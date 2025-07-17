// js/managers/UIEngine.js

import { GAME_EVENTS, UI_STATES, BUTTON_IDS } from '../constants.js';

export class UIEngine {
    constructor(renderer, measureManager, eventManager, mercenaryPanelManager, buttonEngine, heroManager) {
        console.log("\ud83c\udf9b UIEngine initialized. Ready to draw interfaces. \ud83c\udf9b");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.eventManager = eventManager;
        this.mercenaryPanelManager = mercenaryPanelManager;
        this.buttonEngine = buttonEngine;
        this.heroManager = heroManager;

        this.canvas = renderer.canvas;
        this.ctx = renderer.ctx;

        this._currentUIState = UI_STATES.MAP_SCREEN;
        this.heroPanelVisible = false;

        this.recalculateUIDimensions();

        // '전사 고용' 버튼을 초기 위치에 등록
        const hireButtonWidth = 150;
        const hireButtonHeight = 50;
        this.buttonEngine.registerButton(
            BUTTON_IDS.HIRE_WARRIOR,
            this.measureManager.get('gameResolution.width') - hireButtonWidth - 20,
            20,
            hireButtonWidth,
            hireButtonHeight,
            () => {
                console.log("'전사 고용' 버튼 클릭됨!");
                if (this.heroManager) {
                    this.heroManager.hireNewWarrior();
                }
            }
        );

        // ✨ '전투 시작' 버튼은 이제 HTML에서 관리하므로 ButtonEngine에 등록하지 않습니다.

        console.log("[UIEngine] Initialized for overlay UI rendering.");
    }

    recalculateUIDimensions() {
        console.log("[UIEngine] Recalculating UI dimensions based on MeasureManager...");

        const logicalCanvasWidth = this.measureManager.get('gameResolution.width');
        const logicalCanvasHeight = this.measureManager.get('gameResolution.height');

        this.mapPanelWidth = logicalCanvasWidth * this.measureManager.get('ui.mapPanelWidthRatio');
        this.mapPanelHeight = logicalCanvasHeight * this.measureManager.get('ui.mapPanelHeightRatio');

        this.uiFontSize = Math.floor(logicalCanvasHeight * this.measureManager.get('ui.fontSizeRatio'));

        // 화면 크기가 변할 때 버튼 위치도 업데이트합니다.
        const hireButtonWidth = 150;
        const hireButtonHeight = 50;
        this.buttonEngine.updateButtonRect(
            BUTTON_IDS.HIRE_WARRIOR,
            logicalCanvasWidth - hireButtonWidth - 20,
            20,
            hireButtonWidth,
            hireButtonHeight
        );

        console.log(`[UIEngine Debug] Canvas Logical Dimensions: ${logicalCanvasWidth}x${logicalCanvasHeight}`);
    }

    getUIState() {
        return this._currentUIState;
    }

    setUIState(newState) {
        this._currentUIState = newState;
        console.log(`[UIEngine] Internal UI state updated to: ${newState}`);
    }

    // 영웅 패널 가시성 토글
    toggleHeroPanel() {
        this.heroPanelVisible = !this.heroPanelVisible;
        console.log(`[UIEngine] Hero Panel Visibility: ${this.heroPanelVisible ? 'Visible' : 'Hidden'}`);
        // 필요에 따라 UI 상태를 변경할 수 있지만, 오버레이는 현재 UI 상태와 별개로 표시될 수 있습니다.
    }


    handleBattleStartClick() {
        console.log("[UIEngine] '전투 시작' 버튼 클릭 처리됨!");
        this.eventManager.emit(GAME_EVENTS.BATTLE_START, { mapId: 'currentMap', difficulty: 'normal' }); // ✨ 상수 사용
    }

    draw(ctx) {
        // ✨ '전투 시작' 버튼은 이제 HTML 요소이므로 캔버스에 그리지 않습니다.
        if (this._currentUIState === UI_STATES.MAP_SCREEN) {
            const buttonRect = this.buttonEngine.getButtonRect(BUTTON_IDS.HIRE_WARRIOR);
            if (buttonRect) {
                ctx.fillStyle = 'darkblue';
                ctx.fillRect(buttonRect.x, buttonRect.y, buttonRect.width, buttonRect.height);
                ctx.strokeStyle = 'white';
                ctx.strokeRect(buttonRect.x, buttonRect.y, buttonRect.width, buttonRect.height);
                ctx.fillStyle = 'white';
                ctx.font = `${this.uiFontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('전사 고용', buttonRect.x + buttonRect.width / 2, buttonRect.y + buttonRect.height / 2);
            }
        } else if (this._currentUIState === UI_STATES.COMBAT_SCREEN) {
            // 전투 화면에서는 현재 별도의 상단 텍스트를 표시하지 않습니다.
        }

        // 영웅 패널이 활성화되어 있으면 오버레이로 그립니다.
        if (this.heroPanelVisible && this.mercenaryPanelManager) {
            // 오버레이 배경 (반투명)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.canvas.width / (window.devicePixelRatio || 1), this.canvas.height / (window.devicePixelRatio || 1));

            // 영웅 패널이 그려질 중앙 영역 계산
            const panelWidth = this.measureManager.get('gameResolution.width') * 0.8; // 캔버스 너비의 80%
            const panelHeight = this.measureManager.get('gameResolution.height') * 0.7; // 캔버스 높이의 70%
            const panelX = (this.measureManager.get('gameResolution.width') - panelWidth) / 2;
            const panelY = (this.measureManager.get('gameResolution.height') - panelHeight) / 2;

            // MercenaryPanelManager의 draw 메서드를 호출하여 메인 캔버스에 그립니다.
            this.mercenaryPanelManager.draw(ctx, panelX, panelY, panelWidth, panelHeight);
        }
    }

    /**
     * UI 요소 상태를 갱신합니다.
     * 현재 프레임 기반 로직은 없지만 GameEngine의
     * 업데이트 루프와의 호환을 위해 빈 메서드를 유지합니다.
     * @param {number} deltaTime - 프레임 간 시간 차이(ms)
     */
    update(deltaTime) {
        // 향후 UI 애니메이션 등을 처리할 수 있도록 남겨둡니다.
    }

    getMapPanelDimensions() {
        return {
            width: this.mapPanelWidth,
            height: this.mapPanelHeight
        };
    }

    // getButtonDimensions는 이제 canvas-drawn 버튼이 없으므로 필요성이 줄어듭니다.
    // 하지만 외부에서 여전히 참조할 수 있으므로, 임시로 빈 값을 반환합니다.
    getButtonDimensions() {
        return { width: 0, height: 0 };
    }
}
