
        // Game state
        const gameState = {
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            moves: 0,
            timer: 0,
            timerInterval: null,
            isPlaying: false,
            score: 1000,
            difficulty: 'easy',
            gridSizes: {
                easy: { rows: 4, cols: 4 },
                medium: { rows: 4, cols: 5 },
                hard: { rows: 6, cols: 6 }
            }
        };

        // DOM elements
        const gameBoard = document.getElementById('game-board');
        const movesDisplay = document.getElementById('moves');
        const timerDisplay = document.getElementById('timer');
        const scoreDisplay = document.getElementById('score');
        const newGameBtn = document.getElementById('new-game');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        const congratulations = document.getElementById('congratulations');
        const finalMoves = document.getElementById('final-moves');
        const finalTime = document.getElementById('final-time');
        const finalScore = document.getElementById('final-score');
        const playAgainBtn = document.getElementById('play-again');

        // Emoji set for cards
        const emojis = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓', '🍑', '🍍', '🥭', '🍉', '🥝', '🍋', '🍐', '🥥', '🍈', '🍏', '🫐', '🥑'];

        // Initialize game
        function initGame() {
            resetGame();
            createCards();
            renderCards();
            startTimer();
        }

        // Reset game state
        function resetGame() {
            gameState.cards = [];
            gameState.flippedCards = [];
            gameState.matchedPairs = 0;
            gameState.moves = 0;
            gameState.timer = 0;
            gameState.score = 1000;
            gameState.isPlaying = true;
            
            movesDisplay.textContent = '0';
            timerDisplay.textContent = '0s';
            scoreDisplay.textContent = '1000';
            
            if (gameState.timerInterval) {
                clearInterval(gameState.timerInterval);
            }
            
            congratulations.style.display = 'none';
        }

        // Create cards based on difficulty
        function createCards() {
            const { rows, cols } = gameState.gridSizes[gameState.difficulty];
            const totalPairs = (rows * cols) / 2;
            
            // Select emojis for this game
            const selectedEmojis = [];
            for (let i = 0; i < totalPairs; i++) {
                selectedEmojis.push(emojis[i % emojis.length]);
            }
            
            // Create pairs
            const cardValues = [...selectedEmojis, ...selectedEmojis];
            
            // Shuffle cards
            for (let i = cardValues.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
            }
            
            // Create card objects
            gameState.cards = cardValues.map((value, index) => ({
                id: index,
                value,
                isFlipped: false,
                isMatched: false
            }));
        }

        // Render cards on the board
        function renderCards() {
            gameBoard.innerHTML = '';
            const { rows, cols } = gameState.gridSizes[gameState.difficulty];
            
            // Set grid template
            gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            
            // Create card elements
            gameState.cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                if (card.isFlipped || card.isMatched) {
                    cardElement.classList.add('flipped');
                }
                if (card.isMatched) {
                    cardElement.classList.add('matched');
                }
                
                cardElement.innerHTML = `
                    <div class="card-inner">
                        <div class="card-front">${card.value}</div>
                        <div class="card-back"></div>
                    </div>
                `;
                
                cardElement.addEventListener('click', () => flipCard(card.id));
                gameBoard.appendChild(cardElement);
            });
        }

        // Flip card function
        function flipCard(cardId) {
            if (!gameState.isPlaying) return;
            
            const card = gameState.cards[cardId];
            
            // Prevent flipping if already flipped or matched
            if (card.isFlipped || card.isMatched || gameState.flippedCards.length >= 2) {
                return;
            }
            
            // Flip the card
            card.isFlipped = true;
            gameState.flippedCards.push(card);
            
            // Update display
            renderCards();
            
            // Check for match if two cards are flipped
            if (gameState.flippedCards.length === 2) {
                gameState.moves++;
                movesDisplay.textContent = gameState.moves;
                
                // Update score
                updateScore();
                
                const [card1, card2] = gameState.flippedCards;
                
                if (card1.value === card2.value) {
                    // Match found
                    card1.isMatched = true;
                    card2.isMatched = true;
                    gameState.matchedPairs++;
                    
                    gameState.flippedCards = [];
                    
                    // Check for win
                    if (gameState.matchedPairs === gameState.cards.length / 2) {
                        endGame();
                    }
                } else {
                    // No match - flip back after delay
                    setTimeout(() => {
                        card1.isFlipped = false;
                        card2.isFlipped = false;
                        gameState.flippedCards = [];
                        renderCards();
                    }, 1000);
                }
            }
        }

        // Update score based on moves and time
        function updateScore() {
            // Base score decreases with moves and time
            const movePenalty = 5;
            const timePenalty = Math.floor(gameState.timer / 10);
            
            gameState.score = Math.max(0, 1000 - (gameState.moves * movePenalty) - timePenalty);
            scoreDisplay.textContent = gameState.score;
        }

        // Start timer
        function startTimer() {
            gameState.timerInterval = setInterval(() => {
                gameState.timer++;
                timerDisplay.textContent = `${gameState.timer}s`;
                updateScore();
            }, 1000);
        }

        // End game
        function endGame() {
            gameState.isPlaying = false;
            clearInterval(gameState.timerInterval);
            
            // Show congratulations
            finalMoves.textContent = gameState.moves;
            finalTime.textContent = `${gameState.timer}s`;
            finalScore.textContent = gameState.score;
            congratulations.style.display = 'flex';
        }

        // Set difficulty
        function setDifficulty(difficulty) {
            gameState.difficulty = difficulty;
            
            // Update active button
            difficultyBtns.forEach(btn => {
                if (btn.dataset.difficulty === difficulty) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Start new game with selected difficulty
            initGame();
        }

        // Event listeners
        newGameBtn.addEventListener('click', initGame);
        
        playAgainBtn.addEventListener('click', () => {
            congratulations.style.display = 'none';
            initGame();
        });
        
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setDifficulty(btn.dataset.difficulty);
            });
        });

        // Initialize game on load
        window.addEventListener('load', initGame);
   