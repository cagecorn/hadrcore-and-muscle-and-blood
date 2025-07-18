import { GAME_DEBUG_MODE, GAME_EVENTS, ATTACK_TYPES } from '../constants.js';

export class ClassAIManager {
    constructor(idManager, battleSimulationManager, basicAIManager, warriorSkillsAI, targetingManager, monsterAI, slotMachineManager, eventManager, buffManager) {
        console.log("\u2694\uFE0F ClassAIManager initialized. Ready to command units based on class.");
        this.idManager = idManager;
        this.battleSimulationManager = battleSimulationManager;
        this.basicAIManager = basicAIManager;
        this.warriorSkillsAI = warriorSkillsAI;
        this.targetingManager = targetingManager;
        this.monsterAI = monsterAI;
        this.slotMachineManager = slotMachineManager; // 슬롯 머신 매니저 저장
        this.eventManager = eventManager;
        this.buffManager = buffManager;
    }

    async getBasicClassAction(unit, allUnits) {
        // 적 유닛은 몬스터 AI를 사용
        if (unit.type === ATTACK_TYPES.ENEMY) {
            return this.monsterAI.getMeleeAIAction(unit, allUnits);
        }

        // 1. BuffManager를 통해 버프 스킬을 먼저 굴립니다.
        const { activatedBuff, remainingSkills } = await this.buffManager.processBuffSkills(unit);

        let buffAction = null;
        if (activatedBuff) {
            const buffTarget = activatedBuff.range === 0 ? unit : this.targetingManager.findBestTarget('ally', 'closest', unit) || unit;
            buffAction = {
                actionType: 'skill',
                skillId: activatedBuff.id,
                targetId: buffTarget.id,
                execute: () => this.executeSkillAI(unit, activatedBuff, buffTarget),
                followUp: null
            };
        }

        // 2. 버프가 발동되었든 아니든, 나머지 스킬(액티브, 디버프)로 슬롯머신을 다시 굴립니다.
        const subsequentSkill = await this.slotMachineManager.spinWithSkillList(unit, remainingSkills);

        let subsequentAction = null;
        if (subsequentSkill) {
            const skillTarget = this.targetingManager.findBestTarget('enemy', 'closest', unit);
            if (skillTarget) {
                subsequentAction = {
                    actionType: 'skill',
                    skillId: subsequentSkill.id,
                    targetId: skillTarget.id,
                    execute: () => this.executeSkillAI(unit, subsequentSkill, skillTarget)
                };
            }
        }

        // 3. 행동 조합
        if (buffAction && subsequentAction) {
            buffAction.followUp = subsequentAction;
            return buffAction;
        }
        if (buffAction) {
            if (!subsequentAction) {
                buffAction.followUp = this.basicAIManager.determineMoveAndTarget(
                    unit,
                    allUnits,
                    unit.baseStats.moveRange || 1,
                    unit.baseStats.attackRange || 1
                );
            }
            return buffAction;
        }
        if (subsequentAction) {
            return subsequentAction;
        }

        if (GAME_DEBUG_MODE) console.log(`[ClassAIManager] No skills were chosen for ${unit.name}, proceeding with basic AI.`);
        return this.basicAIManager.determineMoveAndTarget(
            unit,
            allUnits,
            unit.baseStats.moveRange || 1,
            unit.baseStats.attackRange || 1
        );
    }
    
    async executeSkillAI(userUnit, skillData, targetUnit) {
        this.eventManager.emit(GAME_EVENTS.SKILL_EXECUTED, { unitId: userUnit.id, skillId: skillData.id });
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
