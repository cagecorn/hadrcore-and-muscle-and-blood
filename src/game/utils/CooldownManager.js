import { debugLogEngine } from './DebugLogEngine.js';

class CooldownManager {
    constructor() {
        // key: unitId, value: Map<skillId, remainingTurns>
        this.cooldowns = new Map();
        debugLogEngine.log('CooldownManager', '쿨다운 매니저가 초기화되었습니다.');
    }

    /**
     * 모든 쿨타임 데이터를 초기화합니다.
     * 주로 전투 시작 시 호출됩니다.
     */
    reset() {
        this.cooldowns.clear();
    }

    /**
     * 유닛의 턴이 끝날 때 호출되어 모든 스킬의 쿨타임을 1턴 감소시킵니다.
     * @param {number} unitId - 턴을 마친 유닛의 ID
     */
    reduceCooldowns(unitId) {
        if (!this.cooldowns.has(unitId)) return;

        const unitCooldowns = this.cooldowns.get(unitId);
        for (const [skillId, turns] of unitCooldowns.entries()) {
            if (turns > 0) {
                unitCooldowns.set(skillId, turns - 1);
            }
        }
    }

    /**
     * 특정 스킬을 쿨타임 상태로 설정합니다.
     * @param {number} unitId
     * @param {string} skillId
     * @param {number} duration - 쿨타임 턴 수
     */
    setCooldown(unitId, skillId, duration) {
        if (!this.cooldowns.has(unitId)) {
            this.cooldowns.set(unitId, new Map());
        }
        this.cooldowns.get(unitId).set(skillId, duration);
        debugLogEngine.log('CooldownManager', `유닛 ${unitId}의 스킬 [${skillId}]에 ${duration}턴 쿨다운 적용.`);
    }

    /**
     * 특정 스킬이 사용 가능한 상태인지 확인합니다.
     * @param {number} unitId
     * @param {string} skillId
     * @returns {boolean}
     */
    isReady(unitId, skillId) {
        if (!this.cooldowns.has(unitId)) return true;

        const remainingTurns = this.cooldowns.get(unitId).get(skillId) || 0;
        return remainingTurns <= 0;
    }

    /**
     * 남은 쿨타임 턴 수를 조회합니다.
     * @param {number} unitId
     * @param {string} skillId
     * @returns {number} 남은 턴 수 (없으면 0)
     */
    getRemaining(unitId, skillId) {
        if (!this.cooldowns.has(unitId)) return 0;
        return this.cooldowns.get(unitId).get(skillId) || 0;
    }
}

export const cooldownManager = new CooldownManager();
