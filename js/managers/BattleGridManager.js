// js/managers/BattleGridManager.js

export class BattleGridManager {
    constructor(measureManager, logicManager) {
        console.log("\uD83D\uDCDC BattleGridManager initialized. Ready to draw the battlefield grid. \uD83D\uDCDC");
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

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // ✨ 핵심 변경: 그리드의 가로 및 세로 비율에 맞춰 타일 크기를 계산하고 더 작은 값을 선택
        // 캔버스 너비에 맞춰 계산된 타일 크기
        const tileSizeBasedOnWidth = gridContentWidth / this.gridCols;
        // 캔버스 높이에 맞춰 계산된 타일 크기
        const tileSizeBasedOnHeight = gridContentHeight / this.gridRows;

        // 두 값 중 더 작은 타일 크기를 선택하여 그리드가 캔버스 내에 완전히 보이도록 함
        const effectiveTileSize = Math.min(tileSizeBasedOnWidth, tileSizeBasedOnHeight);

        // 실제 그려질 그리드의 총 크기
        const totalGridWidth = effectiveTileSize * this.gridCols;
        const totalGridHeight = effectiveTileSize * this.gridRows;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        console.log(`[BattleGridManager Debug] Drawing Grid Parameters (in draw()): \n            Canvas (Logical): ${canvasWidth}x${canvasHeight}\n            Scene Content (Logical): ${sceneContentDimensions.width}x${sceneContentDimensions.height}\n            Effective Tile Size: ${effectiveTileSize.toFixed(2)}\n            Grid Offset (X, Y): ${gridOffsetX.toFixed(2)}, ${gridOffsetY.toFixed(2)}\n            Total Grid Render Size (Logical): ${totalGridWidth.toFixed(2)}x${totalGridHeight.toFixed(2)}`
        );

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;

        // 세로선 그리기
        for (let i = 0; i <= this.gridCols; i++) {
            const lineX = gridOffsetX + i * effectiveTileSize;
            console.log(`[BattleGridManager Debug] Vertical Line ${i}: X=${lineX.toFixed(2)} from Y=${gridOffsetY.toFixed(2)} to Y=${(gridOffsetY + totalGridHeight).toFixed(2)}`);
            ctx.beginPath();
            ctx.moveTo(lineX, gridOffsetY);
            ctx.lineTo(lineX, gridOffsetY + totalGridHeight);
            ctx.stroke();
        }

        // 가로선 그리기
        for (let i = 0; i <= this.gridRows; i++) {
            const lineY = gridOffsetY + i * effectiveTileSize;
            console.log(`[BattleGridManager Debug] Horizontal Line ${i}: Y=${lineY.toFixed(2)} from X=${gridOffsetX.toFixed(2)} to X=${(gridOffsetX + totalGridWidth).toFixed(2)}`);
            ctx.beginPath();
            ctx.moveTo(gridOffsetX, lineY);
            ctx.lineTo(gridOffsetX + totalGridWidth, lineY);
            ctx.stroke();
        }

        // 그리드 영역 테두리 (확인용)
        console.log(`[BattleGridManager Debug] Border Rect: X=${gridOffsetX.toFixed(2)}, Y=${gridOffsetY.toFixed(2)}, W=${totalGridWidth.toFixed(2)}, H=${totalGridHeight.toFixed(2)}`);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(gridOffsetX, gridOffsetY, totalGridWidth, totalGridHeight);
    }
}
