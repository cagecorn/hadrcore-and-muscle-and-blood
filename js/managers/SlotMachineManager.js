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

        const allSkillData = await Promise.all(
            unit.skillSlots.map(skillId => this.idManager.get(skillId))
        );
        return this.spinWithSkillList(unit, allSkillData);
    }

    /**
     * 제공된 스킬 목록과 유닛의 원본 슬롯 인덱스를 기반으로 슬롯 머신을 돌립니다.
     * @param {object} unit - 스킬을 사용할 유닛
     * @param {Array<object>} skillsToSpin - 굴림을 진행할 스킬 데이터 목록
     * @returns {Promise<object | null>} - 발동에 성공한 스킬 데이터 또는 null
     */
    async spinWithSkillList(unit, skillsToSpin) {
        if (!skillsToSpin || skillsToSpin.length === 0) {
            return null;
        }

        for (const skillData of skillsToSpin) {
            if (!skillData) continue;

            // 액티브 또는 디버프 스킬만 대상으로 함 (버프는 BuffManager가 처리)
            if (skillData.type !== 'active' && skillData.type !== 'debuff') {
                continue;
            }

            // AI 함수가 없으면 선택하지 않음
            if (!skillData.aiFunction) {
                continue;
            }

            // 원본 스킬 슬롯에서 이 스킬의 인덱스를 찾아 확률을 결정합니다.
            const originalSlotIndex = unit.skillSlots.indexOf(skillData.id);
            if (originalSlotIndex === -1) continue;

            const baseChance = this.probabilities[originalSlotIndex];
            const skillChance =
                typeof skillData.probability === 'number' ? skillData.probability : 1;
            const finalChance = baseChance * skillChance;

            if (this.diceEngine.getRandomFloat() < finalChance) {
                if (GAME_DEBUG_MODE) {
                    console.log(
                        `[SlotMachine] \uD83C\uDFB0 Success! Slot ${
                            originalSlotIndex + 1
                        } skill '${skillData.name}' triggered (Chance: ${finalChance * 100}%).`
                    );
                }
                return skillData;
            }
        }

        if (GAME_DEBUG_MODE) console.log(`[SlotMachine] ${unit.name} failed all non-buff skill rolls.`);
        return null;
    }
}
