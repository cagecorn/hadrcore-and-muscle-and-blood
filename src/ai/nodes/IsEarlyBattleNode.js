import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 현재 턴이 지정된 턴 수 이하인지 확인하는 조건 노드입니다.
 */
class IsEarlyBattleNode extends Node {
    constructor(maxTurn = 2) {
        super();
        this.maxTurn = maxTurn;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const currentTurn = blackboard.get('currentTurnNumber');

        if (currentTurn <= this.maxTurn) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `전투 초반(현재 ${currentTurn}턴)`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `전투 초반이 아님(현재 ${currentTurn}턴)`);
        return NodeState.FAILURE;
    }
}

export default IsEarlyBattleNode;
