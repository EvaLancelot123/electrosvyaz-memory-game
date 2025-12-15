// ОСНОВНАЯ ЛОГИКА ИГРЫ

document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const memoryBoard = document.getElementById('memory-board');
    const movesElement = document.getElementById('moves');
    const timerElement = document.getElementById('timer');
    const pairsElement = document.getElementById('pairs');
    const restartBtn = document.getElementById('restart-btn');
    const hintBtn = document.getElementById('hint-btn');
    const showFactsBtn = document.getElementById('show-facts-btn');
    const winScreen = document.getElementById('win-screen');
    const factPanel = document.getElementById('fact-panel');
    const closeFactBtn = document.getElementById('close-fact');
    
    // Переменные игры
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let seconds = 0;
    let minutes = 0;
    let timer;
    let isPlaying = false;
    let canFlip = true;
    let hints = 3;
    
    // Инициализация игры
    function initGame() {
        // Очищаем поле
        memoryBoard.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        hints = 3;
        canFlip = true;
        
        // Обновляем интерфейс
        updateMoves();
        updatePairs();
        updateHints();
        
        // Останавливаем таймер
        clearInterval(timer);
        seconds = 0;
        minutes = 0;
        updateTimer();
        
        // Скрываем экран победы
        winScreen.style.display = 'none';
        factPanel.style.display = 'none';
        
        // Перемешиваем карточки
        cards = shuffleArray([...gameData.cards]);
        
        // Создаем карточки на поле
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            cardElement.dataset.id = card.id;
            
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-back">
                        <div class="card-back-content">
                            <div class="card-back-year">${card.year}</div>
                            <div class="card-back-label">Электросвязь</div>
                        </div>
                    </div>
                    <div class="card-front">
                        <img src="${card.image}" alt="Обложка журнала ${card.year}" onerror="this.src='https://via.placeholder.com/300x400/0c2461/ffffff?text=Электросвязь+' + ${card.year}">
                        <div class="card-front-year">${card.year}</div>
                    </div>
                </div>
            `;
            
            cardElement.addEventListener('click', () => flipCard(cardElement));
            memoryBoard.appendChild(cardElement);
        });
        
        isPlaying = true;
        startTimer();
    }
    
    // Переворот карточки
    function flipCard(card) {
        if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        // Переворачиваем карточку
        card.classList.add('flipped');
        flippedCards.push(card);
        
        // Если перевернуты две карточки
        if (flippedCards.length === 2) {
            canFlip = false;
            moves++;
            updateMoves();
            
            const card1 = flippedCards[0];
            const card2 = flippedCards[1];
            
            // Проверяем совпадение
            if (card1.dataset.id === card2.dataset.id) {
                // Найдена пара
                setTimeout(() => {
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    flippedCards = [];
                    canFlip = true;
                    
                    matchedPairs++;
                    updatePairs();
                    
                    // Показываем факт о найденной паре
                    const cardData = cards[card1.dataset.index];
                    showFact(cardData);
                    
                    // Проверяем победу
                    if (matchedPairs === gameData.cards.length / 2) {
                        endGame();
                    }
                }, 500);
            } else {
                // Не совпали - переворачиваем обратно
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                    canFlip = true;
                }, 1000);
            }
        }
    }
    
    // Показ факта
    function showFact(cardData) {
        document.getElementById('fact-year').textContent = cardData.year;
        document.getElementById('fact-title').textContent = cardData.title;
        document.getElementById('fact-text').textContent = cardData.fact;
        document.getElementById('fact-issue').textContent = cardData.issue;
        
        factPanel.style.display = 'block';
        
        // Автоматически скрываем через 7 секунд
        setTimeout(() => {
            if (factPanel.style.display === 'block') {
                factPanel.style.display = 'none';
            }
        }, 7000);
    }
    
    // Обновление счетчика ходов
    function updateMoves() {
        movesElement.textContent = moves;
    }
    
    // Обновление найденных пар
    function updatePairs() {
        pairsElement.textContent = `${matchedPairs}/6`;
    }
    
    // Обновление подсказок
    function updateHints() {
        document.getElementById('hint-count').textContent = hints;
        hintBtn.disabled = hints === 0;
    }
    
    // Таймер
    function startTimer() {
        timer = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                minutes++;
                seconds = 0;
            }
            updateTimer();
        }, 1000);
    }
    
    function updateTimer() {
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        timerElement.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }
    
    // Подсказка
    function useHint() {
        if (hints === 0 || matchedPairs === 6) return;
        
        // Находим первую неперевернутую карточку
        const unflippedCards = Array.from(document.querySelectorAll('.memory-card:not(.flipped):not(.matched)'));
        if (unflippedCards.length === 0) return;
        
        // Временно показываем пару
        const card1 = unflippedCards[0];
        const cardId = card1.dataset.id;
        const card2 = unflippedCards.find(card => card.dataset.id === cardId && card !== card1);
        
        if (card2) {
            card1.classList.add('flipped');
            card2.classList.add('flipped');
            
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1500);
            
            hints--;
            updateHints();
        }
    }
    
    // Завершение игры
    function endGame() {
        clearInterval(timer);
        isPlaying = false;
        
        // Обновляем статистику на экране победы
        document.getElementById('win-time').textContent = timerElement.textContent;
        document.getElementById('win-moves').textContent = moves;
        
        // Определяем рейтинг
        const rating = gameData.ratings.find(r => moves <= r.moves && (minutes * 60 + seconds) <= r.time);
        document.getElementById('win-rating').textContent = rating ? rating.text : 'Исследователь';
        
        // Показываем экран победы
        setTimeout(() => {
            winScreen.style.display = 'flex';
        }, 1000);
    }
    
    // Показ всех фактов
    function showAllFacts() {
        factPanel.style.display = 'block';
        
        // Собираем все уникальные факты
        const uniqueCards = [];
        const seenIds = new Set();
        
        cards.forEach(card => {
            if (!seenIds.has(card.id)) {
                seenIds.add(card.id);
                uniqueCards.push(card);
            }
        });
        
        // Показываем первый факт
        if (uniqueCards.length > 0) {
            const factHtml = uniqueCards.map(card => `
                <div class="fact-item">
                    <h4>${card.year}: ${card.title}</h4>
                    <p>${card.fact}</p>
                    <small>${card.issue}</small>
                </div>
                <hr>
            `).join('');
            
            document.getElementById('fact-year').innerHTML = 'Все годы';
            document.getElementById('fact-title').innerHTML = 'Хронология ключевых тем';
            document.getElementById('fact-text').innerHTML = factHtml;
            document.getElementById('fact-issue').innerHTML = 'Архив 2017-2022';
        }
    }
    
    // Обработчики событий
    restartBtn.addEventListener('click', initGame);
    
    hintBtn.addEventListener('click', useHint);
    
    showFactsBtn.addEventListener('click', showAllFacts);
    
    closeFactBtn.addEventListener('click', () => {
        factPanel.style.display = 'none';
    });
    
    // Кнопки на экране победы
    document.getElementById('play-again-btn').addEventListener('click', () => {
        winScreen.style.display = 'none';
        initGame();
    });
    
    document.getElementById('view-gallery-btn').addEventListener('click', () => {
        // В реальном проекте здесь можно сделать переход на галерею
        alert('Здесь будет галерея всех обложек журнала');
    });
    
    // Инициализация при загрузке
    initGame();
    
    // Добавляем инструкцию при первом запуске
    setTimeout(() => {
        if (matchedPairs === 0 && moves === 0) {
            document.getElementById('fact-year').textContent = 'Инструкция';
            document.getElementById('fact-title').textContent = 'Как играть';
            document.getElementById('fact-text').textContent = 'Найдите все парные обложки журнала "Электросвязь". Кликайте на карточки, чтобы перевернуть их и найти совпадающие пары. Каждая найденная пара откроет интересный факт о развитии связи в тот год.';
            document.getElementById('fact-issue').textContent = 'Удачи в исследовании архива!';
            factPanel.style.display = 'block';
        }
    }, 1500);
});