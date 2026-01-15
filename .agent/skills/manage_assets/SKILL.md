---
name: Manage Assets
description: Instructions for managing game assets (sprites, audio) and updating the manifest.
---

# Manage Assets

此技能指導如何新增或修改 "Pikachu Snake" 的圖片與音效資源。

## 資源位置
- **圖片**: `assets/sprites/`
- **音效**: `assets/audio/`
- **清單**: `assets/clean_manifest.js`

## 新增 Pokemon 流程

### 1. 準備圖片
1.  取得 Pokemon 圖片 (建議 .png 格式，去背)。
2.  將檔案放入 `assets/sprites/` 資料夾。
    - 若為傳說 Pokemon，建議檔名如 `mewtwo.png`。
    - 若為一般 Pokemon，建議檔名如 `bulbasaur.png`。

### 2. 更新 Manifest
開啟 `assets/clean_manifest.js`，找到 `ASSET_MANIFEST` 物件。

- **一般 Pokemon (一般食物)**: 新增到 `starters` 陣列。
    ```javascript
    { id: 1, name: "妙蛙種子", src: "assets/sprites/bulbasaur.png" },
    ```
- **傳說 Pokemon (高級食物)**: 新增到 `legendaries` 陣列。
    ```javascript
    { id: 150, name: "超夢", src: "assets/sprites/mewtwo.png" },
    ```
    - **注意**: `id` 必須對應至 PokeAPI ID (或自定義 ID)，且不可重複。

### 3. 設定傳說 Buff (僅限傳說 Pokemon)
若新增的是傳說 Pokemon，請參考 `tune_game_balance` 技能，在 `config.js` 的 `legendaryBuffs` 中定義其特殊效果。
```javascript
// config.js
150: {
    name: '超夢',
    type: 'SPEED_SLOW',
    multiplier: 1.5,
    duration: 10000,
    color: '#a040a0'
}
```

### 4. 設定生成規則
在 `config.js` 的 `legendarySpawnRules` 中，將該 ID 設定為 `true` 以啟用生成。
```javascript
// config.js
150: true, // 啟用超夢
```

## 驗證
1.  重新整理網頁。
2.  開啟瀏覽器 Console，確認沒有 404 圖片載入錯誤。
3.  若是傳說 Pokemon，此版本提供 **圖鑑 (Pokedex)** 功能，可開啟圖鑑確認是否顯示該 Pokemon。
