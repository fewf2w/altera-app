let coins = localStorage.getItem('vedma_coins') ? parseInt(localStorage.getItem('vedma_coins')) : 0;
const balanceDisplay = document.getElementById('balance-display');
const mainButton = document.getElementById('main-button');
const feedbackContainer = document.getElementById('click-feedback-container');

// 1. Инициализация баланса при старте
function updateBalanceDisplay() {
    balanceDisplay.textContent = coins;
    localStorage.setItem('vedma_coins', coins);
}

// 2. Логика клика
function handleClick() {
    coins += 1;
    updateBalanceDisplay();
    showFeedback('+1');

    // Опционально: виброотклик на мобилке
    if (window.Telegram && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

// 3. Анимация "+1"
function showFeedback(text) {
    const feedback = document.createElement('div');
    feedback.textContent = text;
    feedback.classList.add('feedback-text');
    feedbackContainer.appendChild(feedback);

    // Удаляем элемент после завершения анимации
    feedback.addEventListener('animationend', () => {
        feedback.remove();
    });
}

// 4. Инициализация Telegram Mini App
document.addEventListener('DOMContentLoaded', () => {
    // Эта функция важна, чтобы Telegram знал, что приложение готово
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Можно скрыть нативную кнопку 'MainButton', она нам не нужна
        window.Telegram.WebApp.MainButton.hide(); 
    }

    updateBalanceDisplay();
    mainButton.addEventListener('click', handleClick);
});