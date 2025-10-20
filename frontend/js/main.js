// Основной JavaScript файл для LVR Языковая школа

document.addEventListener('DOMContentLoaded', function() {
    
    // Функция плавной прокрутки к элементу
    function smoothScrollTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Функция для открытия контактов с номером телефона
    function openPhoneContacts() {
        const phoneNumber = '+79025101923';
        
        // Проверяем, поддерживает ли устройство tel: протокол
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Для мобильных устройств
            window.location.href = `tel:${phoneNumber}`;
        } else {
            // Для десктопа - копируем номер в буфер обмена
            navigator.clipboard.writeText(phoneNumber).then(function() {
                alert(`Номер телефона ${phoneNumber} скопирован в буфер обмена!`);
            }).catch(function() {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = phoneNumber;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert(`Номер телефона ${phoneNumber} скопирован в буфер обмена!`);
            });
        }
    }

    // Функция для открытия Telegram чата
    function openTelegramChat() {
        const telegramUsername = 'markidonova_elvira';
        const telegramUrl = `https://t.me/${telegramUsername}`;
        
        // Открываем в новой вкладке
        window.open(telegramUrl, '_blank');
    }

    // Обработчики для кнопок прокрутки к контактам
    const scrollToContactsButtons = [
        '.hero__button--primary',
        '.teacher__button',
        '.gallery__cta-button'
    ];

    scrollToContactsButtons.forEach(selector => {
        const button = document.querySelector(selector);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                smoothScrollTo('contacts');
            });
        }
    });

    // Обработчик для кнопки "Позвонить"
    const phoneButton = document.querySelector('.contacts__quick-button--primary');
    if (phoneButton) {
        phoneButton.addEventListener('click', function(e) {
            e.preventDefault();
            openPhoneContacts();
        });
    }

    // Обработчик для кнопки "Telegram"
    const telegramButton = document.querySelector('.contacts__quick-button--secondary');
    if (telegramButton) {
        telegramButton.addEventListener('click', function(e) {
            e.preventDefault();
            openTelegramChat();
        });
    }

    // Дополнительная функциональность для мобильного меню (если есть)
    const burgerMenu = document.getElementById('burgerMenu');
    if (burgerMenu) {
        burgerMenu.addEventListener('click', function() {
            // Здесь можно добавить логику для мобильного меню
            console.log('Burger menu clicked');
        });
    }

    // Обработчики для навигационных ссылок в хедере
    const navLinks = document.querySelectorAll('.header__nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href.substring(1));
            }
        });
    });

    // Функция валидации номера телефона
    function validatePhone(phone) {
        // Убираем все символы кроме цифр и +
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        
        // Проверяем российские номера
        const russianPattern = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        
        return russianPattern.test(cleanPhone) && cleanPhone.length >= 10;
    }

    // Обработчик формы контактов
    const contactForm = document.querySelector('.contacts__form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Получаем данные формы
            const formData = new FormData(contactForm);
            const name = formData.get('name') || '';
            const phone = formData.get('phone') || '';
            const message = formData.get('message') || '';
            
            // Валидация имени
            if (!name.trim()) {
                alert('Пожалуйста, введите ваше имя');
                return;
            }
            
            if (name.trim().length < 2) {
                alert('Имя должно содержать минимум 2 символа');
                return;
            }
            
            // Валидация телефона
            if (!phone.trim()) {
                alert('Пожалуйста, введите ваш телефон');
                return;
            }
            
            if (!validatePhone(phone.trim())) {
                alert('Пожалуйста, введите корректный номер телефона (например: +7-902-510-19-23)');
                return;
            }
            
            // Показываем индикатор загрузки
            const submitButton = contactForm.querySelector('.contacts__form-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Отправка...';
            submitButton.disabled = true;
            
            try {
                // Отправляем данные на API
                const response = await fetch('/api/send-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        phone: phone.trim(),
                        message: message.trim() // Сообщение не обязательно
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(result.message);
                    contactForm.reset(); // Очищаем форму
                } else {
                    alert(result.error || 'Произошла ошибка при отправке заявки');
                }
                
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                alert('Произошла ошибка при отправке заявки. Попробуйте позже.');
            } finally {
                // Восстанавливаем кнопку
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

    // Инициализация Lucide иконок (если не была выполнена ранее)
    if (typeof lucide !== 'undefined' && !document.querySelector('[data-lucide-processed]')) {
        lucide.createIcons();
    }
});
