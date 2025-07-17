// js/managers/BattleGridManager.js
import { GAME_DEBUG_MODE } from '../constants.js';

export class BattleGridManager {
    constructor(measureManager, logicManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDCDC BattleGridManager initialized. Ready to draw the battlefield grid. \uD83D\uDCDC");
        this.measureManager = measureManager;
        this.logicManager = logicManager;
        this.gridRows = 9;  // 16:9 비율에 맞춘 행 수
        this.gridCols = 16; // 16:9 비율에 맞춘 열 수
    }

    /**
     * 전투 그리드를 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        const sceneContentDimensions = this.logicManager.getCurrentSceneContentDimensions(); // 순수 그리드 컨텐츠 크기 (gameResolution)
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        const tileSizeBasedOnWidth = gridContentWidth / this.gridCols;
        const tileSizeBasedOnHeight = gridContentHeight / this.gridRows;

        const effectiveTileSize = Math.min(tileSizeBasedOnWidth, tileSizeBasedOnHeight);

        const totalGridWidth = effectiveTileSize * this.gridCols;
        const totalGridHeight = effectiveTileSize * this.gridRows;

        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        // --- 여기부터 수정됩니다 ---

        // 선 색상의 alpha 값을 0으로 만들어 투명하게 처리합니다.
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.0)';
        ctx.lineWidth = 1;

        // 세로선 그리기
        for (let i = 0; i <= this.gridCols; i++) {
            const lineX = gridOffsetX + i * effectiveTileSize;
            ctx.beginPath();
            ctx.moveTo(lineX, gridOffsetY);
            ctx.lineTo(lineX, gridOffsetY + totalGridHeight);
            ctx.stroke();
        }

        // 가로선 그리기
        for (let i = 0; i <= this.gridRows; i++) {
            const lineY = gridOffsetY + i * effectiveTileSize;
            ctx.beginPath();
            ctx.moveTo(gridOffsetX, lineY);
            ctx.lineTo(gridOffsetX + totalGridWidth, lineY);
            ctx.stroke();
        }

        // 그리드 영역 테두리 (확인용)도 투명하게 처리합니다.
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.0)';
        ctx.lineWidth = 2;
        ctx.strokeRect(gridOffsetX, gridOffsetY, totalGridWidth, totalGridHeight);
    }
}
