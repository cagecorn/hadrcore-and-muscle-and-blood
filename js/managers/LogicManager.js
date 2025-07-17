// js/managers/LogicManager.js

export class LogicManager {
    constructor(measureManager, sceneManager) {
        console.log("\ud0d1\uc815 \ub85c\uc9c1 \ub9c8\ub2c8\uc800 \ucd08\uae30\ud654\ub428. \uc0c1\uc2e4\uc744 \uac15\uc81c\ud560 \uc900\ube44 \ub41c\ub2e4. \ud83d\udd75\ufe0f");
        this.measureManager = measureManager;
        this.sceneManager = sceneManager;
    }

    /**
     * \ud604\uc7ac \ud65c\uc131\ud654\ub41c \uc2fc\uc758 \uc2e4\uc81c \ucf58\ud150\uce20 \ud06c\uae30\ub97c \ubc18\ud658\ud569\ub2c8\ub2e4.
     * \uc774 \ud06c\uae30\ub294 \uce74\uba54\ub77c\uac00 \ud654\uba74\uc758 \ube48\ud73c \uc5c6\uc774 \ubcf4\uc5ec \uc788\ub294 \ubmax \uc601\uc5ed\uc744 \uc815\uc758\ud569\ub2c8\ub2e4.
     * @returns {{width: number, height: number}} \ud604\uc7ac \uc2fc \ucf58\ud150\uce20\uc758 \ub5a8\uae30 \ubc0f \ub192\uc774
     */
    getCurrentSceneContentDimensions() {
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');
        const currentSceneName = this.sceneManager.getCurrentSceneName();

        let contentWidth, contentHeight;
        if (currentSceneName === 'territoryScene') {
            // 영지 씬은 캔버스와 동일한 크기를 사용
            contentWidth = canvasWidth;
            contentHeight = canvasHeight;
        } else if (currentSceneName === 'battleScene') {
            // 전투 씬의 경우, 전체 캔버스 영역을 콘텐츠로 간주합니다.
            // BattleStageManager가 배경을 전체 캔버스에 그리므로
            // 카메라가 이 전체 영역을 프레임해야 합니다.
            contentWidth = canvasWidth;
            contentHeight = canvasHeight;
        } else {
            console.warn(`[LogicManager] Unknown scene name '${currentSceneName}'. Returning main game canvas dimensions as content dimensions.`);
            contentWidth = canvasWidth;
            contentHeight = canvasHeight;
        }
        // ✨ 추가: 계산된 콘텐츠 크기 확인
        console.log(`[LogicManager Debug] Scene: ${currentSceneName}, Content Dimensions: ${contentWidth}x${contentHeight}`);
        return { width: contentWidth, height: contentHeight };
    }

    /**
     * \uce74\uba54\ub77c\uc758 \ubmax\/\ubc18\uc18c \uc90c \ub808\ubca8\uc744 \ubc18\ud658\ud569\ub2c8\ub2e4.
     * \ucd5c\uc18c \uc90c \ub808\ubca8\uc740 \ucf58\ud150\uce20\uac00 \ud654\uba74\uc744 \ube48\ud73c\uc5c6\uc774 \ucc44\uc6cc \ub0a8\uc544\uc788\b294\uc9c0 \ubcfc\uc218 \uc788\uac8c \ud569\ub2c8\ub2e4.
     * @returns {{minZoom: number, maxZoom: number}} \uc90c \ubc94\uc704
     */
    getZoomLimits() {
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');
        const contentDimensions = this.getCurrentSceneContentDimensions();

        // ✨ canvasWidth 또는 canvasHeight가 유효하지 않은 경우 처리
        if (typeof canvasWidth !== 'number' || isNaN(canvasWidth) || canvasWidth <= 0) {
            console.error("[LogicManager] Invalid 'gameResolution.width' from MeasureManager. Cannot calculate zoom limits.");
            return { minZoom: 1.0, maxZoom: 10.0 };
        }
        if (typeof canvasHeight !== 'number' || isNaN(canvasHeight) || canvasHeight <= 0) {
            console.error("[LogicManager] Invalid 'gameResolution.height' from MeasureManager. Cannot calculate zoom limits.");
            return { minZoom: 1.0, maxZoom: 10.0 };
        }

        // 콘텐츠를 캔버스 너비에 맞추기 위한 줌 비율
        const minZoomX = canvasWidth / contentDimensions.width;
        // 콘텐츠를 캔버스 높이에 맞추기 위한 줌 비율
        const minZoomY = canvasHeight / contentDimensions.height;

        // 🔥 여기가 핵심 변경사항입니다.
        // 콘텐츠 전체가 화면에 '모두 보이도록' 하려면, 두 비율 중 더 작은 값을 선택해야 합니다.
        // 이전의 Math.max는 콘텐츠가 화면에 꽉 차게 보이도록 했지만, 이는 콘텐츠의 일부가 잘릴 수 있다는 의미였습니다.
        // Math.min을 사용하면 콘텐츠 전체가 보이되, 남는 공간(빈틈)이 생길 수 있습니다.
        const minZoom = Math.min(minZoomX, minZoomY); // <--- Math.max를 Math.min으로 변경했습니다.

        const maxZoom = 10.0; // 최대 줌 값 (필요에 따라 MeasureManager에서 가져올 수 있음)

        // ✨ 추가: 줌 리미트 계산 값 확인
        console.log(`[LogicManager Debug] Canvas: ${canvasWidth}x${canvasHeight}, Content: ${contentDimensions.width}x${contentDimensions.height}, minZoomX: ${minZoomX.toFixed(2)}, minZoomY: ${minZoomY.toFixed(2)}, Final minZoom: ${minZoom.toFixed(2)}`);

        return { minZoom: minZoom, maxZoom: maxZoom };
    }

    /**
     * \uc8fc\uc5b4\uc9c4 \uce74\uba54\ub77c \uc704\uce58(x, y)\ub97c \ub180\ub9c8\uc790\uc801 \uc81c\uc57d \uc870\uac74\uc5d0 \ub9de\uac8c \uc870\uc815\ud569\ub2c8\ub2e4.
     * \uc774\ub294 \ud654\uba74\uc5d0 \ube48\ud73c\uc774 \ubcf4\uc774\uc9c0 \uc54a\ub3c4\ub85d \uce74\uba54\ub77c \uc774\ub3d9\uc744 \uc81c\ud55c\ud569\ub2c8\ub2e4.
     * @param {number} currentX - \ud604\uc7ac \uce74\uba54\ub77c x \uc704\uce58
     * @param {number} currentY - \ud604\uc7ac \uce74\uba54\ub77c y \uc704\uce58
     * @param {number} currentZoom - \ud604\uc7ac \uce74\uba54\ub77c \uc90c \ub808\ubca8
     * @returns {{x: number, y: number}} \uc870\uc815\ub41c \uce74\uba54\ub77c \uc704\uce58
     */
    applyPanConstraints(currentX, currentY, currentZoom) {
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');
        const contentDimensions = this.getCurrentSceneContentDimensions();

        const effectiveContentWidth = contentDimensions.width * currentZoom;
        const effectiveContentHeight = contentDimensions.height * currentZoom;

        let clampedX = currentX;
        let clampedY = currentY;

        // X축 제약
        if (effectiveContentWidth < canvasWidth) {
            // 콘텐츠가 화면보다 작으면 중앙 정렬 (이 경우 LogicManager가 캔버스 크기를 콘텐츠로 정의했으므로, 이 조건은 currentZoom < 1.0일 때만 발생)
            clampedX = (canvasWidth - effectiveContentWidth) / 2;
        } else {
            // 콘텐츠가 화면보다 크면 이동 범위 제한
            clampedX = Math.min(0, Math.max(currentX, canvasWidth - effectiveContentWidth));
        }

        // Y축 제약
        if (effectiveContentHeight < canvasHeight) {
            // 콘텐츠가 화면보다 작으면 중앙 정렬
            clampedY = (canvasHeight - effectiveContentHeight) / 2;
        } else {
            // 콘텐츠가 화면보다 크면 이동 범위 제한
            clampedY = Math.min(0, Math.max(currentY, canvasHeight - effectiveContentHeight));
        }

        return { x: clampedX, y: clampedY };
    }

    /**
     * 게임이 시작하기 위해 필요한 최소 해상도 요구 사항을 반환합니다.
     * @returns {{minWidth: number, minHeight: number}} 최소 너비와 높이
     */
    getMinGameResolution() {
        // 이 값은 GuardianManager.js의 규칙과 동기화되어야 합니다.
        return { minWidth: 800, minHeight: 600 };
    }
}
