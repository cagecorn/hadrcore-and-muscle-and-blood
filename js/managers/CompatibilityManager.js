// js/managers/CompatibilityManager.js

export class CompatibilityManager {
    constructor(measureManager, renderer, uiEngine, mapManager, logicManager, mercenaryPanelManager, battleLogManager) {
        console.log("\ud83d\udcf1 CompatibilityManager initialized. Adapting to screen changes. \ud83d\udcf1");
        this.measureManager = measureManager;
        this.renderer = renderer;
        this.uiEngine = uiEngine;
        this.mapManager = mapManager;
        this.logicManager = logicManager;
        // mercenaryPanelManager는 이제 독립적인 캔버스를 가지지 않으므로 직접 참조하지 않습니다.
        // this.mercenaryPanelManager = mercenaryPanelManager;
        this.battleLogManager = battleLogManager;

        // 캔버스 참조 보관
        // this.mercenaryPanelCanvas = mercenaryPanelManager ? mercenaryPanelManager.canvas : null; // 이제 필요 없음
        this.combatLogCanvas = battleLogManager ? battleLogManager.canvas : null;

        this.baseGameWidth = this.measureManager.get('gameResolution.width');
        this.baseGameHeight = this.measureManager.get('gameResolution.height');
        this.baseAspectRatio = this.baseGameWidth / this.baseGameHeight;

        this._setupEventListeners();
        this.adjustResolution();
    }

    _setupEventListeners() {
        window.addEventListener('resize', this.adjustResolution.bind(this));
        console.log("[CompatibilityManager] Listening for window resize events.");
    }

    /**
     * 현재 뷰포트에 맞춰 게임 해상도를 조정합니다.
     * 원본 게임의 가로세로 비율을 유지하면서 화면에 "포함(contain)"되도록 합니다.
     * GuardianManager의 최소 해상도 요구 사항을 충족하도록 보장합니다.
     */
    adjustResolution() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 뷰포트가 0이거나 유효하지 않으면 기본 해상도로 돌아가거나 경고
        if (viewportWidth === 0 || viewportHeight === 0) {
            console.warn("[CompatibilityManager] Viewport dimensions are zero, cannot adjust resolution.");
            const minRes = this.logicManager.getMinGameResolution();

            this.measureManager.updateGameResolution(minRes.minWidth, minRes.minHeight);
            this.renderer.canvas.style.width = `${minRes.minWidth}px`;
            this.renderer.canvas.style.height = `${minRes.minHeight}px`;
            this.renderer.resizeCanvas(minRes.minWidth, minRes.minHeight);

            if (this.combatLogCanvas) {
                const cHeight = Math.floor(minRes.minWidth * (this.measureManager.get('combatLog.heightRatio') / (this.baseGameWidth / this.baseGameHeight)));
                this.combatLogCanvas.style.width = `${minRes.minWidth}px`;
                this.combatLogCanvas.style.height = `${cHeight}px`;
            }
            this.callRecalculateDimensions();
            return;
        }
        const totalPadding = 20; // container padding
        const totalMarginBetweenCanvases = 20; // margins
        const availableHeight = viewportHeight - totalPadding - totalMarginBetweenCanvases;

        const mainGameAspectRatio = this.baseGameWidth / this.baseGameHeight;
        const maxMainGameCanvasWidth = viewportWidth - totalPadding;

        // mercenaryPanelCanvas가 사라졌으므로 해당 비율은 사용하지 않습니다.
        const combatLogExpectedHeightRatio = this.measureManager.get('combatLog.heightRatio');

        let mainGameCanvasWidth;
        let mainGameCanvasHeight;

        const currentViewportAspectRatio = viewportWidth / viewportHeight;
        const totalGameAspectRatio = this.baseAspectRatio +
                                     (this.baseAspectRatio * combatLogExpectedHeightRatio);

        if (currentViewportAspectRatio > totalGameAspectRatio) {
            mainGameCanvasHeight = availableHeight / (1 + combatLogExpectedHeightRatio);
            mainGameCanvasWidth = mainGameCanvasHeight * mainGameAspectRatio;
        } else {
            mainGameCanvasWidth = maxMainGameCanvasWidth;
            mainGameCanvasHeight = mainGameCanvasWidth / mainGameAspectRatio;
            if ((mainGameCanvasHeight + (mainGameCanvasHeight * combatLogExpectedHeightRatio)) > availableHeight) {
                mainGameCanvasHeight = availableHeight / (1 + combatLogExpectedHeightRatio);
                mainGameCanvasWidth = mainGameCanvasHeight * mainGameAspectRatio;
            }
        }

        // 소수점 제거
        mainGameCanvasWidth = Math.floor(mainGameCanvasWidth);
        mainGameCanvasHeight = Math.floor(mainGameCanvasHeight);

        // GuardianManager의 최소 해상도 요구 사항 가져오기
        const minRequiredResolution = this.logicManager.getMinGameResolution();

        // 계산된 해상도가 최소 요구 사항보다 작을 경우 조정
        if (mainGameCanvasWidth < minRequiredResolution.minWidth || mainGameCanvasHeight < minRequiredResolution.minHeight) {
            console.warn(`[CompatibilityManager] Calculated main game resolution ${mainGameCanvasWidth}x${mainGameCanvasHeight} is below minimum requirement ${minRequiredResolution.minWidth}x${minRequiredResolution.minHeight}. Forcing minimums.`);

            const scaleToFitMinWidth = minRequiredResolution.minWidth / mainGameCanvasWidth;
            const scaleToFitMinHeight = minRequiredResolution.minHeight / mainGameCanvasHeight;

            const forcedScale = Math.max(scaleToFitMinWidth, scaleToFitMinHeight);

            mainGameCanvasWidth = Math.floor(mainGameCanvasWidth * forcedScale);
            mainGameCanvasHeight = Math.floor(mainGameCanvasHeight * forcedScale);

            mainGameCanvasWidth = Math.max(mainGameCanvasWidth, minRequiredResolution.minWidth);
            mainGameCanvasHeight = Math.max(mainGameCanvasHeight, minRequiredResolution.minHeight);
        }

        // 1. 메인 게임 캔버스 CSS 해상도 업데이트
        this.measureManager.updateGameResolution(mainGameCanvasWidth, mainGameCanvasHeight);
        this.renderer.canvas.style.width = `${mainGameCanvasWidth}px`;
        this.renderer.canvas.style.height = `${mainGameCanvasHeight}px`;
        this.renderer.resizeCanvas(mainGameCanvasWidth, mainGameCanvasHeight);
        console.log(`[CompatibilityManager] Main Canvas adjusted to: ${mainGameCanvasWidth}x${mainGameCanvasHeight}`);

        // 2. 전투 로그 캔버스 해상도 업데이트
        if (this.combatLogCanvas) {
            const combatLogHeight = Math.floor(mainGameCanvasHeight * combatLogExpectedHeightRatio);
            this.combatLogCanvas.style.width = `${mainGameCanvasWidth}px`;
            this.combatLogCanvas.style.height = `${combatLogHeight}px`;
            if (this.battleLogManager && this.battleLogManager.resizeCanvas) {
                this.battleLogManager.resizeCanvas();
            }
            console.log(`[CompatibilityManager] Combat Log Canvas adjusted to: ${mainGameCanvasWidth}x${combatLogHeight}`);
        }

        // 모든 관련 매니저들의 내부 치수 재계산 호출
        this.callRecalculateDimensions();
    }

    // 모든 매니저의 재계산 메서드를 호출하는 헬퍼 함수
    callRecalculateDimensions() {
        if (this.uiEngine && this.uiEngine.recalculateUIDimensions) {
            this.uiEngine.recalculateUIDimensions();
        }
        if (this.mapManager && this.mapManager.recalculateMapDimensions) {
            this.mapManager.recalculateMapDimensions();
        }
        if (this.battleLogManager && this.battleLogManager.recalculateLogDimensions) {
            this.battleLogManager.recalculateLogDimensions();
        }
    }
}

