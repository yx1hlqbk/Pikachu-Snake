/**
 * 遊戲設定檔
 * 集中管理所有遊戲參數，方便調整與維護
 */

const GAME_CONFIG = {
    // 遊戲基礎設定
    grid: {
        size: 20,           // 格子大小（像素）
        tileCount: 30       // 格子數量（30x30）
    },

    // 遊戲速度設定
    speed: {
        initial: 100,           // 初始速度（毫秒）
        minimum: 50,            // 最快速度（毫秒）
        increaseInterval: 100,  // 每幾分加速一次
        decreaseAmount: 2       // 每次減少的毫秒數
    },

    // 分數系統
    scoring: {
        normalFood: 10,         // 普通食物分數
        legendaryFood: 50,      // 傳說食物分數
        legendarySpawnScore: 100 // 傳說食物出現分數倍數（每100分出現一次）
    },

    // 敵人系統（喵喵）
    enemy: {
        spawnScore: 10,        // 敵人出現所需分數
        penaltyScore: 10,       // 碰撞扣分
        respawnCooldown: 10000, // 復活冷卻時間（毫秒，10秒）
        spawnCountdown: 5000,   // 出現倒數時間(毫秒,5秒)
        moveSpeed: 150,         // 移動間隔（毫秒）
        minSpawnDistance: 10    // 生成時與玩家的最小距離（格子數）
    },

    // 視覺效果
    effects: {
        normalExplosionParticles: 15,    // 普通爆炸粒子數
        legendaryExplosionParticles: 30  // 傳說爆炸粒子數
    }
};
