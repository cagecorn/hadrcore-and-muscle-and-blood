import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 자신의 체력이 지정된 비율(%) 이상인지 확인하는 조건 노드입니다.
 */
class IsHealthAboveThresholdNode extends Node {
    constructor(threshold) {
        super();
        this.threshold = threshold; // 예: 0.7 (70%)
    }

    async evaluate(unit, blackboard) {
        const nodeName = `IsHealthAboveThresholdNode (${this.threshold * 100}%)`;
        debugAIManager.logNodeEvaluation({ constructor: { name: nodeName } }, unit);

        const healthPercentage = blackboard.get('healthPercentage');

        if (healthPercentage >= this.threshold) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `체력이 ${this.threshold * 100}% 이상으로 충분함`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `체력이 ${this.threshold * 100}% 미만임`);
        return NodeState.FAILURE;
    }
}

export default IsHealthAboveThresholdNode;
