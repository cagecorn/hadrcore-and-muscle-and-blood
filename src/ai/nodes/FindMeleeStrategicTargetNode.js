import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { formationEngine } from '../../game/utils/FormationEngine.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

class FindMeleeStrategicTargetNode extends Node {
    constructor({ targetManager, pathfinderEngine }) {
        super();
        this.targetManager = targetManager;
        this.pathfinderEngine = pathfinderEngine;
    }

    // 유닛을 공격할 수 있는 가장 가까운 위치로의 경로를 찾는 헬퍼 메서드
    async _findPathToUnit(unit, target) {
        const attackRange = unit.finalStats.attackRange || 1;
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        const distanceToTarget = Math.abs(start.col - targetPos.col) + Math.abs(start.row - targetPos.row);
        if (distanceToTarget <= attackRange) {
            return [];
        }

        const potentialAttackCells = [];
        for (let r = 0; r < formationEngine.grid.rows; r++) {
            for (let c = 0; c < formationEngine.grid.cols; c++) {
                const distance = Math.abs(c - targetPos.col) + Math.abs(r - targetPos.row);
                if (distance <= attackRange) {
                    const cell = formationEngine.grid.getCell(c, r);
                    if (cell && (!cell.isOccupied || (c === start.col && r === start.row))) {
                        potentialAttackCells.push(cell);
                    }
                }
            }
        }

        if (potentialAttackCells.length === 0) return null;

        potentialAttackCells.sort((a, b) => {
            const distA = Math.abs(a.col - start.col) + Math.abs(a.row - start.row);
            const distB = Math.abs(b.col - start.col) + Math.abs(b.row - start.row);
            return distA - distB;
        });

        for (const bestCell of potentialAttackCells) {
            const path = await this.pathfinderEngine.findPath(unit, start, { col: bestCell.col, row: bestCell.row });
            if (Array.isArray(path) && path.length > 0) return path;
            if (path) {
                debugLogEngine.warn('FindMeleeStrategicTargetNode', 'findPath가 배열을 반환하지 않았습니다.', path);
            }
        }
        return null;
    }


    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemyUnits = blackboard.get('enemyUnits')?.filter(e => e.currentHp > 0);

        if (!enemyUnits || enemyUnits.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "적이 없음");
            return NodeState.FAILURE;
        }

        const movementRange = unit.finalStats.movement || 3;

        const lowHpEnemies = [...enemyUnits]
            .filter(e => (e.currentHp / e.finalStats.hp) < 0.5)
            .sort((a, b) => a.currentHp - b.currentHp);

        for (const lowHpEnemy of lowHpEnemies) {
            const path = await this._findPathToUnit(unit, lowHpEnemy);
            if (Array.isArray(path) && path.length <= movementRange) {
                blackboard.set('movementTarget', lowHpEnemy);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `체력이 적고 도달 가능한 타겟 [${lowHpEnemy.instanceName}] 설정`);
                return NodeState.SUCCESS;
            }
            if (path && !Array.isArray(path)) {
                debugLogEngine.warn('FindMeleeStrategicTargetNode', '_findPathToUnit이 배열이 아닌 값을 반환했습니다.', path);
            }
        }

        const nearestEnemy = this.targetManager.findNearestEnemy(unit, enemyUnits);
        if (nearestEnemy) {
            blackboard.set('movementTarget', nearestEnemy);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `가장 가까운 타겟 [${nearestEnemy.instanceName}] 설정`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, "이동할 타겟을 찾지 못함");
        return NodeState.FAILURE;
    }
}
export default FindMeleeStrategicTargetNode;
