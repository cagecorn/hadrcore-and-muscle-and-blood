import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { tokenEngine } from '../../game/utils/TokenEngine.js';

class SpendTokenForExtraMoveNode extends Node {
    constructor(engines = {}) {
        super();
        this.tokenEngine = engines.tokenEngine || tokenEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const success = this.tokenEngine.spendTokens(unit.uniqueId, 1);

        if (success) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, '추가 이동을 위해 토큰 1개 소모');
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '토큰 소모 실패');
        return NodeState.FAILURE;
    }
}
export default SpendTokenForExtraMoveNode;
