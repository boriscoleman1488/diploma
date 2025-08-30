# 🗄️ Зв'язки в базі даних

## 📊 **Схема зв'язків**

```
auth.users (Supabase Auth)
    ↓ 1:1
profiles
    ↓ 1:N
├── dishes
├── dish_collections
├── dish_comments
├── dish_ratings
├── dish_collection_items
└── ai_chat_sessions

dishes
    ↓ 1:N
├── dish_ingredients
├── dish_steps
├── dish_comments
├── dish_ratings
├── dish_category_relations
└── dish_collection_items

dish_categories
    ↓ 1:N
└── dish_category_relations

dish_collections
    ↓ 1:N
└── dish_collection_items

ai_chat_sessions
    ↓ 1:N
└── ai_chat_messages
```

---

## 🔗 **Детальний опис зв'язків**

### **1. 👤 Користувачі (Users & Profiles)**

#### **auth.users → profiles** (1:1)
```sql
-- Зв'язок: Один користувач має один профіль
profiles.id → auth.users.id (FOREIGN KEY)
```
- **Тип:** One-to-One (1:1)
- **Опис:** Кожен користувач Supabase Auth має відповідний профіль
- **Каскадне видалення:** ON DELETE CASCADE

---

### **2. 🍽️ Страви (Dishes)**

#### **profiles → dishes** (1:N)
```sql
-- Зв'язок: Один користувач може мати багато страв
dishes.user_id → profiles.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Користувач може створити багато страв
- **Каскадне видалення:** ON DELETE CASCADE

#### **dishes → dish_ingredients** (1:N)
```sql
-- Зв'язок: Одна страва має багато інгредієнтів
dish_ingredients.dish_id → dishes.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Кожна страва має список інгредієнтів
- **Каскадне видалення:** ON DELETE CASCADE

#### **dishes → dish_steps** (1:N)
```sql
-- Зв'язок: Одна страва має багато кроків приготування
dish_steps.dish_id → dishes.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Кожна страва має послідовність кроків
- **Каскадне видалення:** ON DELETE CASCADE

---

### **3. 🏷️ Категорії (Categories)**

#### **dishes ↔ dish_categories** (N:N через dish_category_relations)
```sql
-- Зв'язок Many-to-Many через проміжну таблицю
dish_category_relations.dish_id → dishes.id (FOREIGN KEY)
dish_category_relations.category_id → dish_categories.id (FOREIGN KEY)

-- Унікальний індекс
UNIQUE(dish_id, category_id)
```
- **Тип:** Many-to-Many (N:N)
- **Опис:** Страва може належати до кількох категорій, категорія може містити багато страв
- **Каскадне видалення:** ON DELETE CASCADE (з обох сторін)

---

### **4. ⭐ Рейтинги (Ratings)**

#### **profiles → dish_ratings** (1:N)
```sql
-- Зв'язок: Один користувач може поставити багато рейтингів
dish_ratings.user_id → profiles.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Користувач може оцінити багато страв
- **Каскадне видалення:** ON DELETE CASCADE

#### **dishes → dish_ratings** (1:N)
```sql
-- Зв'язок: Одна страва може мати багато рейтингів
dish_ratings.dish_id → dishes.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Страва може отримати рейтинги від різних користувачів
- **Каскадне видалення:** ON DELETE CASCADE

#### **Унікальне обмеження:**
```sql
-- Один користувач може поставити тільки один рейтинг на страву
UNIQUE(dish_id, user_id)
```

---

### **5. 💬 Коментарі (Comments)**

#### **profiles → dish_comments** (1:N)
```sql
-- Зв'язок: Один користувач може написати багато коментарів
dish_comments.user_id → profiles.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Користувач може коментувати багато страв
- **Каскадне видалення:** ON DELETE CASCADE

#### **dishes → dish_comments** (1:N)
```sql
-- Зв'язок: Одна страва може мати багато коментарів
dish_comments.dish_id → dishes.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Страва може отримати коментарі від різних користувачів
- **Каскадне видалення:** ON DELETE CASCADE

---

### **6. 📚 Колекції (Collections)**

#### **profiles → dish_collections** (1:N)
```sql
-- Зв'язок: Один користувач може мати багато колекцій
dish_collections.user_id → profiles.id (FOREIGN KEY)
dish_collections.owner_id → profiles.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Користувач може створити багато колекцій
- **Каскадне видалення:** ON DELETE CASCADE

#### **dishes ↔ dish_collections** (N:N через dish_collection_items)
```sql
-- Зв'язок Many-to-Many через проміжну таблицю
dish_collection_items.dish_id → dishes.id (FOREIGN KEY)
dish_collection_items.collection_id → dish_collections.id (FOREIGN KEY)
dish_collection_items.user_id → profiles.id (FOREIGN KEY)

-- Унікальний індекс
UNIQUE(collection_id, dish_id, user_id)
```
- **Тип:** Many-to-Many (N:N)
- **Опис:** Страва може бути в кількох колекціях, колекція може містити багато страв
- **Каскадне видалення:** ON DELETE CASCADE (з усіх сторін)

---

### **7. 🤖 AI-чат (AI Chat)**

#### **profiles → ai_chat_sessions** (1:N)
```sql
-- Зв'язок: Один користувач може мати багато чат-сесій
ai_chat_sessions.user_id → profiles.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Користувач може створити багато AI-чатів
- **Каскадне видалення:** ON DELETE CASCADE

#### **ai_chat_sessions → ai_chat_messages** (1:N)
```sql
-- Зв'язок: Одна сесія має багато повідомлень
ai_chat_messages.session_id → ai_chat_sessions.id (FOREIGN KEY)
```
- **Тип:** One-to-Many (1:N)
- **Опис:** Кожна чат-сесія містить багато повідомлень
- **Каскадне видалення:** ON DELETE CASCADE

---

## 📋 **Зведена таблиця зв'язків**

| Батьківська таблиця | Дочірня таблиця | Тип зв'язку | Поле зв'язку | Каскадне видалення |
|-------------------|-----------------|-------------|--------------|-------------------|
| `auth.users` | `profiles` | 1:1 | `profiles.id` | CASCADE |
| `profiles` | `dishes` | 1:N | `dishes.user_id` | CASCADE |
| `profiles` | `dish_collections` | 1:N | `dish_collections.user_id` | CASCADE |
| `profiles` | `dish_comments` | 1:N | `dish_comments.user_id` | CASCADE |
| `profiles` | `dish_ratings` | 1:N | `dish_ratings.user_id` | CASCADE |
| `profiles` | `ai_chat_sessions` | 1:N | `ai_chat_sessions.user_id` | CASCADE |
| `dishes` | `dish_ingredients` | 1:N | `dish_ingredients.dish_id` | CASCADE |
| `dishes` | `dish_steps` | 1:N | `dish_steps.dish_id` | CASCADE |
| `dishes` | `dish_comments` | 1:N | `dish_comments.dish_id` | CASCADE |
| `dishes` | `dish_ratings` | 1:N | `dish_ratings.dish_id` | CASCADE |
| `dishes` | `dish_category_relations` | 1:N | `dish_category_relations.dish_id` | CASCADE |
| `dishes` | `dish_collection_items` | 1:N | `dish_collection_items.dish_id` | CASCADE |
| `dish_categories` | `dish_category_relations` | 1:N | `dish_category_relations.category_id` | CASCADE |
| `dish_collections` | `dish_collection_items` | 1:N | `dish_collection_items.collection_id` | CASCADE |
| `ai_chat_sessions` | `ai_chat_messages` | 1:N | `ai_chat_messages.session_id` | CASCADE |

---

## 🔒 **Унікальні обмеження**

### **1. Рейтинги:**
```sql
-- Один користувач може поставити тільки один рейтинг на страву
UNIQUE(dish_id, user_id) ON dish_ratings
```

### **2. Колекції:**
```sql
-- Одна страва може бути додана в колекцію тільки один раз одним користувачем
UNIQUE(collection_id, dish_id, user_id) ON dish_collection_items
```

### **3. Категорії:**
```sql
-- Страва може належати до однієї категорії тільки один раз
UNIQUE(dish_id, category_id) ON dish_category_relations
```

### **4. Профілі:**
```sql
-- Унікальні email та profile_tag
UNIQUE(email) ON profiles
UNIQUE(profile_tag) ON profiles
```

---

## 🎯 **Бізнес-логіка зв'язків**

### **📝 Створення страви:**
1. Створюється запис у `dishes`
2. Додаються `dish_ingredients`
3. Додаються `dish_steps`
4. Створюються зв'язки в `dish_category_relations`

### **❤️ Лайк страви:**
1. Створюється запис у `dish_ratings`
2. Автоматично додається до колекції "Улюблені"

### **🗑️ Видалення користувача:**
1. Видаляються всі `dishes` користувача
2. Каскадно видаляються всі пов'язані дані
3. Видаляються всі `dish_ratings` та `dish_comments`
4. Очищаються всі `dish_collection_items`

---

## 🔍 **Індекси для оптимізації**

```sql
-- Основні індекси для швидкого пошуку
CREATE INDEX idx_dishes_user_id ON dishes(user_id);
CREATE INDEX idx_dishes_status ON dishes(status);
CREATE INDEX idx_dish_ratings_dish_id ON dish_ratings(dish_id);
CREATE INDEX idx_dish_comments_dish_id ON dish_comments(dish_id);
CREATE INDEX idx_dish_category_relations_dish_id ON dish_category_relations(dish_id);
CREATE INDEX idx_dish_collection_items_collection_id ON dish_collection_items(collection_id);
```

Ця структура забезпечує цілісність даних та ефективні запити для всіх функцій додатку!