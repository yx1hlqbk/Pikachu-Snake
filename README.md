# 🐭 皮卡丘養成計畫 | Pikachu Snake Game

一款結合經典貪食蛇玩法與寶可夢元素的霓虹風格網頁遊戲!

![Version](https://img.shields.io/badge/version-1.2.4-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 遊戲特色

- 🌈 **霓虹視覺效果** - 絢麗的霓虹光暈與動態背景
- 🎯 **寶可夢收集** - 收錄歷代御三家與傳說寶可夢
- 🔊 **音效系統** - 皮卡丘與傳說寶可夢專屬音效
- 😼 **追擊挑戰** - 喵喵敵人會在達到 100 分後出現追擊
- 🏆 **排行榜系統** - 記錄最高分與玩家排名
- 📖 **寶可夢圖鑑** - 完整的寶可夢收藏展示
- 📱 **響應式設計** - 支援桌面與行動裝置

## 🎯 遊戲規則

### 基本玩法
- 🎮 使用方向鍵或滑動螢幕控制皮卡丘移動
- 🍎 吃普通寶可夢得 **10 分**
- ⭐ 每 100 分出現傳說寶可夢,吃掉得 **50 分**

### 挑戰機制
- 😼 達到 100 分後,喵喵會出現追擊你!
- ⚠️ 喵喵碰到皮卡丘的**頭部**會扣 **50 分**
- 💡 用身體擋住喵喵不會扣分,只有頭對頭才會!
- ⏳ 喵喵被擊退後會在 10 秒後復活

## 🚀 快速開始

### 線上遊玩
直接訪問 [GitHub Pages](https://yx1hlqbk.github.io/Pikachu-Snake/) 即可開始遊戲!

### 本地運行

1. **克隆專案**
```bash
git clone https://github.com/yx1hlqbk/Pikachu-Snake.git
cd Pikachu-Snake
```

2. **啟動本地伺服器**

使用 Python:
```bash
python server.py
```

或使用其他靜態伺服器:
```bash
# 使用 Node.js http-server
npx http-server

# 使用 Python 3
python -m http.server 8000
```

3. **開啟瀏覽器**
訪問 `http://localhost:8000` (或對應的端口)

## 📁 專案結構

```
Pikachu-Snake/
├── index.html              # 主頁面
├── style.css               # 樣式表
├── script.js               # 遊戲邏輯
├── config.js               # 遊戲設定
├── server.py               # Python 伺服器
├── assets/
│   ├── sprites/            # 遊戲圖片資源
│   │   ├── pikachu_final.png
│   │   ├── pikachu_walking.gif
│   │   └── meowth.png
│   ├── audio/              # 音效檔案
│   │   └── pikachu.mp3
│   └── clean_manifest.js   # 資源清單
└── scripts/
    └── gen_pixel_art.py    # 像素藝術生成工具
```

## 🎨 技術特點

- **純前端實作** - HTML5 Canvas + Vanilla JavaScript
- **霓虹美學** - CSS 動畫與光暈效果
- **本地儲存** - 使用 SQLite 資料庫儲存排行榜
- **響應式設計** - 支援觸控與鍵盤操作
- **模組化設計** - 清晰的程式碼結構

## 🔧 遊戲設定

可在 `config.js` 中調整遊戲參數:

```javascript
const GAME_CONFIG = {
    NORMAL_FOOD_SCORE: 10,        // 普通食物分數
    LEGENDARY_FOOD_SCORE: 50,     // 傳說寶可夢分數
    LEGENDARY_SPAWN_INTERVAL: 100, // 傳說寶可夢出現間隔
    ENEMY_SPAWN_SCORE: 100,       // 敵人出現分數
    ENEMY_COLLISION_PENALTY: 50,  // 敵人碰撞扣分
    // ... 更多設定
};
```

## 📝 版本歷程

### v1.2.4 - 復活倒數機制
- ✨ 新增「喵喵復活倒數」顯示
- 👀 戰況掌握:隨時掌握敵人動態

### v1.2.3 - 榮耀時刻更新
- ✨ 新增「跑馬燈系統」:打破最高分時的專屬公告
- 🔧 介面優化:調整跑馬燈位置

### v1.2.2 - 音效沈浸更新
- 🐉 傳說降臨:傳說寶可夢專屬音效
- ✨ 體驗優化

### v1.2.0 - 追擊挑戰更新
- ✨ 新增敵對貪食蛇機制
- 🚫 碰撞懲罰系統

### v1.1.0 - 圖鑑與音效大升級
- 📖 完整寶可夢圖鑑
- 🔊 皮卡丘音效系統
- 💎 介面優化

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request!

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 👨‍💻 作者

**Ian Liao**

## ☕ 支持作者

如果你喜歡這款遊戲,可以請作者喝杯咖啡!

**Tron (TRC20):**
```
TFxdSLG93t1Rs37PtyauqRM4P4P4UvesCx
```

## 🎮 截圖

> 遊戲截圖即將更新...

---

⭐ 如果你喜歡這個專案,請給它一顆星星!
