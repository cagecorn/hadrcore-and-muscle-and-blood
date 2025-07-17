import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * Calculates attack ranges and checks if targets are in range.
 */
export class RangeManager {
    constructor(battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDCCF RangeManager initialized.");
        this.battleSimulationManager = battleSimulationManager;
    }

    /**
     * Returns the attack range for a unit.
     * @param {object} unit
     * @returns {number}
     */
    getAttackRange(unit) {
        if (unit && unit.baseStats && unit.baseStats.attackRange) {
            return unit.baseStats.attackRange;
        }
        return 1;
    }

    /**
     * Determines whether the target is within the attacker's range.
     * @param {object} attacker
     * @param {object} target
     * @returns {boolean}
     */
    isTargetInRange(attacker, target) {
        if (!attacker || !target) return false;
        const attackRange = this.getAttackRange(attacker);
        const distance = Math.abs(attacker.gridX - target.gridX) + Math.abs(attacker.gridY - target.gridY);
        const inRange = distance <= attackRange;
        if (GAME_DEBUG_MODE) {
            const msg = inRange ? 'IN RANGE' : 'OUT OF RANGE';
            console.log(`[RangeManager] Target ${target.name} is ${msg} for ${attacker.name}. (Dist: ${distance}, Range: ${attackRange})`);
        }
        return inRange;
    }
}
