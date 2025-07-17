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
        this.eventManager.subscribe(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, this._onUnitAttackAttempt.bind(this));
    }

    /**
     * 유닛이 공격을 시도할 때 호출되어 '찢어발기기' 같은 스킬을 처리합니다.
     * @param {{ attackerId: string, targetId: string }} data
     */
    async _onUnitAttackAttempt({ attackerId, targetId }) {
        const attacker = this.battleSimulationManager.unitsOnGrid.find(u => u.id === attackerId);
        if (!attacker) return;

        const classData = await this.idManager.get(attacker.classId);
        if (!classData || !classData.skills || !classData.skills.includes(WARRIOR_SKILLS.RENDING_STRIKE.id)) {
            return;
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
