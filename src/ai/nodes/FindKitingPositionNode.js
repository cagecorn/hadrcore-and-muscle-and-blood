import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

// 최적의 카이팅(거리두기) 위치를 찾는 노드
class FindKitingPositionNode extends Node {
    // visionManager를 의존성으로 추가합니다.
    constructor({ formationEngine, pathfinderEngine, visionManager, narrationEngine }) {
        super();
        this.formationEngine = formationEngine;
        this.pathfinderEngine = pathfinderEngine;
        this.visionManager = visionManager; // VisionManager 인스턴스 저장
        this.narrationEngine = narrationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        // ✨ [핵심 변경] 카이팅의 기준이 될 대상을 결정합니다.
        // 1순위: IsTargetTooCloseNode가 설정한 '위협적인 적'
        // 2순위: 현재 공격하려는 '스킬 대상'
        // 3순위: AI가 정한 '일반 공격 대상'
        const target = blackboard.get('threateningUnit') || blackboard.get('skillTarget') || blackboard.get('currentTargetUnit');
        const enemyUnits = blackboard.get('enemyUnits');

        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "카이팅할 주 대상 없음");
            return NodeState.FAILURE;
        }

        if (this.narrationEngine) {
            this.narrationEngine.show(`${unit.instanceName}이(가) [${target.instanceName}]와(과) 거리를 벌리기 위해 이동합니다.`);
        }

        const attackRange = unit.finalStats.attackRange || 3;
        // ✨ 이 노드 자체의 dangerZone 하드코딩을 제거했습니다.
        // 이제 이 노드는 "안전한 공격 위치"를 찾는 데 집중하고,
        // "위험 여부" 판단은 IsTargetTooCloseNode가 전담합니다.
        const dangerZoneFromBlackboard = blackboard.get('threateningUnit') ? 2 : 0; // 위협적인 유닛이 있을 때만 안전거리 고려
        const sightRange = unit.finalStats.sightRange || 10; // 유닛의 시야 범위
        const start = { col: unit.gridX, row: unit.gridY };

        // **수정된 로직**: 시야 내 모든 위협적인 적을 가져옵니다.
        const enemiesInSight = this.visionManager.findEnemiesInSight(unit, enemyUnits, sightRange);
        if (enemiesInSight.length === 0) {
            // 시야 내에 적이 없으면 카이팅할 필요가 없습니다.
            // 이 경우는 IsTargetTooCloseNode에서 이미 걸러지지만, 방어 코드로 추가합니다.
            debugAIManager.logNodeResult(NodeState.FAILURE, "시야 내에 위협적인 적 없음");
            return NodeState.FAILURE;
        }

        const availableCells = this.formationEngine.grid.gridCells.filter(cell => !cell.isOccupied || (cell.col === start.col && cell.row === start.row));

        let bestCell = null;
        let minDistanceToTravel = Infinity;

        // **수정된 로직**: 최적의 셀을 찾는 기준 변경
        availableCells.forEach(cell => {
            // **조건 1: 주변의 "모든" 적으로부터 안전한가?**
            const isSafeFromAllEnemies = enemiesInSight.every(enemy => {
                const distanceToEnemy = Math.abs(cell.col - enemy.gridX) + Math.abs(cell.row - enemy.gridY);
                return distanceToEnemy > dangerZoneFromBlackboard;
            });

            if (isSafeFromAllEnemies) {
                // **조건 2: 주 공격 대상은 여전히 사거리 안에 있는가?**
                const distanceToTarget = Math.abs(cell.col - target.gridX) + Math.abs(cell.row - target.gridY);

                if (distanceToTarget <= attackRange) {
                    const distanceToTravel = Math.abs(cell.col - start.col) + Math.abs(cell.row - start.row);

                    // **조건 3: 위 조건들을 만족하는 셀 중 가장 이동 거리가 짧은가?**
                    if (distanceToTravel < minDistanceToTravel) {
                        minDistanceToTravel = distanceToTravel;
                        bestCell = cell;
                    }
                }
            }
        });

        if (bestCell) {
            const path = await this.pathfinderEngine.findPath(unit, start, { col: bestCell.col, row: bestCell.row });
            if (path && path.length > 0) {
                blackboard.set('movementPath', path);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `최적 카이팅 위치 (${bestCell.col}, ${bestCell.row})로 경로 설정`);
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, "주변 모든 적을 고려한 안전한 카이팅 위치를 찾지 못함");
        return NodeState.FAILURE; // 마땅한 후퇴 지점 없음
    }
}
export default FindKitingPositionNode;
