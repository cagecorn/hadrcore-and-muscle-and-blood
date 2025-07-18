// js/managers/BuffManager.js

import { GAME_DEBUG_MODE } from '../constants.js';
import { SKILL_TYPES } from '../../data/warriorSkills.js';

/**
 * 버프 스킬의 특별한 발동 로직을 전담하는 매니저입니다.
 * 버프 스킬이 발동했는지 확인하고, 후속 행동(액티브/디버프 스킬)을 위한 정보를 반환합니다.
 */
export class BuffManager {
    constructor(idManager, diceEngine) {
        if (GAME_DEBUG_MODE) console.log("BuffManager initialized. Handling special buff logic.");
        this.idManager = idManager;
        this.diceEngine = diceEngine;
        this.probabilities = [0.4, 0.3, 0.2];
    }

    /**
     * 유닛의 스킬 슬롯을 확인하여 버프 스킬을 발동할지 결정합니다.
     * @param {object} unit - 스킬을 사용할 유닛
     * @returns {Promise<{activatedBuff: object | null, remainingSkills: Array<object>}>
     * - activatedBuff: 발동된 버프 스킬 데이터 (없으면 null)
     * - remainingSkills: 발동된 버프를 제외한 나머지 스킬 데이터 배열
     */
    async processBuffSkills(unit) {
        if (!unit.skillSlots || unit.skillSlots.length === 0) {
            return { activatedBuff: null, remainingSkills: [] };
        }

        let activatedBuff = null;
        const allSkillData = await Promise.all(
            unit.skillSlots.map(skillId => this.idManager.get(skillId))
        );
        const remainingSkills = [...allSkillData];

        for (let i = 0; i < allSkillData.length; i++) {
            const skillData = allSkillData[i];
            
            // 버프 타입 스킬인지 확인
            if (skillData && skillData.type === SKILL_TYPES.BUFF) {
                const chance = this.probabilities[i];
                if (this.diceEngine.getRandomFloat() < chance) {
                    // 확률 성공!
                    if (GAME_DEBUG_MODE) console.log(`[BuffManager] 🎲 Success! Buff skill '${skillData.name}' triggered (Chance: ${chance * 100}%).`);
                    activatedBuff = skillData;
                    
                    // 나머지 스킬 목록에서 현재 버프 스킬 제거
                    remainingSkills.splice(i, 1);
                    
                    // 버프는 하나만 발동하고, 후속 굴림을 위해 결과를 반환합니다.
                    return { activatedBuff, remainingSkills };
                }
            }
        }

        // 어떤 버프 스킬도 발동되지 않은 경우
        if (GAME_DEBUG_MODE) console.log(`[BuffManager] No buff skills were activated for ${unit.name}.`);
        return { activatedBuff: null, remainingSkills: allSkillData };
    }
}
