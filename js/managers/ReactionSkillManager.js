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
        if (!defender || defender.currentHp <= 0 || !defender.skillSlots) return; // 방어자나 스킬 슬롯이 없으면 중단

        const classData = await this.idManager.get(defender.classId);
        if (!classData || !classData.skills || !classData.skills.includes(WARRIOR_SKILLS.RETALIATE.id)) {
            // 🔎 변경점: 클래스 데이터(classData)가 아닌 유닛의 실제 스킬 슬롯(skillSlots)을 확인합니다.
            if (!defender.skillSlots.includes(WARRIOR_SKILLS.RETALIATE.id)) {
                return;
            }
        }

        const skillData = WARRIOR_SKILLS.RETALIATE;

        if (this.diceEngine.getRandomFloat() < skillData.effect.probability) {
            if (GAME_DEBUG_MODE) console.log(`[ReactionSkillManager] ${defender.name}'s Retaliate triggered against ${attackerId}!`);

            // 스킬 이름 표시 이벤트 발생
            this.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
                unitId: defenderId,
                skillName: skillData.name
            });

            await this.delayEngine.waitFor(250);

            this.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                attackerId: defenderId,
                targetId: attackerId,
                attackType: ATTACK_TYPES.MELEE,
                isReaction: true,
                skillId: skillData.id // 반격 스킬 ID 전달
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
