import { Translate } from '@google-cloud/translate/build/src/v2/index.js'

export class TranslationService {
  constructor(config) {
    this.apiKey = config.apiKey
    this.projectId = config.projectId
    
    this.isConfigured = !!this.apiKey
    
    if (this.isConfigured) {
      try {
        this.translate = new Translate({
          key: this.apiKey,
          projectId: this.projectId
        })
        console.log('Google Translate API initialized successfully')
      } catch (error) {
        console.error('Failed to initialize Google Translate API:', error)
        this.isConfigured = false
      }
    } else {
      console.warn('Google Translate API not configured - GOOGLE_TRANSLATE_API_KEY is missing')
    }
    
    // Кеш для перекладів, щоб не робити повторні запити
    this.translationCache = new Map()
  }

  async translateToEnglish(text, sourceLanguage = 'uk') {
    if (!this.isConfigured) {
      console.warn('Google Translate API not configured, returning original text')
      return text
    }

    // Перевірити кеш
    const cacheKey = `${sourceLanguage}:en:${text.toLowerCase()}`
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)
    }

    try {
      console.log(`Translating from ${sourceLanguage} to English: "${text}"`)
      const [translation] = await this.translate.translate(text, {
        from: sourceLanguage,
        to: 'en'
      })

      // Зберегти в кеш
      this.translationCache.set(cacheKey, translation)
      console.log(`Translation result: "${translation}"`)
      return translation
    } catch (error) {
      console.error('Translation error:', error)
      return text // Повернути оригінальний текст при помилці
    }
  }

  async translateToUkrainian(text, sourceLanguage = 'en') {
    if (!this.isConfigured) {
      console.warn('Google Translate API not configured, returning original text')
      return text
    }

    const cacheKey = `${sourceLanguage}:uk:${text.toLowerCase()}`
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)
    }

    try {
      console.log(`Translating from ${sourceLanguage} to Ukrainian: "${text}"`)
      const [translation] = await this.translate.translate(text, {
        from: sourceLanguage,
        to: 'uk'
      })

      this.translationCache.set(cacheKey, translation)
      console.log(`Translation result: "${translation}"`)
      return translation
    } catch (error) {
      console.error('Translation error:', error)
      return text
    }
  }

  // Визначити мову тексту
  async detectLanguage(text) {
    if (!this.isConfigured) {
      console.warn('Google Translate API not configured, assuming Ukrainian')
      return 'uk' // За замовчуванням українська
    }

    try {
      const [detection] = await this.translate.detect(text)
      console.log(`Detected language for "${text}": ${detection.language}`)
      return detection.language
    } catch (error) {
      console.error('Language detection error:', error)
      return 'uk'
    }
  }
}