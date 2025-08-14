import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 자신의 체력이 지정된 비율(%) 이하인지 확인하는 조건 노드입니다.
 */
class IsHealthBelowThresholdNode extends Node {
    constructor(threshold) {
        super();
        this.threshold = threshold; // 예: 0.35 (35%)
    }

    async evaluate(unit, blackboard) {
        const nodeName = `IsHealthBelowThresholdNode (${this.threshold * 100}%)`;
        debugAIManager.logNodeEvaluation({ constructor: { name: nodeName } }, unit);

        const healthPercentage = blackboard.get('healthPercentage');

        if (healthPercentage <= this.threshold) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `체력이 ${this.threshold * 100}% 이하임`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `체력이 ${this.threshold * 100}% 보다 많음`);
        return NodeState.FAILURE;
    }
}

export default IsHealthBelowThresholdNode;
