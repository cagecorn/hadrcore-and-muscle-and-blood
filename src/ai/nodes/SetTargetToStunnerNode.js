import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * Sets the current target to the unit that stunned this unit, if still alive.
 */
class SetTargetToStunnerNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const stunner = unit.stunnedBy;
        if (stunner && stunner.currentHp > 0) {
            blackboard.set('skillTarget', stunner);
            blackboard.set('currentTargetUnit', stunner);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `복수 대상 [${stunner.instanceName}]으로 타겟 변경`);
            return NodeState.SUCCESS;
        }
        debugAIManager.logNodeResult(NodeState.FAILURE, '복수 대상을 찾을 수 없음');
        return NodeState.FAILURE;
    }
}

export default SetTargetToStunnerNode;
