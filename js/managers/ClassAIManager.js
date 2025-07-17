// js/managers/ClassAIManager.js

import { GAME_DEBUG_MODE } from '../constants.js';

export class ClassAIManager {
    constructor(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager, diceBotEngine) {
        console.log("\uD83D\uDD33 ClassAIManager initialized. Ready to define class-based AI. \uD83D\uDD33");
        this.idManager = idManager;
        this.battleSimulationManager = battleSimulationManager;
        this.measureManager = measureManager;
        this.basicAIManager = basicAIManager;
        this.warriorSkillsAI = warriorSkillsAI;
        this.diceEngine = diceEngine;
        this.targetingManager = targetingManager;
        this.diceBotEngine = diceBotEngine;
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

        // 1. 결정된 스킬이 있는지 먼저 확인
        const skillToUse = await this.decideSkillToUse(unit);
        if (skillToUse) {
            if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${unit.name} decided to use skill: ${skillToUse.name}`);
            await this.executeSkillAI(unit, skillToUse);
            return null;
        }

        if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] No skill was chosen for ${unit.name}, proceeding with basic AI.`);
        switch (unitClass.id) {
            case 'class_warrior':
                return this._getWarriorAction(unit, allUnits, unitClass);
            default:
                const defaultMoveRange = unitClass.moveRange || 1;
                const defaultAttackRange = unitClass.attackRange || 1;
                return this.basicAIManager.determineMoveAndTarget(unit, allUnits, defaultMoveRange, defaultAttackRange);
        }
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

        console.log(`[ClassAIManager Debug] DiceBot picked skill for ${unit.name}: ${result ? result.item.name : 'None'}`);

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

            // ✨ 수정된 부분 시작
            // 스킬 타입이 'active'인 경우, 일반적으로 적을 대상으로 합니다.
            if (skillData.type === 'active') {
                // 가장 체력이 낮은 적을 우선 타겟으로 설정합니다.
                targetUnit = this.targetingManager.getLowestHpUnit('enemy');

                // 만약 타겟을 찾지 못했다면, 스킬 사용을 취소하고 경고를 출력합니다.
                if (!targetUnit) {
                    if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${userUnit.name} wanted to use ${skillData.name}, but no valid enemy target was found.`);
                    return;
                }
            }
            // 'buff' 타입의 스킬(예: 전투의 외침)은 대상이 필요 없으므로 targetUnit이 null인 상태로 진행됩니다.
            // ✨ 수정된 부분 끝

            await aiFunction.call(this.warriorSkillsAI, userUnit, targetUnit, skillData);
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
    _getWarriorAction(warriorUnit, allUnits, warriorClassData) {
        const moveRange = warriorClassData.moveRange || 1;
        const attackRange = 1;

        const action = this.basicAIManager.determineMoveAndTarget(warriorUnit, allUnits, moveRange, attackRange);

        return action;
    }
}
