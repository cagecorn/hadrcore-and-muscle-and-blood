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
        // \uD83D\uDCA1 \uBCC0\uACBD\uC810: \uACF5\uACA9 \uD53C\uD574 \uACC4\uC0B0\uC774 \uB9CC\uB4E0 \uD6C4 \uD589\uB3D9\uD558\uB294 \uD504\uB85C\uC138\uC2A4\uB294
        // 'DAMAGE_CALCULATED' \uC774\uBCA4\uD2B8\uB97C \uCC38\uC870\uD569\uB2C8\uB2E4.
        this.eventManager.subscribe(GAME_EVENTS.DAMAGE_CALCULATED, this._onDamageCalculated.bind(this));
    }

    /**
     * \uB370\uBBF8\uC9C0 \uACC4\uC0B0 \uD6C4 \uD638\uCD9C\uB418\uC5B4 \uB300\uC0C1\uC5D0\uAC8C \uC0C1\uD604\uC544\uC2DC\uB97C \uCC98\uB9AC\uD569\uB2C8\uB2E4.
     * @param {{ attackerId: string, targetId: string, newHp: number }} data
     */
    async _onDamageCalculated({ attackerId, targetId, newHp }) {
        const attacker = this.battleSimulationManager.getUnitById(attackerId);
        if (!attacker || !attacker.skillSlots) return;
        if (newHp !== undefined && newHp <= 0) return;

        const slotProb = [0.4, 0.3, 0.2];

        for (const skillId of attacker.skillSlots) {
            const skillData = await this.idManager.get(skillId);

            if (skillData && skillData.type === 'debuff' && skillData.effect && skillData.effect.statusEffectId) {
                const slotIndex = attacker.skillSlots.indexOf(skillId);
                const baseChance = slotProb[slotIndex] || 0;
                const statusApplicationBonus = (attacker.baseStats.intelligence || 0) * 0.005;
                const finalChance = baseChance + statusApplicationBonus;

                if (this.diceEngine.getRandomFloat() < finalChance) {
                    if (GAME_DEBUG_MODE) console.log(`[PassiveSkillManager] ${attacker.name}'s '${skillData.name}' triggered on ${targetId}!`);
                    this.eventManager.emit(GAME_EVENTS.SKILL_EXECUTED, {
                        userId: attackerId,
                        skillId: skillData.id
                    });
                    this.workflowManager.triggerStatusEffectApplication(targetId, skillData.effect.statusEffectId);
                }
            }
        }
    }
}
