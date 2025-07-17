// js/managers/MonsterEngine.js
import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * Top level engine responsible for monster-related behaviour.
 */
export class MonsterEngine {
    constructor(monsterAI) {
        if (GAME_DEBUG_MODE) console.log("\uD83E\uDD16 MonsterEngine initialized.");
        this.monsterAI = monsterAI;
    }

    /**
     * Determine an action for the monster via MonsterAI.
     * @param {object} monsterUnit
     * @param {object[]} allUnits
     * @returns {object|null}
     */
    determineAction(monsterUnit, allUnits) {
        return this.monsterAI.getMeleeAIAction(monsterUnit, allUnits);
    }
}
