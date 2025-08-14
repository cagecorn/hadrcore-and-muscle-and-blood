import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

/**
 * 적에게는 가깝지만, 아군과는 1칸의 거리를 유지하는 최적의 위치를 찾는 노드.
 * ENTP의 '끌어당기기' 스킬 사용을 위한 사전 포석입니다.
 */
class FindPullPositionNode extends Node {
    constructor(engines = {}) {
        super();
        this.formationEngine = engines.formationEngine;
        this.pathfinderEngine = engines.pathfinderEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        const allies = blackboard.get('allyUnits');
        if (!target || !allies) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '타겟 또는 아군 정보 없음');
            return NodeState.FAILURE;
        }

        const availableCells = this.formationEngine.grid.gridCells.filter(
            cell => !cell.isOccupied || (cell.col === unit.gridX && cell.row === unit.gridY)
        );

        let bestCell = null;
        let maxScore = -Infinity;

        availableCells.forEach(cell => {
            const distToTarget = Math.abs(cell.col - target.gridX) + Math.abs(cell.row - target.gridY);

            const nearestAllyDist = Math.min(
                ...allies
                    .filter(a => a.uniqueId !== unit.uniqueId)
                    .map(a => Math.abs(cell.col - a.gridX) + Math.abs(cell.row - a.gridY))
            );

            // 점수 계산: 타겟과는 가까울수록, 아군과는 1칸 떨어져 있을수록 높음
            let score = -distToTarget; // 타겟과 가까울수록 점수 증가
            if (nearestAllyDist > 1) {
                score += 10; // 아군과 1칸 이상 떨어져 있으면 큰 보너스
            }

            if (score > maxScore) {
                maxScore = score;
                bestCell = cell;
            }
        });

        if (bestCell) {
            const path = await this.pathfinderEngine.findPath(
                unit,
                { col: unit.gridX, row: unit.gridY },
                { col: bestCell.col, row: bestCell.row }
            );
            if (Array.isArray(path) && path.length > 0) {
                blackboard.set('movementPath', path);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `끌어당기기 위치 (${bestCell.col}, ${bestCell.row})로 경로 설정`);
                return NodeState.SUCCESS;
            } else if (path) {
                debugLogEngine.warn('FindPullPositionNode', 'findPath가 배열을 반환하지 않았습니다.', path);
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '적절한 위치 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default FindPullPositionNode;
