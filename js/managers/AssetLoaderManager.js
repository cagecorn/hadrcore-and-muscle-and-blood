// js/managers/AssetLoaderManager.js
import { GAME_EVENTS, GAME_DEBUG_MODE } from '../constants.js';

export class AssetLoaderManager {
    constructor() {
        if (GAME_DEBUG_MODE) console.log("\ud83d\udce6 AssetLoaderManager initialized. Ready to load game assets. \ud83d\udce6");
        this.assets = new Map();
        this.totalAssetsToLoad = 0;
        this.assetsLoadedCount = 0;
        this.eventManager = null;
    }

    // ✨ EventManager를 설정하는 메서드 추가
    setEventManager(eventManager) {
        this.eventManager = eventManager;
    }

    // ✨ 총 로드할 에셋 수를 설정
    setTotalAssetsToLoad(count) {
        this.totalAssetsToLoad = count;
        this.assetsLoadedCount = 0;
        if (GAME_DEBUG_MODE) console.log(`[AssetLoaderManager] Expected to load ${this.totalAssetsToLoad} assets.`);
    }

    /**
     * 이미지를 로드하고 관리합니다.
     * @param {string} assetId - 에셋의 고유 ID
     * @param {string} url - 이미지 파일의 경로
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(assetId, url) {
        if (this.assets.has(assetId)) {
            if (GAME_DEBUG_MODE) console.warn(`[AssetLoaderManager] Asset '${assetId}' is already loaded. Returning existing asset.`);
            return Promise.resolve(this.assets.get(assetId));
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(assetId, img);
                this.assetsLoadedCount++;
                if (GAME_DEBUG_MODE) console.log(`[AssetLoaderManager] Image '${assetId}' loaded from ${url} (${this.assetsLoadedCount}/${this.totalAssetsToLoad}).`);

                // ✨ 진행 상황 이벤트 발행
                if (this.eventManager) {
                    this.eventManager.emit(GAME_EVENTS.ASSET_LOAD_PROGRESS, {
                        loaded: this.assetsLoadedCount,
                        total: this.totalAssetsToLoad
                    });
                    if (this.assetsLoadedCount >= this.totalAssetsToLoad) {
                        this.eventManager.emit(GAME_EVENTS.ASSETS_LOADED, {});
                        if (GAME_DEBUG_MODE) console.log("[AssetLoaderManager] All expected assets loaded!");
                    }
                }
                resolve(img);
            };
            img.onerror = (e) => {
                console.error(`[AssetLoaderManager] Failed to load image '${assetId}' from ${url}:`, e);
                reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
        });
    }

    /**
     * 로드된 이미지 에셋을 ID로 가져옵니다.
     * @param {string} assetId
     * @returns {HTMLImageElement | undefined}
     */
    getImage(assetId) {
        if (!this.assets.has(assetId)) {
            if (GAME_DEBUG_MODE) console.warn(`[AssetLoaderManager] Image asset '${assetId}' not found. Was it loaded?`);
        }
        return this.assets.get(assetId);
    }
}
