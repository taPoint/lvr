# 🤖 LVR Telegram Bot

Telegram бот для отправки заявок с сайта LVR Языковая школа пользователю @uzbekburg.

## 📁 Структура файлов

```
backend/bot/
├── telegram_bot.py      # Основной файл бота
├── api_server.py        # API сервер для обработки форм
├── requirements.txt     # Зависимости Python
├── start.sh            # Скрипт запуска
└── README.md           # Этот файл
```

## 🚀 Быстрый старт

### 1. Создание Telegram бота

1. Напиши @BotFather в Telegram
2. Отправь команду `/newbot`
3. Придумай имя и username для бота
4. Скопируй токен, который даст BotFather

### 2. Установка на сервер

```bash
# Перейди в папку с ботом
cd /var/www/lvr/backend/bot

# Установи токен бота
export TELEGRAM_BOT_TOKEN='your_bot_token_here'

# Запусти бота
./start.sh
```

### 3. Настройка chat_id пользователя @uzbekburg

В файле `telegram_bot.py` уже настроен chat_id пользователя @uzbekburg (1512193467). Если нужно изменить получателя сообщений, отредактируйте функцию `_get_chat_id_by_username`.

### 4. Настройка веб-сервера

Для работы API нужно настроить проксирование запросов с фронтенда на API сервер.

#### Для Nginx:

Добавь в конфигурацию сайта:

```nginx
location /api/ {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

#### Для Apache:

Добавь в .htaccess:

```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
```

## 🔧 Настройка

### Переменные окружения

```bash
export TELEGRAM_BOT_TOKEN='your_bot_token_here'
```

### Автозапуск бота

Для автозапуска бота при перезагрузке сервера:

1. Создай systemd сервис:

```bash
sudo nano /etc/systemd/system/lvr-bot.service
```

2. Добавь содержимое:

```ini
[Unit]
Description=LVR Telegram Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/lvr/backend/bot
Environment=TELEGRAM_BOT_TOKEN=your_bot_token_here
ExecStart=/usr/bin/python3 api_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. Активируй сервис:

```bash
sudo systemctl daemon-reload
sudo systemctl enable lvr-bot
sudo systemctl start lvr-bot
```

## 📝 Как это работает

1. Пользователь заполняет форму на сайте
2. JavaScript отправляет данные на `/api/send-form`
3. API сервер получает данные и отправляет их боту
4. Бот форматирует сообщение и отправляет @uzbekburg

## 🐛 Отладка

### Проверка работы API:

```bash
curl -X GET http://localhost:5000/api/health
```

### Проверка отправки формы:

```bash
curl -X POST http://localhost:5000/api/send-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+79025101923","message":"Тестовое сообщение"}'
```

### Логи:

```bash
# Просмотр логов systemd сервиса
sudo journalctl -u lvr-bot -f

# Просмотр логов в реальном времени
tail -f /var/log/lvr-bot.log
```

## 🔒 Безопасность

- API принимает только POST запросы на `/api/send-form`
- Валидация всех входящих данных
- CORS настроен для работы с фронтендом
- Логирование всех операций

## 📞 Поддержка

При возникновении проблем проверь:

1. Правильность токена бота
2. Наличие chat_id пользователя @uzbekburg
3. Работоспособность API сервера
4. Настройки проксирования в веб-сервере
5. Логи на наличие ошибок
