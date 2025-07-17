// js/managers/ConditionalManager.js

import { GAME_DEBUG_MODE } from '../constants.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class ConditionalManager {
    /**
     * @param {BattleSimulationManager} battleSimulationManager
     * @param {IdManager} idManager
     */
    constructor(battleSimulationManager, idManager) {
        if (GAME_DEBUG_MODE) console.log("\ud83d\udd0d ConditionalManager initialized. Monitoring unit conditions. \ud83d\udd0d");
        this.battleSimulationManager = battleSimulationManager;
        this.idManager = idManager;
        this.damageReductionMap = new Map();
    }

    /**
     * 매 프레임 호출되어 모든 유닛의 상태를 확인하고 효과를 업데이트합니다.
     */
    async update() {
        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) {
                this.damageReductionMap.delete(unit.id);
                continue;
            }

            const classData = await this.idManager.get(unit.classId);
            if (classData && classData.skills && classData.skills.includes(WARRIOR_SKILLS.IRON_WILL.id)) {
                const lostHpRatio = 1 - (unit.currentHp / unit.baseStats.hp);
                const damageReduction = WARRIOR_SKILLS.IRON_WILL.effect.maxReduction * lostHpRatio;
                this.damageReductionMap.set(unit.id, damageReduction);

                if (GAME_DEBUG_MODE && Math.random() < 0.01) {
                    console.log(`[ConditionalManager] Unit ${unit.id} has Iron Will. Lost HP: ${(lostHpRatio * 100).toFixed(1)}%, Damage Reduction: ${(damageReduction * 100).toFixed(1)}%`);
                }
            }
        }
    }

    /**
     * 특정 유닛의 현재 피해 감소율을 가져옵니다.
     * @param {string} unitId
     * @returns {number}
     */
    getDamageReduction(unitId) {
        return this.damageReductionMap.get(unitId) || 0;
    }
}
