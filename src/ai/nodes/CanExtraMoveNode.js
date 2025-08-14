import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { tokenEngine } from '../../game/utils/TokenEngine.js';

class CanExtraMoveNode extends Node {
    constructor(engines = {}) {
        super();
        this.tokenEngine = engines.tokenEngine || tokenEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const hasMoved = blackboard.get('hasMovedThisTurn');
        const currentTokens = this.tokenEngine.getTokens(unit.uniqueId);

        if (hasMoved && currentTokens >= 1) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `추가 이동 가능 (현재 토큰: ${currentTokens})`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `추가 이동 불가 (이동 여부: ${hasMoved}, 토큰: ${currentTokens})`);
        return NodeState.FAILURE;
    }
}
export default CanExtraMoveNode;
