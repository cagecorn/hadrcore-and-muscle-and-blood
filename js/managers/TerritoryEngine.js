import { GAME_DEBUG_MODE } from '../constants.js';

export class TerritoryEngine {
    constructor(eventManager, domEngine) {
        if (GAME_DEBUG_MODE) console.log('\uD83C\uDFE0 TerritoryEngine initialized. Managing the home base.');
        this.eventManager = eventManager;
        this.domEngine = domEngine;
    }
}
