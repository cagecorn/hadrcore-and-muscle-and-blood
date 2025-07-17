// js/managers/TerritoryManager.js

export class TerritoryManager {
    constructor() {
        console.log("\ud83c\udf33 TerritoryManager initialized. Ready to oversee the domain. \ud83c\udf33");
    }

    draw(ctx) {
        // Renderer에서 전달된 컨텍스트의 캔버스 크기를 그대로 사용하여 그립니다.
        // 별도의 Renderer 의존성을 두지 않고 독립적으로 동작하도록 수정했습니다.
        const logicalWidth = ctx.canvas.width;
        const logicalHeight = ctx.canvas.height;

        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);

        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('나의 영지', logicalWidth / 2, logicalHeight / 2 - 50);

        ctx.font = '24px Arial';
        ctx.fillText('영지에서 모험을 준비하세요!', logicalWidth / 2, logicalHeight / 2 + 30);
    }
}
