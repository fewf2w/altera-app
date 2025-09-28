document.addEventListener('DOMContentLoaded', () => {
    // --- ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP ---
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand(); // Расширяем приложение на весь экран
        window.Telegram.WebApp.MainButton.hide();
    }

    // --- ПЕРЕМЕННЫЕ СОСТОЯНИЯ ИГРЫ ---
    let state = {
        coins: 0,
        clickValue: 1,
        passiveIncome: 0,
        level: 1,
        clicksToNextLevel: 100,
        currentClicks: 0,
        purchasedItems: [] // ID купленных товаров
    };

    // --- DOM ЭЛЕМЕНТЫ ---
    const balanceDisplay = document.getElementById('balance-display');
    const passiveIncomeDisplay = document.getElementById('passive-income-display');
    const clickArea = document.getElementById('click-area');
    const feedbackContainer = document.getElementById('click-feedback-container');
    const navButtons = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.screen');
    const shopContainer = document.getElementById('shop-items-container');
    const myScoreDisplay = document.getElementById('leaderboard-my-score');
    const progressBarFill = document.getElementById('progress-bar-fill');

    // --- ДАННЫЕ МАГАЗИНА ---
    const shopItems = [
        { id: 'click_1', name: 'Магический курсор', price: 50, bonus: 1, type: 'click', description: '+1 коин за клик' },
        { id: 'passive_1', name: 'Грибная ферма', price: 200, bonus: 1, type: 'passive', description: '+1 коин в секунду' },
        { id: 'click_2', name: 'Зачарованная перчатка', price: 500, bonus: 5, type: 'click', description: '+5 коинов за клик' }
    ];

    // --- ФУНКЦИИ ---

    // Загрузка/Сохранение прогресса
    function saveData() {
        localStorage.setItem('vedma_clicker_state', JSON.stringify(state));
    }

    function loadData() {
        const savedState = localStorage.getItem('vedma_clicker_state');
        if (savedState) {
            state = JSON.parse(savedState);
        }
    }
    
    // Обновление отображения всех данных
    function updateUI() {
        balanceDisplay.textContent = Math.floor(state.coins).toLocaleString();
        passiveIncomeDisplay.textContent = state.passiveIncome.toLocaleString();
        myScoreDisplay.textContent = Math.floor(state.coins).toLocaleString();
        
        const progress = (state.currentClicks / state.clicksToNextLevel) * 100;
        progressBarFill.style.width = `${progress}%`;

        // Обновляем состояние кнопок в магазине
        document.querySelectorAll('.buy-btn').forEach(btn => {
            const itemId = btn.dataset.itemId;
            const item = shopItems.find(i => i.id === itemId);
            if (state.coins < item.price || state.purchasedItems.includes(itemId)) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
             if (state.purchasedItems.includes(itemId)) {
                btn.textContent = 'Куплено';
            }
        });
    }

    // Логика клика
    function handleClick() {
        state.coins += state.clickValue;
        state.currentClicks += state.clickValue;
        
        if(state.currentClicks >= state.clicksToNextLevel) {
            // Level up logic can be added here
            state.level++;
            state.currentClicks = 0;
            state.clicksToNextLevel *= 2; // Усложняем следующий уровень
        }

        showFeedback(`+${state.clickValue}`);
        updateUI();

        if (window.Telegram && window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    // Анимация "+1"
    function showFeedback(text) {
        const feedback = document.createElement('div');
        feedback.textContent = text;
        feedback.classList.add('feedback-text');
        // Случайное положение для живости
        feedback.style.left = `${Math.random() * 80 + 10}%`;
        feedbackContainer.appendChild(feedback);

        feedback.addEventListener('animationend', () => feedback.remove());
    }

    // Навигация по экранам
    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screenId);
        });
    }
    
    // Рендер магазина
    function renderShop() {
        shopContainer.innerHTML = '';
        shopItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('shop-item');
            itemElement.innerHTML = `
                <div class="shop-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <button class="buy-btn" data-item-id="${item.id}">${item.price.toLocaleString()}</button>
            `;
            shopContainer.appendChild(itemElement);
        });
        
        // Добавляем обработчики событий на новые кнопки
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => buyItem(btn.dataset.itemId));
        });
    }
    
    // Покупка товара
    function buyItem(itemId) {
        const item = shopItems.find(i => i.id === itemId);
        if (!item || state.coins < item.price || state.purchasedItems.includes(itemId)) {
            return;
        }

        state.coins -= item.price;
        state.purchasedItems.push(itemId);

        if (item.type === 'click') {
            state.clickValue += item.bonus;
        } else if (item.type === 'passive') {
            state.passiveIncome += item.bonus;
        }
        
        if (window.Telegram && window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        
        updateUI();
    }
    
    // Пассивный доход
    setInterval(() => {
        state.coins += state.passiveIncome;
        // Мы не хотим вызывать полный updateUI каждую секунду, только баланс
        balanceDisplay.textContent = Math.floor(state.coins).toLocaleString();
        myScoreDisplay.textContent = Math.floor(state.coins).toLocaleString();
    }, 1000);

    // Сохранение прогресса раз в 5 секунд
    setInterval(saveData, 5000);

    // --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
    loadData();
    renderShop();
    updateUI();

    clickArea.addEventListener('click', handleClick);

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            showScreen(button.dataset.screen);
        });
    });
});
