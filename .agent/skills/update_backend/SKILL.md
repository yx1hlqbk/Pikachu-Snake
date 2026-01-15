---
name: Update Backend
description: Instructions for updating the Python backend and leaderboard database.
---

# Update Backend

此技能指導如何維護 "Pikachu Snake" 的後端服務 (`server.py`) 與資料庫 (`leaderboard.db`)。

## 檔案結構
- `server.py`: Flask 伺服器，提供靜態檔案與 API。
- `leaderboard.db`: SQLite 資料庫，儲存排行榜資料。

## 常用操作

### 1. 修改 API
若需新增 API (例如 `GET /api/status`)：
1.  在 `server.py` 中使用 `@app.route` 定義新路由。
    ```python
    @app.route('/api/status', methods=['GET'])
    def status():
        return jsonify({'status': 'ok'})
    ```
2.  若需接收 JSON 資料，使用 `request.json`。

### 2. 修改資料庫 Schema
若需在 `scores` 表格中新增欄位 (例如 `max_combo`)：
1.  **備份**: 複製 `leaderboard.db` 為 `leaderboard.db.bak`。
2.  **修改 `init_db`**: 更新 `CREATE TABLE` 語句以備將來使用。
3.  **遷移 (Migration)**: 由於 SQLite 不支援直接修改欄位屬性，通常建議寫一個一次性的 Python script 來執行 SQL：
    ```python
    import sqlite3
    conn = sqlite3.connect('leaderboard.db')
    c = conn.cursor()
    c.execute('ALTER TABLE scores ADD COLUMN max_combo INTEGER DEFAULT 0')
    conn.commit()
    conn.close()
    ```

### 3. 本地測試
在專案根目錄執行：
```bash
python server.py
```
然後瀏覽器打開 `http://localhost:5500`。

## 注意事項
- 前端 `script.js` 使用 `fetch` 呼叫 API。若修改了 API 路徑或參數，請務必同步更新前端代碼。
- `server.py` 同時也是靜態檔案伺服器 (`static_folder='.'`)。
