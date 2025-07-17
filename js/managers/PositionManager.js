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
                // 맨해튼 거리(직선 이동) 기반으로 사거리 계산
                if (Math.abs(dx) + Math.abs(dy) > attackRange) continue;
                
                const x = targetUnit.gridX + dx;
                const y = targetUnit.gridY + dy;

                // 자기 자신 위치는 공격 위치가 아님
                if (x === targetUnit.gridX && y === targetUnit.gridY) continue;

                if (this.isInsideMap(x, y) && !this.battleSimulationManager.isTileOccupied(x, y)) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    }

    /**
     * 시작점에서 도착점까지의 최단 경로를 찾습니다. (A* 알고리즘의 간소화 버전)
     * @param {{x: number, y: number}} startPos - 시작 좌표
     * @param {{x: number, y: number}} endPos - 도착 좌표
     * @param {number} maxMoveRange - 최대 이동 가능 거리
     * @returns {Array<{x: number, y: number}> | null} 경로 배열 또는 null
     */
    findPath(startPos, endPos, maxMoveRange = Infinity) {
        const maxRange = (maxMoveRange === undefined || maxMoveRange === null) ? Infinity : maxMoveRange;
        const queue = [{ x: startPos.x, y: startPos.y, path: [{ x: startPos.x, y: startPos.y }], dist: 0 }];
        const visited = new Set([`${startPos.x},${startPos.y}`]);
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // 4방향 이동

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.dist >= maxRange) continue;

            for (const [dx, dy] of directions) {
                const nextX = current.x + dx;
                const nextY = current.y + dy;
                const key = `${nextX},${nextY}`;

                if (nextX === endPos.x && nextY === endPos.y) {
                    return current.path.concat({ x: nextX, y: nextY });
                }

                if (this.isInsideMap(nextX, nextY) && !visited.has(key) && !this.battleSimulationManager.isTileOccupied(nextX, nextY)) {
                    visited.add(key);
                    const newPath = current.path.concat({ x: nextX, y: nextY });
                    queue.push({ x: nextX, y: nextY, path: newPath, dist: current.dist + 1 });
                }
            }
        }
        return null; // 경로를 찾지 못함
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
