import { Translator } from 'deepl-node';

export class TranslationService {
  constructor(config) {
    this.apiKey = config.apiKey;
    
    this.isConfigured = !!this.apiKey;
    this.isWorking = false; // Track if API is actually working
    
    if (this.isConfigured) {
      try {
        this.translator = new Translator(this.apiKey);
        console.log('DeepL API initialized successfully');
        // Test the API with a simple call to verify it's working
        this.testApiConnection();
      } catch (error) {
        console.error('Failed to initialize DeepL API:', error);
        this.isConfigured = false;
      }
    } else {
      console.warn('DeepL API not configured - DEEPL_API_KEY is missing');
    }
    
    // Кеш для перекладів, щоб не робити повторні запити
    this.translationCache = new Map();
    
    // Статичний словник для основних інгредієнтів
    this.staticDictionary = {
      // Фрукти
      'яблуко': 'apple',
      'банан': 'banana',
      'апельсин': 'orange',
      'лимон': 'lemon',
      'груша': 'pear',
      'виноград': 'grapes',
      'полуниця': 'strawberry',
      'вишня': 'cherry',
      'персик': 'peach',
      'абрикос': 'apricot',
      
      // Овочі
      'помідор': 'tomato',
      'цибуля': 'onion',
      'часник': 'garlic',
      'картопля': 'potato',
      'морква': 'carrot',
      'капуста': 'cabbage',
      'перець': 'pepper',
      'баклажан': 'eggplant',
      'кабачок': 'zucchini',
      'буряк': 'beetroot',
      'редис': 'radish',
      'селера': 'celery',
      'броколі': 'broccoli',
      'цвітна капуста': 'cauliflower',
      'шпинат': 'spinach',
      'салат': 'lettuce',
      'огірок': 'cucumber',
      
      // М'ясо та риба
      'курка': 'chicken',
      'куряче філе': 'chicken breast',
      'свинина': 'pork',
      'яловичина': 'beef',
      'баранина': 'lamb',
      'риба': 'fish',
      'лосось': 'salmon',
      'тунець': 'tuna',
      'креветки': 'shrimp',
      
      // Молочні продукти
      'молоко': 'milk',
      'сир': 'cheese',
      'масло': 'butter',
      'йогурт': 'yogurt',
      'сметана': 'sour cream',
      'вершки': 'cream',
      
      // Зернові та бобові
      'рис': 'rice',
      'гречка': 'buckwheat',
      'овес': 'oats',
      'пшениця': 'wheat',
      'ячмінь': 'barley',
      'квасоля': 'beans',
      'горох': 'peas',
      'сочевиця': 'lentils',
      'нут': 'chickpeas',
      
      // Інше
      'яйце': 'egg',
      'хліб': 'bread',
      'олія': 'oil',
      'оливкова олія': 'olive oil',
      'сіль': 'salt',
      'цукор': 'sugar',
      'борошно': 'flour',
      'мед': 'honey',
      'оцет': 'vinegar',
      'горіхи': 'nuts',
      'мигдаль': 'almonds',
      'волоські горіхи': 'walnuts'
    }
    
    // Зворотний словник для перекладу з англійської на українську
    this.reverseStaticDictionary = Object.entries(this.staticDictionary).reduce((acc, [uk, en]) => {
      acc[en.toLowerCase()] = uk;
      return acc;
    }, {});
  }

  async testApiConnection() {
    if (!this.isConfigured) return;
    
    try {
      // Test with a simple word
      const result = await this.translator.translateText('test', null, 'uk');
      this.isWorking = true;
      console.log('DeepL API is working correctly');
    } catch (error) {
      console.error('DeepL API test failed:', error.message);
      this.isWorking = false;
      
      if (error.response && error.response.status === 403) {
        console.error('DeepL API access denied (403). Please check:');
        console.error('1. API key is valid');
        console.error('2. API key has correct permissions');
        console.error('3. Billing is enabled for your account');
      }
    }
  }

  // Використовувати статичний словник як основний метод перекладу
  translateWithDictionary(text, targetLanguage = 'en') {
    const lowerText = text.toLowerCase().trim();
    
    if (targetLanguage === 'en') {
      // Українська -> Англійська
      return this.staticDictionary[lowerText] || text;
    } else if (targetLanguage === 'uk') {
      // Англійська -> Українська (зворотний пошук)
      return this.reverseStaticDictionary[lowerText] || text;
    }
    
    return text;
  }

  async translateToEnglish(text, sourceLanguage = 'uk') {
    // Спочатку спробувати статичний словник
    const staticTranslation = this.translateWithDictionary(text, 'en');
    if (staticTranslation !== text) {
      console.log(`Static dictionary translation: "${text}" -> "${staticTranslation}"`);
      return staticTranslation;
    }

    // Якщо API не працює, повернути оригінальний текст
    if (!this.isConfigured || !this.isWorking) {
      console.warn('DeepL API not available, using original text:', text);
      return text;
    }

    // Перевірити кеш
    const cacheKey = `${sourceLanguage}:en:${text.toLowerCase()}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }

    try {
      console.log(`Translating from ${sourceLanguage} to English: "${text}"`);
      const result = await this.translator.translateText(text, sourceLanguage, 'en-US');
      const translation = result.text;

      // Зберегти в кеш
      this.translationCache.set(cacheKey, translation);
      console.log(`Translation result: "${translation}"`);
      return translation;
    } catch (error) {
      console.error('Translation error:', error.message);
      
      // Якщо помилка 403, позначити API як неробочий
      if (error.response && error.response.status === 403) {
        this.isWorking = false;
        console.error('DeepL API access denied. Falling back to original text.');
      }
      
      return text; // Повернути оригінальний текст при помилці
    }
  }

  async translateToUkrainian(text, sourceLanguage = 'en') {
    // Спочатку спробувати статичний словник
    const staticTranslation = this.translateWithDictionary(text, 'uk');
    if (staticTranslation !== text) {
      console.log(`Static dictionary translation: "${text}" -> "${staticTranslation}"`);
      return staticTranslation;
    }

    if (!this.isConfigured || !this.isWorking) {
      console.warn('DeepL API not available, using original text:', text);
      return text;
    }

    const cacheKey = `${sourceLanguage}:uk:${text.toLowerCase()}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }

    try {
      console.log(`Translating from ${sourceLanguage} to Ukrainian: "${text}"`);
      const result = await this.translator.translateText(text, sourceLanguage, 'uk');
      const translation = result.text;

      this.translationCache.set(cacheKey, translation);
      console.log(`Translation result: "${translation}"`);
      return translation;
    } catch (error) {
      console.error('Translation error:', error.message);
      
      if (error.response && error.response.status === 403) {
        this.isWorking = false;
        console.error('DeepL API access denied. Falling back to original text.');
      }
      
      return text;
    }
  }

  // Визначити мову тексту
  async detectLanguage(text) {
    // Простий алгоритм визначення мови на основі символів
    const cyrillicPattern = /[а-яёіїєґ]/i;
    const latinPattern = /[a-z]/i;
    
    const hasCyrillic = cyrillicPattern.test(text);
    const hasLatin = latinPattern.test(text);
    
    // Якщо є кирилиця, вважаємо українською
    if (hasCyrillic && !hasLatin) {
      console.log(`Detected language for "${text}": uk (cyrillic characters)`);
      return 'uk';
    }
    
    // Якщо тільки латиниця, вважаємо англійською
    if (hasLatin && !hasCyrillic) {
      console.log(`Detected language for "${text}": en (latin characters)`);
      return 'en';
    }

    if (!this.isConfigured || !this.isWorking) {
      console.warn('DeepL API not available for language detection, assuming Ukrainian');
      return 'uk'; // За замовчуванням українська
    }

    try {
      // DeepL не має прямого API для визначення мови, тому використовуємо евристику
      // Спробуємо перекласти на англійську і подивитися, чи змінився текст
      const result = await this.translator.translateText(text, null, 'en-US');
      const isEnglish = result.text.toLowerCase() === text.toLowerCase();
      const detectedLanguage = isEnglish ? 'en' : 'uk';
      
      console.log(`Detected language for "${text}": ${detectedLanguage}`);
      return detectedLanguage;
    } catch (error) {
      console.error('Language detection error:', error.message);
      
      if (error.response && error.response.status === 403) {
        this.isWorking = false;
      }
      
      return 'uk'; // За замовчуванням українська
    }
  }

  // Перевірити чи працює API
  get isApiWorking() {
    return this.isConfigured && this.isWorking;
  }
}