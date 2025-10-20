// JavaScript для страниц тем
class TopicManager {
    constructor() {
        this.currentUser = null;
        this.currentTopic = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadTopicData();
        this.setupEventListeners();
        this.checkAccess();
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
        // Получаем ID темы из URL
        const path = window.location.pathname;
        const match = path.match(/topic(\d+)\.html/);
        if (match) {
            this.currentTopic = match[1];
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Навигационные кнопки
        const nextBtn = document.querySelector('.topic__nav-btn--next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextTopic();
            });
        }

        const prevBtn = document.querySelector('.topic__nav-btn--prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousTopic();
            });
        }

        // Обновляем состояние кнопок
        this.updateNavigationButtons();
    }

    // Проверка доступа к теме
    checkAccess() {
        if (!this.currentUser) {
            this.showAuthRequired();
            return;
        }

        const purchasedTopics = this.getPurchasedTopics();
        if (!purchasedTopics.includes(this.currentTopic)) {
            this.showPaymentRequired();
            return;
        }

        // Тема доступна, показываем контент
        this.showTopicContent();
    }

    // Получить список купленных тем
    getPurchasedTopics() {
        const purchasedData = localStorage.getItem('pockets_purchased');
        if (purchasedData) {
            return JSON.parse(purchasedData);
        }
        return [];
    }

    // Показать сообщение о необходимости авторизации
    showAuthRequired() {
        const topicContent = document.querySelector('.topic__content');
        if (topicContent) {
            topicContent.innerHTML = `
                <div class="topic__auth-required">
                    <div class="topic__auth-icon">🔒</div>
                    <h2 class="topic__auth-title">Требуется авторизация</h2>
                    <p class="topic__auth-description">Для изучения темы необходимо войти в систему</p>
                    <div class="topic__auth-actions">
                        <button class="topic__btn topic__btn--primary" onclick="topicManager.goToAuth()">Войти</button>
                        <button class="topic__btn topic__btn--secondary" onclick="topicManager.goToMain()">Вернуться к темам</button>
                    </div>
                </div>
            `;
        }
    }

    // Показать сообщение о необходимости оплаты
    showPaymentRequired() {
        const topicContent = document.querySelector('.topic__content');
        if (topicContent) {
            topicContent.innerHTML = `
                <div class="topic__payment-required">
                    <div class="topic__payment-icon">💰</div>
                    <h2 class="topic__payment-title">Тема не куплена</h2>
                    <p class="topic__payment-description">Для изучения этой темы необходимо совершить покупку</p>
                    <div class="topic__payment-actions">
                        <button class="topic__btn topic__btn--primary" onclick="topicManager.goToPayment()">Купить тему</button>
                        <button class="topic__btn topic__btn--secondary" onclick="topicManager.goToMain()">Вернуться к темам</button>
                    </div>
                </div>
            `;
        }
    }

    // Показать контент темы
    showTopicContent() {
        // Контент уже загружен в HTML
        console.log('Тема доступна для изучения');
    }

    // Обновить кнопки навигации
    updateNavigationButtons() {
        const prevBtn = document.querySelector('.topic__nav-btn--prev');
        const nextBtn = document.querySelector('.topic__nav-btn--next');
        
        if (prevBtn) {
            prevBtn.disabled = parseInt(this.currentTopic) <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = parseInt(this.currentTopic) >= 5;
        }
    }

    // Переход к авторизации
    goToAuth() {
        window.location.href = '../auth.html';
    }

    // Переход к оплате
    goToPayment() {
        sessionStorage.setItem('payment_topic', this.currentTopic);
        window.location.href = '../payment.html';
    }

    // Переход на главную
    goToMain() {
        window.location.href = '../courses.html';
    }

    // Следующая тема
    nextTopic() {
        const nextTopicNumber = parseInt(this.currentTopic) + 1;
        if (nextTopicNumber <= 5) {
            window.location.href = `topic${nextTopicNumber}.html`;
        }
    }

    // Предыдущая тема
    previousTopic() {
        const prevTopicNumber = parseInt(this.currentTopic) - 1;
        if (prevTopicNumber >= 1) {
            window.location.href = `topic${prevTopicNumber}.html`;
        }
    }
}

// CSS стили для сообщений об ошибках
const style = document.createElement('style');
style.textContent = `
    .topic__auth-required,
    .topic__payment-required {
        text-align: center;
        padding: 60px 20px;
    }

    .topic__auth-icon,
    .topic__payment-icon {
        font-size: 64px;
        margin-bottom: 20px;
    }

    .topic__auth-title,
    .topic__payment-title {
        color: #dc3545;
        margin-bottom: 15px;
    }

    .topic__auth-description,
    .topic__payment-description {
        color: #6c757d;
        margin-bottom: 30px;
        font-size: 18px;
    }

    .topic__auth-actions,
    .topic__payment-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-width: 300px;
        margin: 0 auto;
    }

    .topic__btn {
        padding: 15px 30px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        width: 100%;
    }

    .topic__btn--primary {
        background-color: #007bff;
        color: white;
    }

    .topic__btn--primary:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
    }

    .topic__btn--secondary {
        background-color: #6c757d;
        color: white;
    }

    .topic__btn--secondary:hover {
        background-color: #545b62;
        transform: translateY(-2px);
    }

    /* Адаптивность */
    @media (max-width: 768px) {
        .topic__auth-actions,
        .topic__payment-actions {
            max-width: 100%;
        }
    }
`;
document.head.appendChild(style);

// Инициализация менеджера тем
let topicManager;
document.addEventListener('DOMContentLoaded', () => {
    topicManager = new TopicManager();
});
