import { GAME_DEBUG_MODE, UI_STATES } from '../constants.js';

export class TerritorySceneManager {
    constructor(sceneEngine) {
        if (GAME_DEBUG_MODE) console.log('\uD83C\uDFAC TerritorySceneManager initialized.');
        this.sceneEngine = sceneEngine;
        this._registerScene();
    }

    _registerScene() {
        this.sceneEngine.registerScene(UI_STATES.MAP_SCREEN, []);
    }
}
