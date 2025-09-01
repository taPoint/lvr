// JavaScript для страниц тем
class TopicManager {
    constructor() {
        this.currentUser = null;
        this.currentTopic = null;
        this.exerciseResults = {};
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadTopicData();
        this.setupEventListeners();
        this.checkAccess();
        this.loadProgress();
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
        // Кнопки проверки упражнений
        const checkButtons = document.querySelectorAll('.exercise__btn--check');
        checkButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exerciseId = e.target.closest('.exercise').id;
                const exerciseNumber = exerciseId.replace('exercise', '');
                this.checkAnswer(parseInt(exerciseNumber));
            });
        });

        // Кнопка начала теста
        const startTestBtn = document.getElementById('startTest');
        if (startTestBtn) {
            startTestBtn.addEventListener('click', () => {
                this.startTest();
            });
        }

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
        // Контент уже загружен в HTML, просто обновляем прогресс
        this.updateProgress();
    }

    // Проверка ответа на упражнение
    checkAnswer(exerciseNumber) {
        let isCorrect = false;
        let userAnswer = '';
        let correctAnswer = '';

        switch (exerciseNumber) {
            case 1:
                // Упражнение с выбором правильной формы глагола
                const selectedOption = document.querySelector(`input[name="q1"]:checked`);
                if (selectedOption) {
                    userAnswer = selectedOption.value;
                    correctAnswer = 'lives';
                    isCorrect = userAnswer === correctAnswer;
                }
                break;

            case 2:
                // Упражнение с вводом правильной формы глагола
                userAnswer = document.getElementById('answer2').value.trim().toLowerCase();
                correctAnswer = 'works';
                isCorrect = userAnswer === correctAnswer;
                break;

            case 3:
                // Упражнение с переводом
                userAnswer = document.getElementById('answer3').value.trim().toLowerCase();
                correctAnswer = 'i study at university';
                isCorrect = userAnswer === correctAnswer || 
                           userAnswer === 'i study at the university' ||
                           userAnswer === 'i study at a university';
                break;
        }

        // Сохраняем результат
        this.exerciseResults[exerciseNumber] = {
            isCorrect: isCorrect,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer
        };

        // Показываем результат
        this.showExerciseResult(exerciseNumber, isCorrect, userAnswer, correctAnswer);

        // Обновляем прогресс
        this.updateProgress();
    }

    // Показать результат упражнения
    showExerciseResult(exerciseNumber, isCorrect, userAnswer, correctAnswer) {
        const exercise = document.getElementById(`exercise${exerciseNumber}`);
        if (!exercise) return;

        // Убираем существующие сообщения о результате
        const existingResult = exercise.querySelector('.exercise__result');
        if (existingResult) {
            existingResult.remove();
        }

        // Создаем сообщение о результате
        const resultDiv = document.createElement('div');
        resultDiv.className = `exercise__result exercise__result--${isCorrect ? 'correct' : 'incorrect'}`;
        
        if (isCorrect) {
            resultDiv.innerHTML = `
                <div class="exercise__result-icon">✅</div>
                <p class="exercise__result-text">Правильно! Молодец!</p>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="exercise__result-icon">❌</div>
                <p class="exercise__result-text">Неправильно. Правильный ответ: <strong>${correctAnswer}</strong></p>
            `;
        }

        // Добавляем в упражнение
        exercise.appendChild(resultDiv);

        // Анимация появления
        resultDiv.style.opacity = '0';
        resultDiv.style.transform = 'translateY(-10px)';
        resultDiv.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            resultDiv.style.opacity = '1';
            resultDiv.style.transform = 'translateY(0)';
        }, 100);
    }

    // Начать тест
    startTest() {
        const testSection = document.querySelector('.test');
        if (testSection) {
            testSection.innerHTML = `
                <h2 class="test__title">Итоговый тест</h2>
                <div class="test__questions">
                    <div class="test__question">
                        <h3 class="test__question-title">Вопрос 1</h3>
                        <p class="test__question-text">Выберите правильную форму глагола:</p>
                        <p class="test__question-text">"She ___ (work) in a hospital."</p>
                        <div class="test__options">
                            <label class="test__option"><input type="radio" name="test1" value="work" class="test__option-input"> <span class="test__option-text">work</span></label>
                            <label class="test__option"><input type="radio" name="test1" value="works" class="test__option-input"> <span class="test__option-text">works</span></label>
                        </div>
                    </div>
                    
                    <div class="test__question">
                        <h3 class="test__question-title">Вопрос 2</h3>
                        <p class="test__question-text">Поставьте глагол в правильную форму:</p>
                        <p class="test__question-text">"My friend ___ (live) in Moscow."</p>
                        <input type="text" id="testAnswer2" placeholder="Введите ответ" class="test__input">
                    </div>
                    
                    <div class="test__question">
                        <h3 class="test__question-title">Вопрос 3</h3>
                        <p class="test__question-text">Переведите на английский:</p>
                        <p class="test__question-text">"Он работает в банке"</p>
                        <input type="text" id="testAnswer3" placeholder="Введите перевод" class="test__input">
                    </div>
                </div>
                
                <div class="test__actions">
                    <button class="test__btn test__btn--primary" onclick="topicManager.submitTest()">Завершить тест</button>
                </div>
            `;
        }
    }

    // Отправить тест
    submitTest() {
        let correctAnswers = 0;
        const totalQuestions = 3;

        // Проверяем ответы
        const test1 = document.querySelector('input[name="test1"]:checked');
        if (test1 && test1.value === 'works') correctAnswers++;

        const test2 = document.getElementById('testAnswer2').value.trim().toLowerCase();
        if (test2 === 'lives') correctAnswers++;

        const test3 = document.getElementById('testAnswer3').value.trim().toLowerCase();
        if (test3 === 'he works in a bank' || test3 === 'he works in bank') correctAnswers++;

        // Показываем результат
        this.showTestResult(correctAnswers, totalQuestions);
    }

    // Показать результат теста
    showTestResult(correctAnswers, totalQuestions) {
        const testSection = document.querySelector('.test');
        if (testSection) {
            const percentage = Math.round((correctAnswers / totalQuestions) * 100);
            const grade = this.getGrade(percentage);
            
            testSection.innerHTML = `
                <h2 class="test__title">Результаты теста</h2>
                <div class="test__results">
                    <div class="test__result-score">
                        <h3 class="test__result-title">Ваш результат: ${correctAnswers} из ${totalQuestions}</h3>
                        <div class="test__result-percentage">${percentage}%</div>
                        <div class="test__result-grade">${grade}</div>
                    </div>
                    
                    <div class="test__result-details">
                        <p class="test__result-detail">Правильных ответов: ${correctAnswers}</p>
                        <p class="test__result-detail">Неправильных ответов: ${totalQuestions - correctAnswers}</p>
                    </div>
                    
                    <div class="test__result-actions">
                        <button class="test__btn test__btn--primary" onclick="topicManager.retakeTest()">Пройти тест заново</button>
                        <button class="test__btn test__btn--secondary" onclick="topicManager.goToMain()">Вернуться к темам</button>
                    </div>
                </div>
            `;
        }

        // Сохраняем результат
        this.saveTestResult(percentage);
    }

    // Получить оценку
    getGrade(percentage) {
        if (percentage >= 90) return 'Отлично! 🏆';
        if (percentage >= 80) return 'Хорошо! 👍';
        if (percentage >= 70) return 'Удовлетворительно! ✅';
        if (percentage >= 60) return 'Попробуйте еще раз! 🔄';
        return 'Нужно повторить материал! 📚';
    }

    // Сохранить результат теста
    saveTestResult(percentage) {
        const testResults = JSON.parse(localStorage.getItem('pockets_test_results') || '{}');
        testResults[this.currentTopic] = {
            percentage: percentage,
            date: new Date().toISOString()
        };
        localStorage.setItem('pockets_test_results', JSON.stringify(testResults));
    }

    // Пройти тест заново
    retakeTest() {
        this.startTest();
    }

    // Загрузить прогресс
    loadProgress() {
        const progressElement = document.querySelector('.topic__progress-text');
        if (progressElement) {
            const progress = this.calculateProgress();
            progressElement.textContent = `Прогресс: ${progress}%`;
        }
    }

    // Рассчитать прогресс
    calculateProgress() {
        const totalExercises = 3;
        const completedExercises = Object.keys(this.exerciseResults).length;
        return Math.round((completedExercises / totalExercises) * 100);
    }

    // Обновить прогресс
    updateProgress() {
        this.loadProgress();
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
        window.location.href = '../pockets.html';
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

// CSS стили для результатов
const style = document.createElement('style');
style.textContent = `
    .exercise__result {
        margin-top: 15px;
        padding: 15px;
        border-radius: 6px;
        text-align: center;
    }

    .exercise__result--correct {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .exercise__result--incorrect {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .exercise__result-icon {
        font-size: 24px;
        margin-bottom: 10px;
    }

    .exercise__result-text {
        margin: 0;
        font-weight: 500;
    }

    .test__questions {
        margin-bottom: 30px;
    }

    .test__question {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #007bff;
    }

    .test__question-title {
        color: #007bff;
        margin-bottom: 15px;
    }

    .test__question-text {
        color: #555;
        margin-bottom: 10px;
    }

    .test__options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 15px;
    }

    .test__option {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .test__option:hover {
        border-color: #007bff;
        background-color: #f8f9fa;
    }

    .test__option-input {
        margin-right: 10px;
        transform: scale(1.2);
    }

    .test__option-text {
        color: #555;
    }

    .test__input {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.3s ease;
        margin-top: 15px;
    }

    .test__input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
    }

    .test__actions {
        text-align: center;
    }

    .test__results {
        text-align: center;
        padding: 30px;
    }

    .test__result-title {
        color: #007bff;
        margin-bottom: 20px;
    }

    .test__result-percentage {
        font-size: 48px;
        font-weight: bold;
        color: #28a745;
        margin-bottom: 10px;
    }

    .test__result-grade {
        font-size: 24px;
        color: #6c757d;
        margin-bottom: 30px;
    }

    .test__result-details {
        margin-bottom: 30px;
    }

    .test__result-detail {
        color: #666;
        margin-bottom: 10px;
    }

    .test__result-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-width: 300px;
        margin: 0 auto;
    }

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
        .test__result-actions,
        .topic__auth-actions,
        .topic__payment-actions {
            max-width: 100%;
        }
        
        .test__question {
            padding: 15px;
        }
    }
`;
document.head.appendChild(style);

// Инициализация менеджера тем
let topicManager;
document.addEventListener('DOMContentLoaded', () => {
    topicManager = new TopicManager();
});
