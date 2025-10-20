# 🚀 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ LVR TELEGRAM BOT

## ✅ Что уже готово:

1. **Python файлы созданы:**
   - `telegram_bot.py` - основной бот
   - `api_server.py` - API сервер
   - `get_chat_id.py` - скрипт для получения chat_id

2. **JavaScript обновлен:**
   - Форма теперь отправляет данные на API
   - Добавлена валидация и индикатор загрузки

3. **Скрипты запуска готовы:**
   - `start.sh` - запуск бота
   - `requirements.txt` - зависимости

## 🔧 Что нужно сделать:

### 1. Создать Telegram бота:
```bash
# Напиши @BotFather в Telegram
# Команда: /newbot
# Получи токен
```

### 2. Установить токен:
```bash
export TELEGRAM_BOT_TOKEN='your_bot_token_here'
```

### 3. Установить зависимости:
```bash
pip3 install -r requirements.txt
```

### 4. Запустить бота:
```bash
./start.sh
```

### 5. Настроить веб-сервер (Nginx):
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

### 6. Перезапустить Nginx:
```bash
sudo systemctl reload nginx
```

## 🎯 Результат:

После настройки:
- Форма на сайте будет отправлять данные в Telegram
- Пользователь @uzbekburg получит красиво оформленные сообщения
- Сообщения будут содержать: имя, телефон, сообщение и время

## 🐛 Если что-то не работает:

1. Проверь токен бота
2. Проверь chat_id пользователя
3. Проверь логи: `sudo journalctl -u lvr-bot -f`
4. Проверь API: `curl http://localhost:5000/api/health`

## 📞 Формат сообщений:

Бот будет отправлять сообщения в таком формате:

```
🎓 Новая заявка с сайта LVR Языковая школа

👤 Имя: Иван Иванов
📞 Телефон: +7-902-510-19-23
📝 Сообщение: Хочу изучать английский язык
⏰ Время: 13.10.2024 15:30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Это автоматическое сообщение от бота LVR
```

Готово! 🎉
