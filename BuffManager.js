/**
 * Buff Manager - 管理遊戲中的所有 Buff 效果
 */
class BuffManager {
    constructor() {
        // 儲存當前啟動的 Buff: buffType -> { endTime, config }
        this.activeBuffs = new Map();
    }

    /**
     * 新增一個 Buff 效果
     * @param {string} buffType - Buff 類型 (例如: 'mewtwo', 'mew')
     * @param {number} duration - 持續時間 (毫秒)
     * @param {object} config - Buff 配置
     */
    addBuff(buffType, duration, config) {
        const endTime = performance.now() + duration;
        this.activeBuffs.set(buffType, {
            endTime: endTime,
            config: config,
            startTime: performance.now()
        });
    }

    /**
     * 更新所有 Buff 狀態，移除過期的 Buff
     * @param {number} currentTime - 當前時間戳
     * @returns {Array} 已過期的 Buff 類型列表
     */
    updateBuffs(currentTime) {
        const expiredBuffs = [];

        for (const [buffType, buffData] of this.activeBuffs.entries()) {
            if (currentTime >= buffData.endTime) {
                expiredBuffs.push(buffType);
                this.activeBuffs.delete(buffType);
            }
        }

        return expiredBuffs;
    }

    /**
     * 檢查特定 Buff 是否啟動中
     * @param {string} buffType - Buff 類型
     * @returns {boolean}
     */
    isBuffActive(buffType) {
        return this.activeBuffs.has(buffType);
    }

    /**
     * 獲取 Buff 剩餘時間
     * @param {string} buffType - Buff 類型
     * @param {number} currentTime - 當前時間戳
     * @returns {number} 剩餘時間(毫秒)，如果 Buff 不存在則返回 0
     */
    getBuffTimeRemaining(buffType, currentTime) {
        const buffData = this.activeBuffs.get(buffType);
        if (!buffData) return 0;

        return Math.max(0, buffData.endTime - currentTime);
    }

    /**
     * 獲取所有啟動中的 Buff
     * @returns {Map} 當前啟動的 Buff Map
     */
    getActiveBuffs() {
        return this.activeBuffs;
    }

    /**
     * 清除所有 Buff
     */
    clearAllBuffs() {
        this.activeBuffs.clear();
    }

    /**
     * 獲取特定類型的 Buff 倍率
     * @param {string} effectType - 效果類型 ('SIZE_BOOST', 'SPEED_BOOST')
     * @returns {number} 倍率，如果沒有對應的 Buff 則返回 1
     */
    getMultiplier(effectType) {
        let multiplier = 1;

        for (const [buffType, buffData] of this.activeBuffs.entries()) {
            if (buffData.config.type === effectType) {
                multiplier *= buffData.config.multiplier;
            }
        }

        return multiplier;
    }
}
