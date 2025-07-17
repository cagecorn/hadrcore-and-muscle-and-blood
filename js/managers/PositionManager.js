// js/managers/PositionManager.js

import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 그리드 좌표, 경로 탐색 등 위치와 관련된 모든 계산을 담당합니다.
 */
export class PositionManager {
    constructor(battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("🗺️ PositionManager initialized. Ready for cartography and pathfinding. 🗺️");
        this.battleSimulationManager = battleSimulationManager;
    }

    /**
     * 목표 유닛 주변에서 공격이 가능한 모든 빈 타일의 좌표를 찾습니다.
     * @param {object} targetUnit - 공격 대상 유닛
     * @param {number} attackRange - 공격 사거리
     * @returns {Array<{x: number, y: number}>} 공격 가능한 좌표 목록
     */
    getAttackablePositions(targetUnit, attackRange) {
        const positions = [];
        for (let dx = -attackRange; dx <= attackRange; dx++) {
            for (let dy = -attackRange; dy <= attackRange; dy++) {
                if (Math.abs(dx) + Math.abs(dy) > attackRange) continue;

                const x = targetUnit.gridX + dx;
                const y = targetUnit.gridY + dy;

                if (x === targetUnit.gridX && y === targetUnit.gridY) continue;

                if (this.isInsideMap(x, y) && !this.battleSimulationManager.isTileOccupied(x, y)) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    }

    /**
     * A* 알고리즘을 사용하여 시작점에서 도착점까지의 최단 경로를 찾습니다.
     * @param {{x: number, y: number}} startPos - 시작 좌표
     * @param {{x: number, y: number}} endPos - 도착 좌표
     * @returns {Array<{x: number, y: number}> | null} 경로 노드 배열 또는 null
     */
    findPath(startPos, endPos) {
        const openSet = new Set([`${startPos.x},${startPos.y}`]);
        const cameFrom = new Map();

        const gScore = new Map();
        gScore.set(`${startPos.x},${startPos.y}`, 0);

        const fScore = new Map();
        fScore.set(`${startPos.x},${startPos.y}`, this.heuristic(startPos, endPos));

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        while (openSet.size > 0) {
            let currentKey = null;
            let lowestFScore = Infinity;
            for (const key of openSet) {
                if ((fScore.get(key) || Infinity) < lowestFScore) {
                    lowestFScore = fScore.get(key);
                    currentKey = key;
                }
            }

            const [currentX, currentY] = currentKey.split(',').map(Number);

            if (currentX === endPos.x && currentY === endPos.y) {
                return this.reconstructPath(cameFrom, currentKey);
            }

            openSet.delete(currentKey);

            for (const [dx, dy] of directions) {
                const neighborX = currentX + dx;
                const neighborY = currentY + dy;
                const neighborKey = `${neighborX},${neighborY}`;

                if (!this.isInsideMap(neighborX, neighborY)) continue;

                // 도착지점이거나 비어있는 타일만 통과 가능
                const isWalkable = (neighborX === endPos.x && neighborY === endPos.y) || !this.battleSimulationManager.isTileOccupied(neighborX, neighborY);

                if (!isWalkable) continue;

                const tentativeGScore = (gScore.get(currentKey) || 0) + 1; // 이동 비용은 1로 고정

                if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + this.heuristic({ x: neighborX, y: neighborY }, endPos));
                    if (!openSet.has(neighborKey)) {
                        openSet.add(neighborKey);
                    }
                }
            }
        }

        return null; // 경로를 찾지 못함
    }

    /**
     * Rekindles the path using the cameFrom map.
     * @private
     * @param {Map<string, string>} cameFrom - Map of navigated nodes.
     * @param {string} currentKey - Key of the last node in the path.
     * @returns {Array<{x: number, y: number}>} Reconstructed path from start to end.
     */
    reconstructPath(cameFrom, currentKey) {
        const totalPath = [
            { x: parseInt(currentKey.split(',')[0], 10), y: parseInt(currentKey.split(',')[1], 10) }
        ];
        while (cameFrom.has(currentKey)) {
            currentKey = cameFrom.get(currentKey);
            totalPath.unshift({
                x: parseInt(currentKey.split(',')[0], 10),
                y: parseInt(currentKey.split(',')[1], 10)
            });
        }
        return totalPath;
    }

    /**
     * Manhattan-distance heuristic used by A*.
     * @private
     * @param {{x: number, y: number}} posA
     * @param {{x: number, y: number}} posB
     * @returns {number} Estimated distance between two points.
     */
    heuristic(posA, posB) {
        return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y);
    }

    /**
     * 해당 좌표가 맵 내부에 있는지 확인합니다.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isInsideMap(x, y) {
        const { gridCols, gridRows } = this.battleSimulationManager;
        return x >= 0 && x < gridCols && y >= 0 && y < gridRows;
    }
}
