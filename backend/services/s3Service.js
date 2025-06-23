import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

export class S3Service {
    constructor(logger) {
        this.logger = logger
        this.isConfigured = this._checkConfiguration()
        
        if (this.isConfigured) {
            this.s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION,
                endpoint: process.env.AWS_S3_ENDPOINT,
                s3ForcePathStyle: true, // Потрібно для деяких S3-сумісних сервісів
            })
            
            this.bucket = process.env.AWS_S3_BUCKET
            this.cdnUrl = process.env.CDN_URL
        }
    }

    _checkConfiguration() {
        const requiredEnvVars = [
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'AWS_REGION',
            'AWS_S3_BUCKET'
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
        const randomId = uuidv4().substring(0, 8)
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
        if (this.cdnUrl) {
            return `${this.cdnUrl}/${key}`
        }
        
        if (process.env.AWS_S3_ENDPOINT) {
            return `${process.env.AWS_S3_ENDPOINT}/${this.bucket}/${key}`
        }
        
        return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
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

            const uploadParams = {
                Bucket: this.bucket,
                Key: fileName,
                Body: fileBuffer,
                ContentType: mimeType,
                ACL: 'public-read', // Робимо файл публічно доступним
                CacheControl: 'max-age=31536000', // Кешування на рік
                Metadata: {
                    'user-id': userId,
                    'upload-timestamp': Date.now().toString()
                }
            }

            const result = await this.s3.upload(uploadParams).promise()
            
            const publicUrl = this._getPublicUrl(fileName)
            
            this.logger.info('S3 avatar upload successful', {
                userId,
                fileName,
                location: result.Location,
                publicUrl
            })

            return {
                success: true,
                url: publicUrl,
                key: fileName,
                location: result.Location
            }

        } catch (error) {
            this.logger.error('S3 avatar upload failed', {
                error: error.message,
                userId,
                stack: error.stack
            })

            throw new Error(`Failed to upload avatar to S3: ${error.message}`)
        }
    }

    async deleteAvatar(key) {
        if (!this.isConfigured) {
            throw new Error('S3 service is not configured')
        }

        try {
            this.logger.info('Deleting avatar from S3', { key })

            const deleteParams = {
                Bucket: this.bucket,
                Key: key
            }

            await this.s3.deleteObject(deleteParams).promise()
            
            this.logger.info('S3 avatar deletion successful', { key })

            return { success: true }

        } catch (error) {
            this.logger.error('S3 avatar deletion failed', {
                error: error.message,
                key,
                stack: error.stack
            })

            throw new Error(`Failed to delete avatar from S3: ${error.message}`)
        }
    }

    async listUserAvatars(userId) {
        if (!this.isConfigured) {
            throw new Error('S3 service is not configured')
        }

        try {
            const listParams = {
                Bucket: this.bucket,
                Prefix: `avatars/${userId}/`
            }

            const result = await this.s3.listObjectsV2(listParams).promise()
            
            return {
                success: true,
                files: result.Contents || []
            }

        } catch (error) {
            this.logger.error('S3 list avatars failed', {
                error: error.message,
                userId,
                stack: error.stack
            })

            throw new Error(`Failed to list avatars from S3: ${error.message}`)
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

            this.logger.info('Cleaned up old avatars', {
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
}