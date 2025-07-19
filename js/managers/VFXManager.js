// js/managers/VFXManager.js

import { GAME_EVENTS, GAME_DEBUG_MODE } from '../constants.js';

export class VFXManager {
    // animationManager를 추가로 받아 유닛의 애니메이션 위치를 참조합니다.
    constructor(renderer, measureManager, cameraEngine, battleSimulationManager, animationManager, eventManager, particleEngine = null) { // ✨ particleEngine 추가
        if (GAME_DEBUG_MODE) console.log("\u2728 VFXManager initialized. Ready to render visual effects. \u2728");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
        this.animationManager = animationManager; // ✨ AnimationManager 저장
        this.eventManager = eventManager;
        this.particleEngine = particleEngine; // ✨ ParticleEngine 저장

        this.activeWeaponDrops = new Map();

        // bleed effect tracking
        this.bleedIcon = null;
        this.bleedingUnits = new Set();

        this.assetLoaderManager = null;
        this.statusEffectManager = null;

        // 이벤트 리스너 설정
        this._setupEventListeners();
    }

    loadVisualEffects() {
        if (!this.assetLoaderManager) return;
        this.bleedIcon = this.assetLoaderManager.getImage('bleed');
        if (GAME_DEBUG_MODE) console.log("[VFXManager] Loaded visual effects assets.");
    }

    /**
     * VFXManager가 수신할 이벤트를 설정합니다.
     * @private
     */
    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.WEAPON_DROPPED, this._onWeaponDropped.bind(this));
        if (GAME_DEBUG_MODE) console.log("[VFXManager] Subscribed to 'weaponDropped' event.");

        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, (data) => {
            if (this.particleEngine && data.damage > 0) {
                this.particleEngine.addParticles(data.unitId, 'red');
            }
        });
    }

    /**
     * 'weaponDropped' 이벤트 발생 시 호출됩니다.
     * @param {{ unitId: string, weaponSpriteId: string }} data
     */
    _onWeaponDropped(data) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === data.unitId);
        if (!unit) {
            if (GAME_DEBUG_MODE) console.warn(`[VFXManager] Cannot find unit '${data.unitId}' for weapon drop animation.`);
            return;
        }

        const weaponImage = this.battleSimulationManager.assetLoaderManager.getImage(data.weaponSpriteId);
        if (!weaponImage) {
            if (GAME_DEBUG_MODE) console.warn(`[VFXManager] Weapon sprite '${data.weaponSpriteId}' not loaded.`);
            return;
        }

        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions(); // 이제 순수 그리드 크기를 반환
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        const stagePadding = this.measureManager.get('battleStage.padding');

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산
        const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        // (캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2 + 패딩
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        const { drawX, drawY } = this.animationManager.getRenderPosition(
            unit.id,
            unit.gridX,
            unit.gridY,
            effectiveTileSize,
            gridOffsetX,
            gridOffsetY
        );

        // ✨ 무기 크기, 시작/종료 위치 등을 MeasureManager 비율 값으로 계산
        const weaponSize = effectiveTileSize * this.measureManager.get('vfx.weaponDropScale');
        const startX = drawX + (effectiveTileSize - weaponSize) / 2;
        const startY = drawY - effectiveTileSize * this.measureManager.get('vfx.weaponDropStartOffsetY');

        this.activeWeaponDrops.set(data.unitId, {
            sprite: weaponImage,
            startX: startX,
            startY: startY,
            endY: drawY + effectiveTileSize * this.measureManager.get('vfx.weaponDropEndOffsetY'), // ✨ 끝 Y 위치 조정
            currentY: startY,
            opacity: 1,
            startTime: performance.now(),
            popDuration: this.measureManager.get('vfx.weaponDropPopDuration'),
            fallDuration: this.measureManager.get('vfx.weaponDropFallDuration'),
            fadeDuration: this.measureManager.get('vfx.weaponDropFadeDuration'),
            totalDuration: this.measureManager.get('vfx.weaponDropTotalDuration')
        });
        if (GAME_DEBUG_MODE) console.log(`[VFXManager] Weapon drop animation data added for unit ${data.unitId}.`);
    }

    /**
     * ✨ 활성 데미지 숫자의 상태를 업데이트합니다.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        const currentTime = performance.now();


        // 무기 드롭 애니메이션 업데이트
        for (const [unitId, drop] of this.activeWeaponDrops.entries()) {
            const elapsed = currentTime - drop.startTime;

            if (elapsed < drop.popDuration) {
                const progress = elapsed / drop.popDuration;
                drop.currentY = drop.startY - drop.sprite.height * progress;
            } else if (elapsed < drop.popDuration + drop.fallDuration) {
                const fallElapsed = elapsed - drop.popDuration;
                const progress = fallElapsed / drop.fallDuration;
                drop.currentY = drop.startY + (drop.endY - drop.startY) * progress;
            } else if (elapsed < drop.totalDuration) {
                const fadeElapsed = elapsed - (drop.popDuration + drop.fallDuration);
                const progress = fadeElapsed / drop.fadeDuration;
                drop.opacity = Math.max(0, 1 - progress);
            } else {
                this.activeWeaponDrops.delete(unitId);
                if (GAME_DEBUG_MODE) console.log(`[VFXManager] Weapon drop animation for unit ${unitId} completed.`);
            }
        }

        // update bleeding units
        if (this.statusEffectManager) {
            this.bleedingUnits.clear();
            for (const unit of this.battleSimulationManager.unitsOnGrid) {
                if (this.statusEffectManager.hasStatusEffect(unit.id, 'status_bleed') ||
                    this.statusEffectManager.hasStatusEffect(unit.id, 'bleeding')) {
                    this.bleedingUnits.add(unit.id);
                }
            }
        }
    }

    clearEffects() {
        this.activeWeaponDrops.clear();
        this.bleedingUnits.clear();
        if (GAME_DEBUG_MODE) console.log("[VFXManager] All active visual effects cleared.");
    }

    /**
     * 특정 유닛의 HP 바를 그립니다.
     * 실제 그리기 위치는 AnimationManager로 계산된 값을 사용합니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - HP 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize - 유닛이 그려지는 타일의 유효 크기
     * @param {number} actualDrawX - 애니메이션이 적용된 x 좌표
     * @param {number} actualDrawY - 애니메이션이 적용된 y 좌표
     */

    /**
     * 모든 활성 시각 효과를 그립니다. 이 메서드는 LayerEngine에 의해 호출됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions(); // 이제 순수 그리드 크기를 반환
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        const stagePadding = this.measureManager.get('battleStage.padding');

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산
        const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        // (캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2 + 패딩
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        // ✨ DEBUG LOG START FOR VFXManager Drawing Parameters
        // if (GAME_DEBUG_MODE) console.log(`[VFXManager Debug] Drawing VFX Parameters: \n            Canvas (Logical): ${canvasWidth}x${canvasHeight}\n            Effective Tile Size: ${effectiveTileSize.toFixed(2)}\n            Grid Offset (X, Y): ${gridOffsetX.toFixed(2)}, ${gridOffsetY.toFixed(2)}`);
        // ✨ DEBUG LOG END FOR VFXManager Drawing Parameters

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            // ✨ AnimationManager를 통해 현재 애니메이션이 적용된 위치를 조회합니다.
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );
            if (this.bleedIcon && this.bleedingUnits.has(unit.id)) {
                const iconSize = effectiveTileSize * 0.3;
                const iconX = drawX + effectiveTileSize - iconSize;
                const iconY = drawY;
                ctx.drawImage(this.bleedIcon, iconX, iconY, iconSize, iconSize);
            }
        }

        // ✨ 무기 드롭 애니메이션 그리기
        for (const [unitId, drop] of this.activeWeaponDrops.entries()) {
            if (!drop.sprite) continue;

            const weaponSize = effectiveTileSize * this.measureManager.get('vfx.weaponDropScale'); // ✨ 비율 사용

            ctx.save();
            ctx.globalAlpha = drop.opacity;
            ctx.drawImage(drop.sprite, drop.startX, drop.currentY, weaponSize, weaponSize);
            ctx.restore();
        }
        // ✨ 파티클 그리기 호출
        if (this.particleEngine) {
            this.particleEngine.draw(ctx);
        }
    }
}
