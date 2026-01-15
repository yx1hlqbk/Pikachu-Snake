---
name: Tune Game Balance
description: Instructions for tuning game balance and configuration.
---

# Tune Game Balance

此技能指導如何調整 "Pikachu Snake" 的遊戲平衡數值。

## 設定檔位置
所有遊戲平衡數值應集中於 `config.js` 中的 `GAME_CONFIG` 物件。

## 可調整的參數

### 1. 基礎設定 (`grid`)
- `size`: 格子像素大小 (影響畫面縮放)。
- `tileCount`: 格子數量 (影響地圖大小)。

### 2. 速度 (`speed`)
- `initial`: 初始移動間隔 (毫秒，越小越快)。
- `minimum`: 最高速度限制。
- `increaseInterval`: 分數每增加多少就加速。
- `decreaseAmount`: 每次加速減少多少毫秒。

### 3. 分數 (`scoring`)
- `normalFood`: 吃到普通食物的分數。
- `legendaryFood`: 吃到傳說食物的分數。

### 4. 敵人設定 (`enemy`)
- `spawnScore`: 分數達到多少後敵人開始出現。
- `respawnCooldown`: 敵人死亡後的復活時間。
- `moveSpeed`: 敵人的移動速度。
- `minSpawnDistance`: 敵人生成的安全距離。
- **注意**: 修改 `moveSpeed` 時，請確認不會比玩家初始速度快太多，否則難度過高。

### 5. 傳說 Pokemon Buff (`legendaryBuffs`)
定義編號對應的 Buff 效果。
- `type`: 'SPEED_SLOW' (減速) 或 'SPEED_BOOST' (加速)。
- `multiplier`: 倍率 (例如 1.5 代表 1.5倍)。
- `duration`: 持續時間 (毫秒)。

## 修改流程
1.  開啟 `config.js`。
2.  找到對應的欄位並修改數值。
3.  (重要) 若新增了新的參數，請確認 `script.js` 中有對應的程式碼讀取該參數，否則無效。

## 驗證
- 修改後重新整理網頁即可生效。
- 測試加速/減速效果是否明顯。
- 測試敵人生成時機是否符合預期。
