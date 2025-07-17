// js/managers/BasicAIManager.js

import { GAME_DEBUG_MODE } from '../constants.js';

export class BasicAIManager {
    constructor(battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83E\uDD16 BasicAIManager initialized. Providing fundamental AI logic. \uD83E\uDD16");
        this.battleSimulationManager = battleSimulationManager;
    }

    /**
     * Determine the unit's action.
     * @param {object} unit
     * @param {object[]} allUnits
     * @param {number} moveRange
     * @param {number} attackRange
     * @returns {{actionType:string,targetId?:string,moveTargetX?:number,moveTargetY?:number}|null}
     */
    determineMoveAndTarget(unit, allUnits, moveRange, attackRange) {
        const enemies = allUnits.filter(u => u.type !== unit.type && u.currentHp > 0);
        if (enemies.length === 0) return null;

        // 1. 이번 턴에 공격할 수 있는 최적의 위치를 찾습니다.
        const bestAttack = this._findBestAttackPosition(unit, enemies, moveRange, attackRange);
        if (bestAttack) {
            // 경로 길이가 1 이하라면 이미 공격 위치에 있다는 의미입니다.
            if (bestAttack.path.length <= 1) {
                return { actionType: 'attack', targetId: bestAttack.target.id };
            }
            // 이동 후 공격합니다.
            const dest = bestAttack.path[bestAttack.path.length - 1];
            return {
                actionType: 'moveAndAttack',
                targetId: bestAttack.target.id,
                moveTargetX: dest.x,
                moveTargetY: dest.y
            };
        }

        // 2. 공격할 수 없다면, 가장 가까운 적에게 이동합니다.
        const bestMove = this._findBestMovePosition(unit, enemies, moveRange);
        if (bestMove) {
            return { actionType: 'move', moveTargetX: bestMove.x, moveTargetY: bestMove.y };
        }

        return null; // 이동할 곳도 없으면 행동하지 않습니다.
    }

    /**
     * 공격할 수 없을 때, 가장 가까운 적을 향해 이동할 최적의 위치를 찾습니다.
     * @private
     */
    _findBestMovePosition(unit, enemies, moveRange) {
        let bestPath = null;

        // 모든 적에 대해...
        for (const enemy of enemies) {
            // 적 주변의 모든 공격 가능한 빈 타일을 찾습니다.
            const attackPositions = this._getAttackablePositions(enemy, 1); // 기본 공격 범위 1로 가정
            for (const pos of attackPositions) {
                // 현재 위치에서 해당 공격 위치까지의 경로를 찾습니다. (이동 범위는 무제한으로 가정)
                const path = this._findPath(unit.gridX, unit.gridY, pos.x, pos.y, 999);
                // 가장 짧은 경로를 찾습니다.
                if (path && (!bestPath || path.length < bestPath.length)) {
                    bestPath = path;
                }
            }
        }

        if (bestPath && bestPath.length > 1) {
            // 가장 짧은 경로가 있다면, 이번 턴에 이동할 수 있는 최대 거리의 지점을 목적지로 설정합니다.
            const destinationIndex = Math.min(moveRange, bestPath.length - 1);
            return bestPath[destinationIndex];
        }

        return null;
    }

    _findBestAttackPosition(unit, enemies, moveRange, attackRange) {
        let best = null;
        for (const enemy of enemies) {
            const positions = this._getAttackablePositions(enemy, attackRange);
            for (const pos of positions) {
                if (pos.x === unit.gridX && pos.y === unit.gridY) {
                    const score = this._evaluateTarget(enemy);
                    if (!best || score > best.score) {
                        best = { target: enemy, path: [{x:unit.gridX,y:unit.gridY}], score };
                    }
                    continue;
                }
                const path = this._findPath(unit.gridX, unit.gridY, pos.x, pos.y, moveRange);
                if (path) {
                    const score = this._evaluateTarget(enemy);
                    if (!best || score > best.score) {
                        best = { target: enemy, path, score };
                    }
                }
            }
        }
        return best;
    }

    _evaluateTarget(target) {
        return 1000 - target.currentHp;
    }

    _findClosestUnit(unit, others) {
        let closest = null;
        let minDist = Infinity;
        for (const other of others) {
            const dist = Math.abs(unit.gridX - other.gridX) + Math.abs(unit.gridY - other.gridY);
            if (dist < minDist) {
                minDist = dist;
                closest = other;
            }
        }
        return closest;
    }

    _getAttackablePositions(enemy, range) {
        const positions = [];
        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                const x = enemy.gridX + dx;
                const y = enemy.gridY + dy;
                if (Math.abs(dx) + Math.abs(dy) <= range*2 && !this.battleSimulationManager.isTileOccupied(x, y) && this._isInsideMap(x, y)) {
                    positions.push({x,y});
                }
            }
        }
        return positions;
    }

    _isInsideMap(x, y) {
        return x >= 0 && x < this.battleSimulationManager.gridCols && y >= 0 && y < this.battleSimulationManager.gridRows;
    }

    _findPath(sx, sy, ex, ey, maxLen) {
        if (sx === ex && sy === ey) return [{x:sx,y:sy}];
        const queue = [{x:sx,y:sy,path:[{x:sx,y:sy}],dist:0}];
        const visited = new Set([`${sx},${sy}`]);
        while (queue.length > 0) {
            const current = queue.shift();
            if (current.dist >= maxLen) continue;
            const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
            for (const [dx,dy] of dirs) {
                const nx = current.x + dx;
                const ny = current.y + dy;
                const key = `${nx},${ny}`;
                if (!this._isInsideMap(nx, ny) || visited.has(key)) continue;
                if (this.battleSimulationManager.isTileOccupied(nx, ny, null)) continue;
                const newPath = current.path.concat({x:nx,y:ny});
                if (nx === ex && ny === ey) return newPath;
                visited.add(key);
                queue.push({x:nx,y:ny,path:newPath,dist:current.dist+1});
            }
        }
        return null;
    }
}
