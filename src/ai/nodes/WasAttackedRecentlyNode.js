import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 이 유닛이 마지막 턴 이후 공격을 받았는지 확인하는 노드
 */
class WasAttackedRecentlyNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        // CombatCalculationEngine에서 설정한 플래그를 확인합니다.
        if (unit.wasAttackedBy) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `최근 공격 받음 (공격자 ID: ${unit.wasAttackedBy})`);
            // 다른 노드가 사용할 수 있도록 공격자 ID를 블랙보드에 저장합니다.
            blackboard.set('lastAttackerId', unit.wasAttackedBy);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '최근 공격받은 기록 없음');
        return NodeState.FAILURE;
    }
}

export default WasAttackedRecentlyNode;
