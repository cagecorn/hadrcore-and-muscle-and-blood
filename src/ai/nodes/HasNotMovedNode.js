import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * Checks if the unit has already performed its move action this turn.
 */
class HasNotMovedNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const hasMoved = blackboard.get('hasMovedThisTurn');

        if (!hasMoved) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, '아직 이동하지 않음');
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '이번 턴에 이미 이동함');
        return NodeState.FAILURE;
    }
}

export default HasNotMovedNode;
