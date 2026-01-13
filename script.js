/**
 * Neon Snake Game
 * Core Logic Skeleton
 */

class EnemySnake {
    constructor() {
        this.active = false;
        this.body = [];
        this.color = '#ff3333'; // Red
        this.moveInterval = GAME_CONFIG.enemy.moveSpeed; // Chase speed (ms)
        this.accumulatedTime = 0;
    }

    spawn(playerSnake, tileCount) {
        this.body = [];
        let validPosition = false;
        let startX, startY;

        while (!validPosition) {
            startX = Math.floor(Math.random() * tileCount);
            startY = Math.floor(Math.random() * tileCount);

            // Ensure far enough from player head
            if (playerSnake.length > 0) {
                const dist = Math.abs(startX - playerSnake[0].x) + Math.abs(startY - playerSnake[0].y);
                if (dist > GAME_CONFIG.enemy.minSpawnDistance) validPosition = true;
            } else {
                validPosition = true;
            }
        }

        this.body.push({ x: startX, y: startY });
        // this.body.push({ x: startX, y: startY + 1 }); // Tail removed for single head
        this.active = true;
        this.accumulatedTime = 0;
    }

    update(deltaTime, playerHead) {
        if (!this.active) return;

        this.accumulatedTime += deltaTime;
        if (this.accumulatedTime < this.moveInterval) return;
        this.accumulatedTime -= this.moveInterval;

        const head = this.body[0];
        const dx = playerHead.x - head.x;
        const dy = playerHead.y - head.y;

        let moveX = 0;
        let moveY = 0;

        // Simple chase logic
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
        } else {
            moveY = dy > 0 ? 1 : -1;
        }

        const newHead = { x: head.x + moveX, y: head.y + moveY };
        this.body.unshift(newHead);
        this.body.pop();
    }

    draw(ctx, gridSize, img) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        // Code for body drawing removed as per request (Head only)
        /*
        for (let i = 1; i < this.body.length; i++) {
            const part = this.body[i];
            const x = part.x * gridSize;
            const y = part.y * gridSize;
            ctx.beginPath();
            ctx.rect(x, y, gridSize, gridSize);
            ctx.fill();
        }
        */

        // Draw Head
        const head = this.body[0];
        const hx = head.x * gridSize;
        const hy = head.y * gridSize;

        if (img && img.complete && img.naturalWidth !== 0) { // Check if loaded
            const size = gridSize * 3.8; // Make it big like Pikachu
            const offset = (size - gridSize) / 2;
            ctx.drawImage(img, hx - offset, hy - offset, size, size);
        } else {
            // Fallback
            ctx.beginPath();
            ctx.rect(hx, hy, gridSize, gridSize);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 - 2;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size = Math.max(0, this.size - 0.1);
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

class Game {
    #score = 0; // Private score variable

    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Load Assets
        this.headImage = new Image();
        this.headImage.src = 'assets/sprites/pikachu_final.png?v=' + new Date().getTime();

        // Load Audio
        this.eatSound = new Audio('assets/audio/pikachu.mp3');
        this.eatSound.volume = 0.5;

        this.pokemonSprites = [];   // Normal Food (Starters)
        this.legendaryImages = []; // Legendary Food

        this.spritesLoaded = 0;

        // --- Load Assets from Manifest ---
        this.pokemonSprites = [];   // Normal Food
        this.legendaryImages = [];  // Legendary Food
        this.spritesLoaded = 0;

        // Ensure manifest exists
        const manifest = window.ASSET_MANIFEST || { starters: [], legendaries: [] };

        // Load Starters
        if (manifest.starters && manifest.starters.length > 0) {
            manifest.starters.forEach(item => {
                const img = new Image();
                img.src = item.src + '?v=' + new Date().getTime(); // Access .src property
                img.dataset.id = item.id;     // Store metadata
                img.dataset.name = item.name; // Store metadata
                img.onload = () => this.spritesLoaded++;
                img.onerror = () => { console.warn(`Failed to load ${item.src}`); this.spritesLoaded++; };
                this.pokemonSprites.push(img);
            });
        } else {
            console.error("No starter assets found in manifest!");
        }

        // Load Legendaries
        if (manifest.legendaries && manifest.legendaries.length > 0) {
            manifest.legendaries.forEach(item => {
                const img = new Image();
                img.src = item.src + '?v=' + new Date().getTime(); // Access .src property
                img.dataset.id = item.id;     // Store metadata
                img.dataset.name = item.name; // Store metadata
                img.onload = () => this.spritesLoaded++;
                img.onerror = () => { console.warn(`Failed to load ${item.src}`); this.spritesLoaded++; };
                this.legendaryImages.push(img);
            });
        } else {
            console.error("No legendary assets found in manifest!");
        }

        // Game Constants
        this.gridSize = GAME_CONFIG.grid.size;
        this.tileCount = GAME_CONFIG.grid.tileCount;
        this.gameSpeed = GAME_CONFIG.speed.initial; // ms

        // Game State
        this.#score = 0;
        // Constructively clear old local storage high score to reset client side
        localStorage.removeItem('snakeHighScore');
        this.highScore = 0; // Reset high score for session

        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;

        // Entities
        this.snake = [];
        this.food = {}; // {x, y, type: 'normal'|'legendary', spriteIndex: 0-19}
        this.velocity = { x: 0, y: 0 };
        this.nextVelocity = { x: 0, y: 0 };
        this.particles = [];

        // Enemy System
        this.enemy = new EnemySnake();
        this.enemyImage = new Image();
        this.enemyImage.src = 'assets/sprites/meowth.png';
        this.enemyCooldown = 0;

        // Leaderboard State
        this.playerName = "玩家";
        this.leaderboard = [];
        this.playerNameInput = document.getElementById('player-name-input');
        this.leaderboardListEl = document.getElementById('leaderboard-list');
        this.mainLeaderboardListEl = document.getElementById('main-leaderboard-list');

        // Load initial data
        this.loadLeaderboard();

        // UI Elements
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('high-score');
        this.finalScoreEl = document.getElementById('final-score-val');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.leaderboardScreen = document.getElementById('leaderboard-screen');
        // Duplicate assignment removed
        this.pokedexSection = document.querySelector('.pokedex-section');
        this.marqueeContainer = document.getElementById('marquee-container');
        this.marqueeText = document.getElementById('marquee-text');
        this.recordBrokenTriggered = false;

        // Meowth Timer Elements
        this.meowthTimerEl = document.getElementById('meowth-timer');
        this.meowthCountdownEl = document.getElementById('meowth-countdown');

        this.initEventListeners();
        this.updateHighScoreUI();

        // Initial Draw (Clear)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resizeCanvas() {
        this.canvas.width = 600;
        this.canvas.height = 600;
    }

    showInstructionsDialog() {
        const nameInput = this.playerNameInput.value.trim();
        // Force keyboard to close
        this.playerNameInput.blur();
        window.scrollTo(0, 0);

        if (nameInput) {
            this.playerName = nameInput;
        } else {
            if (!this.playerName || this.playerName === "玩家") {
                this.playerName = "玩家";
            }
        }

        // Hide pokedex section buttons when showing instructions
        if (this.pokedexSection) this.pokedexSection.classList.add('hidden');

        // Hide start screen, show instructions dialog
        this.startScreen.classList.add('hidden');
        this.startScreen.classList.remove('active');

        const instructionsDialog = document.getElementById('instructions-dialog');
        if (instructionsDialog) {
            instructionsDialog.classList.remove('hidden');
            instructionsDialog.classList.add('active');
        }
    }

    startGameFromDialog() {
        // Hide instructions dialog
        const instructionsDialog = document.getElementById('instructions-dialog');
        if (instructionsDialog) {
            instructionsDialog.classList.add('hidden');
            instructionsDialog.classList.remove('active');
        }

        // Show countdown
        this.showCountdown();
    }

    showCountdown() {
        const countdownScreen = document.getElementById('countdown-screen');
        const countdownNumber = document.querySelector('.countdown-number');

        if (!countdownScreen || !countdownNumber) return;

        // Hide pokedex section buttons during countdown
        if (this.pokedexSection) this.pokedexSection.classList.add('hidden');

        let count = 3;
        countdownNumber.textContent = count;
        countdownScreen.classList.remove('hidden');
        countdownScreen.classList.add('active');

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownNumber.textContent = count;
                // Re-trigger animation
                countdownNumber.style.animation = 'none';
                setTimeout(() => {
                    countdownNumber.style.animation = 'countdown-pulse 1s ease-in-out';
                }, 10);
            } else {
                clearInterval(countdownInterval);
                countdownScreen.classList.add('hidden');
                countdownScreen.classList.remove('active');
                // Start the game
                this.init();
            }
        }, 1000);
    }

    restartGame() {
        // Hide game over screen
        this.gameOverScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('active');

        // Show countdown
        this.showCountdown();
    }

    init() {
        const nameInput = this.playerNameInput.value.trim();
        // Force keyboard to close and reset viewport
        this.playerNameInput.blur();
        window.scrollTo(0, 0);

        if (nameInput) {
            this.playerName = nameInput;
        } else {
            // Optional: Shake input or demand name. For now default to Player
            if (!this.playerName || this.playerName === "玩家") {
                this.playerName = "玩家";
            }
        }

        this.snake = [
            { x: 10, y: 15 },
            { x: 9, y: 15 },
            { x: 8, y: 15 }
        ];
        this.velocity = { x: 1, y: 0 };
        this.nextVelocity = { x: 1, y: 0 };
        this.#score = 0;
        this.particles = [];
        this.enemy.active = false;
        this.enemyCooldown = 0;
        this.updateScoreUI();
        this.spawnFood();
        this.isRunning = true;
        this.isPaused = false;

        this.startScreen.classList.add('hidden');
        this.startScreen.classList.remove('active');
        this.gameOverScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('active');
        if (this.marqueeContainer) this.marqueeContainer.classList.add('hidden');
        this.recordBrokenTriggered = false;

        // Reset Meowth Timer
        if (this.meowthTimerEl) this.meowthTimerEl.classList.add('hidden');

        // Hide buttons during game
        if (this.pokedexSection) this.pokedexSection.classList.add('hidden');

        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    goToHome() {
        this.gameOverScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('active');

        this.startScreen.classList.remove('hidden');
        this.startScreen.classList.add('active');

        if (this.pokedexSection) this.pokedexSection.classList.remove('hidden');

        // Reset Score display
        this.#score = 0;
        this.updateScoreUI();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Hide Meowth Timer on Home Return
        if (this.meowthTimerEl) this.meowthTimerEl.classList.add('hidden');
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => this.handleInput(e));

        // Show instructions dialog when clicking start
        document.getElementById('start-btn').addEventListener('click', () => this.showInstructionsDialog());

        // Actually start game when confirming instructions
        document.getElementById('start-game-confirm-btn').addEventListener('click', () => this.startGameFromDialog());

        // Show countdown when clicking restart
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => this.goToHome());
        }

        // Device Detection and Instructions
        this.updateInstructions();
        window.addEventListener('resize', () => this.updateInstructions());

        // Mobile Controls
        const handleTouchInput = (x, y) => {
            if (this.isRunning) this.changeDirection(x, y);
        };

        // Swipe Controls
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            // Prevent scrolling/refresh while playing
            if (this.isRunning) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!this.isRunning) return;

            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // Minimum swipe distance threshold
            if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal
                if (diffX > 0) handleTouchInput(1, 0); // Right
                else handleTouchInput(-1, 0); // Left
            } else {
                // Vertical
                if (diffY > 0) handleTouchInput(0, 1); // Down
                else handleTouchInput(0, -1); // Up
            }
        }, { passive: false });

        // Helper to close all views
        const closeAllViews = () => {
            if (pokedexGrid) pokedexGrid.classList.add('hidden');
            if (changelogScreen) {
                changelogScreen.classList.add('hidden');
                changelogScreen.classList.remove('active');
            }
            if (this.leaderboardScreen) {
                this.leaderboardScreen.classList.add('hidden');
                this.leaderboardScreen.classList.remove('active');
            }
        };

        // Pokedex Toggle
        const toggleBtn = document.getElementById('toggle-pokedex-btn');
        const pokedexGrid = document.getElementById('pokedex-grid');
        if (toggleBtn && pokedexGrid) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = pokedexGrid.classList.contains('hidden');
                closeAllViews(); // Close everything first

                if (isHidden) {
                    pokedexGrid.classList.remove('hidden');
                    this.renderPokedex();
                    setTimeout(() => pokedexGrid.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            });
        }

        // Version Changelog Toggle
        const versionBtn = document.getElementById('version-btn');
        const changelogScreen = document.getElementById('changelog-screen');
        const closeChangelogBtn = document.getElementById('close-changelog-btn');

        if (versionBtn && changelogScreen) {
            versionBtn.addEventListener('click', () => {
                closeAllViews();
                changelogScreen.classList.remove('hidden');
                changelogScreen.classList.add('active');
            });
        }

        if (closeChangelogBtn && changelogScreen) {
            closeChangelogBtn.addEventListener('click', () => {
                changelogScreen.classList.add('hidden');
                changelogScreen.classList.remove('active');
            });
        }

        // Leaderboard Toggle
        const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
        const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');

        if (showLeaderboardBtn) {
            showLeaderboardBtn.addEventListener('click', () => {
                closeAllViews();
                this.leaderboardScreen.classList.remove('hidden');
                this.leaderboardScreen.classList.add('active');
            });
        }

        if (closeLeaderboardBtn) {
            closeLeaderboardBtn.addEventListener('click', () => {
                this.leaderboardScreen.classList.add('hidden');
                this.leaderboardScreen.classList.remove('active');
            });
        }
    }

    renderPokedex() {
        const grid = document.getElementById('pokedex-grid');
        if (!grid || grid.children.length > 0) return; // Render once

        const createCard = (img, isLegendary) => {
            const card = document.createElement('div');
            card.className = isLegendary ? 'poke-card legendary' : 'poke-card';

            // Format ID: e.g. #001
            const id = String(img.dataset.id || '???').padStart(3, '0');
            const name = img.dataset.name || '未知';

            card.innerHTML = `
                <img src="${img.src}" loading="lazy">
                <div class="poke-info">
                    <div class="poke-id">#${id}</div>
                    <div class="poke-name">${name}</div>
                </div>
            `;
            return card;
        };

        // 1. Render Normal Pokemon
        this.pokemonSprites.forEach(img => {
            grid.appendChild(createCard(img, false));
        });

        // 2. Render Legendary Pokemon
        this.legendaryImages.forEach(img => {
            grid.appendChild(createCard(img, true));
        });
    }

    isMobile() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    updateInstructions() {
        const instructionEl = document.getElementById('instruction-text');
        const gestureHintEl = document.getElementById('gesture-hint');

        if (instructionEl) {
            if (this.isMobile()) {
                instructionEl.innerText = "滑動螢幕控制方向";
                if (gestureHintEl) gestureHintEl.classList.remove('hidden');
            } else {
                instructionEl.innerText = "使用方向鍵移動";
                if (gestureHintEl) gestureHintEl.classList.add('hidden');
            }
        }
    }

    handleInput(e) {
        if (!this.isRunning) return;

        switch (e.key) {
            case 'ArrowUp':
                this.changeDirection(0, -1);
                break;
            case 'ArrowDown':
                this.changeDirection(0, 1);
                break;
            case 'ArrowLeft':
                this.changeDirection(-1, 0);
                break;
            case 'ArrowRight':
                this.changeDirection(1, 0);
                break;
        }
    }

    changeDirection(x, y) {
        if (this.velocity.x !== 0 && x === -this.velocity.x) return;
        if (this.velocity.y !== 0 && y === -this.velocity.y) return;
        this.nextVelocity = { x, y };
    }

    spawnFood() {
        let validPosition = false;
        while (!validPosition) {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: 'normal',
                spriteIndex: Math.floor(Math.random() * this.pokemonSprites.length)
            };

            // Allow render even if sprites are still loading (fallback will handle it)
            // But once loaded, length will be 19.
            // Wait, this.pokemonSprites array grows as we push.
            // We pushed all image objects synchronously in constructor!
            // So length is 19 immediately. Safe.

            if (this.#score > 0 && this.#score % GAME_CONFIG.scoring.legendarySpawnScore === 0) {
                this.food.type = 'legendary';
                this.food.legendaryIndex = Math.floor(Math.random() * this.legendaryImages.length);
            }

            validPosition = !this.snake.some(part => part.x === this.food.x && part.y === this.food.y);
        }
    }

    createExplosion(x, y, color) {
        const count = color === '#a600ff' ? GAME_CONFIG.effects.legendaryExplosionParticles : GAME_CONFIG.effects.normalExplosionParticles;
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update(deltaTime) {
        this.particles.forEach((p, index) => {
            p.update();
            if (p.life <= 0) this.particles.splice(index, 1);
        });

        // --- Enemy Logic Start ---
        if (this.enemyCooldown > 0) {
            this.enemyCooldown -= deltaTime;

            // Show and update Timer
            if (this.meowthTimerEl && this.meowthCountdownEl) {
                this.meowthTimerEl.classList.remove('hidden');
                this.meowthCountdownEl.innerText = Math.ceil(this.enemyCooldown / 1000);
            }
        } else {
            // Hide Timer
            if (this.meowthTimerEl) {
                this.meowthTimerEl.classList.add('hidden');
            }
        }

        // Spawn Enemy condition: Score >= 100, not active, cooldown over
        if (this.#score >= GAME_CONFIG.enemy.spawnScore && !this.enemy.active && this.enemyCooldown <= 0) {
            this.enemy.spawn(this.snake, this.tileCount);
        }

        // Update Enemy & Check Collision
        if (this.enemy.active && this.snake.length > 0) {
            this.enemy.update(deltaTime, this.snake[0]);

            const playerHead = this.snake[0];
            const enemyHead = this.enemy.body[0];

            // Check 1: Player Head hits Enemy Body
            const hitEnemy = this.enemy.body.some(part => part.x === playerHead.x && part.y === playerHead.y);

            // Check 2: Enemy Head hits Player Body
            const hitPlayer = this.snake.some(part => part.x === enemyHead.x && part.y === enemyHead.y);

            if (hitEnemy || hitPlayer) {
                this.#score = Math.max(0, this.#score - GAME_CONFIG.enemy.penaltyScore);
                this.updateScoreUI();

                // Visual feedback
                this.createExplosion(playerHead.x * this.gridSize + 10, playerHead.y * this.gridSize + 10, '#ff0000');

                // Reset Enemy
                this.enemy.active = false;
                this.enemyCooldown = GAME_CONFIG.enemy.respawnCooldown; // Cooldown from config
            }
        }
        // --- Enemy Logic End ---

        this.accumulatedTime = (this.accumulatedTime || 0) + deltaTime;
        if (this.accumulatedTime < this.gameSpeed) return;
        this.accumulatedTime -= this.gameSpeed;

        this.velocity = this.nextVelocity;
        const head = { x: this.snake[0].x + this.velocity.x, y: this.snake[0].y + this.velocity.y };

        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount ||
            this.snake.some(part => part.x === head.x && part.y === head.y)) {
            this.createExplosion(this.snake[0].x * this.gridSize + 10, this.snake[0].y * this.gridSize + 10, '#f6e652');
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            let points = GAME_CONFIG.scoring.normalFood;
            let color = '#ffff00'; // Yellow explosion

            if (this.food.type === 'legendary') {
                points = GAME_CONFIG.scoring.legendaryFood;
                color = '#a600ff';

                // Play Legendary Cry
                const legendaryImg = this.legendaryImages[this.food.legendaryIndex];
                if (legendaryImg && legendaryImg.dataset.id) {
                    this.playLegendaryCry(legendaryImg.dataset.id);
                }
            } else {
                // Play Normal Eat Sound
                this.eatSound.currentTime = 0;
                this.eatSound.play().catch(e => console.log("Audio play failed:", e));
            }

            this.#score += points;
            this.updateScoreUI();

            // Progressive Difficulty: Increase speed based on config
            // Current speed starts at initial. Decrease by config amount every interval.
            // Cap at minimum speed.
            if (this.#score % GAME_CONFIG.speed.increaseInterval === 0) {
                const speedDecrease = Math.floor(this.#score / GAME_CONFIG.speed.increaseInterval) * GAME_CONFIG.speed.decreaseAmount;
                this.gameSpeed = Math.max(GAME_CONFIG.speed.minimum, GAME_CONFIG.speed.initial - speedDecrease);
                console.log(`Speed updated: ${this.gameSpeed}ms`);
            }

            this.createExplosion(head.x * this.gridSize + 10, head.y * this.gridSize + 10, color);
            this.createExplosion(head.x * this.gridSize + 10, head.y * this.gridSize + 10, color);

            // Check High Score Marquee removed from here


            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => p.draw(this.ctx));

        // Draw Enemy
        if (this.enemy && this.enemy.active) {
            this.enemy.draw(this.ctx, this.gridSize, this.enemyImage);
        }

        if (!this.isRunning) return;

        // Draw Food
        if (this.food.x !== undefined) {
            const x = this.food.x * this.gridSize;
            const y = this.food.y * this.gridSize;
            const size = this.gridSize * 1.8;
            const offset = (size - this.gridSize) / 2;

            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.food.type === 'legendary' ? '#a600ff' : '#bc13fe';

            if (this.food.type === 'legendary') {
                const lSize = this.gridSize * 2.5;
                const lOffset = (lSize - this.gridSize) / 2;
                const lImg = this.legendaryImages[this.food.legendaryIndex] || this.legendaryImages[0];
                this.ctx.drawImage(lImg, x - lOffset, y - lOffset, lSize, lSize);

                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize, 0, Math.PI * 2);
                this.ctx.stroke();
            } else {
                const img = this.pokemonSprites[this.food.spriteIndex];
                if (img) {
                    this.ctx.drawImage(img, x - offset, y - offset, size, size);
                } else {
                    this.ctx.fillStyle = '#bc13fe';
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            this.ctx.shadowBlur = 0;
        }

        // Draw Snake
        if (this.snake.length > 0) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#f6e652';

            this.snake.forEach((part, index) => {
                const x = part.x * this.gridSize;
                const y = part.y * this.gridSize;

                if (index === 0) {
                    this.ctx.save();
                    this.ctx.translate(x + this.gridSize / 2, y + this.gridSize / 2);

                    let angle = 0;
                    if (this.velocity.x === 1) angle = Math.PI / 2;
                    else if (this.velocity.x === -1) angle = -Math.PI / 2;
                    else if (this.velocity.y === -1) angle = 0;
                    else if (this.velocity.y === 1) angle = Math.PI;

                    this.ctx.rotate(angle);

                    const size = this.gridSize * 2.0;
                    this.ctx.drawImage(this.headImage, -size / 2, -size / 2, size, size);
                    this.ctx.restore();
                } else {
                    this.ctx.fillStyle = '#f6e652';
                    const bx = part.x * this.gridSize + 1;
                    const by = part.y * this.gridSize + 1;
                    const bSize = this.gridSize - 2;
                    const radius = 4;
                    this.ctx.beginPath();
                    this.ctx.roundRect(bx, by, bSize, bSize, radius);
                    this.ctx.fill();
                }
            });
            this.ctx.shadowBlur = 0;
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning && this.particles.length === 0) return;
        window.requestAnimationFrame((time) => this.gameLoop(time));
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.update(deltaTime);
        this.draw();
    }

    updateScoreUI() {
        this.scoreEl.innerText = this.#score;
    }

    updateHighScoreUI() {
        this.highScoreEl.innerText = this.highScore;
    }

    gameOver() {
        this.isRunning = false;

        // Save to Leaderboard (Async)
        if (this.#score > 0) {
            this.updateLeaderboard(this.#score);
        } else {
            this.renderLeaderboard();
        }

        if (this.#score > this.highScore) {
            this.highScore = this.#score;
            // localStorage.setItem('snakeHighScore', this.highScore); // Optional: keep local personal best
            this.updateHighScoreUI();
            this.showMarquee(`${this.playerName} 得到 ${this.#score}分`);
        }
        this.finalScoreEl.innerText = this.#score;

        this.gameOverScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('active');

        // Hide Meowth Timer on Game Over
        if (this.meowthTimerEl) this.meowthTimerEl.classList.add('hidden');

        // Show buttons again
        if (this.pokedexSection) this.pokedexSection.classList.remove('hidden');

        // Force hide pokedex grid (user must click to open)
        const pokedexGrid = document.getElementById('pokedex-grid');
        if (pokedexGrid) {
            pokedexGrid.classList.add('hidden');
        }

        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    async updateLeaderboard(score) {
        try {
            await fetch('/api/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.playerName,
                    score: score
                })
            });
            await this.loadLeaderboard();
        } catch (e) {
            console.error("Failed to update score", e);
        }
    }

    async loadLeaderboard() {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            this.leaderboard = data;
            this.renderLeaderboard();

            // Update High Score Display to be the top score on server
            if (this.leaderboard.length > 0) {
                const topScore = this.leaderboard[0].score;
                if (topScore > this.highScore) {
                    this.highScore = topScore;
                    this.updateHighScoreUI();
                }
            }
        } catch (e) {
            console.error("Failed to load leaderboard", e);
        }
    }

    showMarquee(text) {
        if (this.marqueeText && this.marqueeContainer) {
            this.marqueeText.innerText = text;
            this.marqueeContainer.classList.remove('hidden');

            // Reset animation
            this.marqueeText.style.animation = 'none';
            this.marqueeText.offsetHeight; /* trigger reflow */
            this.marqueeText.style.animation = null;

            // Listen for animation end to hide
            const onAnimationEnd = () => {
                this.marqueeContainer.classList.add('hidden');
                this.marqueeText.removeEventListener('animationend', onAnimationEnd);
                this.recordBrokenTriggered = false; // Allow re-trigger if needed (though high score only breaks once usually)
            };
            this.marqueeText.addEventListener('animationend', onAnimationEnd);
        }
    }

    playLegendaryCry(id) {
        // PokeAPI Cry URL
        const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`);
        audio.volume = 0.6; // Slightly louder distinct sound
        audio.play().catch(e => console.warn(`Failed to play legendary cry for ID ${id}:`, e));
    }

    renderLeaderboard() {
        const createListItems = () => {
            return this.leaderboard.map((entry, index) => {
                return `
                        <li>
                            <span class="rank-name">#${index + 1} ${entry.name}</span>
                            <span class="rank-score">${entry.score}</span>
                        </li>
                    `;
            }).join('');
        };

        const html = createListItems();
        if (this.leaderboardListEl) this.leaderboardListEl.innerHTML = html;
        if (this.mainLeaderboardListEl) this.mainLeaderboardListEl.innerHTML = html;
    }
}

window.onload = () => {
    new Game();
};
