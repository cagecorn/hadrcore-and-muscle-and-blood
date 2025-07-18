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

    _chooseSkillByOrder(unit) {
        if (!unit.skillSlots || unit.skillSlots.length === 0) return null;
        const roll = this.diceEngine.getRandomFloat();
        if (roll < 0.4) return unit.skillSlots[0];
        if (roll < 0.7) return unit.skillSlots[1];
        if (roll < 0.9) return unit.skillSlots[2];
        return null;
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
        const skillData = await this.decideSkillToUse(unit);
        if (skillData) {
            if (skillData.id === WARRIOR_SKILLS.STONE_SKIN.id) {
                return {
                    actionType: 'skill',
                    skillId: skillData.id,
                    targetId: unit.id,
                    execute: () => this.warriorSkillsAI.stoneSkin(unit, skillData)
                };
            }

            if (skillData.id === WARRIOR_SKILLS.DOUBLE_STRIKE.id) {
                const target = this.targetingManager.findBestTarget('enemy', 'closest', unit);
                if (target) {
                    if (this.rangeManager.isTargetInRange(unit, target)) {
                        return {
                            actionType: 'skill',
                            skillId: skillData.id,
                            targetId: target.id,
                            execute: () => this.warriorSkillsAI.doubleStrike(unit, target, skillData)
                        };
                    }

                    const posMgr = this.basicAIManager.positionManager;
                    const moveRange = unit.baseStats.moveRange || 1;
                    const positions = posMgr.getAttackablePositions(target, 1);
                    let bestPath = null;
                    for (const pos of positions) {
                        const path = posMgr.findPath({ x: unit.gridX, y: unit.gridY }, pos);
                        if (path && path.length - 1 <= moveRange) {
                            if (!bestPath || path.length < bestPath.length) {
                                bestPath = path;
                            }
                        }
                    }
                    if (bestPath) {
                        const dest = bestPath[bestPath.length - 1];
                        return {
                            actionType: 'moveAndSkill',
                            targetId: target.id,
                            moveTargetX: dest.x,
                            moveTargetY: dest.y,
                            execute: () => this.warriorSkillsAI.doubleStrike(unit, target, skillData)
                        };
                    }
                }
            }

            if (skillData.id === WARRIOR_SKILLS.BATTLE_CRY.id) {
                return {
                    actionType: 'skill',
                    skillId: skillData.id,
                    targetId: unit.id,
                    execute: () => this.warriorSkillsAI.battleCry(unit, skillData)
                };
            }
        }

        if (GAME_DEBUG_MODE)
            console.log(`[ClassAIManager] No warrior skill chosen for ${unit.name}, using basic AI.`);
        const defaultMoveRange = unit.baseStats.moveRange || 1;
        const defaultAttackRange = unit.baseStats.attackRange || 1;
        return this.basicAIManager.determineMoveAndTarget(unit, allUnits, defaultMoveRange, defaultAttackRange);
    }

    async decideSkillToUse(unit) {
        const chosenId = this._chooseSkillByOrder(unit);
        if (!chosenId) return null;
        const skillData = await this.idManager.get(chosenId);
        if (!skillData || skillData.type === 'passive') return null;

        if (chosenId === WARRIOR_SKILLS.BATTLE_CRY.id) {
            const enemy = this.targetingManager.findBestTarget('enemy', 'closest', unit);
            if (!enemy || !this.rangeManager.isTargetInRange(unit, enemy)) return null;
        }

        return skillData;
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
