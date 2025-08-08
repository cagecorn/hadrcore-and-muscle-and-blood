import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 아군이 일정 규모로 뭉쳐 있는 클러스터를 찾아 블랙보드에 저장합니다.
 */
class FindAllyClusterNode extends Node {
    constructor(clusterSize = 3, clusterRadius = 2.5) {
        super();
        this.clusterSize = clusterSize;
        this.clusterRadius = clusterRadius;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const allies = blackboard.get('allyUnits');
        if (!allies || allies.length < this.clusterSize) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '클러스터를 형성할 아군 부족');
            return NodeState.FAILURE;
        }

        for (const ally of allies) {
            const nearby = [ally];
            for (const other of allies) {
                if (ally.uniqueId === other.uniqueId) continue;
                const dist = Math.hypot(ally.gridX - other.gridX, ally.gridY - other.gridY);
                if (dist <= this.clusterRadius) nearby.push(other);
            }

            if (nearby.length >= this.clusterSize) {
                const cx = nearby.reduce((sum, a) => sum + a.gridX, 0) / nearby.length;
                const cy = nearby.reduce((sum, a) => sum + a.gridY, 0) / nearby.length;
                const center = { col: Math.round(cx), row: Math.round(cy) };
                blackboard.set('allyClusterCenter', center);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `아군 클러스터 발견 (중심: ${center.col},${center.row})`);
                return NodeState.SUCCESS;
            }
        }

        blackboard.set('allyClusterCenter', null);
        debugAIManager.logNodeResult(NodeState.FAILURE, '아군 클러스터 없음');
        return NodeState.FAILURE;
    }
}

export default FindAllyClusterNode;
