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
        legendaryFood: 100,      // 傳說食物分數
        legendarySpawnScore: 10 // 傳說食物出現分數倍數（每100分出現一次）
    },

    // 敵人系統（喵喵）
    enemy: {
        spawnScore: 10,        // 敵人出現所需分數
        penaltyScore: 10,       // 碰撞扣分
        respawnCooldown: 10000, // 復活冷卻時間（毫秒，10秒）
        spawnCountdown: 5000,   // 出現倒數時間(毫秒,5秒)
        moveSpeed: 300,         // 移動間隔（毫秒）
        minSpawnDistance: 5     // 最小生成距離（格子數）
    },

    // 傳說寶可夢 Buff 系統
    legendaryBuffs: {
        150: { // 超夢
            name: '超夢',
            type: 'SPEED_SLOW',  // 改為速度變慢
            multiplier: 1.5,      // 速度變慢 1.5 倍（實際速度 = 原速度 * 1.5）
            duration: 10000,      // 10秒
            color: '#a040a0'
        },
        151: { // 夢幻
            name: '夢幻',
            type: 'SPEED_BOOST',
            multiplier: 1.5,
            duration: 10000, // 10秒
            color: '#ff69b4'
        },
        249: { // 洛奇亞
            name: '洛奇亞',
            type: 'SCORE_MULTIPLIER', // 分數加倍
            multiplier: 2,            // 2倍
            duration: 10000,          // 10秒
            color: '#b0c4de'
        },
        250: { // 鳳王
            name: '鳳王',
            type: 'MEOWTH_INVINCIBLE', // 喵喵無敵
            multiplier: 1,             // 碰撞不扣分
            duration: 10000,           // 10秒
            color: '#ff4500'
        },
        382: { // 蓋歐卡
            name: '蓋歐卡',
            type: 'MOVEMENT_BONUS',    // 移動加分
            scorePerStep: 10,          // 每步+10分
            duration: 10000,           // 10秒
            color: '#00bfff'
        }
    },

    // 傳說寶可夢出現規則（預設全部啟用）
    legendarySpawnRules: {
        // Generation 1
        150: true,  // 超夢
        151: true,  // 夢幻

        // Generation 2
        249: true,  // 洛奇亞
        250: true,  // 鳳王

        // Generation 3
        382: true,   // 蓋歐卡
        383: false,  // 固拉多
        384: false,  // 烈空坐

        // Generation 4
        483: false,  // 帝牙盧卡
        484: false,  // 帕路奇亞
        487: false,  // 騎拉帝納

        // Generation 5
        643: false,  // 雷希拉姆
        644: false,  // 捷克羅姆
        646: false,  // 酋雷姆

        // Generation 6
        716: false,  // 哲爾尼亞斯
        717: false,  // 伊裴爾塔爾

        // Generation 7
        791: false,  // 索爾迦雷歐
        792: false,  // 露奈雅拉

        // Generation 8
        888: false,  // 蒼響
        889: false,  // 藏瑪然特

        // Generation 9
        1007: false, // 故勒頓
        1008: false  // 密勒頓
    },

    // 視覺效果
    effects: {
        normalExplosionParticles: 15,    // 普通爆炸粒子數
        legendaryExplosionParticles: 30  // 傳說爆炸粒子數
    }
};
