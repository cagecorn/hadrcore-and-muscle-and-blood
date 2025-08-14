import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

/**
 * 아군을 치유하면서 적에게서 안전한 위치를 탐색합니다.
 */
class FindSafeHealingPositionNode extends Node {
    constructor({ formationEngine, pathfinderEngine, narrationEngine }) {
        super();
        this.formationEngine = formationEngine;
        this.pathfinderEngine = pathfinderEngine;
        this.narrationEngine = narrationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const targetAlly = blackboard.get('skillTarget');
        const enemies = blackboard.get('enemyUnits');
        const healRange = blackboard.get('currentSkillData')?.range || 2;

        if (!targetAlly) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '치유 대상 아군 없음');
            return NodeState.FAILURE;
        }

        if (this.narrationEngine) {
            this.narrationEngine.show(`${unit.instanceName}이(가) [${targetAlly.instanceName}]을(를) 치유하기 위해 안전한 위치를 찾습니다.`);
        }

        const cells = this.formationEngine.grid.gridCells.filter(
            cell => !cell.isOccupied || (cell.col === unit.gridX && cell.row === unit.gridY)
        );

        let bestCell = null;
        let maxScore = -Infinity;

        cells.forEach(cell => {
            const distToAlly = Math.abs(cell.col - targetAlly.gridX) + Math.abs(cell.row - targetAlly.gridY);
            if (distToAlly > healRange) return;

            let minEnemyDist = Infinity;
            if (enemies && enemies.length > 0) {
                enemies.forEach(enemy => {
                    const d = Math.abs(cell.col - enemy.gridX) + Math.abs(cell.row - enemy.gridY);
                    if (d < minEnemyDist) minEnemyDist = d;
                });
            }

            const travelDist = Math.abs(cell.col - unit.gridX) + Math.abs(cell.row - unit.gridY);
            // 아군과 지나치게 멀어지는 위치에는 페널티를 주어, 적당히 가까운 곳을 선호합니다.
            const score = minEnemyDist - (travelDist * 0.5) - (distToAlly * 0.2);
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
                debugAIManager.logNodeResult(NodeState.SUCCESS, `안전한 치유 위치 (${bestCell.col}, ${bestCell.row})로 경로 설정`);
                return NodeState.SUCCESS;
            } else if (path) {
                debugLogEngine.warn('FindSafeHealingPositionNode', 'findPath가 배열을 반환하지 않았습니다.', path);
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '안전한 치유 위치 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default FindSafeHealingPositionNode;
