import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * Checks if the unit has just recovered from stun this turn.
 */
class JustRecoveredFromStunNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        if (unit.justRecoveredFromStun) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, '기절에서 방금 회복됨');
            return NodeState.SUCCESS;
        }
        debugAIManager.logNodeResult(NodeState.FAILURE, '기절에서 회복된 상태 아님');
        return NodeState.FAILURE;
    }
}

export default JustRecoveredFromStunNode;
