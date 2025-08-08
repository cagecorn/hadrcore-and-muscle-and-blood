import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

// 공격 사거리 내에 있는 적 중 체력이 가장 낮은 적을 우선적으로 찾고,
// 없다면 가장 가까운 적을 타겟으로 삼는 노드
class FindPreferredTargetNode extends Node {
    constructor({ targetManager }) {
        super();
        this.targetManager = targetManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemyUnits = blackboard.get('enemyUnits');
        if (!enemyUnits || enemyUnits.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }

        const attackRange = unit.finalStats.attackRange || 1;
        const inRange = enemyUnits.filter(e => e.currentHp > 0 &&
            Math.abs(unit.gridX - e.gridX) + Math.abs(unit.gridY - e.gridY) <= attackRange);

        let target = null;
        if (inRange.length > 0) {
            target = inRange.sort((a, b) => a.currentHp - b.currentHp)[0];
        } else {
            target = this.targetManager.findNearestEnemy(unit, enemyUnits);
        }

        if (target) {
            blackboard.set('currentTargetUnit', target);
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE;
    }
}

export default FindPreferredTargetNode;
