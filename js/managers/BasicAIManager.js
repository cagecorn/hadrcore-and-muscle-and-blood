// js/managers/BasicAIManager.js

import { GAME_DEBUG_MODE } from '../constants.js';

export class BasicAIManager {
    constructor(targetingManager, positionManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83E\uDD16 BasicAIManager initialized. Ready to command. \uD83E\uDD16");
        this.targetingManager = targetingManager;
        this.positionManager = positionManager;
    }

    /**
     * \uC720\uB2C8\uD2B8\uC758 \uC774\uB3D9 \uBC0F \uACF5\uACA9 \uB300\uC0C1\uC744 \uACB0\uC815\uD569\uB2C8\uB2E4.
     * 1. \uCCB4\uB825\uC774 \uAC00\uC7A5 \uB0AE\uC740 \uC801\uC744 \uC6B0\uC120 \uBAA9\uD45C\uB85C \uC0BC\uB2C8\uB2E4.
     * 2. \uD574\uB2F9 \uBAA9\uD45C\uC5D0 \uB3C4\uB2E4\uB840 \uC218 \uC5C6\uC73C\uBA74, \uAC00\uC7A5 \uAC70\uB9AC\uAC00 \uAC00\uAE4C\uC6B4 \uC801\uC744 \uBAA9\uD45C\uB85C \uC804\uD658\uD569\uB2C8\uB2E4.
     * @param {object} unit - \uD589\uB3D9\uD560 \uC720\uB2C8\uD2B8
     * @param {object[]} allUnits - \uBAA8\uB4E0 \uC720\uB2C8\uD2B8\uC758 \uBC30\uC5F4
     * @param {number} moveRange - \uC720\uB2C8\uD2B8\uC758 \uC774\uB3D9 \uBC94\uC704
     * @param {number} attackRange - \uC720\uB2C8\uD2B8\uC758 \uACF5\uACA9 \uBC94\uC704
     * @returns {object | null} \uACB0\uC815\uB41C \uD589\uB3D9 \uAC1D\uCCB4 \uB610\uB294 null
     */
    determineMoveAndTarget(unit, allUnits, moveRange, attackRange) {
        // 1. 1\uCC28 \uBAA9\uD45C: HP\uAC00 \uAC00\uC7A5 \uB0AE\uC740 \uC801
        let target = this.targetingManager.findBestTarget('enemy', 'lowestHp', unit);

        if (!target) {
            if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} found no targets.`);
            return null;
        }
        if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] Primary Target (Lowest HP): ${target.name}`);

        // 1\uCC28 \uBAA9\uD45C\uC5D0 \uB300\uD55C \uCD5C\uC801\uC758 \uD589\uB3D9 \uACC4\uC0B0
        let action = this._calculateActionForTarget(unit, target, allUnits, moveRange, attackRange);

        // \uB9C8\uB098 1\uCC28 \uBAA9\uD45C\uC5D0\uAC8C \uB3C4\uB2EC\uD558\uC5B4 \uACF5\uACA9\uD560 \uC218 \uC5C6\uB2E4\uBA74
        if (!action || action.actionType === 'move') {
            if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] Cannot reach ${target.name} to attack. Finding closest target...`);

            // 2. 2\uCC28 \uBAA9\uD45C: \uAC00\uC7A5 \uAC70\uB9AC\uAC00 \uAC00\uAE4C\uC6B4 \uC801
            const closestTarget = this.targetingManager.findBestTarget('enemy', 'closest', unit);
            if (closestTarget && closestTarget.id !== target.id) {
                if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] Secondary Target (Closest): ${closestTarget.name}`);
                // 2\uCC28 \uBAA9\uD45C\uC5D0 \uB300\uD55C \uD589\uB3D9 \uACC4\uC0B0
                const alternativeAction = this._calculateActionForTarget(unit, closestTarget, allUnits, moveRange, attackRange);
                if (alternativeAction) {
                    action = alternativeAction;
                }
            }
        }
        
        if (!action) {
            if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} has no possible action.`);
        }

        return action;
    }

    /**
     * \uD2B9\uC815 \uBAA9\uD45C\uC5D0 \uB300\uD55C \uCD5C\uC801\uC758 \uD589\uB3D9\uC744 \uACC4\uC0B0\uD558\uB294 \uD6C4\uBCF4 \uD568\uC218\uC785\uB2C8\uB2E4.
     * @private
     */
    _calculateActionForTarget(unit, target, allUnits, moveRange, attackRange) {
        // \uBAA9\uD45C\uB97C \uACF5\uACA9\uD560 \uC218 \uC788\uB294 \uC704\uCE58 \uBAA9\uB85D
        const attackPositions = this.positionManager.getAttackablePositions(target, attackRange);

        // \uC774\uBBF8 \uACF5\uACA9 \uC704\uCE58\uC5D0 \uC788\uB294\uC9C0 \uD655\uC778
        if (this.positionManager.isInsideMap(unit.gridX, unit.gridY)) {
            const isAtAttackPosition = attackPositions.some(pos => pos.x === unit.gridX && pos.y === unit.gridY);
            if(isAtAttackPosition) {
                 if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} is already in attack range of ${target.name}. Attacking.`);
                 return { actionType: 'attack', targetId: target.id };
            }
        }

        // \uACF5\uACA9 \uC704\uCE58\uAE4C\uC9C0\uC758 \uCD5C\uB2E4 \uACBD\uB85C \uCC3C\uAE30
        let bestPath = null;
        for (const pos of attackPositions) {
            const path = this.positionManager.findPath({ x: unit.gridX, y: unit.gridY }, pos);
            if (path && (path.length - 1) <= moveRange) {
                if (!bestPath || path.length < bestPath.length) {
                    bestPath = path;
                }
            }
        }

        // \uC774\uB3D9 \uD6C4 \uACF5\uACA9\uC774 \uAC00\uB2A5\uD55C \uACBD\uB85C\uAC00 \uC788\uB2E4\uBA74 \uD574\uB2F9 \uD589\uB3D9 \uBC18\uD658
        if (bestPath) {
            const destination = bestPath[bestPath.length - 1];
            if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} will move to (${destination.x},${destination.y}) and attack ${target.name}.`);
            return { actionType: 'moveAndAttack', targetId: target.id, moveTargetX: destination.x, moveTargetY: destination.y };
        }

        // \uACF5\uACA9 \uC704\uCE58\uB85C \uC774\uB3D9\uD560 \uC218 \uC5C6\uB2E4\uBA74, \uBAA9\uD45C\uB97C \uD5A5\uD574 \uCD5C\uB300\uD55C \uC774\uB3D9
        const pathToTarget = this.positionManager.findPath({ x: unit.gridX, y: unit.gridY }, { x: target.gridX, y: target.gridY });
        if (pathToTarget && pathToTarget.length > 1) {
            const maxReachableIndex = Math.min(moveRange, pathToTarget.length - 1);

            // \uC774\uB3D9 \uAC00\uB2A5\uD55C \uAC00\uC7A5 \uBA38\uB9AC \uC9C0\uC810\uC744 \uCC3C\uB2E4\uB2C8, \uB2E4\uB978 \uC720\uB2C8\uD2B8\uAC00 \uC810\uC720\uD558\uC9C0 \uC54A\uC740 \uACF3\uC73C\uB85C
            for (let i = maxReachableIndex; i > 0; i--) {
                const candidate = pathToTarget[i];
                if (!this.positionManager.battleSimulationManager.isTileOccupied(candidate.x, candidate.y, unit.id)) {
                    if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} cannot reach attack position. Moving towards ${target.name} at (${candidate.x},${candidate.y}).`);
                    return { actionType: 'move', moveTargetX: candidate.x, moveTargetY: candidate.y };
                }
            }
        }
        
        return null; // \uC5B4\uB5A4 \uD589\uB3D9\uB3C4 \uBD88\uAC00\uB2A5
    }
}
