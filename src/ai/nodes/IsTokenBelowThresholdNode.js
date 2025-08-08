import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { tokenEngine } from '../../game/utils/TokenEngine.js';

/**
 * 자신의 토큰이 지정된 개수 이하인지 확인하는 조건 노드입니다.
 */
class IsTokenBelowThresholdNode extends Node {
    constructor(threshold) {
        super();
        this.threshold = threshold; // 예: 1 (1개 이하)
    }

    async evaluate(unit, blackboard) {
        const nodeName = `IsTokenBelowThresholdNode (${this.threshold}개 이하)`;
        debugAIManager.logNodeEvaluation({ constructor: { name: nodeName } }, unit);

        const currentTokens = tokenEngine.getTokens(unit.uniqueId);

        if (currentTokens <= this.threshold) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `토큰 부족 (${currentTokens}개)`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `토큰 충분 (${currentTokens}개)`);
        return NodeState.FAILURE;
    }
}

export default IsTokenBelowThresholdNode;
