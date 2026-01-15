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

    spawn(playerSnake, tileCount, presetPosition = null) {
        this.body = [];
        let startX, startY;

        if (presetPosition) {
            // Use preset position
            startX = presetPosition.x;
            startY = presetPosition.y;
        } else {
            // Random position with distance check
            let validPosition = false;
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
            const size = gridSize * 2.5; // Adjusted size for official artwork
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
        this.headImage.src = 'assets/pokemon/pikachu.png?v=' + new Date().getTime();

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

        // Food and Legendary
        this.snake = []; // Restore snake initialization
        this.food = {};
        this.legendary = null; // New independent legendary state

        this.velocity = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.nextVelocity = { x: 0, y: 0 };
        this.particles = [];
        this.rainDrops = []; // Initialize here before spawnFood uses it

        // Enemy System
        this.enemy = new EnemySnake();
        this.spawnFood(); // Moved here to ensure enemy exists before checking position
        this.enemyImage = new Image();
        this.enemyImage = new Image();
        this.enemyImage.src = 'assets/pokemon/meowth.png';
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
        this.pokedexTabs = document.getElementById('pokedex-tabs');
        this.currentCategory = 'all'; // 預設顯示全部
        this.marqueeContainer = document.getElementById('marquee-container');
        this.marqueeText = document.getElementById('marquee-text');
        this.recordBrokenTriggered = false;

        // Meowth Timer Elements
        this.meowthTimerEl = document.getElementById('meowth-timer');
        this.meowthCountdownEl = document.getElementById('meowth-countdown');
        this.meowthRespawnLocationEl = document.getElementById('meowth-respawn-location');

        // Meowth Spawn Alert Elements
        this.meowthSpawnAlertEl = document.getElementById('meowth-spawn-alert');
        this.meowthSpawnCountdownEl = document.getElementById('meowth-spawn-countdown');
        this.meowthSpawnLocationEl = document.getElementById('meowth-spawn-location');

        // Meowth Spawn State
        this.meowthSpawnTimer = 0;
        this.meowthSpawnPosition = null;

        // Effects
        this.buffManager = new BuffManager();
        this.particles = [];
        this.rainDrops = []; // For Kyogre's raining effect
        this.buffContainerEl = document.getElementById('buff-container');

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

        // Hide all meowth timers during countdown
        if (this.meowthTimerEl) this.meowthTimerEl.classList.add('hidden');
        if (this.meowthSpawnAlertEl) this.meowthSpawnAlertEl.classList.add('hidden');

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

        // Reset score immediately before showing countdown
        this.#score = 0;
        this.updateScoreUI();

        // Hide all meowth timers before countdown
        if (this.meowthTimerEl) this.meowthTimerEl.classList.add('hidden');
        if (this.meowthSpawnAlertEl) this.meowthSpawnAlertEl.classList.add('hidden');

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
        this.rainDrops = [];
        this.enemy.active = false;
        this.enemyCooldown = 0;
        this.meowthSpawnTimer = 0;
        this.meowthSpawnPosition = null;
        this.legendary = null; // Reset legendary
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

        // Reset Meowth Timers
        if (this.meowthTimerEl) this.meowthTimerEl.classList.add('hidden');
        if (this.meowthSpawnAlertEl) this.meowthSpawnAlertEl.classList.add('hidden');

        // Reset Buff System
        this.buffManager.clearAllBuffs();
        if (this.buffContainerEl) this.buffContainerEl.innerHTML = '';

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

        // Hide Meowth Timers on Home Return
        if (this.meowthTimerEl) this.meowthTimerEl.classList.add('hidden');
        if (this.meowthSpawnAlertEl) this.meowthSpawnAlertEl.classList.add('hidden');
    }

    closeAllOverlays() {
        // 關閉圖鑑
        const pokedexScreen = document.getElementById('pokedex-screen');
        if (pokedexScreen) {
            pokedexScreen.classList.remove('active');
            pokedexScreen.classList.add('hidden');
        }

        // 關閉版本更新
        const changelogScreen = document.getElementById('changelog-screen');
        if (changelogScreen) {
            changelogScreen.classList.remove('active');
            changelogScreen.classList.add('hidden');
        }

        // 關閉排行榜
        if (this.leaderboardScreen) {
            this.leaderboardScreen.classList.remove('active');
            this.leaderboardScreen.classList.add('hidden');
        }

        // 關閉 Buff 說明
        const buffInfoScreen = document.getElementById('buff-info-screen');
        if (buffInfoScreen) {
            buffInfoScreen.classList.remove('active');
            buffInfoScreen.classList.add('hidden');
        }
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
        this.renderInstructionsList();
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
            if (this.pokedexTabs) this.pokedexTabs.classList.add('hidden');
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
        const pokedexScreen = document.getElementById('pokedex-screen');
        const closePokedexBtn = document.getElementById('close-pokedex-btn');

        if (toggleBtn && pokedexScreen) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = pokedexScreen.classList.contains('hidden');
                this.closeAllOverlays();

                if (isHidden) {
                    pokedexScreen.classList.remove('hidden');
                    pokedexScreen.classList.add('active');
                    this.renderPokedex(this.currentCategory);
                }
            });

            if (closePokedexBtn) {
                closePokedexBtn.addEventListener('click', () => {
                    pokedexScreen.classList.add('hidden');
                    pokedexScreen.classList.remove('active');
                });
            }
        }

        // Pokedex Tabs
        if (this.pokedexTabs) {
            const tabButtons = this.pokedexTabs.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // 移除所有 active 狀態
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    // 添加當前按鈕的 active 狀態
                    button.classList.add('active');

                    // 獲取分類並重新渲染
                    const category = button.dataset.category;
                    this.currentCategory = category;
                    this.renderPokedex(category);
                });
            });
        }

        // Version Changelog Toggle
        const versionBtn = document.getElementById('version-btn');
        const changelogScreen = document.getElementById('changelog-screen');
        const closeChangelogBtn = document.getElementById('close-changelog-btn');

        if (versionBtn && changelogScreen && closeChangelogBtn) {
            versionBtn.addEventListener('click', () => {
                this.closeAllOverlays();
                changelogScreen.classList.remove('hidden');
                changelogScreen.classList.add('active');
            });

            closeChangelogBtn.addEventListener('click', () => {
                changelogScreen.classList.remove('active');
                changelogScreen.classList.remove('active');
                changelogScreen.classList.add('hidden');
            });
        }

        // Initialize Buff Info Button
        this.initBuffInfoButton();

        // Leaderboard Toggle
        const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
        const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');

        if (showLeaderboardBtn) {
            showLeaderboardBtn.addEventListener('click', () => {
                this.closeAllOverlays();
                if (this.leaderboardScreen) {
                    this.leaderboardScreen.classList.remove('hidden');
                    this.leaderboardScreen.classList.add('active');
                }
            });
        }

        if (closeLeaderboardBtn) {
            closeLeaderboardBtn.addEventListener('click', () => {
                if (this.leaderboardScreen) {
                    this.leaderboardScreen.classList.add('hidden');
                    this.leaderboardScreen.classList.remove('active');
                }
            });
        }

        // Wallet Address Copy Functionality
        const copyWalletBtn = document.getElementById('copy-wallet');
        const walletText = document.getElementById('wallet-text');

        if (copyWalletBtn && walletText) {
            copyWalletBtn.addEventListener('click', async () => {
                const address = walletText.textContent;

                try {
                    // 使用 Clipboard API 複製
                    await navigator.clipboard.writeText(address);

                    // 顯示成功提示
                    this.showCopyNotification('✅ 地址已複製到剪貼簿!', 'success');
                } catch (err) {
                    // 降級方案:使用舊方法
                    const textArea = document.createElement('textarea');
                    textArea.value = address;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.select();

                    try {
                        document.execCommand('copy');
                        this.showCopyNotification('✅ 地址已複製到剪貼簿!', 'success');
                    } catch (err2) {
                        this.showCopyNotification('❌ 複製失敗,請手動複製', 'error');
                    }

                    document.body.removeChild(textArea);
                }
            });
        }
    }

    initBuffInfoButton() {
        const buffInfoBtn = document.getElementById('show-buff-info-btn');
        const buffInfoScreen = document.getElementById('buff-info-screen');
        const closeBuffInfoBtn = document.getElementById('close-buff-info-btn');
        const buffInfoList = document.getElementById('buff-info-list');

        if (buffInfoBtn && buffInfoScreen && closeBuffInfoBtn && buffInfoList) {
            buffInfoBtn.addEventListener('click', () => {
                this.closeAllOverlays();
                this.renderBuffInfo(buffInfoList);
                buffInfoScreen.classList.remove('hidden');
                buffInfoScreen.classList.add('active');
            });

            closeBuffInfoBtn.addEventListener('click', () => {
                buffInfoScreen.classList.remove('active');
                buffInfoScreen.classList.add('hidden');
            });
        }
    }

    renderBuffInfo(container) {
        container.innerHTML = '';

        // 從 CONFIG 讀取傳說 Buff
        const legendaryBuffs = GAME_CONFIG.legendaryBuffs;

        for (const [id, config] of Object.entries(legendaryBuffs)) {
            // 找到對應的圖片
            const legendaryImg = this.legendaryImages.find(img => img.dataset.id === id);
            const imgSrc = legendaryImg ? legendaryImg.src : '';

            const item = document.createElement('div');
            item.className = 'buff-info-item';
            item.dataset.buffId = id;

            let desc = '';
            if (config.type === 'SPEED_SLOW') {
                desc = `散發出念力場，使周圍時間變慢，讓你的移動速度<strong>減少 ${(config.multiplier - 1) * 100}%</strong>，持續 ${config.duration / 1000} 秒。`;
            } else if (config.type === 'SPEED_BOOST') {
                desc = `憑藉著輕盈的身手，讓你的移動速度<strong>提升 ${(config.multiplier - 1) * 100}%</strong>，持續 ${config.duration / 1000} 秒。`;
            } else if (config.type === 'SCORE_MULTIPLIER') {
                desc = `傳說的氣場籠罩，獲得的分數<strong>變為 ${config.multiplier} 倍</strong>，持續 ${config.duration / 1000} 秒。`;
            } else if (config.type === 'MEOWTH_INVINCIBLE') {
                desc = `鳳凰的神聖火焰保護著你，<strong>碰到喵喵不會扣分</strong>，持續 ${config.duration / 1000} 秒。`;
            } else if (config.type === 'MOVEMENT_BONUS') {
                desc = `蓋歐卡喚來始源之海，<strong>每移動一步獲得 ${config.scorePerStep} 分</strong>，持續 ${config.duration / 1000} 秒。`;
            } else if (config.type === 'KYOGRE_RAIN') {
                desc = `蓋歐卡喚來始源之雨，地圖將出現<strong>能量水滴</strong>，收集每個獲得 <strong>${config.scorePerItem} 分</strong>！`;
            }

            item.innerHTML = `
                <img src="${imgSrc}" alt="${config.name}" class="buff-info-img">
                <div class="buff-info-details">
                    <div class="buff-info-name">${config.name}</div>
                    <div class="buff-info-desc">${desc}</div>
                </div>
            `;

            container.appendChild(item);
        }
    }

    showCopyNotification(message, type = 'success') {
        // 移除舊的通知
        const existingNotification = document.querySelector('.copy-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 建立新通知
        const notification = document.createElement('div');
        notification.className = `copy-notification ${type}`;
        notification.textContent = message;

        // 添加樣式
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.2rem;
            font-weight: 600;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: copyNotificationFadeIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // 2秒後移除
        setTimeout(() => {
            notification.style.animation = 'copyNotificationFadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    renderPokedex(category = 'all') {
        const grid = document.getElementById('pokedex-grid');
        if (!grid) return;

        // 清空現有內容以支援重新渲染
        grid.innerHTML = '';

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

        // 根據分類渲染
        if (category === 'all' || category === 'starters') {
            this.pokemonSprites.forEach(img => {
                grid.appendChild(createCard(img, false));
            });
        }

        if (category === 'all' || category === 'legendaries') {
            this.legendaryImages.forEach(img => {
                grid.appendChild(createCard(img, true));
            });
        }
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

    renderInstructionsList() {
        const list = document.getElementById('instructions-list');
        if (!list) return;

        list.innerHTML = `
            <p>🎮 使用方向鍵或滑動螢幕控制皮卡丘移動</p>
            <p>🍎 吃普通寶可夢得 <span class="highlight">${GAME_CONFIG.scoring.normalFood} 分</span></p>
            <p>⭐ 每 ${GAME_CONFIG.scoring.legendarySpawnScore} 分出現傳說寶可夢，吃掉得 <span class="highlight">${GAME_CONFIG.scoring.legendaryFood} 分</span></p>
            <p>😼 達到 ${GAME_CONFIG.enemy.spawnScore} 分後，喵喵會出現追擊你！</p>
            <p>⚠️ 喵喵碰到皮卡丘的<span class="highlight-danger">頭部</span>會扣 <span class="highlight-danger">${GAME_CONFIG.enemy.penaltyScore}
                    分</span></p>
            <p>💡 用身體擋住喵喵不會扣分，只有頭對頭才會！</p>
        `;
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

    getRandomEmptyPosition() {
        let validPosition = false;
        let newPos = { x: 0, y: 0 };
        let attempts = 0;
        const maxAttempts = this.tileCount * this.tileCount;

        while (!validPosition && attempts < maxAttempts) {
            newPos = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };

            // Check against snake body
            validPosition = !this.snake.some(part => part.x === newPos.x && part.y === newPos.y);

            // Check against food
            if (validPosition && this.food.x !== undefined) {
                validPosition = !(newPos.x === this.food.x && newPos.y === this.food.y);
            }

            // Check against legendary
            if (validPosition && this.legendary) {
                validPosition = !(
                    newPos.x >= this.legendary.x && newPos.x < this.legendary.x + 2 &&
                    newPos.y >= this.legendary.y && newPos.y < this.legendary.y + 2
                );
            }

            // Check against enemy body
            if (validPosition && this.enemy.active) {
                validPosition = !this.enemy.body.some(part => part.x === newPos.x && part.y === newPos.y);
            }

            // Check against rain drops
            if (validPosition && this.rainDrops.length > 0) {
                validPosition = !this.rainDrops.some(drop => drop.x === newPos.x && drop.y === newPos.y);
            }

            attempts++;
        }
        return validPosition ? newPos : null;
    }

    spawnFood() {
        // Normal food spawning only
        const pos = this.getRandomEmptyPosition();
        if (pos) {
            this.food = {
                x: pos.x,
                y: pos.y,
                type: 'normal',
                spriteIndex: Math.floor(Math.random() * this.pokemonSprites.length)
            };
        }
    }

    trySpawnLegendary() {
        // Condition: Score is multiple of SpawnScore (e.g., 100, 200...)
        // And no legendary currently exists
        if (this.#score > 0 && this.#score % GAME_CONFIG.scoring.legendarySpawnScore === 0 && !this.legendary) {
            const enabledLegendaries = this.legendaryImages.filter(img => {
                const id = parseInt(img.dataset.id);
                return GAME_CONFIG.legendarySpawnRules[id] !== false;
            });

            if (enabledLegendaries.length > 0) {
                // Try to find a 2x2 space
                let attempts = 0;
                let valid = false;
                let lx, ly;

                while (!valid && attempts < 50) {
                    lx = Math.floor(Math.random() * (this.tileCount - 1));
                    ly = Math.floor(Math.random() * (this.tileCount - 1));

                    // Check collision for 2x2 area
                    const occupied = this.snake.some(p =>
                        (p.x >= lx && p.x < lx + 2 && p.y >= ly && p.y < ly + 2)
                    ) || (this.food.x !== undefined &&
                        this.food.x >= lx && this.food.x < lx + 2 &&
                        this.food.y >= ly && this.food.y < ly + 2
                        );

                    if (!occupied) valid = true;
                    attempts++;
                }

                if (valid) {
                    const lImg = enabledLegendaries[Math.floor(Math.random() * enabledLegendaries.length)];
                    this.legendary = {
                        x: lx,
                        y: ly,
                        type: 'legendary',
                        legendaryIndex: this.legendaryImages.indexOf(lImg),
                        spawnTime: Date.now(),
                        lifetime: GAME_CONFIG.scoring.legendaryLifetime
                    };

                    // Play spawn sound if any (Optional)
                    this.showMarquee("傳說寶可夢出現了！");
                }
            }
        }
    }

    createExplosion(x, y, color) {
        const count = color === '#a600ff' ? GAME_CONFIG.effects.legendaryExplosionParticles : GAME_CONFIG.effects.normalExplosionParticles;
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    calculateEnemySpawnPosition() {
        // Calculate a random spawn position far from player
        let validPosition = false;
        let startX, startY;

        while (!validPosition) {
            startX = Math.floor(Math.random() * this.tileCount);
            startY = Math.floor(Math.random() * this.tileCount);

            // Ensure far enough from player head
            if (this.snake.length > 0) {
                const dist = Math.abs(startX - this.snake[0].x) + Math.abs(startY - this.snake[0].y);
                if (dist > GAME_CONFIG.enemy.minSpawnDistance) validPosition = true;
            } else {
                validPosition = true;
            }
        }

        return { x: startX, y: startY };
    }

    getPositionDescription(x, y) {
        // Convert coordinates to region description
        const thirdX = this.tileCount / 3;
        const thirdY = this.tileCount / 3;

        let horizontal = '';
        let vertical = '';

        // Determine horizontal position
        if (x < thirdX) {
            horizontal = '左';
        } else if (x < thirdX * 2) {
            horizontal = '中';
        } else {
            horizontal = '右';
        }

        // Determine vertical position
        if (y < thirdY) {
            vertical = '上';
        } else if (y < thirdY * 2) {
            vertical = '央';
        } else {
            vertical = '下';
        }

        // Combine to create region description
        if (horizontal === '中' && vertical === '央') {
            return '中央區域';
        } else if (horizontal === '中') {
            return vertical === '上' ? '上方區域' : '下方區域';
        } else if (vertical === '央') {
            return horizontal === '左' ? '左側區域' : '右側區域';
        } else {
            return horizontal + vertical + '區域';
        }
    }

    update(deltaTime) {
        this.particles.forEach((p, index) => {
            p.update();
            if (p.life <= 0) this.particles.splice(index, 1);
        });

        if (!this.isRunning) return;

        // Update Buff System
        const expiredBuffs = this.buffManager.updateBuffs(performance.now());

        // 如果有 Buff 過期或有啟動中的 Buff，更新 UI
        if (expiredBuffs.length > 0 || this.buffManager.getActiveBuffs().size > 0) {
            this.updateBuffUI();
        }

        // --- Enemy Logic Start ---
        // --- Enemy Logic Start ---
        if (this.enemyCooldown > 0) {
            this.enemyCooldown -= deltaTime;

            // Show and update Timer with location (Using same UI as initial spawn)
            if (this.meowthSpawnAlertEl && this.meowthSpawnCountdownEl) {
                this.meowthSpawnAlertEl.classList.remove('hidden');
                this.meowthSpawnCountdownEl.innerText = Math.ceil(this.enemyCooldown / 1000);

                // Update location display if position is calculated
                if (this.meowthSpawnLocationEl && this.meowthSpawnPosition) {
                    const locationDesc = this.getPositionDescription(
                        this.meowthSpawnPosition.x,
                        this.meowthSpawnPosition.y
                    );
                    this.meowthSpawnLocationEl.innerText = locationDesc;
                }
            }

            // When cooldown ends, spawn enemy directly (no additional countdown)
            if (this.enemyCooldown <= 0) {
                if (this.meowthSpawnPosition) {
                    this.enemy.spawn(this.snake, this.tileCount, this.meowthSpawnPosition);
                } else {
                    this.enemy.spawn(this.snake, this.tileCount);
                }

                // Hide timer
                if (this.meowthSpawnAlertEl) {
                    this.meowthSpawnAlertEl.classList.add('hidden');
                }

                // Reset spawn state
                this.meowthSpawnPosition = null;
            }
        } else {
            // Hide Timer (Use spawn alert element)
            // Note: We don't forcefully hide here every frame because it might be used by the other spawn logic below.
            // The other logic handles its own visibility.
            // However, to be safe from "red timer" logic:
            if (this.meowthTimerEl) {
                this.meowthTimerEl.classList.add('hidden');
            }
        }

        // Spawn Enemy condition: Score >= 100, not active, cooldown over
        // This only triggers for FIRST spawn (not after collision)
        if (this.#score >= GAME_CONFIG.enemy.spawnScore && !this.enemy.active && this.enemyCooldown <= 0) {

            // If countdown is running, continue it
            if (this.meowthSpawnTimer > 0) {
                // Countdown in progress
                this.meowthSpawnTimer -= deltaTime;

                // Update spawn alert UI
                if (this.meowthSpawnAlertEl && this.meowthSpawnCountdownEl) {
                    this.meowthSpawnAlertEl.classList.remove('hidden');
                    this.meowthSpawnCountdownEl.innerText = Math.ceil(this.meowthSpawnTimer / 1000);
                }

                // Check if countdown finished
                if (this.meowthSpawnTimer <= 0) {
                    // Spawn enemy at pre-calculated position
                    if (this.meowthSpawnPosition) {
                        this.enemy.spawn(this.snake, this.tileCount, this.meowthSpawnPosition);
                    } else {
                        this.enemy.spawn(this.snake, this.tileCount);
                    }

                    // Hide spawn alert
                    if (this.meowthSpawnAlertEl) {
                        this.meowthSpawnAlertEl.classList.add('hidden');
                    }

                    // Reset spawn state
                    this.meowthSpawnTimer = 0;
                    this.meowthSpawnPosition = null;
                }
            }
            // If countdown is not running and we don't have a position set (meaning we haven't just finished spawning), start it
            else if (this.meowthSpawnPosition === null) {
                // Start spawn countdown
                this.meowthSpawnTimer = GAME_CONFIG.enemy.spawnCountdown;

                // Pre-calculate spawn position
                this.meowthSpawnPosition = this.calculateEnemySpawnPosition();

                // Update location display
                if (this.meowthSpawnLocationEl) {
                    const locationDesc = this.getPositionDescription(
                        this.meowthSpawnPosition.x,
                        this.meowthSpawnPosition.y
                    );
                    this.meowthSpawnLocationEl.innerText = locationDesc;
                }
            }
        } else {
            // Hide spawn alert if conditions not met
            // BUT only if we are not in the middle of a cooldown countdown (which handles its own visibility)
            if (this.meowthSpawnAlertEl && this.enemyCooldown <= 0) {
                this.meowthSpawnAlertEl.classList.add('hidden');
            }
        }

        // Update Enemy & Check Collision
        if (this.enemy.active && this.snake.length > 0) {
            this.enemy.update(deltaTime, this.snake[0]);

            const playerHead = this.snake[0];
            const enemyHead = this.enemy.body[0];

            // Check 1: Player Head hits Enemy Body
            const hitEnemy = this.enemy.body.some(part => part.x === playerHead.x && part.y === playerHead.y);

            // Check 2: Enemy Head hits Player Body (excluding player head)
            const hitPlayer = this.snake.slice(1).some(part => part.x === enemyHead.x && part.y === enemyHead.y);

            if (hitEnemy || hitPlayer) {
                // Check for MEOWTH_INVINCIBLE buff
                const isInvincible = Array.from(this.buffManager.getActiveBuffs().values())
                    .some(buff => buff.config.type === 'MEOWTH_INVINCIBLE');

                if (isInvincible) {
                    // Visual feedback for invincibility (e.g., Gold/Orange sparks)
                    this.createExplosion(playerHead.x * this.gridSize + 10, playerHead.y * this.gridSize + 10, '#ffcc00');
                    console.log("Invincible! No score penalty.");
                } else {
                    this.#score = Math.max(0, this.#score - GAME_CONFIG.enemy.penaltyScore);
                    this.updateScoreUI();

                    // Visual feedback
                    this.createExplosion(playerHead.x * this.gridSize + 10, playerHead.y * this.gridSize + 10, '#ff0000');
                }

                // Reset Enemy
                this.enemy.active = false;
                this.enemyCooldown = GAME_CONFIG.enemy.respawnCooldown; // Cooldown from config

                // Pre-calculate next spawn position for display during cooldown
                this.meowthSpawnPosition = this.calculateEnemySpawnPosition();
            }
        }
        // --- Enemy Logic End ---

        // Apply SPEED_BOOST and SPEED_SLOW from Buff System
        const speedBoostMultiplier = this.buffManager.getMultiplier('SPEED_BOOST');
        const speedSlowMultiplier = this.buffManager.getMultiplier('SPEED_SLOW');

        // 計算最終速度：加速效果除以倍率，減速效果乘以倍率
        const effectiveGameSpeed = (this.gameSpeed / speedBoostMultiplier) * speedSlowMultiplier;

        this.accumulatedTime = (this.accumulatedTime || 0) + deltaTime;
        if (this.accumulatedTime < effectiveGameSpeed) return;
        this.accumulatedTime -= effectiveGameSpeed;

        this.velocity = this.nextVelocity; // Update velocity based on nextVelocity
        // Move Snake
        const head = { x: this.snake[0].x + this.velocity.x, y: this.snake[0].y + this.velocity.y };

        // Handle KYOGRE_RAIN buff logic
        const kyogreBuff = Array.from(this.buffManager.getActiveBuffs().values())
            .find(buff => buff.config.type === 'KYOGRE_RAIN');

        if (kyogreBuff) {
            // Spawn drops if needed
            while (this.rainDrops.length < kyogreBuff.config.maxItems) {
                const drop = this.getRandomEmptyPosition();
                if (drop) this.rainDrops.push(drop);
            }

            // Check collision with drops
            const dropIndex = this.rainDrops.findIndex(d => d.x === head.x && d.y === head.y);
            if (dropIndex !== -1) {
                this.#score += kyogreBuff.config.scorePerItem;
                this.updateScoreUI();
                this.createExplosion(head.x * this.gridSize + 10, head.y * this.gridSize + 10, '#00bfff');
                this.rainDrops.splice(dropIndex, 1);
                // Sound effect could go here
            }
        } else {
            // Clear drops if buff ended
            this.rainDrops = [];
        }

        // Check Wall Collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount ||
            this.snake.some(part => part.x === head.x && part.y === head.y)) {
            this.createExplosion(this.snake[0].x * this.gridSize + 10, this.snake[0].y * this.gridSize + 10, '#f6e652');
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Track if any food was eaten this frame
        let foodEatenThisFrame = false;

        // Check Food Collision (Normal)
        if (head.x === this.food.x && head.y === this.food.y) {
            let points = GAME_CONFIG.scoring.normalFood;
            let color = '#ffff00'; // Yellow explosion

            // Apply Score Multiplier Buff
            const scoreMultiplier = this.buffManager.getMultiplier('SCORE_MULTIPLIER');
            points *= scoreMultiplier;

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

        // Draw Food (Normal)
        if (this.food.x !== undefined) {
            const x = this.food.x * this.gridSize;
            const y = this.food.y * this.gridSize;
            const size = this.gridSize * 1.8;
            const offset = (size - this.gridSize) / 2;

            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#bc13fe';

            const img = this.pokemonSprites[this.food.spriteIndex];
            if (img) {
                this.ctx.drawImage(img, x - offset, y - offset, size, size);
            } else {
                this.ctx.fillStyle = '#bc13fe';
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.shadowBlur = 0;
        }

        // Draw Legendary
        if (this.legendary) {
            const lx = this.legendary.x * this.gridSize;
            const ly = this.legendary.y * this.gridSize;
            const lSize = this.gridSize * 2.5;
            const lOffset = (lSize - this.gridSize) / 2;

            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#a600ff';

            const lImg = this.legendaryImages[this.legendary.legendaryIndex] || this.legendaryImages[0];
            this.ctx.drawImage(lImg, lx - lOffset, ly - lOffset, lSize, lSize);

            // Draw timer circle or indicator
            const timeLeft = this.legendary.lifetime - (Date.now() - this.legendary.spawnTime);
            const percent = Math.max(0, timeLeft / this.legendary.lifetime);

            this.ctx.strokeStyle = `rgba(255, 255, 255, ${percent})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(lx + this.gridSize, ly + this.gridSize, this.gridSize * 1.5, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * percent));
            this.ctx.stroke();

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

        // Draw Active Buff Visuals (Overlay)
        // Check for specific buffs that need full-screen effects
        const activeBuffs = this.buffManager.getActiveBuffs();
        for (const [buffType, buffData] of activeBuffs) {
            if (buffData.config.type === 'MOVEMENT_BONUS') {
                // Kyogre's Primordial Sea effect
                this.ctx.save();
                const gradient = this.ctx.createRadialGradient(
                    this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 4,
                    this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 1.2
                );
                gradient.addColorStop(0, 'rgba(0, 191, 255, 0)');
                gradient.addColorStop(1, 'rgba(0, 191, 255, 0.4)');

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // Add border effect
                this.ctx.strokeStyle = 'rgba(0, 191, 255, 0.8)';
                this.ctx.lineWidth = 15;
                this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();
            }
        }

        // Draw Rain Drops (Kyogre)
        if (this.rainDrops.length > 0) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00bfff';
            this.ctx.fillStyle = '#00bfff';

            this.rainDrops.forEach(drop => {
                const x = drop.x * this.gridSize;
                const y = drop.y * this.gridSize;

                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2.5, 0, Math.PI * 2);
                this.ctx.fill();
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

        // Hide Meowth Timers on Game Over
        if (this.meowthTimerEl) this.meowthTimerEl.classList.add('hidden');
        if (this.meowthSpawnAlertEl) this.meowthSpawnAlertEl.classList.add('hidden');

        // Clear all Buffs on Game Over
        this.buffManager.clearAllBuffs();
        if (this.buffContainerEl) this.buffContainerEl.innerHTML = '';

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

    /**
     * 更新 Buff UI 顯示
     */
    updateBuffUI() {
        if (!this.buffContainerEl) {
            console.warn('Buff container element not found!');
            return;
        }

        const currentTime = performance.now();
        const activeBuffs = this.buffManager.getActiveBuffs();

        console.log('updateBuffUI called, active buffs:', activeBuffs.size);

        // 清空現有 UI
        this.buffContainerEl.innerHTML = '';

        // 為每個啟動的 Buff 建立 UI 元素
        for (const [buffId, buffData] of activeBuffs.entries()) {
            console.log('Creating UI for buff:', buffId, buffData.config.name);

            const timeRemaining = this.buffManager.getBuffTimeRemaining(buffId, currentTime);
            const secondsRemaining = Math.ceil(timeRemaining / 1000);

            // 建立 Buff 項目
            const buffItem = document.createElement('div');
            buffItem.className = 'buff-item';
            buffItem.dataset.buffId = buffId;

            // 建立圖示
            const buffImg = document.createElement('img');
            // 從 legendaryImages 中找到對應的圖片
            const pokemonId = parseInt(buffId);
            const legendaryImg = this.legendaryImages.find(img => parseInt(img.dataset.id) === pokemonId);
            if (legendaryImg) {
                buffImg.src = legendaryImg.src;
                buffImg.alt = buffData.config.name;
                console.log('Buff image set:', legendaryImg.src);
            } else {
                console.warn('Legendary image not found for ID:', pokemonId);
            }

            // 建立資訊容器
            const buffInfo = document.createElement('div');
            buffInfo.className = 'buff-info';

            // 建立名稱
            const buffName = document.createElement('div');
            buffName.className = 'buff-name';
            buffName.textContent = buffData.config.name;

            // 建立計時器
            const buffTimer = document.createElement('div');
            buffTimer.className = 'buff-timer';
            buffTimer.textContent = `${secondsRemaining}秒`;

            // 組裝元素
            buffInfo.appendChild(buffName);
            buffInfo.appendChild(buffTimer);
            buffItem.appendChild(buffImg);
            buffItem.appendChild(buffInfo);
            this.buffContainerEl.appendChild(buffItem);

            console.log('Buff UI element added to container');
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
