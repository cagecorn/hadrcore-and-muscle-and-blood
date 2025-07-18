import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 유닛의 스킬 슬롯을 순서대로 돌면서 고정된 확률로 스킬 사용을 결정하는 매니저입니다.
 * 1번 슬롯: 40%, 2번 슬롯: 30%, 3번 슬롯: 20%
 */
export class SlotMachineManager {
    constructor(idManager, diceEngine) {
        if (GAME_DEBUG_MODE) console.log("\uD83C\uDFB0 SlotMachineManager initialized. Fixed odds, ready to spin!");
        this.idManager = idManager;
        this.diceEngine = diceEngine;
        // 스킬 슬롯 순서별 고정 확률
        this.probabilities = [0.4, 0.3, 0.2]; 
    }

    /**
     * 슬롯 머신을 돌려 사용할 스킬을 결정합니다.
     * @param {object} unit - 스킬을 사용할 유닛
     * @returns {Promise<object | null>} - 발동에 성공한 스킬 데이터 또는 null
     */
    async spin(unit) {
        if (!unit.skillSlots || unit.skillSlots.length === 0) {
            return null;
        }

        // 1번, 2번, 3번 스킬 슬롯을 순서대로 확인 (최대 3개까지만)
        for (let i = 0; i < unit.skillSlots.length; i++) {
            const skillId = unit.skillSlots[i];
            const skillData = await this.idManager.get(skillId);
            
            // 액티브 또는 버프 스킬이 아니면 이 매니저에서 처리하지 않습니다.
            if (!skillData || (skillData.type !== 'active' && skillData.type !== 'buff')) {
                continue;
            }

            const chance = this.probabilities[i]; // 1번 슬롯은 0.4, 2번은 0.3...
            if (this.diceEngine.getRandomFloat() < chance) {
                // 확률 성공!
                if (GAME_DEBUG_MODE) console.log(`[SlotMachine] \uD83C\uDFB0 Success! Slot ${i + 1} skill '${skillData.name}' triggered (Chance: ${chance * 100}%).`);
                return skillData; // 성공한 스킬을 반환하고 즉시 종료 (순차적 경쟁)
            }
        }

        // 모든 스킬의 확률 경쟁에서 실패하면 null을 반환합니다.
        if (GAME_DEBUG_MODE) console.log(`[SlotMachine] ${unit.name} failed all skill rolls.`);
        return null;
    }
}
