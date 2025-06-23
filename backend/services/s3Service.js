import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

export class S3Service {
    constructor(logger) {
        this.logger = logger
        this.isConfigured = this._checkConfiguration()
        
        if (this.isConfigured) {
            // Налаштування для Supabase S3 Connection з AWS SDK v3
            this.s3Client = new S3Client({
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
                region: process.env.AWS_REGION,
                endpoint: process.env.AWS_S3_ENDPOINT,
                forcePathStyle: true, // Обов'язково для Supabase S3
            })
            
            this.bucket = process.env.AWS_S3_BUCKET || 'avatars'
            this.cdnUrl = process.env.CDN_URL
            
            this.logger.info('S3 Service configured for Supabase with AWS SDK v3', {
                endpoint: process.env.AWS_S3_ENDPOINT,
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

        return true
    }

    _generateFileName(userId, originalName, fileType) {
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 10)
        const extension = this._getFileExtension(originalName, fileType)
        
        return `avatars/${userId}/${timestamp}-${randomId}.${extension}`
    }

    _getFileExtension(originalName, mimeType) {
        // Спочатку спробуємо отримати розширення з оригінального імені
        if (originalName && originalName.includes('.')) {
            const ext = originalName.split('.').pop().toLowerCase()
            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                return ext
            }
        }

        // Якщо не вдалося, використаємо MIME type
        const mimeToExt = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/gif': 'gif'
        }

        return mimeToExt[mimeType] || 'jpg'
    }

    _getPublicUrl(key) {
        // Для Supabase S3 Connection використовуємо стандартний Supabase Storage URL
        const supabaseUrl = process.env.SUPABASE_URL
        if (supabaseUrl) {
            return `${supabaseUrl}/storage/v1/object/public/${this.bucket}/${key}`
        }
        
        // Fallback до CDN або S3 endpoint
        if (this.cdnUrl) {
            return `${this.cdnUrl}/${key}`
        }
        
        return `${process.env.AWS_S3_ENDPOINT}/${this.bucket}/${key}`
    }

    async uploadAvatar(userId, fileBuffer, mimeType, originalName) {
        if (!this.isConfigured) {
            throw new Error('S3 service is not configured')
        }

        try {
            const fileName = this._generateFileName(userId, originalName, mimeType)
            
            this.logger.info('Starting Supabase S3 avatar upload', {
                userId,
                fileName,
                fileSize: fileBuffer.length,
                mimeType,
                endpoint: process.env.AWS_S3_ENDPOINT
            })

            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: fileName,
                Body: fileBuffer,
                ContentType: mimeType,
                ACL: 'public-read',
                CacheControl: 'max-age=31536000', // Кешування на рік
                Metadata: {
                    'user-id': userId,
                    'upload-timestamp': Date.now().toString(),
                    'original-name': originalName || 'unknown'
                }
            })

            const result = await this.s3Client.send(command)
            
            const publicUrl = this._getPublicUrl(fileName)
            
            this.logger.info('Supabase S3 avatar upload successful', {
                userId,
                fileName,
                publicUrl,
                etag: result.ETag
            })

            return {
                success: true,
                url: publicUrl,
                key: fileName,
                etag: result.ETag
            }

        } catch (error) {
            this.logger.error('Supabase S3 avatar upload failed', {
                error: error.message,
                name: error.name,
                code: error.$metadata?.httpStatusCode,
                userId,
                stack: error.stack
            })

            throw new Error(`Failed to upload avatar to Supabase S3: ${error.message}`)
        }
    }

    async deleteAvatar(key) {
        if (!this.isConfigured) {
            throw new Error('S3 service is not configured')
        }

        try {
            this.logger.info('Deleting avatar from Supabase S3', { key })

            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key
            })

            await this.s3Client.send(command)
            
            this.logger.info('Supabase S3 avatar deletion successful', { key })

            return { success: true }

        } catch (error) {
            this.logger.error('Supabase S3 avatar deletion failed', {
                error: error.message,
                name: error.name,
                code: error.$metadata?.httpStatusCode,
                key,
                stack: error.stack
            })

            throw new Error(`Failed to delete avatar from Supabase S3: ${error.message}`)
        }
    }

    async listUserAvatars(userId) {
        if (!this.isConfigured) {
            throw new Error('S3 service is not configured')
        }

        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: `avatars/${userId}/`,
                MaxKeys: 100
            })

            const result = await this.s3Client.send(command)
            
            this.logger.info('Listed user avatars from Supabase S3', {
                userId,
                count: result.Contents?.length || 0
            })
            
            return {
                success: true,
                files: result.Contents || []
            }

        } catch (error) {
            this.logger.error('Supabase S3 list avatars failed', {
                error: error.message,
                name: error.name,
                code: error.$metadata?.httpStatusCode,
                userId,
                stack: error.stack
            })

            throw new Error(`Failed to list avatars from Supabase S3: ${error.message}`)
        }
    }

    async cleanupOldAvatars(userId, keepLatest = 3) {
        if (!this.isConfigured) {
            return { success: false, message: 'S3 service not configured' }
        }

        try {
            const listResult = await this.listUserAvatars(userId)
            
            if (!listResult.success || listResult.files.length <= keepLatest) {
                return { success: true, deleted: 0 }
            }

            // Сортуємо файли за датою модифікації (найновіші спочатку)
            const sortedFiles = listResult.files.sort((a, b) => 
                new Date(b.LastModified) - new Date(a.LastModified)
            )

            // Видаляємо старі файли (залишаємо тільки keepLatest найновіших)
            const filesToDelete = sortedFiles.slice(keepLatest)
            
            if (filesToDelete.length === 0) {
                return { success: true, deleted: 0 }
            }

            this.logger.info('Starting cleanup of old avatars', {
                userId,
                totalFiles: sortedFiles.length,
                filesToDelete: filesToDelete.length,
                keepLatest
            })

            const deletePromises = filesToDelete.map(file => 
                this.deleteAvatar(file.Key).catch(error => {
                    this.logger.warn('Failed to delete old avatar', { 
                        key: file.Key, 
                        error: error.message 
                    })
                    return null
                })
            )

            await Promise.all(deletePromises)

            this.logger.info('Cleaned up old avatars from Supabase S3', {
                userId,
                deletedCount: filesToDelete.length,
                keptCount: keepLatest
            })

            return { 
                success: true, 
                deleted: filesToDelete.length 
            }

        } catch (error) {
            this.logger.error('Avatar cleanup failed', {
                error: error.message,
                userId,
                stack: error.stack
            })

            return { 
                success: false, 
                error: error.message 
            }
        }
    }

    // Метод для перевірки з'єднання з S3
    async testConnection() {
        if (!this.isConfigured) {
            return { success: false, error: 'S3 service not configured' }
        }

        try {
            // Спробуємо отримати список об'єктів в bucket
            const command = new ListObjectsV2Command({
                Bucket: this.bucket,
                MaxKeys: 1
            })

            await this.s3Client.send(command)
            
            this.logger.info('Supabase S3 connection test successful', {
                endpoint: process.env.AWS_S3_ENDPOINT,
                bucket: this.bucket
            })

            return { success: true }

        } catch (error) {
            this.logger.error('Supabase S3 connection test failed', {
                error: error.message,
                name: error.name,
                code: error.$metadata?.httpStatusCode,
                endpoint: process.env.AWS_S3_ENDPOINT,
                bucket: this.bucket
            })

            return { 
                success: false, 
                error: error.message,
                code: error.$metadata?.httpStatusCode 
            }
        }
    }
}