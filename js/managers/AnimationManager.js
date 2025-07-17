// js/managers/AnimationManager.js

import { GAME_DEBUG_MODE } from '../constants.js'; // ✨ GAME_DEBUG_MODE 임포트

export class AnimationManager {
    // ✨ particleEngine을 추가로 받습니다.
    constructor(measureManager, battleSimulationManager = null, particleEngine) {
        if (GAME_DEBUG_MODE) console.log("\uD83C\uDFC3 AnimationManager initialized. Ready to animate movements. \uD83C\uDFC3");
        if (!particleEngine) {
            throw new Error("[AnimationManager] Missing ParticleEngine. Cannot initialize.");
        }
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.particleEngine = particleEngine; // ✨ ParticleEngine 저장
        this.activeAnimations = new Map();
        this.animationSpeed = 0.005; // Tiles per millisecond
    }

    /**
     * Add a move animation to the queue.
     * @param {string} unitId
     * @param {number} startGridX
     * @param {number} startGridY
     * @param {number} endGridX
     * @param {number} endGridY
     * @returns {Promise<void>} Resolves when the animation completes
     */
    queueMoveAnimation(unitId, startGridX, startGridY, endGridX, endGridY) {
        return new Promise(resolve => {
            const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions();
            const canvasWidth = this.measureManager.get('gameResolution.width') || sceneContentDimensions.width;
            const canvasHeight = this.measureManager.get('gameResolution.height') || sceneContentDimensions.height;
            const stagePadding = this.measureManager.get('battleStage.padding');

            const gridContentWidth = sceneContentDimensions.width;
            const gridContentHeight = sceneContentDimensions.height;

            const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;
            const totalGridWidth = gridContentWidth;
            const totalGridHeight = gridContentHeight;
            const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
            const gridOffsetY = (canvasHeight - totalGridHeight) / 2;
            const startPixelX = gridOffsetX + startGridX * effectiveTileSize;
            const startPixelY = gridOffsetY + startGridY * effectiveTileSize;
            const endPixelX = gridOffsetX + endGridX * effectiveTileSize;
            const endPixelY = gridOffsetY + endGridY * effectiveTileSize;

            const dist = Math.sqrt(
                Math.pow(endGridX - startGridX, 2) +
                Math.pow(endGridY - startGridY, 2)
            );
            const duration = dist / this.animationSpeed;

            this.activeAnimations.set(unitId, {
                startPixelX,
                startPixelY,
                endPixelX,
                endPixelY,
                startTime: performance.now(),
                duration,
                resolve,
                currentPixelX: startPixelX,
                currentPixelY: startPixelY
            });
            if (GAME_DEBUG_MODE) console.log(`[AnimationManager] Queued move animation for unit ${unitId} from (${startGridX},${startGridY}) to (${endGridX},${endGridY}) with duration ${duration.toFixed(0)}ms.`);
        });
    }

    /**
     * 이동 애니메이션의 지속 시간을 반환합니다.
     * @param {number} startGridX
     * @param {number} startGridY
     * @param {number} endGridX
     * @param {number} endGridY
     * @returns {number} 애니메이션 지속 시간 (ms)
     */
    getAnimationDuration(startGridX, startGridY, endGridX, endGridY) {
        const dist = Math.sqrt(
            Math.pow(endGridX - startGridX, 2) +
            Math.pow(endGridY - startGridY, 2)
        );
        return dist / this.animationSpeed;
    }

    /**
     * ✨ 유닛 대시 애니메이션을 큐에 추가합니다.
     * 돌진처럼 빠르게 이동하고 잔상을 남기는 효과를 포함합니다.
     */
    queueDashAnimation(unitId, startGridX, startGridY, endGridX, endGridY) {
        return new Promise(resolve => {
            if (!this.battleSimulationManager) {
                if (GAME_DEBUG_MODE) console.warn("[AnimationManager] Cannot queue dash animation: BattleSimulationManager not set.");
                resolve();
                return;
            }

            const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions();
            const canvasWidth = this.measureManager.get('gameResolution.width') || sceneContentDimensions.width;
            const canvasHeight = this.measureManager.get('gameResolution.height') || sceneContentDimensions.height;

            const gridContentWidth = sceneContentDimensions.width;
            const gridContentHeight = sceneContentDimensions.height;

            const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;
            const totalGridWidth = gridContentWidth;
            const totalGridHeight = gridContentHeight;
            const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
            const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

            const startPixelX = gridOffsetX + startGridX * effectiveTileSize;
            const startPixelY = gridOffsetY + startGridY * effectiveTileSize;
            const endPixelX = gridOffsetX + endGridX * effectiveTileSize;
            const endPixelY = gridOffsetY + endGridY * effectiveTileSize;

            const dashSpeedMultiplier = 3;
            const dashDuration = this.getAnimationDuration(startGridX, startGridY, endGridX, endGridY) / dashSpeedMultiplier;

            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);

            this.activeAnimations.set(unitId, {
                startPixelX,
                startPixelY,
                endPixelX,
                endPixelY,
                startTime: performance.now(),
                duration: dashDuration,
                resolve,
                currentPixelX: startPixelX,
                currentPixelY: startPixelY,
                type: 'dash',
                afterimageInterval: setInterval(() => {
                    if (unit && unit.image) {
                        this.particleEngine.addUnitAfterimage(unitId, unit.image, unit.gridX, unit.gridY);
                    }
                }, 50)
            });

            if (GAME_DEBUG_MODE) console.log(`[AnimationManager] Queued dash animation for unit ${unitId} from (${startGridX},${startGridY}) to (${endGridX},${endGridY}) with duration ${dashDuration.toFixed(0)}ms.`);
        });
    }

    /**
     * Update animation states each frame.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        const currentTime = performance.now();
        for (const [unitId, animation] of this.activeAnimations.entries()) {
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(1, elapsed / animation.duration);

            if (progress >= 1) {
                animation.currentPixelX = animation.endPixelX;
                animation.currentPixelY = animation.endPixelY;
                if (GAME_DEBUG_MODE) console.log(`[AnimationManager] Animation for unit ${unitId} completed.`);
                this.activeAnimations.delete(unitId);
                if (animation.afterimageInterval) {
                    clearInterval(animation.afterimageInterval);
                }
                if (animation.resolve) {
                    animation.resolve();
                }
            } else {
                animation.currentPixelX = animation.startPixelX + (animation.endPixelX - animation.startPixelX) * progress;
                animation.currentPixelY = animation.startPixelY + (animation.endPixelY - animation.startPixelY) * progress;
            }
        }
    }

    /**
     * Get the current render position for a unit.
     * @param {string} unitId
     * @param {number} currentGridX
     * @param {number} currentGridY
     * @param {number} effectiveTileSize
     * @param {number} gridOffsetX
     * @param {number} gridOffsetY
     * @returns {{drawX:number, drawY:number}}
     */
    getRenderPosition(unitId, currentGridX, currentGridY, effectiveTileSize, gridOffsetX, gridOffsetY) {
        const animation = this.activeAnimations.get(unitId);
        if (animation) {
            return {
                drawX: animation.currentPixelX,
                drawY: animation.currentPixelY
            };
        }
        return {
            drawX: gridOffsetX + currentGridX * effectiveTileSize,
            drawY: gridOffsetY + currentGridY * effectiveTileSize
        };
    }

    /**
     * Check if any animations are active.
     * @returns {boolean}
     */
    hasActiveAnimations() {
        return this.activeAnimations.size > 0;
    }
}
