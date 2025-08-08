// 경로: src/ai/nodes/CheckAspirationStateNode.js
import Node, { NodeState } from './Node.js';
import { aspirationEngine, ASPIRATION_STATE } from '../../game/utils/AspirationEngine.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 유닛의 열망 상태를 확인하는 조건 노드입니다.
 */
class CheckAspirationStateNode extends Node {
    constructor(targetState) {
        super();
        this.targetState = targetState; // 확인할 상태 (COLLAPSED 또는 EXALTED)
    }

    async evaluate(unit, blackboard) {
        const nodeName = `CheckAspirationStateNode (${this.targetState})`;
        debugAIManager.logNodeEvaluation({ constructor: { name: nodeName } }, unit);

        const aspirationData = aspirationEngine.getAspirationData(unit.uniqueId);

        if (aspirationData.state === this.targetState) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `열망 상태 일치: ${aspirationData.state}`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `열망 상태 불일치 (현재: ${aspirationData.state})`);
        return NodeState.FAILURE;
    }
}

export default CheckAspirationStateNode;
