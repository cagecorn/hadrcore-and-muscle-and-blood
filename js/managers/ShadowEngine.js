import { GAME_DEBUG_MODE } from '../constants.js';
import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.mjs';

export class ShadowEngine {
    constructor(battleSimulationManager, animationManager, pixiUIOverlay) {
        if (GAME_DEBUG_MODE) console.log("🎨 ShadowEngine initialized for Pixi.js. 🎨");
        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        this.pixiApp = pixiUIOverlay.app;
        this.shadowContainer = pixiUIOverlay.shadowContainer;

        this.shadows = new Map();
        this.shadowsEnabled = true;
        this.baseShadowOpacity = 0.4;
        this.shadowScaleY = 0.35;
    }

    update() {
        if (!this.shadowsEnabled) {
            this.shadowContainer.visible = false;
            return;
        }
        this.shadowContainer.visible = true;

        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        const aliveUnitIds = new Set();

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0 || !unit.image) {
                continue;
            }
            aliveUnitIds.add(unit.id);

            let shadow = this.shadows.get(unit.id);
            if (!shadow) {
                shadow = new PIXI.Graphics();
                this.shadows.set(unit.id, shadow);
                this.shadowContainer.addChild(shadow);
            }

            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY
            );

            const shadowWidth = effectiveTileSize * 0.8;
            const shadowHeight = shadowWidth * this.shadowScaleY;

            shadow.clear();
            shadow.beginFill(0x000000, this.baseShadowOpacity);
            shadow.drawEllipse(0, 0, shadowWidth / 2, shadowHeight / 2);
            shadow.endFill();

            shadow.x = drawX + effectiveTileSize / 2;
            shadow.y = drawY + effectiveTileSize * 0.95;
            shadow.filters = [new PIXI.BlurFilter(4)];
        }

        for (const [unitId, shadow] of this.shadows.entries()) {
            if (!aliveUnitIds.has(unitId)) {
                this.shadowContainer.removeChild(shadow);
                shadow.destroy();
                this.shadows.delete(unitId);
            }
        }
    }
}
