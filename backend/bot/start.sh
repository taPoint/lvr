#!/bin/bash
# Скрипт для запуска Telegram бота и API сервера LVR

echo "🚀 Запуск LVR Telegram Bot и API сервера..."

# Проверяем наличие Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python3."
    exit 1
fi

# Проверяем наличие pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 не найден. Установите pip3."
    exit 1
fi

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
pip3 install -r requirements.txt

# Проверяем наличие токена
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Токен Telegram бота не найден!"
    echo "Установите переменную окружения TELEGRAM_BOT_TOKEN"
    echo "Пример: export TELEGRAM_BOT_TOKEN='your_bot_token_here'"
    exit 1
fi

echo "✅ Все проверки пройдены!"
echo "🌐 Запуск API сервера на порту 5000..."

# Запускаем API сервер
python3 api_server.py
