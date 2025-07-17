// js/managers/ReactionSkillManager.js

import { GAME_EVENTS, GAME_DEBUG_MODE, ATTACK_TYPES } from '../constants.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class ReactionSkillManager {
    /**
     * @param {EventManager} eventManager
     * @param {IdManager} idManager
     * @param {DiceEngine} diceEngine
     * @param {BattleSimulationManager} battleSimulationManager
     * @param {BattleCalculationManager} battleCalculationManager
     * @param {DelayEngine} delayEngine
     */
    constructor(eventManager, idManager, diceEngine, battleSimulationManager, battleCalculationManager, delayEngine) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDCA5 ReactionSkillManager initialized. Ready to retaliate! \uD83D\uDCA5");
        this.eventManager = eventManager;
        this.idManager = idManager;
        this.diceEngine = diceEngine;
        this.battleSimulationManager = battleSimulationManager;
        this.battleCalculationManager = battleCalculationManager;
        this.delayEngine = delayEngine;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, this._onUnitDamaged.bind(this));
    }

    /**
     * 유닛이 피해를 입었을 때 반격 스킬 발동을 체크합니다.
     * @param {{ unitId: string, damage: number, attackerId: string }} param0
     */
    async _onUnitDamaged({ unitId: defenderId, damage, attackerId }) {
        if (damage <= 0 || !attackerId) return;

        const defender = this.battleSimulationManager.unitsOnGrid.find(u => u.id === defenderId);
        if (!defender || defender.currentHp <= 0) return;

        const classData = await this.idManager.get(defender.classId);
        if (!classData || !classData.skills || !classData.skills.includes(WARRIOR_SKILLS.RETALIATE.id)) {
            return;
        }

        const skillData = WARRIOR_SKILLS.RETALIATE;

        if (this.diceEngine.getRandomFloat() < skillData.effect.probability) {
            if (GAME_DEBUG_MODE) console.log(`[ReactionSkillManager] ${defender.name}'s Retaliate triggered against ${attackerId}!`);

            await this.delayEngine.waitFor(250);

            this.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                attackerId: defenderId,
                targetId: attackerId,
                attackType: ATTACK_TYPES.MELEE,
                isReaction: true
            });

            const retaliateAttackData = {
                type: ATTACK_TYPES.PHYSICAL,
                dice: { num: 1, sides: 6 },
                damageModifier: skillData.effect.damageModifier
            };
            this.battleCalculationManager.requestDamageCalculation(defenderId, attackerId, retaliateAttackData);

            await this.delayEngine.waitFor(800);
        }
    }
}
