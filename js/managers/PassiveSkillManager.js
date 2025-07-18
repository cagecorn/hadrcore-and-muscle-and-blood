// js/managers/PassiveSkillManager.js

import { GAME_EVENTS, GAME_DEBUG_MODE } from '../constants.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class PassiveSkillManager {
    /**
     * @param {EventManager} eventManager
     * @param {IdManager} idManager
     * @param {DiceEngine} diceEngine
     * @param {BattleSimulationManager} battleSimulationManager
     * @param {WorkflowManager} workflowManager
     */
    constructor(eventManager, idManager, diceEngine, battleSimulationManager, workflowManager) {
        if (GAME_DEBUG_MODE) console.log("✨ PassiveSkillManager initialized. Watching for on-hit effects. ✨");
        this.eventManager = eventManager;
        this.idManager = idManager;
        this.diceEngine = diceEngine;
        this.battleSimulationManager = battleSimulationManager;
        this.workflowManager = workflowManager;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // \uD83D\uDCA1 \uBCC0\uACBD\uC810: 'UNIT_ATTACK_ATTEMPT' \uB300\uC2E0 'BASIC_ATTACK_LANDED'\uB97C \uAD6C\uB3C4\uD569\uB2C8\uB2E4.
        // \uC774\uC81C "\uD3C9\uD0C0 \uC2EC\uD310"\uC758 \uD310\uC815\uC774 \uB05D\uB09C \uACF5\uACA9\uC5D0 \uB300\uD574\uC11C\uB9CC \uBC18\uC751\uD569\uB2C8\uB2E4.
        this.eventManager.subscribe(GAME_EVENTS.BASIC_ATTACK_LANDED, this._onUnitAttackAttempt.bind(this));
    }

    /**
     * 유닛이 공격을 시도할 때 호출되어 '찢어발기기' 같은 스킬을 처리합니다.
     * @param {{ attackerId: string, targetId: string }} data
     */
    async _onUnitAttackAttempt({ attackerId, targetId }) {
        const attacker = this.battleSimulationManager.unitsOnGrid.find(u => u.id === attackerId);
        if (!attacker || !attacker.skillSlots) return; // 공격자나 스킬 슬롯이 없으면 중단

        const classData = await this.idManager.get(attacker.classId);
        if (!classData || !classData.skills || !classData.skills.includes(WARRIOR_SKILLS.RENDING_STRIKE.id)) {
            // 🔎 변경점: 클래스 데이터(classData)가 아닌 유닛의 실제 스킬 슬롯(skillSlots)을 확인합니다.
            if (!attacker.skillSlots.includes(WARRIOR_SKILLS.RENDING_STRIKE.id)) {
                return;
            }
        }

        const skillData = WARRIOR_SKILLS.RENDING_STRIKE;

        const statusApplicationBonus = (attacker.baseStats.intelligence || 0) * 0.005;
        const finalChance = skillData.effect.applyChance + statusApplicationBonus;

        if (this.diceEngine.getRandomFloat() < finalChance) {
            if (GAME_DEBUG_MODE) console.log(`[PassiveSkillManager] ${attacker.name}'s Rending Strike triggered on ${targetId}!`);
            this.workflowManager.triggerStatusEffectApplication(targetId, skillData.effect.statusEffectId);
        }
    }
}
