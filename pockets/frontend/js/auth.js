// JavaScript для страницы авторизации
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    // Загрузка данных пользователя
    loadUserData() {
        const userData = localStorage.getItem('pockets_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // Сохранение данных пользователя
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('pockets_user', JSON.stringify(this.currentUser));
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Переключение между формами
        const tabBtns = document.querySelectorAll('.auth__tab-btn');
        const authForms = document.querySelectorAll('.auth__form');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Форма входа
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Форма регистрации
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
                this.useTestAccount();
            });
        }

        // Забыли пароль
        const forgotPasswordLink = document.querySelector('.auth__form-link--forgot');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPassword();
            });
        }
    }

    // Переключение между вкладками
    switchTab(tab) {
        const tabBtns = document.querySelectorAll('.auth__tab-btn');
        const authForms = document.querySelectorAll('.auth__form');

        // Убираем активный класс у всех кнопок и форм
        tabBtns.forEach(btn => btn.classList.remove('auth__tab-btn--active'));
        authForms.forEach(form => form.classList.remove('auth__form--active'));

        // Добавляем активный класс выбранной кнопке и форме
        const selectedBtn = document.querySelector(`[data-tab="${tab}"]`);
        const selectedForm = document.getElementById(tab + 'Form');

        if (selectedBtn) selectedBtn.classList.add('auth__tab-btn--active');
        if (selectedForm) selectedForm.classList.add('auth__form--active');
    }

    // Обработка входа
    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Валидация
        if (!this.validateEmail(email)) {
            this.showError('Введите корректный email');
            return;
        }

        if (!password) {
            this.showError('Введите пароль');
            return;
        }

        // Проверка тестового аккаунта
        if (email === 'admin' && password === 'admin') {
            this.currentUser = {
                id: 'admin',
                name: 'Администратор',
                email: 'admin',
                role: 'admin'
            };
            this.saveUserData();
            this.showSuccess('Успешный вход!');
            this.redirectToMain();
        } else {
            // Здесь будет проверка через Firebase в будущем
            this.showError('Неверные данные для входа');
        }
    }

    // Обработка регистрации
    handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        // Валидация
        if (!name) {
            this.showError('Введите имя');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Введите корректный email');
            return;
        }

        if (password.length < 6) {
            this.showError('Пароль должен содержать минимум 6 символов');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('Пароли не совпадают');
            return;
        }

        // Создание пользователя
        this.currentUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        this.saveUserData();
        this.showSuccess('Регистрация успешна!');
        this.redirectToMain();
    }

    // Использование тестового аккаунта
    useTestAccount() {
        this.currentUser = {
            id: 'admin',
            name: 'Администратор',
            email: 'admin',
            role: 'admin'
        };
        this.saveUserData();
        this.showSuccess('Вход с тестовым аккаунтом!');
        this.redirectToMain();
    }

    // Показать форму "Забыли пароль"
    showForgotPassword() {
        const authContent = document.querySelector('.auth');
        if (authContent) {
            authContent.innerHTML = `
                <div class="auth__forgot-password">
                    <h2 class="auth__forgot-title">Восстановление пароля</h2>
                    <p class="auth__forgot-description">Введите ваш email для восстановления пароля</p>
                    <form id="forgotPasswordForm" class="auth__forgot-form">
                        <div class="auth__form-group">
                            <label for="forgotEmail" class="auth__form-label">Email</label>
                            <input type="email" id="forgotEmail" name="email" class="auth__form-input" required>
                        </div>
                        <button type="submit" class="auth__form-btn auth__form-btn--primary">Отправить</button>
                    </form>
                    <div class="auth__form-footer">
                        <a href="#" class="auth__form-link auth__form-link--back">← Вернуться к входу</a>
                    </div>
                </div>
            `;

            // Обработчик для формы восстановления
            const forgotForm = document.getElementById('forgotPasswordForm');
            if (forgotForm) {
                forgotForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleForgotPassword();
                });
            }

            // Обработчик для возврата к входу
            const backLink = document.querySelector('.auth__form-link--back');
            if (backLink) {
                backLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.reloadPage();
                });
            }
        }
    }

    // Обработка восстановления пароля
    handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();
        
        if (!this.validateEmail(email)) {
            this.showError('Введите корректный email');
            return;
        }

        // Здесь будет отправка email для восстановления через Firebase
        this.showSuccess('Инструкции по восстановлению пароля отправлены на ваш email');
        
        setTimeout(() => {
            this.reloadPage();
        }, 2000);
    }

    // Валидация email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Проверка статуса авторизации
    checkAuthStatus() {
        if (this.currentUser) {
            this.showUserInfo();
        }
    }

    // Показать информацию о пользователе
    showUserInfo() {
        const authContent = document.querySelector('.auth');
        if (authContent) {
            authContent.innerHTML = `
                <div class="auth__user-info">
                    <h2 class="auth__user-title">Добро пожаловать, ${this.currentUser.name}!</h2>
                    <p class="auth__user-email">Email: ${this.currentUser.email}</p>
                    <p class="auth__user-role">Роль: ${this.currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                    <div class="auth__user-actions">
                        <button class="auth__form-btn auth__form-btn--primary" onclick="authManager.redirectToMain()">Перейти к темам</button>
                        <button class="auth__form-btn auth__form-btn--secondary" onclick="authManager.logout()">Выйти</button>
                    </div>
                </div>
            `;
        }
    }

    // Выход из системы
    logout() {
        this.currentUser = null;
        localStorage.removeItem('pockets_user');
        this.showSuccess('Вы вышли из системы');
        setTimeout(() => {
            this.reloadPage();
        }, 1500);
    }

    // Переход на главную страницу
    redirectToMain() {
        window.location.href = 'pockets.html';
    }

    // Перезагрузка страницы
    reloadPage() {
        window.location.reload();
    }

    // Показать ошибку
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Показать успех
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        // Создаем новое уведомление
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
            max-width: 300px;
            word-wrap: break-word;
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

        // Удаляем через 4 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
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

    .auth__forgot-password {
        text-align: center;
    }

    .auth__forgot-title {
        color: #007bff;
        margin-bottom: 20px;
    }

    .auth__forgot-description {
        color: #666;
        margin-bottom: 25px;
    }

    .auth__user-info {
        text-align: center;
    }

    .auth__user-title {
        color: #007bff;
        margin-bottom: 20px;
    }

    .auth__user-email,
    .auth__user-role {
        color: #666;
        margin-bottom: 10px;
    }

    .auth__user-actions {
        margin-top: 25px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .auth__user-actions .auth__form-btn {
        width: 100%;
    }
`;
document.head.appendChild(style);

// Инициализация менеджера авторизации
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});
