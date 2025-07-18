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
    constructor(eventManager, idManager, diceEngine, battleSimulationManager, battleCalculationManager, delayEngine, unitStatManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDCA5 ReactionSkillManager initialized. Ready to retaliate! \uD83D\uDCA5");
        this.eventManager = eventManager;
        this.idManager = idManager;
        this.diceEngine = diceEngine;
        this.battleSimulationManager = battleSimulationManager;
        this.battleCalculationManager = battleCalculationManager;
        this.delayEngine = delayEngine;
        this.unitStatManager = unitStatManager;

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
        if (!defender || defender.currentHp <= 0 || !defender.skillSlots) return; // 방어자나 스킬 슬롯이 없으면 중단

        const slotProb = [0.4, 0.3, 0.2];

        if (defender.skillSlots.includes(WARRIOR_SKILLS.RETALIATE.id)) {
            const skillData = WARRIOR_SKILLS.RETALIATE;
            const slotIndex = defender.skillSlots.indexOf(skillData.id);
            const chance = slotProb[slotIndex] || 0;

            if (this.diceEngine.getRandomFloat() < chance) {
                if (GAME_DEBUG_MODE) console.log(`[ReactionSkillManager] ${defender.name}'s Retaliate triggered against ${attackerId}!`);

                this.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
                    unitId: defenderId,
                    skillName: skillData.name,
                    skillType: skillData.type
                });

                await this.delayEngine.waitFor(250);

                this.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                    attackerId: defenderId,
                    targetId: attackerId,
                    attackType: ATTACK_TYPES.MELEE,
                    isReaction: true,
                    skillId: skillData.id
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

        if (defender.skillSlots.includes(WARRIOR_SKILLS.SMALL_HEALING_POTION.id)) {
            const skillData = WARRIOR_SKILLS.SMALL_HEALING_POTION;
            const slotIndex = defender.skillSlots.indexOf(skillData.id);
            const chance = slotProb[slotIndex] || 0;

            if (this.diceEngine.getRandomFloat() < chance) {
                if (GAME_DEBUG_MODE) console.log(`[ReactionSkillManager] ${defender.name}'s Small Healing Potion triggered.`);

                this.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
                    unitId: defenderId,
                    skillName: skillData.name,
                    skillType: skillData.type
                });

                const healAmount = Math.floor(defender.baseStats.hp * skillData.effect.healPercent);
                this.unitStatManager.heal(defenderId, healAmount);
                this.eventManager.emit(GAME_EVENTS.DISPLAY_DAMAGE, { unitId: defenderId, damage: healAmount, color: 'green' });

                await this.delayEngine.waitFor(500);
            }
        }
    }
}
