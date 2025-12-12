# Backend Server

Простой Express сервер для хранения данных в JSON файлах.

## Запуск

```bash
# Установить зависимости (если еще не установлены)
npm install

# Запустить только сервер
npm run dev:server

# Или запустить сервер и фронтенд одновременно
npm run dev:all
```

Сервер будет доступен на `http://localhost:3001`

## API Endpoints

### Общежития
- `GET /api/dorms` - получить все общежития
- `GET /api/dorms/:id` - получить общежитие по ID

### Пользователи
- `POST /api/users/register` - регистрация
- `POST /api/users/login` - вход
- `GET /api/users` - получить всех пользователей (без паролей)

### Заявки
- `GET /api/requests` - получить заявки (требует авторизацию)
- `POST /api/requests` - создать заявку
- `DELETE /api/requests/:id` - удалить заявку

### Платежи
- `GET /api/payments` - получить платежи (требует авторизацию)
- `POST /api/payments` - создать платеж

### Health Check
- `GET /api/health` - проверка работы сервера

## Хранение данных

Все данные хранятся в папке `server/data/` в JSON файлах:
- `users.json` - пользователи
- `sessions.json` - сессии
- `requests.json` - заявки
- `payments.json` - платежи

## Авторизация

Для защищенных endpoints нужно передать токен в заголовке:
```
Authorization: Bearer <token>
```

Токен получается при входе (`/api/users/login`).

