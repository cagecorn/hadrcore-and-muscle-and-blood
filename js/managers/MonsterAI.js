// js/managers/MonsterAI.js
import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * Defines behaviour patterns for monsters.
 */
export class MonsterAI {
    constructor(basicAIManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83E\uDDDF MonsterAI initialized.");
        this.basicAIManager = basicAIManager;
    }

    /**
     * Use basic melee AI shared with warriors.
     * @param {object} monsterUnit
     * @param {object[]} allUnits
     */
    getMeleeAIAction(monsterUnit, allUnits) {
        if (!monsterUnit) return null;
        const moveRange = monsterUnit.baseStats.moveRange || 1;
        const attackRange = monsterUnit.baseStats.attackRange || 1;
        if (GAME_DEBUG_MODE) console.log(`[MonsterAI] Delegating ${monsterUnit.name}`);
        return this.basicAIManager.determineMoveAndTarget(monsterUnit, allUnits, moveRange, attackRange);
    }
}
