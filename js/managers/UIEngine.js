// js/managers/UIEngine.js

import { GAME_EVENTS, UI_STATES } from '../constants.js';

export class UIEngine {
    constructor(renderer, measureManager, eventManager, mercenaryPanelManager, buttonEngine) {
        console.log("🎨 UIEngine initialized. Ready to draw interfaces. 🎨");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.eventManager = eventManager;
        this.mercenaryPanelManager = mercenaryPanelManager;
        this.buttonEngine = buttonEngine;

        this.canvas = renderer.canvas;
        this.ctx = renderer.ctx;

        this._currentUIState = UI_STATES.MAP_SCREEN;

        this.recalculateUIDimensions();
        console.log("[UIEngine] Initialized for overlay UI rendering.");
    }

    recalculateUIDimensions() {
        console.log("[UIEngine] Recalculating UI dimensions based on MeasureManager...");

        const logicalCanvasWidth = this.measureManager.get('gameResolution.width');
        const logicalCanvasHeight = this.measureManager.get('gameResolution.height');

        this.uiFontSize = Math.floor(logicalCanvasHeight * this.measureManager.get('ui.fontSizeRatio'));

        console.log(`[UIEngine Debug] Canvas Logical Dimensions: ${logicalCanvasWidth}x${logicalCanvasHeight}`);
    }

    getUIState() {
        return this._currentUIState;
    }

    setUIState(newState) {
        this._currentUIState = newState;
        console.log(`[UIEngine] Internal UI state updated to: ${newState}`);
    }

    toggleHeroPanel() {
        const heroPanel = document.getElementById('hero-panel');
        if (heroPanel) {
            heroPanel.classList.toggle('hidden');
            this.mercenaryPanelManager.updatePanel();
        }
        console.log(`[UIEngine] Hero Panel Visibility toggled.`);
    }

    handleBattleStartClick() {
        console.log("[UIEngine] '전투 시작' 버튼 클릭 처리됨!");
        this.eventManager.emit(GAME_EVENTS.BATTLE_START, { mapId: 'currentMap', difficulty: 'normal' });
    }

    draw(ctx) {
        // DOM 기반 UI는 캔버스에 그릴 필요가 없습니다.
    }
}
