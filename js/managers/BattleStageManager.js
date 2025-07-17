// js/managers/BattleStageManager.js

export class BattleStageManager {
    constructor(assetLoaderManager) {
        console.log("🏟️ BattleStageManager initialized. Preparing the arena. 🏟️");
        this.assetLoaderManager = assetLoaderManager; // AssetLoaderManager 저장
        this.backgroundImage = null; // 배경 이미지 객체
    }

    /**
     * 전투 스테이지를 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        // 캔버스의 논리적(CSS) 너비와 높이를 가져옵니다.
        // ctx.canvas.width는 실제 픽셀 너비이므로, pixelRatio로 나누어 논리적 너비를 얻습니다.
        const logicalWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
        const logicalHeight = ctx.canvas.height / (window.devicePixelRatio || 1);

        if (!this.backgroundImage) {
            // 이미지가 로드되지 않았다면 로드 시도
            this.backgroundImage = this.assetLoaderManager.getImage('sprite_battle_stage_forest');
            if (!this.backgroundImage) {
                console.warn("[BattleStageManager] Battle stage background image not loaded. Using fallback color.");
                ctx.fillStyle = '#6A5ACD'; // 대체 색상 (보라색)
                ctx.fillRect(0, 0, logicalWidth, logicalHeight);
                return;
            }
        }

        // 배경 이미지를 논리적 캔버스 크기에 맞춰 그립니다.
        ctx.drawImage(this.backgroundImage, 0, 0, logicalWidth, logicalHeight);

    }
}
