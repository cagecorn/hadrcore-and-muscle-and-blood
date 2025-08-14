import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 위협적인 적에게서 멀리 떨어진 안전한 위치로 도주 경로를 설정하는 노드
 */
class FleeNode extends Node {
    constructor({ formationEngine, pathfinderEngine }) {
        super();
        this.formationEngine = formationEngine;
        this.pathfinderEngine = pathfinderEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const threat = blackboard.get('threateningUnit') || blackboard.get('nearestEnemy');
        if (!threat) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '도망칠 대상이 없음');
            return NodeState.FAILURE;
        }

        const availableCells = this.formationEngine.grid.gridCells.filter(c => !c.isOccupied);
        if (availableCells.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '빈 셀이 없음');
            return NodeState.FAILURE;
        }

        let bestCell = null;
        let maxDist = -1;
        availableCells.forEach(cell => {
            const dist = Math.abs(cell.col - threat.gridX) + Math.abs(cell.row - threat.gridY);
            if (dist > maxDist) {
                maxDist = dist;
                bestCell = cell;
            }
        });

        if (!bestCell) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '도망 위치 찾기 실패');
            return NodeState.FAILURE;
        }

        const start = { col: unit.gridX, row: unit.gridY };
        const end = { col: bestCell.col, row: bestCell.row };
        const path = await this.pathfinderEngine.findPath(unit, start, end);
        if (path && path.length > 0) {
            blackboard.set('movementPath', path);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `도주 경로 설정 (${end.col}, ${end.row})`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '경로 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default FleeNode;
