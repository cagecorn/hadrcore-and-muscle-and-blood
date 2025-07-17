// js/managers/TurnCountManager.js

export class TurnCountManager {
    constructor() {
        console.log("\u23F3 TurnCountManager initialized. Tracking all timed effects. \u23F3");
        // key: unitId, value: Map<effectId, { effectData, turnsRemaining }>
        this.activeEffects = new Map();
    }

    /**
     * 유닛에게 새로운 지속 효과(상태 이상, 버프, 디버프)를 추가합니다.
     * @param {string} unitId
     * @param {object} effectData
     */
    addEffect(unitId, effectData) {
        if (!effectData || !effectData.id || effectData.duration === undefined) {
            console.error("[TurnCountManager] Invalid effectData provided:", effectData);
            return;
        }
        if (!this.activeEffects.has(unitId)) {
            this.activeEffects.set(unitId, new Map());
        }
        const unitEffects = this.activeEffects.get(unitId);
        unitEffects.set(effectData.id, {
            effectData: effectData,
            turnsRemaining: effectData.duration
        });
        console.log(`[TurnCountManager] Added effect '${effectData.name}' (${effectData.id}) to unit '${unitId}'. Duration: ${effectData.duration} turns.`);
    }

    /**
     * 특정 유닛의 모든 지속 효과의 남은 턴을 감소시키고 만료된 효과를 제거합니다.
     * @param {string} unitId
     * @returns {string[]} 만료된 효과의 ID 목록
     */
    updateTurns(unitId) {
        const unitEffects = this.activeEffects.get(unitId);
        if (!unitEffects) return [];

        const expiredEffects = [];
        for (const [effectId, effect] of unitEffects.entries()) {
            effect.turnsRemaining--;
            console.log(`[TurnCountManager] Effect '${effect.effectData.name}' (${effectId}) on unit '${unitId}' has ${effect.turnsRemaining} turns remaining.`);
            if (effect.turnsRemaining <= 0) {
                expiredEffects.push(effectId);
            }
        }
        for (const effectId of expiredEffects) {
            unitEffects.delete(effectId);
            console.log(`[TurnCountManager] Effect '${effectId}' on unit '${unitId}' has expired and been removed.`);
        }
        if (unitEffects.size === 0) {
            this.activeEffects.delete(unitId);
        }
        return expiredEffects;
    }

    /**
     * 특정 유닛이 가진 모든 활성 지속 효과를 반환합니다.
     * @param {string} unitId
     */
    getEffectsOfUnit(unitId) {
        return this.activeEffects.get(unitId);
    }

    /**
     * 특정 유닛의 특정 지속 효과를 강제로 제거합니다.
     * @param {string} unitId
     * @param {string} effectId
     */
    removeEffect(unitId, effectId) {
        const unitEffects = this.activeEffects.get(unitId);
        if (unitEffects && unitEffects.has(effectId)) {
            unitEffects.delete(effectId);
            if (unitEffects.size === 0) {
                this.activeEffects.delete(unitId);
            }
            console.log(`[TurnCountManager] Effect '${effectId}' removed from unit '${unitId}'.`);
            return true;
        }
        console.warn(`[TurnCountManager] Effect '${effectId}' not found on unit '${unitId}'.`);
        return false;
    }

    /**
     * 모든 유닛의 모든 지속 효과를 초기화합니다.
     */
    clearAllEffects() {
        this.activeEffects.clear();
        console.log("[TurnCountManager] All active effects cleared.");
    }
}
