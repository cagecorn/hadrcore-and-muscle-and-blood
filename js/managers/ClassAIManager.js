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
        // 유닛이 직접 보유한 스킬 슬롯을 기준으로 판단한다.
        if (unit.skillSlots && unit.skillSlots.length > 0) {
            // 2. 스톤 스킨
            const stoneSkinData = WARRIOR_SKILLS.STONE_SKIN;
            if (
                unit.skillSlots.includes(stoneSkinData.id) &&
                this.diceEngine.getRandomFloat() < stoneSkinData.ai.usageChance
            ) {
                if (stoneSkinData.ai.condition(unit, null)) {
                    if (GAME_DEBUG_MODE)
                        console.log(`[ClassAIManager] ${unit.name} decided to use skill: ${stoneSkinData.name}`);
                    return {
                        actionType: 'skill',
                        skillId: stoneSkinData.id,
                        targetId: unit.id, // 자신에게 사용
                        execute: () => this.warriorSkillsAI.stoneSkin(unit, stoneSkinData)
                    };
                }
            }

            // 3. 더블 스트라이크
            const doubleStrikeData = WARRIOR_SKILLS.DOUBLE_STRIKE;
            if (
                unit.skillSlots.includes(doubleStrikeData.id) &&
                this.diceEngine.getRandomFloat() < doubleStrikeData.ai.usageChance
            ) {
                const targetForDoubleStrike = this.targetingManager.findBestTarget(
                    'enemy',
                    'closest',
                    unit
                );
                if (
                    targetForDoubleStrike &&
                    this.rangeManager.isTargetInRange(unit, targetForDoubleStrike)
                ) {
                    if (GAME_DEBUG_MODE)
                        console.log(`[ClassAIManager] ${unit.name} decided to use skill: ${doubleStrikeData.name}`);
                    return {
                        actionType: 'skill',
                        skillId: doubleStrikeData.id,
                        targetId: targetForDoubleStrike.id,
                        execute: () =>
                            this.warriorSkillsAI.doubleStrike(
                                unit,
                                targetForDoubleStrike,
                                doubleStrikeData
                            )
                    };
                }
            }

            // 4. 전투의 외침
            const battleCryData = WARRIOR_SKILLS.BATTLE_CRY;
            if (
                unit.skillSlots.includes(battleCryData.id) &&
                this.diceEngine.getRandomFloat() < battleCryData.probability / 100
            ) {
                if (GAME_DEBUG_MODE)
                    console.log(`[ClassAIManager] ${unit.name} decided to use skill: ${battleCryData.name}`);
                return {
                    actionType: 'skill',
                    skillId: battleCryData.id,
                    targetId: unit.id, // 자신에게 사용
                    execute: () => this.warriorSkillsAI.battleCry(unit, battleCryData)
                };
            }
        }

        // 사용할 스킬이 없으면 기본 AI(이동 및 공격)를 수행
        if (GAME_DEBUG_MODE)
            console.log(`[ClassAIManager] No warrior skill chosen for ${unit.name}, using basic AI.`);
        const defaultMoveRange = unit.baseStats.moveRange || 1;
        const defaultAttackRange = unit.baseStats.attackRange || 1;
        return this.basicAIManager.determineMoveAndTarget(
            unit,
            allUnits,
            defaultMoveRange,
            defaultAttackRange
        );
    }

    async decideSkillToUse(unit) {
        if (!unit.skillSlots || unit.skillSlots.length === 0) {
            return null;
        }

        for (const skillId of unit.skillSlots) {
            const skillData = await this.idManager.get(skillId);
            if (!skillData || (skillData.type !== 'active' && skillData.type !== 'buff')) continue;

            // 스킬별 사용 조건 추가
            if (skillId === 'skill_warrior_battle_cry') {
                const closestEnemy = this.targetingManager.findBestTarget('enemy', 'closest', unit);
                // 전투의 외침은 추가 공격을 위해, 사거리 1 안에 적이 있을 때만 사용 고려
                if (!closestEnemy || !this.rangeManager.isTargetInRange(unit, closestEnemy)) {
                    if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${unit.name} skipped Battle Cry: No enemy in range.`);
                    continue; // 조건 미충족 시 다음 스킬로
                }
            }

            const probability = (skillData.probability || 0) / 100;
            if (this.diceEngine.getRandomFloat() < probability) {
                if (GAME_DEBUG_MODE) console.log(`[ClassAIManager Debug] Dice roll success for ${skillData.name} (${probability * 100}%)`);
                return skillData;
            }
        }

        return null;
    }

    async executeSkillAI(userUnit, skillData) {
        if (!skillData.aiFunction) {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] Skill ${skillData.name} has no 'aiFunction' defined.`);
            return;
        }

        const aiFunction = this.warriorSkillsAI[skillData.aiFunction];
        if (typeof aiFunction === 'function') {
            let targetUnit = null;

            if (skillData.type === 'active' || skillData.type === 'debuff') {
                targetUnit = this.targetingManager.findBestTarget('enemy', 'lowestHp', userUnit);
                if (!targetUnit) {
                    if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] ${userUnit.name} wanted to use ${skillData.name}, but no valid enemy target was found.`);
                    return;
                }
            }
            
            if (skillData.type === 'active' || skillData.type === 'debuff') {
                await aiFunction.call(this.warriorSkillsAI, userUnit, targetUnit, skillData);
            } else {
                await aiFunction.call(this.warriorSkillsAI, userUnit, skillData);
            }
        } else {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] AI function '${skillData.aiFunction}' not found in WarriorSkillsAI.`);
        }
    }
}
