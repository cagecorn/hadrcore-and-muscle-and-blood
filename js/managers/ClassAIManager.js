// js/managers/ClassAIManager.js

import { GAME_DEBUG_MODE, ATTACK_TYPES } from '../constants.js';

export class ClassAIManager {
    constructor(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager, diceBotEngine, monsterAI) {
        console.log("\uD83D\uDD33 ClassAIManager initialized. Ready to define class-based AI. \uD83D\uDD33");
        this.idManager = idManager;
        this.battleSimulationManager = battleSimulationManager;
        this.measureManager = measureManager;
        this.basicAIManager = basicAIManager;
        this.warriorSkillsAI = warriorSkillsAI;
        this.diceEngine = diceEngine;
        this.targetingManager = targetingManager;
        this.diceBotEngine = diceBotEngine;
        this.monsterAI = monsterAI;
    }

    /**
     * 주어진 유닛의 클래스에 따른 기본 행동을 결정합니다.
     * @param {object} unit - 현재 턴을 진행하는 유닛 (fullUnitData 포함)
     * @param {object[]} allUnits - 현재 전장에 있는 모든 유닛
     * @returns {{actionType: string, targetId?: string, moveTargetX?: number, moveTargetY?: number} | null}
     */
    async getBasicClassAction(unit, allUnits) {
        const unitClass = await this.idManager.get(unit.classId);
        if (!unitClass) {
            console.warn(`[ClassAIManager] Class data not found for unit ${unit.name} (${unit.classId}). Cannot determine action.`);
            return null;
        }

        // 적 유닛이라면 MonsterAI에 위임
        if (unit.type === ATTACK_TYPES.ENEMY) {
            return this.monsterAI.getMeleeAIAction(unit, allUnits);
        }

        // 1. 결정된 스킬이 있는지 먼저 확인
        const skillToUse = await this.decideSkillToUse(unit);
        if (skillToUse) {
            if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${unit.name} decided to use skill: ${skillToUse.name}`);
            await this.executeSkillAI(unit, skillToUse);
            return null;
        }

        if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] No skill was chosen for ${unit.name}, proceeding with basic AI.`);
        const defaultMoveRange = unit.baseStats.moveRange || 1;
        const defaultAttackRange = unit.baseStats.attackRange || 1;
        return this.basicAIManager.determineMoveAndTarget(unit, defaultMoveRange, defaultAttackRange);
    }

    async decideSkillToUse(unit) {
        if (!unit.skillSlots || unit.skillSlots.length === 0) {
            return null;
        }

        const skillTable = [];
        for (const skillId of unit.skillSlots) {
            const skillData = await this.idManager.get(skillId);
            if (skillData && (skillData.type === 'active' || skillData.type === 'buff')) {
                skillTable.push({
                    item: skillData,
                    weight: skillData.probability || 0
                });
            }
        }

        if (skillTable.length === 0) return null;

        const result = this.diceBotEngine.pickWeightedRandom(skillTable);

        if (GAME_DEBUG_MODE) console.log(`[ClassAIManager Debug] DiceBot picked skill for ${unit.name}: ${result ? result.item.name : 'None'}`);

        return result ? result.item : null;
    }

    async executeSkillAI(userUnit, skillData) {
        if (!skillData.aiFunction) {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] Skill ${skillData.name} has no 'aiFunction' defined.`);
            return;
        }

        const aiFunction = this.warriorSkillsAI[skillData.aiFunction];
        if (typeof aiFunction === 'function') {
            let targetUnit = null;

            // 'active' 또는 'debuff' 타입의 스킬은 대상을 필요로 합니다.
            if (skillData.type === 'active' || skillData.type === 'debuff') {
                targetUnit = this.targetingManager.getLowestHpUnit('enemy');

                if (!targetUnit) {
                    if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${userUnit.name} wanted to use ${skillData.name}, but no valid enemy target was found.`);
                    return;
                }
            }

            // 버프와 패시브 스킬은 대상이 필요 없으므로 userUnit과 skillData만 전달
            if (skillData.type === 'active' || skillData.type === 'debuff') {
                await aiFunction.call(this.warriorSkillsAI, userUnit, targetUnit, skillData);
            } else {
                await aiFunction.call(this.warriorSkillsAI, userUnit, skillData);
            }
        } else {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] AI function '${skillData.aiFunction}' not found in WarriorSkillsAI.`);
        }
    }

    /**
     * 전사 클래스의 AI 로직을 구현합니다. 가까운 적에게 근접하여 공격합니다.
     * @param {object} warriorUnit
     * @param {object[]} allUnits
     * @param {object} warriorClassData
     * @returns {{actionType: string, targetId?: string, moveTargetX?: number, moveTargetY?: number}}
     */
    _getWarriorAction(warriorUnit, warriorClassData) {
        const moveRange = warriorClassData.moveRange || 1;
        const attackRange = 1;

        return this.basicAIManager.determineMoveAndTarget(warriorUnit, moveRange, attackRange);
    }
}
