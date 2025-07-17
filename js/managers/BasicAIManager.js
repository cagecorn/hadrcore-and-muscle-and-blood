// js/managers/BasicAIManager.js

import { GAME_DEBUG_MODE } from '../constants.js';

export class BasicAIManager {
    constructor(targetingManager, positionManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83E\uDD16 BasicAIManager initialized. Ready to command. \uD83E\uDD16");
        this.targetingManager = targetingManager;
        this.positionManager = positionManager;
    }

    determineMoveAndTarget(unit, allUnits, moveRange, attackRange) {
        const target = this.targetingManager.findBestTarget('enemy', 'lowestHp', unit);
        if (!target) {
            if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} found no targets.`);
            return null;
        }
        if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} selected target: ${target.name}`);

        const attackPositions = this.positionManager.getAttackablePositions(target, attackRange);

        for (const pos of attackPositions) {
            if (unit.gridX === pos.x && unit.gridY === pos.y) {
                if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} is already in attack range. Attacking ${target.name}.`);
                return { actionType: 'attack', targetId: target.id };
            }
        }

        let bestPath = null;
        for (const pos of attackPositions) {
            const path = this.positionManager.findPath({ x: unit.gridX, y: unit.gridY }, pos);
            if (path && path.length - 1 <= moveRange) {
                if (!bestPath || path.length < bestPath.length) {
                    bestPath = path;
                }
            }
        }

        if (bestPath) {
            const destination = bestPath[bestPath.length - 1];
            if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} will move to (${destination.x},${destination.y}) and attack ${target.name}.`);
            return { actionType: 'moveAndAttack', targetId: target.id, moveTargetX: destination.x, moveTargetY: destination.y };
        }

        const pathToTarget = this.positionManager.findPath(
            { x: unit.gridX, y: unit.gridY },
            { x: target.gridX, y: target.gridY }
        );
        if (pathToTarget && pathToTarget.length > 1) {
            // 이동 가능한 최대 거리 내에서 적에게 가장 근접한 위치를 찾음
            const maxReachableIndex = Math.min(moveRange, pathToTarget.length - 1);

            let moveDestination = null;
            for (let i = maxReachableIndex; i > 0; i--) {
                const candidate = pathToTarget[i];
                if (!this.positionManager.battleSimulationManager.isTileOccupied(candidate.x, candidate.y, unit.id)) {
                    moveDestination = candidate;
                    break;
                }
            }

            if (moveDestination) {
                if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} cannot reach attack position. Moving towards ${target.name} at (${moveDestination.x},${moveDestination.y}).`);
                return { actionType: 'move', moveTargetX: moveDestination.x, moveTargetY: moveDestination.y };
            }
        }

        if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} has no possible action.`);
        return null;
    }
}
