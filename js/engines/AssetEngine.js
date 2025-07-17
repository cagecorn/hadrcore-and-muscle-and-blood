// js/engines/AssetEngine.js

import { IdManager } from '../managers/IdManager.js';
import { AssetLoaderManager } from '../managers/AssetLoaderManager.js';
import { SkillIconManager } from '../managers/SkillIconManager.js';
import { UnitSpriteEngine } from '../managers/UnitSpriteEngine.js';

/**
 * 게임의 모든 데이터와 에셋 로딩 및 관리를 담당하는 엔진입니다.
 */
export class AssetEngine {
    constructor(eventManager) {
        console.log("\ud83d\udce6 AssetEngine initialized.");
        this.idManager = new IdManager();
        this.assetLoaderManager = new AssetLoaderManager();
        this.assetLoaderManager.setEventManager(eventManager);
        this.skillIconManager = new SkillIconManager(this.assetLoaderManager, this.idManager);
        this.unitSpriteEngine = new UnitSpriteEngine(this.assetLoaderManager, null); // battleSim은 추후 주입
    }

    getIdManager() { return this.idManager; }
    getAssetLoaderManager() { return this.assetLoaderManager; }
    getSkillIconManager() { return this.skillIconManager; }
    getUnitSpriteEngine() { return this.unitSpriteEngine; }
}
