// JavaScript для страницы оплаты
class PaymentManager {
    constructor() {
        this.currentUser = null;
        this.currentTopic = null;
        this.topicsData = {
            '1': {
                title: 'Present Simple',
                description: 'Настоящее простое время - основа английской грамматики',
                icon: '📚',
                price: 299
            },
            '2': {
                title: 'Past Simple',
                description: 'Простое прошедшее время - рассказываем о прошлом',
                icon: '⏰',
                price: 299
            },
            '3': {
                title: 'Future Simple',
                description: 'Простое будущее время - планируем будущее',
                icon: '🔮',
                price: 299
            },
            '4': {
                title: 'Present Continuous',
                description: 'Настоящее длительное время - действия в процессе',
                icon: '🔄',
                price: 299
            },
            '5': {
                title: 'Modal Verbs',
                description: 'Модальные глаголы - выражаем возможности и необходимость',
                icon: '💪',
                price: 299
            }
        };
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadTopicData();
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

    // Загрузка данных темы
    loadTopicData() {
        const topicId = sessionStorage.getItem('payment_topic');
        if (topicId && this.topicsData[topicId]) {
            this.currentTopic = topicId;
            this.updateTopicInfo();
        } else {
            // Если тема не выбрана, перенаправляем на главную
            this.redirectToMain();
        }
    }

    // Обновление информации о теме
    updateTopicInfo() {
        const topic = this.topicsData[this.currentTopic];
        if (!topic) return;

        const topicIcon = document.getElementById('topicIcon');
        const topicTitle = document.getElementById('topicTitle');
        const topicDescription = document.getElementById('topicDescription');

        if (topicIcon) topicIcon.textContent = topic.icon;
        if (topicTitle) topicTitle.textContent = topic.title;
        if (topicDescription) topicDescription.textContent = topic.description;
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопка оплаты
        const payButton = document.getElementById('payButton');
        if (payButton) {
            payButton.addEventListener('click', () => {
                this.handlePayment();
            });
        }

        // Кнопка "Вернуться к темам"
        const backLink = document.querySelector('.back-link');
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToMain();
            });
        }
    }

    // Проверка статуса авторизации
    checkAuthStatus() {
        if (!this.currentUser) {
            this.showAuthRequired();
        }
    }

    // Показать сообщение о необходимости авторизации
    showAuthRequired() {
        const paymentContent = document.querySelector('.payment-content');
        if (paymentContent) {
            paymentContent.innerHTML = `
                <div class="auth-required">
                    <div class="auth-icon">🔒</div>
                    <h2>Требуется авторизация</h2>
                    <p>Для покупки темы необходимо войти в систему</p>
                    <div class="auth-actions">
                        <button class="btn btn-primary" onclick="paymentManager.goToAuth()">Войти</button>
                        <button class="btn btn-secondary" onclick="paymentManager.redirectToMain()">Вернуться к темам</button>
                    </div>
                </div>
            `;
        }
    }

    // Переход к авторизации
    goToAuth() {
        window.location.href = 'auth.html';
    }

    // Обработка оплаты
    handlePayment() {
        if (!this.currentUser) {
            this.showNotification('Необходимо войти в систему', 'error');
            return;
        }

        if (!this.currentTopic) {
            this.showNotification('Тема не выбрана', 'error');
            return;
        }

        // Показываем процесс оплаты
        this.showPaymentProcess();
    }

    // Показать процесс оплаты
    showPaymentProcess() {
        const paymentActions = document.querySelector('.payment-actions');
        if (paymentActions) {
            paymentActions.innerHTML = `
                <div class="payment-process">
                    <div class="loading-spinner"></div>
                    <h3>Обработка оплаты...</h3>
                    <p>Пожалуйста, подождите</p>
                </div>
            `;
        }

        // Имитация процесса оплаты
        setTimeout(() => {
            this.completePayment();
        }, 3000);
    }

    // Завершение оплаты
    completePayment() {
        // Добавляем тему в список купленных
        this.addTopicToPurchased();

        // Показываем успешную оплату
        this.showPaymentSuccess();
    }

    // Добавить тему в список купленных
    addTopicToPurchased() {
        let purchasedTopics = [];
        const purchasedData = localStorage.getItem('pockets_purchased');
        
        if (purchasedData) {
            purchasedTopics = JSON.parse(purchasedData);
        }

        if (!purchasedTopics.includes(this.currentTopic)) {
            purchasedTopics.push(this.currentTopic);
            localStorage.setItem('pockets_purchased', JSON.stringify(purchasedTopics));
        }
    }

    // Показать успешную оплату
    showPaymentSuccess() {
        const paymentContent = document.querySelector('.payment-content');
        if (paymentContent) {
            paymentContent.innerHTML = `
                <div class="payment-success">
                    <div class="success-icon">✅</div>
                    <h2>Оплата прошла успешно!</h2>
                    <p>Тема "${this.topicsData[this.currentTopic].title}" добавлена в ваш аккаунт</p>
                    <div class="success-actions">
                        <button class="btn btn-primary" onclick="paymentManager.goToTopic()">Начать изучение</button>
                        <button class="btn btn-secondary" onclick="paymentManager.redirectToMain()">Вернуться к темам</button>
                    </div>
                </div>
            `;
        }
    }

    // Переход к изучению темы
    goToTopic() {
        window.location.href = `topic${this.currentTopic}.html`;
    }

    // Переход на главную страницу
    redirectToMain() {
        window.location.href = 'pockets.html';
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

// CSS анимации и стили
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

    .auth-required {
        text-align: center;
        padding: 60px 20px;
    }

    .auth-icon {
        font-size: 64px;
        margin-bottom: 20px;
    }

    .auth-required h2 {
        color: #dc3545;
        margin-bottom: 15px;
    }

    .auth-required p {
        color: #6c757d;
        margin-bottom: 30px;
        font-size: 18px;
    }

    .auth-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-width: 300px;
        margin: 0 auto;
    }

    .auth-actions .btn {
        width: 100%;
    }

    .payment-process {
        text-align: center;
        padding: 40px 20px;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .payment-process h3 {
        color: #007bff;
        margin-bottom: 10px;
    }

    .payment-process p {
        color: #6c757d;
    }

    .payment-success {
        text-align: center;
        padding: 60px 20px;
    }

    .success-icon {
        font-size: 64px;
        margin-bottom: 20px;
    }

    .payment-success h2 {
        color: #28a745;
        margin-bottom: 15px;
    }

    .payment-success p {
        color: #6c757d;
        margin-bottom: 30px;
        font-size: 18px;
    }

    .success-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-width: 300px;
        margin: 0 auto;
    }

    .success-actions .btn {
        width: 100%;
    }

    /* Адаптивность */
    @media (max-width: 768px) {
        .auth-actions,
        .success-actions {
            max-width: 100%;
        }
    }
`;
document.head.appendChild(style);

// Инициализация менеджера оплаты
let paymentManager;
document.addEventListener('DOMContentLoaded', () => {
    paymentManager = new PaymentManager();
});
