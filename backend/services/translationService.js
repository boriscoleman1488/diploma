import { Translate } from '@google-cloud/translate/build/src/v2/index.js'

export class TranslationService {
  constructor(config) {
    this.apiKey = config.apiKey
    this.translate = new Translate({
      key: this.apiKey,
      projectId: config.projectId // опціонально
    })
    
    // Кеш для перекладів, щоб не робити повторні запити
    this.translationCache = new Map()
    
    this.isConfigured = !!this.apiKey
  }

  async translateToEnglish(text, sourceLanguage = 'uk') {
    if (!this.isConfigured) {
      console.warn('Google Translate API not configured')
      return text
    }

    // Перевірити кеш
    const cacheKey = `${sourceLanguage}:${text.toLowerCase()}`
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)
    }

    try {
      const [translation] = await this.translate.translate(text, {
        from: sourceLanguage,
        to: 'en'
      })

      // Зберегти в кеш
      this.translationCache.set(cacheKey, translation)
      return translation
    } catch (error) {
      console.error('Translation error:', error)
      return text // Повернути оригінальний текст при помилці
    }
  }

  async translateToUkrainian(text, sourceLanguage = 'en') {
    if (!this.isConfigured) {
      return text
    }

    const cacheKey = `${sourceLanguage}:uk:${text.toLowerCase()}`
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)
    }

    try {
      const [translation] = await this.translate.translate(text, {
        from: sourceLanguage,
        to: 'uk'
      })

      this.translationCache.set(cacheKey, translation)
      return translation
    } catch (error) {
      console.error('Translation error:', error)
      return text
    }
  }

  // Визначити мову тексту
  async detectLanguage(text) {
    if (!this.isConfigured) {
      return 'uk' // За замовчуванням українська
    }

    try {
      const [detection] = await this.translate.detect(text)
      return detection.language
    } catch (error) {
      console.error('Language detection error:', error)
      return 'uk'
    }
  }
}