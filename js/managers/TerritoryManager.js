// js/managers/TerritoryManager.js

export class TerritoryManager {
    constructor() {
        console.log("\ud83c\udf33 TerritoryManager initialized. Ready to oversee the domain. \ud83c\udf33");
    }

    draw(ctx) {
        // 경로의 css 크기를 기본으로 그림을 진행
        // Renderer 에서 pixelRatio 를 적용하면서 canvas.width/그 포로는 무리적 크기를 반환하고 있으므로
        // draw 방법에서는 css 크기를 사용하는 것이 맞다.
        const pixelRatio = window.devicePixelRatio || 1;
        const logicalWidth = ctx.canvas.width / pixelRatio;
        const logicalHeight = ctx.canvas.height / pixelRatio;

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
