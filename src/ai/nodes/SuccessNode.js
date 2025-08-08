import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class SuccessNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}

export default SuccessNode;
