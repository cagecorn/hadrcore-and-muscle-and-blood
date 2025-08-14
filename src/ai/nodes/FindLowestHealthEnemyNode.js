import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

// 체력이 가장 낮은 적을 찾는 노드
class FindLowestHealthEnemyNode extends Node {
    constructor({ targetManager, narrationEngine }) {
        super();
        this.targetManager = targetManager;
        this.narrationEngine = narrationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemyUnits = blackboard.get('enemyUnits');
        const target = this.targetManager.findLowestHealthEnemy(enemyUnits);

        if (target) {
            if (this.narrationEngine) {
                this.narrationEngine.show(`${unit.instanceName}이(가) 가장 약해진 적 [${target.instanceName}]을(를) 노립니다.`);
            }
            blackboard.set('currentTargetUnit', target);
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }
        
        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE;
    }
}
export default FindLowestHealthEnemyNode;
