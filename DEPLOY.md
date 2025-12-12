# Деплой на GitHub Pages

## Автоматический деплой (рекомендуется)

1. **Включите GitHub Pages в настройках репозитория:**
   - Перейдите в Settings → Pages
   - Source: выберите "GitHub Actions"

2. **Запушьте код в репозиторий:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages"
   git push origin main
   ```

3. **Деплой запустится автоматически** при каждом push в main/master

## Ручной деплой

### Вариант 1: Через npm скрипт

```bash
# Установите имя репозитория в package.json (если нужно)
# Затем запустите:
npm run deploy
```

### Вариант 2: Через GitHub Actions

1. Перейдите в Actions → Deploy to GitHub Pages (Manual)
2. Нажмите "Run workflow"

## Настройка base path

Если ваш репозиторий называется не `username.github.io`, нужно указать имя репозитория:

1. **В vite.config.ts** уже настроено автоматическое определение
2. **Или создайте файл `.env`:**
   ```
   VITE_BASE_PATH=/almaty-dorm-finder/
   ```

## Важные замечания

⚠️ **Бэкенд не будет работать на GitHub Pages** (это статический хостинг)
- Приложение автоматически использует localStorage как fallback
- Все данные будут храниться локально в браузере

## Проверка деплоя

После деплоя ваше приложение будет доступно по адресу:
- `https://username.github.io/almaty-dorm-finder/` (если репозиторий не username.github.io)
- `https://username.github.io/` (если репозиторий называется username.github.io)

