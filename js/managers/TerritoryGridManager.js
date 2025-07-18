import { GAME_DEBUG_MODE } from '../constants.js';

export class TerritoryGridManager {
    constructor(domEngine) {
        if (GAME_DEBUG_MODE) console.log('GRID TerritoryGridManager initialized.');
        this.domEngine = domEngine;
        this.gridElement = this.domEngine.getElement('territory-grid');
    }
}
