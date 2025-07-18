import { GAME_DEBUG_MODE, ATTACK_TYPES } from '../constants.js';

export class ClassAIManager {
    constructor(idManager, battleSimulationManager, basicAIManager, warriorSkillsAI, targetingManager, monsterAI, slotMachineManager) {
        console.log("\u2694\uFE0F ClassAIManager initialized. Ready to command units based on class.");
        this.idManager = idManager;
        this.battleSimulationManager = battleSimulationManager;
        this.basicAIManager = basicAIManager;
        this.warriorSkillsAI = warriorSkillsAI;
        this.targetingManager = targetingManager;
        this.monsterAI = monsterAI;
        this.slotMachineManager = slotMachineManager; // 슬롯 머신 매니저 저장
    }

    async getBasicClassAction(unit, allUnits) {
        // 적 유닛은 몬스터 AI를 사용
        if (unit.type === ATTACK_TYPES.ENEMY) {
            return this.monsterAI.getMeleeAIAction(unit, allUnits);
        }

        // \uD83C\uDFB0 슬롯 머신을 돌려 스킬을 결정합니다!
        const skillToUse = await this.slotMachineManager.spin(unit);

        // 슬롯 머신에서 스킬이 당첨되었다면,
        if (skillToUse) {
            let targetUnit = null;
            // 버프 스킬이나 사거리가 0인 스킬은 자신을 대상으로 합니다.
            if (skillToUse.type === 'buff' || skillToUse.range === 0) {
                targetUnit = unit;
            } else { // 그 외에는 가장 가까운 적을 대상으로 합니다.
                targetUnit = this.targetingManager.findBestTarget('enemy', 'closest', unit);
            }

            // 스킬 사용에 타겟이 필요했는데 못 찾은 경우만 제외
            if (targetUnit) {
                return {
                    actionType: 'skill',
                    skillId: skillToUse.id,
                    targetId: targetUnit.id,
                    execute: () => this.executeSkillAI(unit, skillToUse, targetUnit)
                };
            }
        }

        // 스킬이 당첨되지 않았거나, 타겟을 못 찾았다면 기본 행동(이동 및 공격)을 합니다.
        if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] No skill was chosen for ${unit.name}, proceeding with basic AI.`);
        const defaultMoveRange = unit.baseStats.moveRange || 1;
        const defaultAttackRange = unit.baseStats.attackRange || 1;
        return this.basicAIManager.determineMoveAndTarget(unit, allUnits, defaultMoveRange, defaultAttackRange);
    }
    
    async executeSkillAI(userUnit, skillData, targetUnit) {
        if (!skillData.aiFunction) {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] Skill '${skillData.name}' has no 'aiFunction' property to execute.`);
            return;
        }

        const aiFunction = this.warriorSkillsAI[skillData.aiFunction];

        if (typeof aiFunction === 'function') {
            await aiFunction.call(this.warriorSkillsAI, userUnit, targetUnit, skillData);
        } else {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] AI function '${skillData.aiFunction}' not found in WarriorSkillsAI for skill '${skillData.name}'.`);
        }
    }
}
