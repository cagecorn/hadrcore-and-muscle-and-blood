// js/managers/ClassAIManager.js

import { GAME_DEBUG_MODE, ATTACK_TYPES } from '../constants.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class ClassAIManager {
    constructor(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager, diceBotEngine, monsterAI, rangeManager) {
        console.log("\u269C\uFE0F ClassAIManager initialized. Ready to define class-based AI. \u269C\uFE0F");
        this.idManager = idManager;
        this.battleSimulationManager = battleSimulationManager;
        this.measureManager = measureManager;
        this.basicAIManager = basicAIManager;
        this.warriorSkillsAI = warriorSkillsAI;
        this.diceEngine = diceEngine;
        this.targetingManager = targetingManager;
        this.diceBotEngine = diceBotEngine;
        this.monsterAI = monsterAI;
        this.rangeManager = rangeManager; // RangeManager 인스턴스 저장
    }

    async getBasicClassAction(unit, allUnits) {
        if (unit.type === ATTACK_TYPES.ENEMY) {
            return this.monsterAI.getMeleeAIAction(unit, allUnits);
        }

        if (unit.classId === 'class_warrior') {
            return this.getWarriorAction(unit, allUnits);
        }

        const skillToUse = await this.decideSkillToUse(unit);
        if (skillToUse) {
            if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${unit.name} decided to use skill: ${skillToUse.name}`);
            return {
                actionType: 'skill',
                skillId: skillToUse.id,
                execute: () => this.executeSkillAI(unit, skillToUse)
            };
        }

        if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] No skill was chosen for ${unit.name}, proceeding with basic AI.`);
        const defaultMoveRange = unit.baseStats.moveRange || 1;
        const defaultAttackRange = unit.baseStats.attackRange || 1;
        return this.basicAIManager.determineMoveAndTarget(unit, allUnits, defaultMoveRange, defaultAttackRange);
    }

    async getWarriorAction(unit, allUnits) {
        const skillToUse = await this.decideSkillToUse(unit);

        if (skillToUse) {
            if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${unit.name} decided to use skill: ${skillToUse.name}`);

            let targetUnit = null;
            // 버프 스킬이나 사거리가 0인 스킬은 자신을 대상으로 합니다.
            if (skillToUse.type === 'buff' || skillToUse.range === 0) {
                targetUnit = unit;
            } else {
                // 그 외에는 가장 가까운 적을 대상으로 합니다.
                targetUnit = this.targetingManager.findBestTarget('enemy', 'closest', unit);
            }

            // 스킬 사용에 타겟이 필요한데 찾지 못했다면 기본 행동으로 전환합니다.
            if (!targetUnit) {
                if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${unit.name} wanted to use ${skillToUse.name}, but no valid target was found. Reverting to basic action.`);
            } else {
                return {
                    actionType: 'skill',
                    skillId: skillToUse.id,
                    targetId: targetUnit.id,
                    execute: () => this.executeSkillAI(unit, skillToUse, targetUnit)
                };
            }
        }

        if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] No skill was chosen for ${unit.name}, proceeding with basic AI.`);
        const defaultMoveRange = unit.baseStats.moveRange || 1;
        const defaultAttackRange = unit.baseStats.attackRange || 1;
        return this.basicAIManager.determineMoveAndTarget(unit, allUnits, defaultMoveRange, defaultAttackRange);
    }

    async decideSkillToUse(unit) {
        if (!unit.skillSlots || unit.skillSlots.length === 0) {
            return null;
        }

        for (const skillId of unit.skillSlots) {
            const skillData = await this.idManager.get(skillId);
            // 'active' 와 'buff' 타입의 스킬만 턴 행동으로 고려합니다.
            if (!skillData || (skillData.type !== 'active' && skillData.type !== 'buff')) continue;

            // 1. 발동 확률을 먼저 확인합니다.
            let probability = 0;
            if (skillData.probability) {
                probability = skillData.probability / 100;
            } else if (skillData.ai && typeof skillData.ai.usageChance === 'number') {
                probability = skillData.ai.usageChance;
            }

            if (this.diceEngine.getRandomFloat() >= probability) {
                continue; // 확률 체크 실패
            }

            // 2. 스킬 사용 조건을 확인합니다.
            if (skillData.ai && typeof skillData.ai.condition === 'function') {
                const potentialTarget = skillData.type === 'buff' || skillData.range === 0 ? unit : this.targetingManager.findBestTarget('enemy', 'closest', unit);
                if (!skillData.ai.condition(unit, potentialTarget)) {
                    if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${unit.name} skipped ${skillData.name}: AI condition not met.`);
                    continue; // 조건 불일치
                }
            }

            // 모든 검사를 통과하면 이 스킬을 사용하기로 결정합니다.
            if (GAME_DEBUG_MODE) console.log(`[ClassAIManager Debug] Dice roll success for ${skillData.name} (${probability * 100}%)`);
            return skillData;
        }

        return null;
    }

    async executeSkillAI(userUnit, skillData, targetUnit) {
        // 스킬 데이터에 정의된 aiFunction 이름을 가져옵니다.
        if (!skillData.aiFunction) {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] Skill '${skillData.name}' has no 'aiFunction' property to execute.`);
            return;
        }

        // warriorSkillsAI 객체에서 해당 이름의 함수를 찾습니다.
        const aiFunction = this.warriorSkillsAI[skillData.aiFunction];

        if (typeof aiFunction === 'function') {
            // 찾은 함수를 실행합니다.
            await aiFunction.call(this.warriorSkillsAI, userUnit, targetUnit, skillData);
        } else {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] AI function '${skillData.aiFunction}' not found in WarriorSkillsAI for skill '${skillData.name}'.`);
        }
    }
}
