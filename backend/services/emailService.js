export class EmailService {
    constructor(logger) {
        this.logger = logger
        this.isConfigured = this._checkConfiguration()
    }

    _checkConfiguration() {
        const requiredEnvVars = [
            'SMTP_HOST',
            'SMTP_PORT', 
            'SMTP_USER',
            'SMTP_PASS',
            'FROM_EMAIL'
        ]

        const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
        
        if (missing.length > 0) {
            this.logger.warn('Email service not configured. Missing environment variables:', { missing })
            return false
        }

        return true
    }

    async sendEmail(to, subject, htmlContent, textContent = null) {
        if (!this.isConfigured) {
            this.logger.warn('Email service not configured, skipping email send', { to, subject })
            return {
                success: false,
                error: 'Email service not configured'
            }
        }

        try {
            // For development, we'll just log the email content
            // In production, you would use a real email service like SendGrid, Mailgun, etc.
            this.logger.info('Email would be sent:', {
                to,
                subject,
                htmlContent,
                textContent
            })

            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 100))

            return {
                success: true,
                message: 'Email sent successfully'
            }
        } catch (error) {
            this.logger.error('Failed to send email', { error: error.message, to, subject })
            return {
                success: false,
                error: error.message
            }
        }
    }

    async sendWelcomeEmail(userEmail, userName) {
        const subject = 'Ласкаво просимо до Recipe App!'
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ed7420;">Ласкаво просимо!</h1>
                <p>Привіт ${userName || 'користувач'},</p>
                <p>Дякуємо за реєстрацію в Recipe App! Ваш акаунт успішно створено.</p>
                <p>Тепер ви можете:</p>
                <ul>
                    <li>Створювати власні рецепти</li>
                    <li>Зберігати улюблені рецепти</li>
                    <li>Ділитися рецептами з іншими</li>
                </ul>
                <p>Бажаємо приємного користування!</p>
                <p>З найкращими побажаннями,<br>Команда Recipe App</p>
            </div>
        `
        const textContent = `
            Ласкаво просимо!
            
            Привіт ${userName || 'користувач'},
            
            Дякуємо за реєстрацію в Recipe App! Ваш акаунт успішно створено.
            
            Тепер ви можете:
            - Створювати власні рецепти
            - Зберігати улюблені рецепти
            - Ділитися рецептами з іншими
            
            Бажаємо приємного користування!
            
            З найкращими побажаннями,
            Команда Recipe App
        `

        return await this.sendEmail(userEmail, subject, htmlContent, textContent)
    }

    async sendPasswordChangeNotification(userEmail, userName) {
        const subject = 'Пароль змінено - Recipe App'
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ed7420;">Пароль змінено</h1>
                <p>Привіт ${userName || 'користувач'},</p>
                <p>Ваш пароль було успішно змінено ${new Date().toLocaleString('uk-UA')}.</p>
                <p>Якщо ви не змінювали пароль, негайно зверніться до служби підтримки.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Поради з безпеки:</strong></p>
                    <ul style="margin: 10px 0;">
                        <li>Використовуйте унікальний пароль</li>
                        <li>Не діліться паролем з іншими</li>
                        <li>Регулярно змінюйте пароль</li>
                    </ul>
                </div>
                <p>З найкращими побажаннями,<br>Команда Recipe App</p>
            </div>
        `
        const textContent = `
            Пароль змінено
            
            Привіт ${userName || 'користувач'},
            
            Ваш пароль було успішно змінено ${new Date().toLocaleString('uk-UA')}.
            
            Якщо ви не змінювали пароль, негайно зверніться до служби підтримки.
            
            Поради з безпеки:
            - Використовуйте унікальний пароль
            - Не діліться паролем з іншими
            - Регулярно змінюйте пароль
            
            З найкращими побажаннями,
            Команда Recipe App
        `

        return await this.sendEmail(userEmail, subject, htmlContent, textContent)
    }

    async sendPasswordResetEmail(userEmail, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${resetToken}`
        const subject = 'Скидання пароля - Recipe App'
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ed7420;">Скидання пароля</h1>
                <p>Ви запросили скидання пароля для вашого акаунту Recipe App.</p>
                <p>Натисніть на кнопку нижче, щоб створити новий пароль:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #ed7420; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Скинути пароль</a>
                </div>
                <p>Або скопіюйте це посилання у ваш браузер:</p>
                <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">${resetUrl}</p>
                <p><strong>Це посилання дійсне протягом 1 години.</strong></p>
                <p>Якщо ви не запросили скидання пароля, проігноруйте цей лист.</p>
                <p>З найкращими побажаннями,<br>Команда Recipe App</p>
            </div>
        `
        const textContent = `
            Скидання пароля
            
            Ви запросили скидання пароля для вашого акаунту Recipe App.
            
            Перейдіть за цим посиланням, щоб створити новий пароль:
            ${resetUrl}
            
            Це посилання дійсне протягом 1 години.
            
            Якщо ви не запросили скидання пароля, проігноруйте цей лист.
            
            З найкращими побажаннями,
            Команда Recipe App
        `

        return await this.sendEmail(userEmail, subject, htmlContent, textContent)
    }

    async sendEmailVerification(userEmail, verificationToken) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?token=${verificationToken}`
        const subject = 'Підтвердіть вашу електронну пошту - Recipe App'
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ed7420;">Підтвердіть вашу електронну пошту</h1>
                <p>Дякуємо за реєстрацію в Recipe App!</p>
                <p>Щоб завершити реєстрацію, будь ласка, підтвердіть вашу електронну пошту:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #ed7420; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Підтвердити електронну пошту</a>
                </div>
                <p>Або скопіюйте це посилання у ваш браузер:</p>
                <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
                <p><strong>Це посилання дійсне протягом 24 годин.</strong></p>
                <p>Якщо ви не реєструвалися в Recipe App, проігноруйте цей лист.</p>
                <p>З найкращими побажаннями,<br>Команда Recipe App</p>
            </div>
        `
        const textContent = `
            Підтвердіть вашу електронну пошту
            
            Дякуємо за реєстрацію в Recipe App!
            
            Щоб завершити реєстрацію, будь ласка, підтвердіть вашу електронну пошту:
            ${verificationUrl}
            
            Це посилання дійсне протягом 24 годин.
            
            Якщо ви не реєструвалися в Recipe App, проігноруйте цей лист.
            
            З найкращими побажаннями,
            Команда Recipe App
        `

        return await this.sendEmail(userEmail, subject, htmlContent, textContent)
    }
}