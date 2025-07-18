// js/managers/TerritoryManager.js
import { TerritoryEngine } from './TerritoryEngine.js';
import { TerritoryBackgroundManager } from './TerritoryBackgroundManager.js';
import { TerritoryGridManager } from './TerritoryGridManager.js';
import { TerritoryInputManager } from './TerritoryInputManager.js';
import { TerritorySceneManager } from './TerritorySceneManager.js';

export class TerritoryManager {
    constructor(assetLoaderManager, measureManager, eventManager, sceneEngine, canvas) {
        console.log("\ud83c\udf33 TerritoryManager initialized. Ready to oversee the domain. \ud83c\udf33");
        this.engine = new TerritoryEngine();
        this.backgroundManager = new TerritoryBackgroundManager(assetLoaderManager);
        this.gridManager = new TerritoryGridManager(measureManager);
        this.sceneManager = new TerritorySceneManager(sceneEngine);
        this.inputManager = new TerritoryInputManager(eventManager, this.gridManager, canvas);
        this.inputManager.onTileClick = (tileId) => this.sceneManager.switchToScene(tileId);
    }

    update(deltaTime) {
        this.engine.update(deltaTime);
    }

    draw(ctx) {
        this.backgroundManager.draw(ctx);
        this.gridManager.draw(ctx);
    }
}
