import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 전투가 잠잠할 때 유리한 위치로 이동하기 위한 위치를 탐색합니다.
 */
class FindSafeRepositionNode extends Node {
    constructor({ formationEngine, pathfinderEngine, narrationEngine, targetManager }) {
        super();
        this.formationEngine = formationEngine;
        this.pathfinderEngine = pathfinderEngine;
        this.narrationEngine = narrationEngine;
        this.targetManager = targetManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemies = blackboard.get('enemyUnits');

        // ✨ [핵심 추가] 현재 위협받고 있는지(isThreatened) 확인하는 로직
        const isThreatened = blackboard.get('isThreatened');

        // 만약 적이 있는데 위협받는 상황이 아니라면, 굳이 후퇴하지 않고 전투를 지속합니다.
        if (enemies && enemies.length > 0 && !isThreatened) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '전투 중 불필요한 재배치는 수행하지 않음');
            return NodeState.FAILURE;
        }

        if (this.narrationEngine) {
            if (isThreatened) {
                this.narrationEngine.show(`${unit.instanceName}이(가) 위협을 피해 안전한 위치로 후퇴합니다.`);
            } else {
                this.narrationEngine.show(`${unit.instanceName}이(가) 다음 행동을 위해 유리한 위치로 이동합니다.`);
            }
        }
        const cells = this.formationEngine.grid.gridCells.filter(
            cell => !cell.isOccupied || (cell.col === unit.gridX && cell.row === unit.gridY)
        );

        let bestCell = null;
        let maxScore = -Infinity;

        // 가장 가까운 적을 찾습니다.
        const nearestEnemy = this.targetManager.findNearestEnemy(unit, enemies);

        cells.forEach(cell => {
            let minEnemyDist = Infinity;
            if (enemies && enemies.length > 0) {
                enemies.forEach(enemy => {
                    const d = Math.abs(cell.col - enemy.gridX) + Math.abs(cell.row - enemy.gridY);
                    if (d < minEnemyDist) minEnemyDist = d;
                });
            }

            const travelDist = Math.abs(cell.col - unit.gridX) + Math.abs(cell.row - unit.gridY);

            // 가장 가까운 적과의 거리를 계산하여, 지나치게 멀어지지 않도록 합니다.
            const distToNearestEnemy = nearestEnemy ?
                Math.abs(cell.col - nearestEnemy.gridX) + Math.abs(cell.row - nearestEnemy.gridY) : 0;

            // 🔁 [수정] 점수 계산 로직을 수정하여 너무 멀리 도망가지 않도록 합니다.
            const score = (minEnemyDist * 1.2) - (travelDist * 0.5) - (distToNearestEnemy * 1.2);

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
            if (path && path.length > 0) {
                blackboard.set('movementPath', path);
                debugAIManager.logNodeResult(
                    NodeState.SUCCESS,
                    `재배치 위치 (${bestCell.col}, ${bestCell.row}) 경로 설정 (Score: ${maxScore.toFixed(2)})`
                );
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '재배치 위치 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default FindSafeRepositionNode;
