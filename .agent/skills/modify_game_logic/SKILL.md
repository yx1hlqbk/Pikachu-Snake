---
name: Modify Game Logic
description: Instructions for modifying the core game logic of Pikachu Snake.
---

# Modify Game Logic

此技能指導如何安全地修改 "Pikachu Snake" 的核心遊戲邏輯，包括 `Game` 類別、實體更新、與碰撞偵測。

## 核心檔案結構
- **主要邏輯**: `script.js` 中的 `Game` 類別。
- **實體**: `EnemySnake`, `Particle` 類別。
- **設定**: `config.js` (請參考 `tune_game_balance` 技能)。

## 常見修改流程

### 1. 新增遊戲狀態變數
如果要追蹤新的遊戲狀態（例如：「無敵時間」或「連擊數」）：

1.  在 `Game` 類別的 `constructor` 中初始化變數。
    ```javascript
    constructor() {
        // ...Existing code
        this.isInvincible = false; // 新增狀態
        this.comboCount = 0;       // 新增狀態
    }
    ```
2.  如果有需要在 `init()` (重置遊戲) 時重置的變數，請務必由 `init()` 方法中重置。
    ```javascript
    init() {
        // ...Existing code
        this.isInvincible = false; // 重置
        this.comboCount = 0;
    }
    ```

### 2. 修改 Update 循環
所有每幀更新的邏輯都在 `Game.update(deltaTime)` 方法中。

- **使用 `deltaTime`**: 所有計時器或移動邏輯**必須**依賴 `deltaTime` (毫秒)，而不是假設固定的幀率。
    ```javascript
    // 正確範例
    this.someTimer += deltaTime;
    if (this.someTimer > 1000) { /* 1秒後執行 */ }
    
    // 錯誤範例 (依賴幀數)
    this.frameCount++;
    if (this.frameCount > 60) { ... }
    ```
- **位置**: 請將邏輯放置在 `if (this.isPaused || !this.isRunning) return;` 檢查之後。

### 3. 修改 Draw 循環
所有渲染邏輯都在 `Game.draw()` 方法中。

- **順序**: 背景 -> 格線 -> 蛇身 -> 食物 -> 粒子 -> UI。
- **注意**: 若新增新的視覺層，請確保圖層順序正確 (例如 UI 應該在最上層)。

### 4. 處理碰撞 (Collision)
- **蛇與食物**: 在 `update` 方法中，檢查蛇頭座標與 `this.food` 座標。
- **蛇與敵人**: 檢查 `this.snake` 與 `this.enemy.body` 的座標重疊。
- **邊界**: 當蛇頭超出 `0` 到 `tileCount-1` 的範圍時處理。

## 驗證步驟
1.  修改後，請務必執行遊戲並檢查 Console 是否有錯誤。
2.  如果修改了 `constructor`，請確認重新整理頁面後變數初始化正確。
3.  如果修改了 `init`，請確認「GameOver 後再玩一次」是否能正確重置狀態。
