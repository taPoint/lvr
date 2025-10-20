#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Telegram Bot для LVR Языковая школа
Отправляет данные из формы контактов пользователю @uzbekburg
"""

import asyncio
import logging
from telegram import Bot
from telegram.error import TelegramError
import json
import os
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class LVRBot:
    def __init__(self, token):
        self.bot = Bot(token=token)
        self.target_username = "uzbekburg"  # Пользователь, которому отправляем сообщения
        
    async def send_form_data(self, name, phone, message=""):
        """
        Отправляет данные формы пользователю @uzbekburg
        """
        try:
            # Форматируем сообщение
            formatted_message = self._format_message(name, phone, message)
            
            # Получаем chat_id пользователя по username
            chat_id = await self._get_chat_id_by_username(self.target_username)
            
            if chat_id:
                # Отправляем сообщение
                await self.bot.send_message(
                    chat_id=chat_id,
                    text=formatted_message,
                    parse_mode='HTML'
                )
                logger.info(f"Сообщение отправлено пользователю {self.target_username}")
                return True
            else:
                logger.error(f"Не удалось найти пользователя {self.target_username}")
                return False
                
        except TelegramError as e:
            logger.error(f"Ошибка Telegram: {e}")
            return False
        except Exception as e:
            logger.error(f"Общая ошибка: {e}")
            return False
    
    def _format_message(self, name, phone, message):
        """
        Форматирует сообщение с данными формы
        """
        timestamp = datetime.now().strftime("%d.%m.%Y %H:%M")
        
        formatted_text = f"""
🎓 <b>Новая заявка с сайта LVR Языковая школа</b>

👤 <b>Имя:</b> {name}
📞 <b>Телефон:</b> {phone}
📝 <b>Сообщение:</b> {message if message else 'Не указано'}
⏰ <b>Время:</b> {timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 <i>Это автоматическое сообщение от бота LVR</i>
        """.strip()
        
        return formatted_text
    
    async def _get_chat_id_by_username(self, username):
        """
        Получает chat_id пользователя по username
        """
        try:
            # Используем реальный chat_id пользователя @uzbekburg
            return "1512193467"
            
        except Exception as e:
            logger.error(f"Ошибка получения chat_id: {e}")
            return None
    
    async def start_polling(self):
        """
        Запускает бота в режиме polling
        """
        try:
            logger.info("Запуск бота...")
            await self.bot.get_me()
            logger.info("Бот успешно запущен!")
            
            # Здесь можно добавить команды бота
            # Пока что бот работает только для отправки сообщений
            
        except Exception as e:
            logger.error(f"Ошибка запуска бота: {e}")

# Функция для отправки данных (вызывается из API)
async def send_form_to_telegram(name, phone, message=""):
    """
    Функция для отправки данных формы в Telegram
    """
    # Получаем токен из переменной окружения
    token = os.getenv('TELEGRAM_BOT_TOKEN', '7879860306:AAHxoWZU1Sk5S-vlNWy4TgiUl72TZ0xZK5M')
    
    if not token:
        logger.error("Токен Telegram бота не найден в переменных окружения!")
        return False
    
    bot = LVRBot(token)
    return await bot.send_form_data(name, phone, message)

if __name__ == "__main__":
    # Для тестирования бота
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    
    if not token:
        print("❌ Ошибка: Токен Telegram бота не найден!")
        print("Установите переменную окружения TELEGRAM_BOT_TOKEN")
        exit(1)
    
    bot = LVRBot(token)
    
    # Запускаем бота
    asyncio.run(bot.start_polling())
