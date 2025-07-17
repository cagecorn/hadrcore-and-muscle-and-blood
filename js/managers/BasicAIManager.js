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

        const best = this._findBestAttackPosition(unit, enemies, moveRange, attackRange);
        if (best) {
            if (best.path.length <= 1) {
                return { actionType: 'attack', targetId: best.target.id };
            }
            const dest = best.path[best.path.length - 1];
            return {
                actionType: 'moveAndAttack',
                targetId: best.target.id,
                moveTargetX: dest.x,
                moveTargetY: dest.y
            };
        }

        const closest = this._findClosestUnit(unit, enemies);
        if (closest) {
            const path = this._findPath(unit.gridX, unit.gridY, closest.gridX, closest.gridY, moveRange);
            if (path && path.length > 1) {
                const dest = path[path.length - 1];
                return { actionType: 'move', moveTargetX: dest.x, moveTargetY: dest.y };
            }
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
