import { GAME_DEBUG_MODE } from '../constants.js';

export class TerritoryUIManager {
    constructor(eventManager, domEngine) {
        if (GAME_DEBUG_MODE) console.log('\uD83D\uDCCB TerritoryUIManager initialized.');
        this.eventManager = eventManager;
        this.domEngine = domEngine;
    }
}
