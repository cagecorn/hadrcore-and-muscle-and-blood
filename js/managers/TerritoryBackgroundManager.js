import { GAME_DEBUG_MODE } from '../constants.js';

export class TerritoryBackgroundManager {
    constructor(domEngine) {
        if (GAME_DEBUG_MODE) console.log('\uD83C\uDFDE\uFE0F TerritoryBackgroundManager initialized.');
        this.domEngine = domEngine;
        this.territoryScreen = this.domEngine.getElement('territory-screen');
        this._setupBackground();
    }

    _setupBackground() {
        if (this.territoryScreen) {
            this.territoryScreen.style.backgroundImage = "url('assets/territory/city-1.png')";
            this.territoryScreen.style.backgroundSize = 'cover';
            this.territoryScreen.style.backgroundPosition = 'center';
        }
    }
}
