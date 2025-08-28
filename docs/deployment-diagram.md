# Діаграма розгортання платформи "Пошук Страв"

## 🏗️ **Архітектура системи**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                 🌐 ІНТЕРНЕТ                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              📱 КОРИСТУВАЧ                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Desktop   │  │   Tablet    │  │   Mobile    │  │   PWA App   │                │
│  │   Browser   │  │   Browser   │  │   Browser   │  │             │                │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼ HTTPS
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           🌍 CDN / LOAD BALANCER                                    │
│                              (Bolt Hosting)                                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ⚛️ FRONTEND (Next.js)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                          📄 Static Files                                    │   │
│  │  • HTML, CSS, JavaScript                                                   │   │
│  │  • Images, Fonts, Icons                                                    │   │
│  │  • Service Worker (PWA)                                                    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                        🎨 React Components                                  │   │
│  │  • Pages (Home, Dishes, Profile, Admin)                                    │   │
│  │  • Components (Cards, Forms, Modals)                                       │   │
│  │  • Hooks (useAuth, useDishes, useProfile)                                  │   │
│  │  • Store (Zustand - Auth, UI State)                                        │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼ HTTP/REST API
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🚀 BACKEND (Node.js/Fastify)                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           🛣️ API Routes                                     │   │
│  │  • /api/auth/*           - Автентифікація                                  │   │
│  │  • /api/dishes/*         - Управління стравами                             │   │
│  │  • /api/users/*          - Профілі користувачів                            │   │
│  │  • /api/categories/*     - Категорії страв                                 │   │
│  │  • /api/ratings/*        - Рейтинги та лайки                               │   │
│  │  • /api/comments/*       - Коментарі                                       │   │
│  │  • /api/collections/*    - Колекції страв                                  │   │
│  │  • /api/ai/*             - AI-чат та рекомендації                          │   │
│  │  • /api/admin/*          - Адмін панель                                     │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                          🏗️ Services Layer                                  │   │
│  │  • AuthService           - Реєстрація, вхід, токени                        │   │
│  │  • DishService           - CRUD операції зі стравами                       │   │
│  │  • UserService           - Управління профілями                            │   │
│  │  • CategoryService       - Управління категоріями                          │   │
│  │  • RatingService         - Лайки та рейтинги                               │   │
│  │  • CommentService        - Коментарі до страв                              │   │
│  │  • CollectionService     - Колекції користувачів                           │   │
│  │  • AIService             - Gemini AI інтеграція                            │   │
│  │  • EdamamService         - Пошук інгредієнтів                              │   │
│  │  • TranslationService    - DeepL переклади                                 │   │
│  │  • EmailService          - Email повідомлення                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         🔐 Middleware                                       │   │
│  │  • Authentication        - JWT токени                                      │   │
│  │  • Authorization         - Ролі (user/admin)                               │   │
│  │  • Rate Limiting         - Захист від спаму                                │   │
│  │  • CORS                  - Cross-origin запити                             │   │
│  │  • Validation            - JSON Schema валідація                           │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼ SQL Queries
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🗄️ SUPABASE PLATFORM                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         💾 PostgreSQL Database                              │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │   │
│  │  │     profiles    │  │     dishes      │  │  dish_ratings   │             │   │
│  │  │  • id           │  │  • id           │  │  • dish_id      │             │   │
│  │  │  • email        │  │  • title        │  │  • user_id      │             │   │
│  │  │  • full_name    │  │  • description  │  │  • rating       │             │   │
│  │  │  • role         │  │  • status       │  │  • created_at   │             │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘             │   │
│  │                                                                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │   │
│  │  │ dish_ingredients│  │   dish_steps    │  │ dish_categories │             │   │
│  │  │ dish_comments   │  │ dish_collections│  │ai_chat_sessions │             │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         🔐 Authentication                                   │   │
│  │  • JWT токени                                                               │   │
│  │  • Email підтвердження                                                      │   │
│  │  • Скидання паролів                                                         │   │
│  │  • Row Level Security (RLS)                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         📁 Storage                                          │   │
│  │  • avatars/              - Аватари користувачів                            │   │
│  │  • dish-images/          - Зображення страв                                │   │
│  │  • step-images/          - Зображення кроків                               │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼ API Calls
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🔌 ЗОВНІШНІ СЕРВІСИ                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                     │
│  │   🤖 Google     │  │   🍎 Edamam     │  │   🌐 DeepL      │                     │
│  │   Gemini AI     │  │   Food API      │  │   Translation   │                     │
│  │                 │  │                 │  │                 │                     │
│  │ • Рекомендації  │  │ • Пошук їжі     │  │ • Переклад      │                     │
│  │ • AI-чат        │  │ • Поживність    │  │ • Детекція мови │                     │
│  │ • Генерація     │  │ • Калорії       │  │ • Словник       │                     │
│  │   рецептів      │  │ • Макронутрієнти│  │                 │                     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 **Потік взаємодії користувача:**

### **1. Автентифікація**
```
Користувач → Frontend → Backend → Supabase Auth → JWT Token → Frontend Store
```

### **2. Перегляд страв**
```
Користувач → Home Page → API /dishes → DishService → PostgreSQL → JSON Response → UI
```

### **3. Створення страви**
```
Користувач → Form → Image Upload → Supabase Storage → 
API /dishes → DishService → PostgreSQL → Success → Redirect
```

### **4. AI-чат**
```
Користувач → AI Chat → API /ai/generate-response → 
AIService → Gemini API → Response → Save to DB → Display
```

### **5. Пошук інгредієнтів**
```
Користувач → Search → API /edamam/search → 
EdamamService → Translation → Edamam API → Results → UI
```

## 🚀 **Розгортання:**

### **Production Environment:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bolt Hosting  │    │   Supabase      │    │  External APIs  │
│                 │    │                 │    │                 │
│ • Next.js App   │◄──►│ • PostgreSQL    │◄──►│ • Gemini AI     │
│ • Static Files  │    │ • Auth          │    │ • Edamam        │
│ • CDN           │    │ • Storage       │    │ • DeepL         │
│ • SSL/HTTPS     │    │ • Edge Functions│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Development Environment:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   localhost     │    │   Supabase      │    │  External APIs  │
│                 │    │   (Cloud)       │    │                 │
│ • Next.js :5173 │◄──►│ • PostgreSQL    │◄──►│ • Gemini AI     │
│ • Node.js :3000 │    │ • Auth          │    │ • Edamam        │
│ • Hot Reload    │    │ • Storage       │    │ • DeepL         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 **Потоки даних:**

### **Читання даних (GET):**
```
👤 User Request → 🌐 CDN → ⚛️ Frontend → 🚀 Backend → 🗄️ Database → 📤 Response
```

### **Запис даних (POST/PUT):**
```
👤 User Input → ⚛️ Frontend → 🔐 Auth Check → 🚀 Backend → ✅ Validation → 🗄️ Database
```

### **Завантаження файлів:**
```
👤 File Upload → ⚛️ Frontend → 🚀 Backend → 📁 Supabase Storage → 🔗 Public URL
```

### **AI взаємодія:**
```
👤 AI Request → ⚛️ Frontend → 🚀 Backend → 🤖 Gemini API → 💾 Save Response → 📱 Display
```

## 🔒 **Безпека:**

### **Рівні захисту:**
1. **Frontend:** Client-side валідація, HTTPS
2. **CDN:** DDoS захист, SSL термінація
3. **Backend:** JWT автентифікація, Rate limiting, CORS
4. **Database:** RLS (Row Level Security), Encrypted connections
5. **Storage:** Signed URLs, File type validation

### **Автентифікація:**
```
Login → Supabase Auth → JWT Token → Local Storage → API Headers → Backend Verification
```

## 📈 **Масштабування:**

### **Горизонтальне:**
- Multiple frontend instances (CDN)
- Database read replicas
- Edge functions for AI processing

### **Вертикальне:**
- Більше CPU/RAM для backend
- Database performance tuning
- CDN caching optimization

## 🔧 **Моніторинг:**

### **Метрики:**
- Response times
- Error rates  
- User activity
- AI API usage
- Database performance

### **Логування:**
- Application logs (Fastify)
- Database logs (Supabase)
- CDN logs (Bolt Hosting)
- Error tracking

## 🌟 **Ключові особливості архітектури:**

✅ **Serverless** - Supabase для backend сервісів
✅ **JAMstack** - Static frontend з API
✅ **Microservices** - Розділені сервіси для різних функцій  
✅ **Real-time** - WebSocket підключення через Supabase
✅ **Progressive Web App** - Працює офлайн
✅ **Mobile-first** - Responsive design
✅ **SEO-friendly** - Server-side rendering з Next.js