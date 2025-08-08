import { debugLogEngine } from './DebugLogEngine.js';
import { formationEngine } from './FormationEngine.js';
import { aiMemoryEngine } from './AIMemoryEngine.js';

/**
 * A* 알고리즘을 사용하여 유닛의 이동 경로를 계산하는 엔진
 */
class PathfinderEngine {
    constructor() {
        /**
         * 내부적으로 참조하는 FormationEngine 인스턴스.
         * 테스트 환경에서는 이 값을 덮어써서 사용합니다.
         */
        this.formationEngine = formationEngine;
        debugLogEngine.log('PathfinderEngine', 'A* 경로 탐색 엔진이 초기화되었습니다.');
    }

    /**
     * A* 알고리즘을 사용하여 시작 좌표에서 목표 좌표까지의 경로를 찾습니다.
     * @param {object} unit - 경로를 찾는 주체 유닛 (아군/적군 판단용)
     * @param {object} startPos - 시작 그리드 좌표 { col, row }
     * @param {object} endPos - 목표 그리드 좌표 { col, row }
     * @returns {Array<object>|null} - 경로 좌표 배열 또는 null (경로 없음)
     */
    async findPath(unit, startPos, endPos) {
        const grid = this.formationEngine?.grid;
        if (!grid) return null;

        const memory = await aiMemoryEngine.getMemory(unit.uniqueId);
        const dangerousTiles = memory.dangerousTiles || {};

        const openSet = [];
        const closedSet = new Set();

        const startNode = this._getNodeFromGrid(startPos.col, startPos.row);
        const endNode = this._getNodeFromGrid(endPos.col, endPos.row);
        if (!startNode || !endNode) return null;

        startNode.gCost = 0;
        startNode.hCost = this._getDistance(startNode, endNode);
        startNode.fCost = startNode.hCost;
        openSet.push(startNode);

        while (openSet.length > 0) {
            const currentNode = openSet.reduce((a, b) =>
                a.fCost === b.fCost ? (a.hCost < b.hCost ? a : b) : (a.fCost < b.fCost ? a : b)
            );

            openSet.splice(openSet.indexOf(currentNode), 1);
            closedSet.add(`${currentNode.col},${currentNode.row}`);

            if (currentNode.col === endNode.col && currentNode.row === endNode.row) {
                return this._retracePath(startNode, currentNode);
            }

            this._getNeighbors(currentNode).forEach(neighbor => {
                const key = `${neighbor.col},${neighbor.row}`;
                const cell = grid.getCell(neighbor.col, neighbor.row);

                // 이미 탐색했거나 유효하지 않은 셀은 제외합니다.
                if (closedSet.has(key) || !cell) {
                    return;
                }

                // ✨ [핵심 수정] 모든 유닛이 점유된 칸을 통과할 수 없도록 간소화합니다.
                if (cell.isOccupied) {
                    return;
                }

                let movementCost = this._getDistance(currentNode, neighbor);
                const neighborKey = `${neighbor.col},${neighbor.row}`;
                if (dangerousTiles[neighborKey]) {
                    movementCost *= 10 * dangerousTiles[neighborKey];
                }

                const newCost = currentNode.gCost + movementCost;
                const existing = openSet.find(n => n.col === neighbor.col && n.row === neighbor.row);

                if (!existing || newCost < neighbor.gCost) {
                    neighbor.gCost = newCost;
                    neighbor.hCost = this._getDistance(neighbor, endNode);
                    neighbor.fCost = neighbor.gCost + neighbor.hCost;
                    neighbor.parent = currentNode;

                    if (!existing) {
                        openSet.push(neighbor);
                    }
                }
            });
        }

        debugLogEngine.warn('PathfinderEngine', `경로를 찾을 수 없습니다: (${startPos.col},${startPos.row}) -> (${endPos.col},${endPos.row})`);
        return null;
    }

    /**
     * 대상 주위에서 스킬을 사용할 수 있는 최적의 타일까지의 경로를 계산합니다.
     * @param {object} unit - 이동 주체 유닛
     * @param {object} skill - 사용하려는 스킬 데이터
     * @param {object} target - 공격 대상 유닛
     * @returns {Array<object>|null} - 이동 경로 또는 null (이동 불가)
     */
    async findBestPathToAttack(unit, skill, target) {
        const grid = this.formationEngine?.grid;
        if (!grid || !skill || !target) return null;

        const skillRange = skill.range ?? 1;
        const moveRange = unit.finalStats.movement || 0;
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        const candidateTiles = [];
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                const cell = grid.getCell(c, r);
                if (!cell) continue;
                if (cell.isOccupied && !(c === start.col && r === start.row)) continue;
                const distance = Math.abs(c - targetPos.col) + Math.abs(r - targetPos.row);
                if (distance <= skillRange) {
                    candidateTiles.push({ col: c, row: r });
                }
            }
        }

        const reachable = [];
        for (const tile of candidateTiles) {
            const path = await this.findPath(unit, start, tile);
            if (path && path.length <= moveRange) {
                reachable.push({ path });
            }
        }

        if (reachable.length === 0) return null;

        reachable.sort((a, b) => a.path.length - b.path.length);
        return reachable[0].path;
    }

    _retracePath(startNode, endNode) {
        const path = [];
        let currentNode = endNode;
        while (currentNode && currentNode !== startNode) {
            path.push({ col: currentNode.col, row: currentNode.row });
            currentNode = currentNode.parent;
        }
        const reversedPath = path.reverse();
        debugLogEngine.log('PathfinderEngine', `A* 경로 탐색 완료: ${reversedPath.length}개의 이동 경로 발견.`);
        return reversedPath;
    }

    _getNodeFromGrid(col, row) {
        const cell = this.formationEngine?.grid?.getCell(col, row);
        if (!cell) return null;
        return { col: cell.col, row: cell.row, gCost: Infinity, hCost: Infinity, fCost: Infinity, parent: null };
    }

    _getNeighbors(node) {
        const neighbors = [];
        const { col, row } = node;
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
        ];

        for (const dir of directions) {
            const checkCol = col + dir.x;
            const checkRow = row + dir.y;
            const neighborNode = this._getNodeFromGrid(checkCol, checkRow);
            if (neighborNode) {
                neighbors.push(neighborNode);
            }
        }
        return neighbors;
    }

    _getDistance(nodeA, nodeB) {
        const dstX = Math.abs(nodeA.col - nodeB.col);
        const dstY = Math.abs(nodeA.row - nodeB.row);
        return (dstX + dstY) * 10;
    }
}

export const pathfinderEngine = new PathfinderEngine();

