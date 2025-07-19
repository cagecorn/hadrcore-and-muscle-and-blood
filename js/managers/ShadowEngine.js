// js/managers/ShadowEngine.js

import { GAME_DEBUG_MODE } from '../constants.js';
// Use the same CDN build of Pixi.js as the previous overlay to avoid module resolution issues
// when running without a bundler.
import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.mjs';

export class ShadowEngine {
    constructor(battleSimulationManager, animationManager, renderer) {
        if (!battleSimulationManager || !animationManager || !renderer) {
            throw new Error('[ShadowEngine] Missing essential dependencies.');
        }
        if (GAME_DEBUG_MODE) {
            console.log('🎨 ShadowEngine initialized for Pixi.js. 🎨');
        }
        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        const view = document.createElement('canvas');
        view.id = 'shadow-canvas';
        renderer.canvas.parentNode.appendChild(view);
        this.pixiApp = new PIXI.Application({
            view,
            width: renderer.canvas.width / renderer.pixelRatio,
            height: renderer.canvas.height / renderer.pixelRatio,
            backgroundAlpha: 0,
            autoStart: false
        });
        this.shadowContainer = new PIXI.Container();
        this.pixiApp.stage.addChild(this.shadowContainer);

        this.shadows = new Map();
        this.shadowsEnabled = true;
        this.baseShadowOpacity = 0.4;
        this.shadowScaleY = 0.35;
    }

    setShadowsEnabled(enable) {
        this.shadowsEnabled = enable;
        if (GAME_DEBUG_MODE) {
            console.log(`[ShadowEngine] Shadows are now ${enable ? 'ENABLED' : 'DISABLED'}.`);
        }
    }

    toggleShadows() {
        this.shadowsEnabled = !this.shadowsEnabled;
        if (GAME_DEBUG_MODE) {
            console.log(`[ShadowEngine] Toggled shadows to: ${this.shadowsEnabled}.`);
        }
        return this.shadowsEnabled;
    }

    resize(width, height) {
        this.pixiApp.renderer.resize(width, height);
    }

    draw() {
        this.pixiApp.render();
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
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
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
