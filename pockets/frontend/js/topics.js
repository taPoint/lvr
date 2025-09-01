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
        const checkButtons = document.querySelectorAll('.btn-check');
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
        const nextBtn = document.querySelector('.navigation-buttons .btn-primary');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextTopic();
            });
        }

        const prevBtn = document.querySelector('.navigation-buttons .btn-secondary');
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
        const topicContent = document.querySelector('.topic-content');
        if (topicContent) {
            topicContent.innerHTML = `
                <div class="auth-required">
                    <div class="auth-icon">🔒</div>
                    <h2>Требуется авторизация</h2>
                    <p>Для изучения темы необходимо войти в систему</p>
                    <div class="auth-actions">
                        <button class="btn btn-primary" onclick="topicManager.goToAuth()">Войти</button>
                        <button class="btn btn-secondary" onclick="topicManager.goToMain()">Вернуться к темам</button>
                    </div>
                </div>
            `;
        }
    }

    // Показать сообщение о необходимости оплаты
    showPaymentRequired() {
        const topicContent = document.querySelector('.topic-content');
        if (topicContent) {
            topicContent.innerHTML = `
                <div class="payment-required">
                    <div class="payment-icon">💰</div>
                    <h2>Тема не куплена</h2>
                    <p>Для изучения этой темы необходимо совершить покупку</p>
                    <div class="payment-actions">
                        <button class="btn btn-primary" onclick="topicManager.goToPayment()">Купить тему</button>
                        <button class="btn btn-secondary" onclick="topicManager.goToMain()">Вернуться к темам</button>
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
        const existingResult = exercise.querySelector('.exercise-result');
        if (existingResult) {
            existingResult.remove();
        }

        // Создаем сообщение о результате
        const resultDiv = document.createElement('div');
        resultDiv.className = `exercise-result ${isCorrect ? 'correct' : 'incorrect'}`;
        
        if (isCorrect) {
            resultDiv.innerHTML = `
                <div class="result-icon">✅</div>
                <p class="result-text">Правильно! Молодец!</p>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="result-icon">❌</div>
                <p class="result-text">Неправильно. Правильный ответ: <strong>${correctAnswer}</strong></p>
            `;
        }

        // Добавляем стили
        resultDiv.style.cssText = `
            margin-top: 15px;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            ${isCorrect ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;

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
        const testSection = document.querySelector('.test-section');
        if (testSection) {
            testSection.innerHTML = `
                <h2>Итоговый тест</h2>
                <div class="test-questions">
                    <div class="test-question">
                        <h3>Вопрос 1</h3>
                        <p>Выберите правильную форму глагола:</p>
                        <p>"She ___ (work) in a hospital."</p>
                        <div class="test-options">
                            <label><input type="radio" name="test1" value="work"> work</label>
                            <label><input type="radio" name="test1" value="works"> works</label>
                        </div>
                    </div>
                    
                    <div class="test-question">
                        <h3>Вопрос 2</h3>
                        <p>Поставьте глагол в правильную форму:</p>
                        <p>"My friend ___ (live) in Moscow."</p>
                        <input type="text" id="testAnswer2" placeholder="Введите ответ">
                    </div>
                    
                    <div class="test-question">
                        <h3>Вопрос 3</h3>
                        <p>Переведите на английский:</p>
                        <p>"Он работает в банке"</p>
                        <input type="text" id="testAnswer3" placeholder="Введите перевод">
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn btn-primary" onclick="topicManager.submitTest()">Завершить тест</button>
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
        const testSection = document.querySelector('.test-section');
        if (testSection) {
            const percentage = Math.round((correctAnswers / totalQuestions) * 100);
            const grade = this.getGrade(percentage);
            
            testSection.innerHTML = `
                <h2>Результаты теста</h2>
                <div class="test-results">
                    <div class="result-score">
                        <h3>Ваш результат: ${correctAnswers} из ${totalQuestions}</h3>
                        <div class="score-percentage">${percentage}%</div>
                        <div class="score-grade">${grade}</div>
                    </div>
                    
                    <div class="result-details">
                        <p>Правильных ответов: ${correctAnswers}</p>
                        <p>Неправильных ответов: ${totalQuestions - correctAnswers}</p>
                    </div>
                    
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="topicManager.retakeTest()">Пройти тест заново</button>
                        <button class="btn btn-secondary" onclick="topicManager.goToMain()">Вернуться к темам</button>
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
        const progressElement = document.querySelector('.topic-progress span');
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
        window.location.href = 'auth.html';
    }

    // Переход к оплате
    goToPayment() {
        sessionStorage.setItem('payment_topic', this.currentTopic);
        window.location.href = 'payment.html';
    }

    // Переход на главную
    goToMain() {
        window.location.href = 'pockets.html';
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
    .exercise-result {
        margin-top: 15px;
        padding: 15px;
        border-radius: 6px;
        text-align: center;
    }

    .exercise-result.correct {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .exercise-result.incorrect {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .result-icon {
        font-size: 24px;
        margin-bottom: 10px;
    }

    .result-text {
        margin: 0;
        font-weight: 500;
    }

    .test-questions {
        margin-bottom: 30px;
    }

    .test-question {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #007bff;
    }

    .test-question h3 {
        color: #007bff;
        margin-bottom: 15px;
    }

    .test-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 15px;
    }

    .test-options label {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .test-options label:hover {
        border-color: #007bff;
        background-color: #f8f9fa;
    }

    .test-options input[type="radio"] {
        margin-right: 10px;
        transform: scale(1.2);
    }

    .test-actions {
        text-align: center;
    }

    .test-results {
        text-align: center;
        padding: 30px;
    }

    .result-score h3 {
        color: #007bff;
        margin-bottom: 20px;
    }

    .score-percentage {
        font-size: 48px;
        font-weight: bold;
        color: #28a745;
        margin-bottom: 10px;
    }

    .score-grade {
        font-size: 24px;
        color: #6c757d;
        margin-bottom: 30px;
    }

    .result-details {
        margin-bottom: 30px;
    }

    .result-details p {
        color: #666;
        margin-bottom: 10px;
    }

    .result-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-width: 300px;
        margin: 0 auto;
    }

    .auth-required,
    .payment-required {
        text-align: center;
        padding: 60px 20px;
    }

    .auth-icon,
    .payment-icon {
        font-size: 64px;
        margin-bottom: 20px;
    }

    .auth-required h2,
    .payment-required h2 {
        color: #dc3545;
        margin-bottom: 15px;
    }

    .auth-required p,
    .payment-required p {
        color: #6c757d;
        margin-bottom: 30px;
        font-size: 18px;
    }

    .auth-actions,
    .payment-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-width: 300px;
        margin: 0 auto;
    }

    .auth-actions .btn,
    .payment-actions .btn {
        width: 100%;
    }

    /* Адаптивность */
    @media (max-width: 768px) {
        .result-actions,
        .auth-actions,
        .payment-actions {
            max-width: 100%;
        }
        
        .test-question {
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
