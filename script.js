document.addEventListener('DOMContentLoaded', () => {
    // --- ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP ---
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.MainButton.hide();
    }

    // --- ПЕРЕМЕННЫЕ СОСТОЯНИЯ ИГРЫ ---
    let state = {
        coins: 0,
        clickValue: 1,
        passiveIncome: 0,
        purchasedItems: []
    };

    // --- DOM ЭЛЕМЕНТЫ ---
    const balanceDisplay = document.getElementById('balance-display');
    const passiveIncomeDisplay = document.getElementById('passive-income-display');
    const clickArea = document.getElementById('click-area');
    const feedbackContainer = document.getElementById('click-feedback-container');
    const navButtons = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.screen');
    const shopContainer = document.getElementById('shop-items-container');
    const paginationContainer = document.getElementById('shop-pagination');

    // --- ДАННЫЕ МАГАЗИНА (добавил больше товаров для примера) ---
    const shopItems = [
        { id: 'click_1', name: 'Магический курсор', price: 50, bonus: 1, type: 'click', description: '+1 коин за клик' },
        { id: 'passive_1', name: 'Грибная ферма', price: 200, bonus: 1, type: 'passive', description: '+1 коин в секунду' },
        { id: 'click_2', name: 'Зачарованная перчатка', price: 500, bonus: 5, type: 'click', description: '+5 коинов за клик' },
        { id: 'passive_2', name: 'Корень мандрагоры', price: 1200, bonus: 5, type: 'passive', description: '+5 коинов в секунду' },
        { id: 'click_3', name: 'Талисман силы', price: 3000, bonus: 20, type: 'click', description: '+20 коинов за клик' },
        { id: 'passive_3', name: 'Призрачный помощник', price: 10000, bonus: 25, type: 'passive', description: '+25 коинов в секунду' }
    ];

    // --- ФУНКЦИИ ---

    function saveData() {
        localStorage.setItem('vedma_clicker_state', JSON.stringify(state));
    }

    function loadData() {
        const savedState = localStorage.getItem('vedma_clicker_state');
        if (savedState) {
            state = JSON.parse(savedState);
        }
    }
    
    function updateUI() {
        balanceDisplay.textContent = Math.floor(state.coins).toLocaleString();
        passiveIncomeDisplay.textContent = state.passiveIncome.toLocaleString();
        
        document.querySelectorAll('.buy-btn').forEach(btn => {
            const itemId = btn.dataset.itemId;
            const item = shopItems.find(i => i.id === itemId);
            if (!item) return;

            btn.disabled = state.coins < item.price || state.purchasedItems.includes(itemId);
            if (state.purchasedItems.includes(itemId)) {
                btn.textContent = 'Куплено';
            }
        });
    }

    function handleClick() {
        state.coins += state.clickValue;
        showFeedback(`+${state.clickValue}`);
        updateUI();

        if (window.Telegram && window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    function showFeedback(text) {
        const feedback = document.createElement('div');
        feedback.textContent = text;
        feedback.classList.add('feedback-text');
        feedback.style.left = `${Math.random() * 80 + 10}%`;
        feedbackContainer.appendChild(feedback);

        feedback.addEventListener('animationend', () => feedback.remove());
    }

    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screenId);
        });
    }
    
    function renderShop() {
        shopContainer.innerHTML = '';
        paginationContainer.innerHTML = '';
        
        const itemsPerPage = 3;
        const pageCount = Math.ceil(shopItems.length / itemsPerPage);

        for (let i = 0; i < pageCount; i++) {
            // Создаем страницу
            const page = document.createElement('div');
            page.classList.add('shop-page');
            
            // Создаем точку для пагинации
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            paginationContainer.appendChild(dot);
            
            // Заполняем страницу товарами
            const pageItems = shopItems.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            pageItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('shop-item');
                itemElement.innerHTML = `
                    <div class="shop-item-info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                    </div>
                    <button class="buy-btn" data-item-id="${item.id}">${item.price.toLocaleString()}</button>
                `;
                page.appendChild(itemElement);
            });
            shopContainer.appendChild(page);
        }
        
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => buyItem(btn.dataset.itemId));
        });
    }
    
    function updatePagination() {
        const dots = paginationContainer.querySelectorAll('.dot');
        const currentPage = Math.round(shopContainer.scrollLeft / shopContainer.clientWidth);
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
    }

    function buyItem(itemId) {
        const item = shopItems.find(i => i.id === itemId);
        if (!item || state.coins < item.price || state.purchasedItems.includes(itemId)) {
            return;
        }

        state.coins -= item.price;
        state.purchasedItems.push(itemId);

        if (item.type === 'click') state.clickValue += item.bonus;
        else if (item.type === 'passive') state.passiveIncome += item.bonus;
        
        if (window.Telegram && window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        
        updateUI();
    }
    
    setInterval(() => {
        state.coins += state.passiveIncome;
        balanceDisplay.textContent = Math.floor(state.coins).toLocaleString();
    }, 1000);

    setInterval(saveData, 5000);

    // --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
    loadData();
    renderShop();
    updateUI();

    clickArea.addEventListener('click', handleClick);
    shopContainer.addEventListener('scroll', updatePagination);

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            showScreen(button.dataset.screen);
        });
    });
});
