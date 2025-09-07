// Основной JavaScript файл для главной страницы
class PocketsApp {
    constructor() {
        this.currentUser = null;
        this.purchasedTopics = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
    }

    // Загрузка данных пользователя из localStorage
    loadUserData() {
        const userData = localStorage.getItem('pockets_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }

        const purchasedData = localStorage.getItem('pockets_purchased');
        if (purchasedData) {
            this.purchasedTopics = JSON.parse(purchasedData);
        }
    }

    // Сохранение данных пользователя в localStorage
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('pockets_user', JSON.stringify(this.currentUser));
        }
        localStorage.setItem('pockets_purchased', JSON.stringify(this.purchasedTopics));
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопка входа
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showAuthModal());
        }

        // Клики по карточкам тем
        const topicCards = document.querySelectorAll('.topic-card');
        topicCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('topic-card__btn')) {
                    this.handleTopicClick(card);
                }
            });
        });

        // Кнопки "Начать изучение"
        const topicButtons = document.querySelectorAll('.topic-card__btn');
        topicButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.topic-card');
                this.handleTopicClick(card);
            });
        });

        // Модальное окно
        const modal = document.getElementById('authModal');
        if (modal) {
            const closeBtn = modal.querySelector('.modal__close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideAuthModal());
            }

            // Закрытие по клику вне модального окна
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAuthModal();
                }
            });
        }
    }

    // Показать модальное окно авторизации
    async showAuthModal() {
        const modal = document.getElementById('authModal');
        const authContent = document.getElementById('authContent');
        
        if (modal && authContent) {
            try {
                // Загружаем содержимое auth.html
                const response = await fetch('auth.html');
                const html = await response.text();
                
                // Извлекаем содержимое body
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const bodyContent = doc.body.innerHTML;
                
                authContent.innerHTML = bodyContent;
                
                // Инициализируем функционал авторизации
                this.initAuthFunctionality();
                
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } catch (error) {
                console.error('Ошибка загрузки страницы авторизации:', error);
                // Fallback - показываем простое модальное окно
                this.showSimpleAuthModal();
            }
        }
    }

    // Скрыть модальное окно
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Простое модальное окно авторизации (fallback)
    showSimpleAuthModal() {
        const authContent = document.getElementById('authContent');
        if (authContent) {
            authContent.innerHTML = `
                <div style="padding: 30px;">
                    <h2>Вход в систему</h2>
                    <div style="margin: 20px 0;">
                        <input type="text" id="simpleEmail" placeholder="Email" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <input type="password" id="simplePassword" placeholder="Пароль" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <button onclick="app.simpleLogin()" style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Войти</button>
                    </div>
                    <p style="text-align: center; color: #666;">
                        Тестовый аккаунт: admin / admin
                    </p>
                </div>
            `;
        }
    }

    // Простой вход (fallback)
    simpleLogin() {
        const email = document.getElementById('simpleEmail').value;
        const password = document.getElementById('simplePassword').value;

        if (email === 'admin' && password === 'admin') {
            this.currentUser = {
                id: 'admin',
                name: 'Администратор',
                email: 'admin'
            };
            this.saveUserData();
            this.hideAuthModal();
            this.updateUI();
            this.showNotification('Успешный вход!', 'success');
        } else {
            this.showNotification('Неверные данные для входа', 'error');
        }
    }

    // Инициализация функционала авторизации
    initAuthFunctionality() {
        // Переключение между формами
        const tabBtns = document.querySelectorAll('.auth__tab-btn');
        const authForms = document.querySelectorAll('.auth__form');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Убираем активный класс у всех кнопок и форм
                tabBtns.forEach(b => b.classList.remove('auth__tab-btn--active'));
                authForms.forEach(f => f.classList.remove('auth__form--active'));
                
                // Добавляем активный класс выбранной кнопке и форме
                btn.classList.add('auth__tab-btn--active');
                document.getElementById(tab + 'Form').classList.add('auth__form--active');
            });
        });

        // Обработка формы входа
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Обработка формы регистрации
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Тестовый аккаунт
        const testAccountBtn = document.getElementById('useTestAccount');
        if (testAccountBtn) {
            testAccountBtn.addEventListener('click', () => {
                this.currentUser = {
                    id: 'admin',
                    name: 'Администратор',
                    email: 'admin'
                };
                this.saveUserData();
                this.hideAuthModal();
                this.updateUI();
                this.showNotification('Вход с тестовым аккаунтом!', 'success');
            });
        }
    }

    // Обработка входа
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (email === 'admin' && password === 'admin') {
            this.currentUser = {
                id: 'admin',
                name: 'Администратор',
                email: 'admin'
            };
            this.saveUserData();
            this.hideAuthModal();
            this.updateUI();
            this.showNotification('Успешный вход!', 'success');
        } else {
            this.showNotification('Неверные данные для входа', 'error');
        }
    }

    // Обработка регистрации
    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        if (password !== passwordConfirm) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        // Простая проверка
        if (name && email && password) {
            this.currentUser = {
                id: Date.now().toString(),
                name: name,
                email: email
            };
            this.saveUserData();
            this.hideAuthModal();
            this.updateUI();
            this.showNotification('Регистрация успешна!', 'success');
        } else {
            this.showNotification('Заполните все поля', 'error');
        }
    }

    // Обработка клика по теме
    handleTopicClick(card) {
        const topicId = card.dataset.topic;
        
        // Бесплатный топик доступен без регистрации
        if (topicId === 'free') {
            this.goToTopic(topicId);
            return;
        }
        
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        // Проверяем, куплена ли тема
        if (this.isTopicPurchased(topicId)) {
            // Переходим к изучению темы
            this.goToTopic(topicId);
        } else {
            // Показываем страницу оплаты
            this.showPaymentPage(topicId);
        }
    }

    // Проверка покупки темы
    isTopicPurchased(topicId) {
        return this.purchasedTopics.includes(topicId);
    }

    // Переход к изучению темы
    goToTopic(topicId) {
        if (topicId === 'free') {
            window.location.href = 'topics/topic-free.html';
        } else {
            window.location.href = `topics/topic${topicId}.html`;
        }
    }

    // Показать страницу оплаты
    showPaymentPage(topicId) {
        // Сохраняем ID темы для оплаты
        sessionStorage.setItem('payment_topic', topicId);
        window.location.href = 'payment.html';
    }

    // Обновление UI
    updateUI() {
        if (this.currentUser) {
            // Создаем выпадающее меню для пользователя
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                this.createUserDropdown(loginBtn);
            }
        } else {
            // Удаляем выпадающее меню если есть
            const existingDropdown = document.querySelector('.user-dropdown');
            if (existingDropdown) {
                existingDropdown.remove();
            }
            
            // Удаляем контейнер пользователя если есть
            const userContainer = document.querySelector('.user-container');
            if (userContainer) {
                userContainer.remove();
            }
            
            // Восстанавливаем кнопку входа
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.textContent = 'Войти';
                loginBtn.className = 'header__btn header__btn--primary';
                loginBtn.onclick = () => this.showAuthModal();
            } else {
                // Если кнопка была заменена, создаем новую
                this.restoreLoginButton();
            }
        }

        // Обновляем статус тем
        this.updateTopicsStatus();
    }

    // Восстановление кнопки входа
    restoreLoginButton() {
        const userContainer = document.querySelector('.user-container');
        if (userContainer) {
            // Создаем новую кнопку входа
            const newLoginBtn = document.createElement('button');
            newLoginBtn.id = 'loginBtn';
            newLoginBtn.className = 'header__btn header__btn--primary';
            newLoginBtn.textContent = 'Войти';
            newLoginBtn.onclick = () => this.showAuthModal();
            
            // Заменяем контейнер пользователя на кнопку входа
            userContainer.parentNode.replaceChild(newLoginBtn, userContainer);
        } else {
            // Если контейнера нет, ищем кнопку в контактах
            const contactsDiv = document.querySelector('.header__contacts');
            if (contactsDiv) {
                const newLoginBtn = document.createElement('button');
                newLoginBtn.id = 'loginBtn';
                newLoginBtn.className = 'header__btn header__btn--primary';
                newLoginBtn.textContent = 'Войти';
                newLoginBtn.onclick = () => this.showAuthModal();
                
                contactsDiv.appendChild(newLoginBtn);
            }
        }
    }

    // Создание выпадающего меню пользователя
    createUserDropdown(loginBtn) {
        // Удаляем старое меню если есть
        const existingDropdown = document.querySelector('.user-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        // Удаляем старый обработчик события
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

        // Создаем контейнер для кнопки и меню
        const userContainer = document.createElement('div');
        userContainer.className = 'user-container';
        userContainer.style.position = 'relative';

        // Заменяем кнопку входа на кнопку пользователя
        newLoginBtn.textContent = this.currentUser.name;
        newLoginBtn.innerHTML = `
            <i class="header__user-icon" data-lucide="user"></i>
            ${this.currentUser.name}
            <i class="header__dropdown-icon" data-lucide="chevron-down"></i>
        `;
        newLoginBtn.className = 'header__btn header__btn--user';
        newLoginBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleUserDropdown();
        };

        // Создаем выпадающее меню
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="user-dropdown__header">
                <div class="user-dropdown__avatar">
                    <i data-lucide="user"></i>
                </div>
                <div class="user-dropdown__info">
                    <div class="user-dropdown__name">${this.currentUser.name}</div>
                    <div class="user-dropdown__email">${this.currentUser.email}</div>
                </div>
            </div>
            <div class="user-dropdown__divider"></div>
            <div class="user-dropdown__menu">
                <button class="user-dropdown__item" onclick="app.showProfile()">
                    <i data-lucide="user"></i>
                    Профиль
                </button>
                <button class="user-dropdown__item" onclick="app.showSettings()">
                    <i data-lucide="settings"></i>
                    Настройки
                </button>
                <div class="user-dropdown__divider"></div>
                <button class="user-dropdown__item user-dropdown__item--danger" onclick="app.logout()">
                    <i data-lucide="log-out"></i>
                    Выйти из аккаунта
                </button>
            </div>
        `;

        // Вставляем контейнер
        newLoginBtn.parentNode.insertBefore(userContainer, newLoginBtn);
        userContainer.appendChild(newLoginBtn);
        userContainer.appendChild(dropdown);

        // Инициализируем иконки
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!userContainer.contains(e.target)) {
                this.hideUserDropdown();
            }
        });
    }

    // Показать/скрыть выпадающее меню
    toggleUserDropdown() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('user-dropdown--active');
        }
    }

    hideUserDropdown() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.classList.remove('user-dropdown--active');
        }
    }

    // Показать профиль (заглушка)
    showProfile() {
        this.hideUserDropdown();
        this.showNotification('Функция профиля в разработке', 'info');
    }

    // Показать настройки (заглушка)
    showSettings() {
        this.hideUserDropdown();
        this.showNotification('Функция настроек в разработке', 'info');
    }

    // Обновление статуса тем
    updateTopicsStatus() {
        const topicCards = document.querySelectorAll('.topic-card');
        topicCards.forEach(card => {
            const topicId = card.dataset.topic;
            const button = card.querySelector('.topic-card__btn');
            
            // Бесплатный топик всегда доступен
            if (topicId === 'free') {
                button.textContent = 'Начать бесплатно';
                button.style.backgroundColor = '#0ea5e9';
                button.style.color = 'white';
                return;
            }
            
            if (this.currentUser) {
                if (this.isTopicPurchased(topicId)) {
                    button.textContent = 'Изучать';
                    button.style.backgroundColor = '#28a745';
                } else {
                    button.textContent = 'Купить за 299₽';
                    button.style.backgroundColor = '#ffc107';
                    button.style.color = '#000';
                }
            } else {
                button.textContent = 'Начать изучение';
                button.style.backgroundColor = '#28a745';
                button.style.color = 'white';
            }
        });
    }

    // Выход из системы
    logout() {
        this.currentUser = null;
        localStorage.removeItem('pockets_user');
        this.updateUI();
        this.showNotification('Вы вышли из системы', 'info');
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        // Цвета для разных типов уведомлений
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'info':
                notification.style.backgroundColor = '#17a2b8';
                break;
            default:
                notification.style.backgroundColor = '#6c757d';
        }

        // Добавляем в DOM
        document.body.appendChild(notification);

        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// CSS анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PocketsApp();
});
