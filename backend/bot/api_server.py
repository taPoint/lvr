#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API сервер для обработки данных формы контактов
Принимает данные из веб-формы и отправляет их в Telegram
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import logging
import os
from telegram_bot import send_form_to_telegram

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для запросов с фронтенда

@app.route('/api/send-form', methods=['POST'])
def send_form():
    """
    Обрабатывает данные формы и отправляет их в Telegram
    """
    try:
        # Получаем данные из запроса
        data = request.get_json()
        
        # Проверяем обязательные поля
        if not data:
            return jsonify({
                'success': False,
                'error': 'Данные не получены'
            }), 400
        
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        message = data.get('message', '').strip()
        
        # Валидация имени
        if not name:
            return jsonify({
                'success': False,
                'error': 'Имя обязательно для заполнения'
            }), 400
        
        if len(name) < 2:
            return jsonify({
                'success': False,
                'error': 'Имя должно содержать минимум 2 символа'
            }), 400
        
        # Валидация телефона
        if not phone:
            return jsonify({
                'success': False,
                'error': 'Телефон обязателен для заполнения'
            }), 400
        
        # Простая валидация российского номера
        import re
        phone_clean = re.sub(r'[^\d+]', '', phone)
        if not re.match(r'^(\+7|7|8)?[489]\d{9}$', phone_clean) or len(phone_clean) < 10:
            return jsonify({
                'success': False,
                'error': 'Пожалуйста, введите корректный номер телефона'
            }), 400
        
        # Логируем полученные данные
        logger.info(f"Получена заявка: {name}, {phone}, {message}")
        
        # Отправляем данные в Telegram
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            success = loop.run_until_complete(
                send_form_to_telegram(name, phone, message)
            )
            
            if success:
                logger.info("Заявка успешно отправлена в Telegram")
                return jsonify({
                    'success': True,
                    'message': 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
                })
            else:
                logger.error("Ошибка отправки в Telegram")
                return jsonify({
                    'success': False,
                    'error': 'Ошибка отправки заявки. Попробуйте позже.'
                }), 500
                
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Ошибка обработки заявки: {e}")
        return jsonify({
            'success': False,
            'error': 'Внутренняя ошибка сервера'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Проверка работоспособности API
    """
    return jsonify({
        'status': 'ok',
        'message': 'LVR API работает'
    })

@app.route('/', methods=['GET'])
def index():
    """
    Главная страница API
    """
    return jsonify({
        'message': 'LVR Языковая школа - API сервер',
        'version': '1.0.0',
        'endpoints': {
            'POST /api/send-form': 'Отправка данных формы',
            'GET /api/health': 'Проверка работоспособности'
        }
    })

if __name__ == '__main__':
    # Проверяем наличие токена
    token = os.getenv('TELEGRAM_BOT_TOKEN', '7879860306:AAHxoWZU1Sk5S-vlNWy4TgiUl72TZ0xZK5M')
    if not token:
        logger.error("❌ Токен Telegram бота не найден!")
        logger.error("Установите переменную окружения TELEGRAM_BOT_TOKEN")
        exit(1)
    
    logger.info("🚀 Запуск API сервера LVR...")
    logger.info("📡 Сервер будет доступен по адресу: http://localhost:5000")
    
    # Запускаем сервер
    app.run(
        host='0.0.0.0',  # Доступен извне
        port=5000,
        debug=False  # В продакшене лучше False
    )
