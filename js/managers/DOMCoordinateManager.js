import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 캔버스 월드 좌표와 DOM 화면 좌표를 동기화하는 엔진입니다.
 * 유닛 위에 떠다니는 DOM 요소의 위치를 관리합니다.
 */
export class DOMCoordinateManager {
    constructor(cameraEngine, battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83C\DF10 DOMCoordinateManager initialized. Syncing worlds.");
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager;
        this.trackedElements = new Map();
        this.container = document.createElement('div');
        this.container.id = 'dom-overlay-container';
        document.body.appendChild(this.container);
    }

    trackElement(id, element, unitId, options = {}) {
        this.trackedElements.set(id, {
            element,
            unitId,
            offsetY: options.offsetY || 0,
            offsetX: options.offsetX || 0,
        });
        this.container.appendChild(element);
    }

    untrackElement(id) {
        const tracked = this.trackedElements.get(id);
        if (tracked && tracked.element.parentElement) {
            this.container.removeChild(tracked.element);
        }
        this.trackedElements.delete(id);
    }

    update() {
        if (this.trackedElements.size === 0) return;

        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        const canvasRect = this.battleSimulationManager.assetLoaderManager.canvas.getBoundingClientRect();

        for (const [id, tracked] of this.trackedElements.entries()) {
            const unit = this.battleSimulationManager.getUnitById(tracked.unitId);
            if (!unit) {
                this.untrackElement(id);
                continue;
            }

            const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
                unit.id, unit.gridX, unit.gridY,
                effectiveTileSize, gridOffsetX, gridOffsetY
            );

            const worldX = drawX + effectiveTileSize / 2;
            const worldY = drawY;

            const screenPos = this.cameraEngine.worldToScreen(worldX, worldY);
            const finalX = screenPos.x + canvasRect.left + tracked.offsetX;
            const finalY = screenPos.y + canvasRect.top + tracked.offsetY;

            tracked.element.style.left = `${finalX}px`;
            tracked.element.style.top = `${finalY}px`;
        }
    }
}
