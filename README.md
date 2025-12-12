# DormEase

**DormEase** — это фронтенд-only MVP для поиска и бронирования студенческих общежитий в Алматы. Весь интерфейс на русском языке, включает систему аутентификации, интерактивную карту (офлайн), демо-оплату и стартовый опросник для персонализации поиска.

## Project info

**URL**: https://lovable.dev/projects/c05fbddd-f6de-422d-9d14-fcc95fe178fb

## Основные возможности

### 1. Поиск общежитий
- Каталог общежитий с фильтрами: университет, цена, пол, расстояние, тип комнаты
- Два режима просмотра: **Список** и **Карта** (офлайн, статичная)
- Детальные страницы с фото, удобствами, ценами
- Система рейтингов и верификации

### 2. Аутентификация (фронтенд)
- **Регистрация** с хэшированием паролей (SHA-256 + salt)
- **Вход** в систему с запоминанием сессии
- **Сброс пароля** (демо-режим с кодом на экране)
- **Профиль пользователя** с управлением заявками и настройками

### 3. Карта (офлайн)
- Статическая карта Алматы (`/public/assets/almaty-map.jpg`)
- Маркеры общежитий с pixel-координатами (`mapX`, `mapY`)
- Симуляция zoom/pan (CSS scale + drag)
- Поповеры с быстрыми действиями: **Подробнее**, **Оставить заявку**
- Кластеризация при большом количестве маркеров

### 4. Заявки и оплата
- Форма заявки на проживание с валидацией
- Интеграция с авторизованными пользователями (авто-подстановка данных)
- **Демо-оплата** депозита без реальных транзакций
- История заявок в профиле

### 5. Стартовый опросник (Onboarding)
- Появляется через 400ms при первом визите
- **3 шага** с прогресс-баром:
  1. **Кто вы?** — роль, университет, текущее проживание
  2. **Когда и бюджет** — дата въезда, бюджет, предпочтения
  3. **Контакты и предпочтения** — источник, готовность к депозиту, контакт
- Можно **пропустить** (повтор через 30 дней) или **заполнить**
- При заполнении — автоматическое применение фильтров на странице `/dorms`
- Редактирование в любое время из **Профиля**

## Структура данных

### Общежития (`src/data/dorms.ts`)
```typescript
interface Dorm {
  id: string;
  name: string;
  university: string;
  address: string;
  priceKzt: number;
  genderPolicy: "male" | "female" | "mixed";
  roomTypes: string[];
  amenities: string[];
  distanceKm: number;
  verified: boolean;
  photos: string[];
  mapX: number;  // 0-1000 координаты на карте
  mapY: number;
  geo?: { lat: number; lng: number };
}
```

### localStorage ключи

#### `users` — пользователи
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  salt: string;
  passwordHash: string; // SHA-256(salt + password)
  createdAt: string;
}
```

#### `session` — текущая сессия
```typescript
interface Session {
  userId: string;
  token: string;
  createdAt: string;
}
```

#### `dormRequests` — заявки на общежития
```typescript
interface DormRequest {
  id: string;
  dormId: string;
  dormName: string;
  fullName: string;
  university: string;
  contactType: "email" | "telegram";
  contactValue: string;
  roomType: string;
  budget: number;
  moveInMonth: string;
  timestamp: string;
  demoPaymentId?: string;
  userId?: string;
}
```

#### `demoPayments` — демо-платежи
```typescript
interface DemoPayment {
  id: string;
  requestId?: string;
  dormId: string;
  dormName: string;
  amount: number;
  status: "success" | "declined";
  timestamp: string;
}
```

#### `onboardingProfile` — профиль опросника
```typescript
interface OnboardingProfile {
  role: string;
  roleOther?: string;
  university: string;
  liveNow: boolean;
  moveIn: string;
  budgetMin: number;
  budgetMax: number;
  genderPolicy: string;
  roomType: string;
  transparencyScore: number;
  depositWilling: string;
  source: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
  contact?: string;
  timestamp: string;
}
```

#### `onboardingStatus` — статус показа опросника
```typescript
interface OnboardingStatus {
  status: "submitted" | "skipped";
  nextAt?: string; // ISO дата следующего показа (при пропуске)
}
```

#### `eventLog` — лог событий
```typescript
interface TrackingEvent {
  timestamp: string;
  event: string;
  payload: Record<string, unknown>;
}
```

## Трекинг событий

### Аутентификация
- `auth_register_success`, `auth_register_fail`
- `auth_login_success`, `auth_login_fail`
- `auth_logout`
- `auth_reset_start`, `auth_reset_success`, `auth_reset_fail`

### Опросник
- `onboarding_open` — открытие при первом визите
- `onboarding_skip` — пропуск опросника
- `onboarding_next_step` — переход между шагами
- `onboarding_submit` — завершение заполнения
- `onboarding_edit_open`, `onboarding_edit_save` — редактирование

### Поиск и заявки
- `view_search`, `apply_filters`
- `toggle_map_list`, `open_map`
- `map_marker_click`, `map_view_details`, `map_open_request`
- `submit_request`, `delete_request`

### Демо-оплата
- `start_checkout_demo`, `submit_checkout_demo`
- `mock_pay_success`, `mock_pay_decline`

## Доступность (A11y)

- Фокус виден на всех интерактивных элементах
- **Esc** закрывает модальные окна
- **Tab** циклирует фокус внутри модалок (фокус-трап)
- Подписи (`<Label>`) для всех полей ввода
- ARIA-атрибуты для кнопок и ссылок

## Сброс состояния

Для полного сброса состояния приложения:
```javascript
localStorage.clear();
location.reload();
```

Или удалить отдельные ключи:
```javascript
localStorage.removeItem('users');
localStorage.removeItem('session');
localStorage.removeItem('dormRequests');
localStorage.removeItem('demoPayments');
localStorage.removeItem('onboardingProfile');
localStorage.removeItem('onboardingStatus');
localStorage.removeItem('eventLog');
```

## Debug-модалка

Нажмите на иконку **Bug** (🐛) в правом нижнем углу для доступа к:
- Списку всех заявок
- Списку всех событий (`eventLog`)
- Списку демо-платежей
- Кнопке очистки всех данных

## Известные ограничения (Demo)

1. **Пароли**: хранятся локально в виде хэша, но SubtleCrypto может быть недоступна в некоторых контекстах (не HTTPS). В продакшене следует использовать серверную аутентификацию.
2. **Карта**: статичное изображение, без реального geocoding/routing.
3. **Оплата**: симуляция, карточные данные не сохраняются.
4. **Email/SMS**: уведомления не отправляются.
5. **Опросник**: UTM-метки считываются только при первом визите на страницу.

## Технологии

- **React 18** + **TypeScript**
- **Vite** — сборка
- **Tailwind CSS** — стилизация
- **shadcn/ui** — UI-компоненты
- **React Router** — маршрутизация
- **localStorage** — персистентность данных
- **SubtleCrypto** — хэширование паролей

## Деплой

### ⚠️ GitHub Pages требует публичный репозиторий

Если ваш репозиторий приватный, используйте альтернативы:

**🚀 Рекомендуется: Vercel** (работает с приватными репо)
- См. [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) для инструкций
- Или просто перейдите на [vercel.com](https://vercel.com) и импортируйте репозиторий

**Другие варианты:**
- Netlify - см. [DEPLOY-ALTERNATIVES.md](./DEPLOY-ALTERNATIVES.md)
- Cloudflare Pages
- Render

**GitHub Pages:**
- См. [README-DEPLOY.md](./README-DEPLOY.md) (требует публичный репозиторий)

## Запуск проекта

### Вариант 1: Только фронтенд (localStorage)
```bash
npm install
npm run dev
```
Приложение будет доступно на `http://localhost:8080`

### Вариант 2: С бэкендом (рекомендуется)
```bash
npm install
npm run dev:all
```
- Фронтенд: `http://localhost:8080`
- Бэкенд API: `http://localhost:3001`

Или запустить отдельно:
```bash
# Терминал 1 - Бэкенд
npm run dev:server

# Терминал 2 - Фронтенд
npm run dev
```

### Бэкенд
Простой Express сервер с JSON хранилищем. Все данные сохраняются в `server/data/`.

**API Endpoints:**
- `GET /api/dorms` - список общежитий
- `POST /api/users/register` - регистрация
- `POST /api/users/login` - вход
- `GET /api/requests` - заявки (требует авторизацию)
- `POST /api/requests` - создать заявку
- `DELETE /api/requests/:id` - удалить заявку
- `GET /api/payments` - платежи (требует авторизацию)
- `POST /api/payments` - создать платеж

Подробнее в `server/README.md`

## Разработка

### Добавление новых общежитий
Редактируйте `src/data/dorms.ts`, добавляя объекты с полями `mapX`, `mapY` (0-1000), `geo` (опционально).

### Изменение карты
Замените `/public/assets/almaty-map.jpg` на новое изображение и обновите координаты маркеров.

### Настройка опросника
Редактируйте `src/components/OnboardingModal.tsx` для добавления/изменения вопросов.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c05fbddd-f6de-422d-9d14-fcc95fe178fb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c05fbddd-f6de-422d-9d14-fcc95fe178fb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

**DormEase** — прототип для демонстрации frontend-only MVP с полным циклом: поиск → заявка → демо-оплата → аутентификация → персонализация.
