// js/ai/nodes/UnitActionNodes.js
import { Node, NodeState } from '../core/Node.js';
import { AttackCommand } from '../../commands/AttackCommand.js';
import { MoveCommand } from '../../commands/MoveCommand.js';
import { WARRIOR_SKILLS } from '../../../data/warriorSkills.js';

/**
 * 공격할 대상을 찾아 블랙보드에 'target'으로 저장합니다.
 */
export class FindTargetNode extends Node {
    async evaluate(blackboard) {
        const { targetingManager } = blackboard.getData('managers');
        const target = targetingManager.getLowestHpUnit('enemy');

        if (target) {
            blackboard.setData('target', target);
            console.log(`[BT-Action] ${blackboard.getData('self').name}이(가) 대상을 찾았습니다: ${target.name}`);
            return NodeState.SUCCESS;
        }
        console.log(`[BT-Action] ${blackboard.getData('self').name}이(가) 공격 대상을 찾지 못했습니다.`);
        return NodeState.FAILURE;
    }
}

/**
 * 블랙보드의 'target'을 향해 이동합니다.
 */
export class MoveToTargetNode extends Node {
    async evaluate(blackboard) {
        if (!blackboard.hasData('target')) return NodeState.FAILURE;

        const unit = blackboard.getData('self');
        const target = blackboard.getData('target');
        const { basicAIManager, battleSimulationManager, animationManager, idManager } = blackboard.getData('managers');
        const classData = await idManager.get(unit.classId);
        const moveRange = classData.moveRange || 3;

        const moveAction = basicAIManager.determineMoveAndTarget(unit, [target], moveRange, 1);
        if (moveAction && (moveAction.actionType === 'move' || moveAction.actionType === 'moveAndAttack')) {
            console.log(`[BT-Action] ${unit.name}이(가) ${target.name}을(를) 향해 (${moveAction.moveTargetX}, ${moveAction.moveTargetY})로 이동합니다.`);
            const command = new MoveCommand(unit.id, moveAction.moveTargetX, moveAction.moveTargetY);
            await command.execute({ battleSimulationManager, animationManager });
            return NodeState.SUCCESS;
        }

        return NodeState.FAILURE;
    }
}

/**
 * 블랙보드의 'target'을 공격합니다.
 */
export class AttackTargetNode extends Node {
    async evaluate(blackboard) {
        if (!blackboard.hasData('target')) return NodeState.FAILURE;

        const unit = blackboard.getData('self');
        const target = blackboard.getData('target');
        const { battleCalculationManager, eventManager, delayEngine } = blackboard.getData('managers');

        console.log(`[BT-Action] ${unit.name}이(가) ${target.name}을(를) 공격합니다.`);
        const command = new AttackCommand(unit.id, target.id);
        await command.execute({ battleCalculationManager, eventManager, delayEngine });

        return NodeState.SUCCESS;
    }
}

/**
 * 유닛의 스킬 슬롯과 확률에 기반하여 사용할 스킬을 결정하고,
 * 블랙보드에 'skillToUse'와 'skillTarget'으로 저장합니다.
 */
export class DecideSkillNode extends Node {
    async evaluate(blackboard) {
        const unit = blackboard.getData('self');
        const { diceEngine, targetingManager } = blackboard.getData('managers');

        if (!unit.skillSlots || unit.skillSlots.length === 0) {
            return NodeState.FAILURE;
        }

        const roll = diceEngine.getRandomFloat() * 100;
        let cumulativeProbability = 0;
        let skillProbability = 40; // 첫 슬롯 확률

        for (const skillId of unit.skillSlots) {
            const skillData = Object.values(WARRIOR_SKILLS).find(s => s.id === skillId);

            if (skillData && (skillData.type === 'active' || skillData.type === 'buff')) {
                cumulativeProbability += skillProbability;
                if (roll < cumulativeProbability) {
                    blackboard.setData('skillToUse', skillData);

                    let targetUnit = null;
                    if (skillData.id === WARRIOR_SKILLS.CHARGE.id) {
                        targetUnit = targetingManager.getLowestHpUnit('enemy');
                    }
                    if (skillData.type === 'buff') {
                        targetUnit = unit;
                    }

                    if (targetUnit) {
                        blackboard.setData('skillTarget', targetUnit);
                        console.log(`[BT-Action] ${unit.name}이(가) 스킬 사용을 결정했습니다: ${skillData.name}`);
                        return NodeState.SUCCESS;
                    } else {
                        return NodeState.FAILURE;
                    }
                }
                skillProbability = Math.max(10, skillProbability - 10);
            }
        }

        return NodeState.FAILURE;
    }
}

/**
 * 블랙보드에 저장된 스킬을 실행합니다.
 */
export class UseSkillNode extends Node {
    async evaluate(blackboard) {
        if (!blackboard.hasData('skillToUse')) {
            return NodeState.FAILURE;
        }

        const unit = blackboard.getData('self');
        const skillData = blackboard.getData('skillToUse');
        const target = blackboard.getData('skillTarget');
        const { warriorSkillsAI } = blackboard.getData('managers');

        if (!skillData.aiFunction) {
            console.warn(`[BT-Action] 스킬 ${skillData.name}에 'aiFunction'이 정의되지 않았습니다.`);
            return NodeState.FAILURE;
        }

        const aiFunction = warriorSkillsAI[skillData.aiFunction];
        if (typeof aiFunction === 'function') {
            console.log(`[BT-Action] ${unit.name}이(가) 스킬 '${skillData.name}'을(를) ${target ? target.name : ''}에게 사용합니다.`);
            await aiFunction.call(warriorSkillsAI, unit, target, skillData);

            blackboard.setData('skillToUse', null);
            blackboard.setData('skillTarget', null);
            return NodeState.SUCCESS;
        } else {
            console.warn(`[BT-Action] AI 함수 '${skillData.aiFunction}'를 WarriorSkillsAI에서 찾을 수 없습니다.`);
            return NodeState.FAILURE;
        }
    }
}
