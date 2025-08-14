import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class IsTargetValidNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');

        // 대상이 존재하고 현재 HP가 0보다 큰지 확인
        if (target && target.currentHp > 0) {
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }

        // 대상이 없거나 쓰러졌다면 블랙보드에서 제거
        blackboard.set('currentTargetUnit', null);
        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE;
    }
}
export default IsTargetValidNode;
