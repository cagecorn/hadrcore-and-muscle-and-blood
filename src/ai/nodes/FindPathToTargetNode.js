import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

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
        if (path) {
            blackboard.set('movementPath', path);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `목표(${target.instanceName})에게 경로 설정`);
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
            if (path && path.length > 0) return path;
        }
        return null;
    }
}
export default FindPathToTargetNode;
