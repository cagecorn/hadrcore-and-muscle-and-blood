import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

class FindPathToTargetNode extends Node {
    constructor({ pathfinderEngine, formationEngine }) {
        super();
        this.pathfinderEngine = pathfinderEngine;
        this.formationEngine = formationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        // ✨ [수정] 'movementTarget' 대신 'currentTargetUnit'을 참조하도록 변경
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "이동 목표 없음");
            return NodeState.FAILURE;
        }

        const path = await this._findPathToUnit(unit, target);
        if (Array.isArray(path)) {
            blackboard.set('movementPath', path);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `목표(${target.instanceName})에게 경로 설정`);
            return NodeState.SUCCESS;
        }

        // 🛠 경로 탐색 실패 시 한 칸 전진 시도
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };
        const fallback = this._getDirectStep(start, targetPos);
        if (fallback) {
            blackboard.set('movementPath', [fallback]);
            debugAIManager.logNodeResult(NodeState.SUCCESS, '경로 탐색 실패, 직접 한 칸 전진');
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '경로 탐색 실패');
        return NodeState.FAILURE;
    }

    async _findPathToUnit(unit, target) {
        const attackRange = unit.finalStats.attackRange || 1;
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        const distanceToTarget = Math.abs(start.col - targetPos.col) + Math.abs(start.row - targetPos.row);
        if (distanceToTarget <= attackRange) {
            return [];
        }

        const potentialCells = [];
        for (let r = 0; r < this.formationEngine.grid.rows; r++) {
            for (let c = 0; c < this.formationEngine.grid.cols; c++) {
                const distance = Math.abs(c - targetPos.col) + Math.abs(r - targetPos.row);
                if (distance <= attackRange) {
                    const cell = this.formationEngine.grid.getCell(c, r);
                    if (cell && (!cell.isOccupied || (c === start.col && r === start.row))) {
                        potentialCells.push(cell);
                    }
                }
            }
        }

        if (potentialCells.length === 0) return null;

        potentialCells.sort((a, b) => {
            const distA = Math.abs(a.col - start.col) + Math.abs(a.row - start.row);
            const distB = Math.abs(b.col - start.col) + Math.abs(b.row - start.row);
            return distA - distB;
        });

        for (const bestCell of potentialCells) {
            const path = await this.pathfinderEngine.findPath(unit, start, { col: bestCell.col, row: bestCell.row });
            if (Array.isArray(path) && path.length > 0) return path;
            if (path) {
                debugLogEngine.warn('FindPathToTargetNode', 'findPath가 배열을 반환하지 않았습니다.', path);
            }
        }
        return null;
    }

    _getDirectStep(start, targetPos) {
        const dx = Math.sign(targetPos.col - start.col);
        const dy = Math.sign(targetPos.row - start.row);
        const candidates = [];
        if (dx !== 0) candidates.push({ col: start.col + dx, row: start.row });
        if (dy !== 0) candidates.push({ col: start.col, row: start.row + dy });

        for (const step of candidates) {
            const cell = this.formationEngine.grid.getCell(step.col, step.row);
            if (cell && !cell.isOccupied) {
                return step;
            }
        }
        return null;
    }
}
export default FindPathToTargetNode;
