import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

/**
 * 모든 아군 유닛들의 평균 위치(중심점) 근처의 가장 가까운 빈 셀로 이동 경로를 설정하는 노드.
 */
class FindAllyClusterCenterNode extends Node {
    constructor({ pathfinderEngine, formationEngine } = {}) {
        super();
        this.pathfinderEngine = pathfinderEngine;
        this.formationEngine = formationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const allies = blackboard.get('allyUnits');

        // 자신을 제외한 아군이 1명 이상 있어야 의미가 있음
        if (!allies || allies.length < 2) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '클러스터를 형성할 아군이 부족함');
            return NodeState.FAILURE;
        }

        const totalPos = allies.reduce((acc, ally) => {
            acc.col += ally.gridX;
            acc.row += ally.gridY;
            return acc;
        }, { col: 0, row: 0 });

        const centerPos = {
            col: Math.round(totalPos.col / allies.length),
            row: Math.round(totalPos.row / allies.length),
        };

        const availableCells = this.formationEngine.grid.gridCells.filter(c => !c.isOccupied || (c.col === unit.gridX && c.row === unit.gridY));
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

        const path = await this.pathfinderEngine.findPath(unit, { col: unit.gridX, row: unit.gridY }, { col: bestCell.col, row: bestCell.row });
        if (Array.isArray(path) && path.length > 0) {
            blackboard.set('movementPath', path);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `아군 중심(${bestCell.col}, ${bestCell.row})으로 경로 설정`);
            return NodeState.SUCCESS;
        }
        if (path) {
            debugLogEngine.warn('FindAllyClusterCenterNode', 'findPath가 배열을 반환하지 않았습니다.', path);
        }
        
        debugAIManager.logNodeResult(NodeState.FAILURE, '아군 중심점으로의 경로 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default FindAllyClusterCenterNode;
