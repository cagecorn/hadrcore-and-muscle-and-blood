import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 모든 적 유닛들의 평균 위치(중심점) 근처의 가장 가까운 빈 셀로 이동 경로를 설정하는 노드.
 * ESFP AI가 적진으로 돌격할 위치를 찾는 데 사용됩니다.
 */
class FindEnemyClusterCenterNode extends Node {
    constructor({ pathfinderEngine, formationEngine } = {}) {
        super();
        this.pathfinderEngine = pathfinderEngine;
        this.formationEngine = formationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemies = blackboard.get('enemyUnits');

        if (!enemies || enemies.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '중심점을 계산할 적이 없음');
            return NodeState.FAILURE;
        }

        const totalPos = enemies.reduce((acc, enemy) => {
            acc.col += enemy.gridX;
            acc.row += enemy.gridY;
            return acc;
        }, { col: 0, row: 0 });

        const centerPos = {
            col: Math.round(totalPos.col / enemies.length),
            row: Math.round(totalPos.row / enemies.length),
        };

        const availableCells = this.formationEngine.grid.gridCells.filter(
            c => !c.isOccupied || (c.col === unit.gridX && c.row === unit.gridY)
        );
        if (availableCells.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '이동할 빈 셀이 없음');
            return NodeState.FAILURE;
        }

        availableCells.sort((a, b) => {
            const distA = Math.abs(a.col - centerPos.col) + Math.abs(a.row - centerPos.row);
            const distB = Math.abs(b.col - centerPos.col) + Math.abs(b.row - centerPos.row);
            return distA - distB;
        });
        const bestCell = availableCells[0];

        const path = await this.pathfinderEngine.findPath(
            unit,
            { col: unit.gridX, row: unit.gridY },
            { col: bestCell.col, row: bestCell.row }
        );
        if (path && path.length > 0) {
            blackboard.set('movementPath', path);
            blackboard.set('movementTarget', bestCell);
            debugAIManager.logNodeResult(
                NodeState.SUCCESS,
                `적 중심(${bestCell.col}, ${bestCell.row})으로 경로 설정`
            );
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '적 중심점으로의 경로 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default FindEnemyClusterCenterNode;
