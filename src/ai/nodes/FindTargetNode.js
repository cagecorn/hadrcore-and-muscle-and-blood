import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class FindTargetNode extends Node {
    constructor({ targetManager }) {
        super();
        this.targetManager = targetManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const enemyUnits = blackboard.get('enemyUnits');
        // 'nearest' 전략 사용
        const target = this.targetManager.findNearestEnemy(unit, enemyUnits);

        if (target) {
            blackboard.set('currentTargetUnit', target);
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }
        
        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE;
    }
}
export default FindTargetNode;
