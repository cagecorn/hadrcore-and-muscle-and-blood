import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 현재 타겟의 체력이 지정된 비율(%) 이하인지 확인하는 조건 노드입니다.
 */
class IsTargetHealthBelowThresholdNode extends Node {
    constructor(threshold) {
        super();
        this.threshold = threshold; // 예: 0.4 (40%)
    }

    async evaluate(unit, blackboard) {
        const nodeName = `IsTargetHealthBelowThresholdNode (${this.threshold * 100}%)`;
        debugAIManager.logNodeEvaluation({ constructor: { name: nodeName } }, unit);

        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '타겟이 지정되지 않음');
            return NodeState.FAILURE;
        }

        const healthPercentage = target.currentHp / target.finalStats.hp;

        if (healthPercentage <= this.threshold) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `타겟 체력이 ${this.threshold * 100}% 이하임`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `타겟 체력이 ${this.threshold * 100}% 보다 많음`);
        return NodeState.FAILURE;
    }
}

export default IsTargetHealthBelowThresholdNode;
