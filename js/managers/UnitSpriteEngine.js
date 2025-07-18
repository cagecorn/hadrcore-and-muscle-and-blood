// js/managers/UnitSpriteEngine.js

import { GAME_DEBUG_MODE } from '../constants.js';

export class UnitSpriteEngine {
    /**
     * UnitSpriteEngine을 초기화합니다.
     * @param {AssetLoaderManager} assetLoaderManager - 스프라이트 이미지 로드를 위한 인스턴스
     * @param {BattleSimulationManager} battleSimulationManager - 유닛 정보 접근 및 업데이트를 위한 인스턴스
     */
    constructor(assetLoaderManager, battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83C\uDFA8 UnitSpriteEngine initialized. Ready to switch unit sprites. \uD83C\uDFA8");
        this.assetLoaderManager = assetLoaderManager;
        this.battleSimulationManager = battleSimulationManager;
        // 유닛의 상태별 스프라이트를 저장합니다. 구조: Map<unitId, Map<spriteState, HTMLImageElement>>
        this.unitSpriteMap = new Map();
        // 반전된 이미지 캐시
        this.flippedImageCache = new Map();
    }

    /**
     * 유닛의 상태별 스프라이트 이미지를 미리 로드하고 등록합니다.
     * @param {string} unitId - 유닛의 고유 ID
     * @param {object} spriteStates - { state: 'url' } 형태의 객체. 예: { idle: 'path/to/idle.png', attack: '...' }
     * @returns {Promise<void>}
     */
    async registerUnitSprites(unitId, spriteStates) {
        if (!this.unitSpriteMap.has(unitId)) {
            this.unitSpriteMap.set(unitId, new Map());
        }

        const unitSprites = this.unitSpriteMap.get(unitId);
        const promises = [];

        for (const state in spriteStates) {
            const url = spriteStates[state];
            const assetId = `sprite_${unitId}_${state}`;

            const promise = this.assetLoaderManager.loadImage(assetId, url)
                .then(image => {
                    unitSprites.set(state, image);
                    if (GAME_DEBUG_MODE) console.log(`[UnitSpriteEngine] Registered sprite for ${unitId}, state: ${state}`);
                })
                .catch(error => {
                    console.error(`[UnitSpriteEngine] Failed to load sprite for ${unitId}, state: ${state}`, error);
                });
            promises.push(promise);
        }
        await Promise.all(promises);
    }

    /**
     * 유닛의 스프라이트를 지정된 상태로 변경합니다.
     * @param {string} unitId - 변경할 유닛의 ID
     * @param {string} spriteState - 변경할 스프라이트 상태 (예: 'idle', 'attack', 'hitted', 'finish')
     */
    setUnitSprite(unitId, spriteState) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        const unitSprites = this.unitSpriteMap.get(unitId);

        if (unit && unitSprites && unitSprites.has(spriteState)) {
            const newSprite = unitSprites.get(spriteState);
            unit.image = newSprite; // 현재 유닛 이미지 교체
            if (GAME_DEBUG_MODE) console.log(`[UnitSpriteEngine] Unit ${unitId}'s sprite changed to '${spriteState}'.`);
        } else {
            if (GAME_DEBUG_MODE) console.warn(`[UnitSpriteEngine] Sprite for state '${spriteState}' not found for unit ${unitId}.`);
        }
    }

    /**
     * 주어진 이미지를 수평으로 반전시킨 새 이미지를 반환합니다.
     * 성능을 위해 반전된 이미지는 캐시됩니다.
     * @param {HTMLImageElement} originalImage - 원본 이미지
     * @returns {Promise<HTMLImageElement>} 수평으로 반전된 이미지
     */
    async getFlippedImage(originalImage) {
        if (!originalImage || !originalImage.src) {
            return originalImage;
        }
        if (this.flippedImageCache.has(originalImage.src)) {
            return this.flippedImageCache.get(originalImage.src);
        }

        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;

            ctx.translate(originalImage.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(originalImage, 0, 0);

            const flippedImage = new Image();
            flippedImage.onload = () => {
                this.flippedImageCache.set(originalImage.src, flippedImage);
                resolve(flippedImage);
            };
            flippedImage.src = canvas.toDataURL();
        });
    }
}

