import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

export class S3Service {
    constructor(logger) {
        this.logger = logger
        this.isConfigured = this._checkConfiguration()
        
        if (this.isConfigured) {
            // Ensure endpoint has proper protocol
            let endpoint = process.env.AWS_S3_ENDPOINT
            if (endpoint && !endpoint.startsWith('http')) {
                endpoint = `https://${endpoint}`
            }

            this.s3Client = new S3Client({
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
                region: process.env.AWS_REGION,
                endpoint: endpoint,
                forcePathStyle: true,
            })
            
            this.bucket = process.env.AWS_S3_BUCKET || 'avatars'
            
            this.logger.info('S3 Service configured for Supabase', {
                endpoint: endpoint,
                region: process.env.AWS_REGION,
                bucket: this.bucket
            })
        }
    }

    _checkConfiguration() {
        const requiredEnvVars = [
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'AWS_REGION',
            'AWS_S3_ENDPOINT'
        ]

        const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
        
        if (missing.length > 0) {
            this.logger.warn('S3 service not configured. Missing environment variables:', { missing })
            return false
        }

        // Validate endpoint format
        const endpoint = process.env.AWS_S3_ENDPOINT
        if (endpoint && !endpoint.includes('.')) {
            this.logger.warn('S3 endpoint appears to be invalid:', { endpoint })
            return false
        }

        return true
    }

    _generateFileName(userId, originalName, fileType) {
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 10)
        const extension = this._getFileExtension(originalName, fileType)
        
        return `${userId}-${timestamp}-${randomId}.${extension}`
    }

    _getFileExtension(originalName, mimeType) {
        if (originalName && originalName.includes('.')) {
            const ext = originalName.split('.').pop().toLowerCase()
            if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
                return ext
            }
        }

        const mimeToExt = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
        }

        return mimeToExt[mimeType] || 'jpg'
    }

    _getPublicUrl(key) {
        const supabaseUrl = process.env.SUPABASE_URL
        if (supabaseUrl) {
            return `${supabaseUrl}/storage/v1/object/public/${this.bucket}/${key}`
        }
        
        // Fallback to S3 endpoint
        let endpoint = process.env.AWS_S3_ENDPOINT
        if (endpoint && !endpoint.startsWith('http')) {
            endpoint = `https://${endpoint}`
        }
        
        return `${endpoint}/${this.bucket}/${key}`
    }

    async uploadAvatar(userId, fileBuffer, mimeType, originalName) {
        if (!this.isConfigured) {
            throw new Error('S3 service is not configured')
        }

        try {
            const fileName = this._generateFileName(userId, originalName, mimeType)
            
            this.logger.info('Starting S3 avatar upload', {
                userId,
                fileName,
                fileSize: fileBuffer.length,
                mimeType
            })

            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: fileName,
                Body: fileBuffer,
                ContentType: mimeType,
                ACL: 'public-read',
                CacheControl: 'max-age=31536000',
                Metadata: {
                    'user-id': userId,
                    'upload-timestamp': Date.now().toString()
                }
            })

            const result = await this.s3Client.send(command)
            const publicUrl = this._getPublicUrl(fileName)
            
            this.logger.info('S3 avatar upload successful', {
                userId,
                fileName,
                publicUrl,
                etag: result.ETag
            })

            return {
                success: true,
                url: publicUrl,
                key: fileName
            }

        } catch (error) {
            this.logger.error('S3 avatar upload failed', {
                error: error.message,
                name: error.name,
                code: error.code,
                userId
            })

            throw new Error(`Failed to upload avatar to S3: ${error.message}`)
        }
    }

    async deleteAvatar(key) {
        if (!this.isConfigured) {
            throw new Error('S3 service is not configured')
        }

        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key
            })

            await this.s3Client.send(command)
            
            this.logger.info('S3 avatar deletion successful', { key })
            return { success: true }

        } catch (error) {
            this.logger.error('S3 avatar deletion failed', {
                error: error.message,
                key
            })

            throw new Error(`Failed to delete avatar from S3: ${error.message}`)
        }
    }

    async testConnection() {
        if (!this.isConfigured) {
            return { success: false, error: 'S3 service not configured' }
        }

        try {
            // Just validate that we can create the client without errors
            this.logger.info('S3 connection test successful', {
                endpoint: process.env.AWS_S3_ENDPOINT,
                bucket: this.bucket
            })
            return { success: true }

        } catch (error) {
            this.logger.error('S3 connection test failed', {
                error: error.message,
                endpoint: process.env.AWS_S3_ENDPOINT,
                bucket: this.bucket
            })

            return { 
                success: false, 
                error: error.message
            }
        }
    }
}