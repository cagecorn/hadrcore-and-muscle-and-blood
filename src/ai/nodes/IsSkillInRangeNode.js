import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class IsSkillInRangeNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('skillTarget');
        const skillData = blackboard.get('currentSkillData');

        if (!target || !skillData) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '타겟 또는 스킬 정보 없음');
            return NodeState.FAILURE;
        }

        // 스킬 range가 없으면 유닛의 기본 attackRange, 그것도 없으면 1을 사용
        const attackRange = skillData.range ?? unit.finalStats.attackRange ?? 1;
        const distance = Math.abs(unit.gridX - target.gridX) + Math.abs(unit.gridY - target.gridY);

        if (distance <= attackRange) {
            debugAIManager.logNodeResult(
                NodeState.SUCCESS,
                `스킬 [${skillData.name}] 사거리 내 (사거리: ${attackRange})`
            );
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(
            NodeState.FAILURE,
            `스킬 [${skillData.name}] 사거리 밖 (사거리: ${attackRange})`
        );
        return NodeState.FAILURE;
    }
}
export default IsSkillInRangeNode;
