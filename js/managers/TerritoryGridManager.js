export class TerritoryGridManager {
    constructor(measureManager) {
        console.log("\u25a6 TerritoryGridManager initialized. Laying the foundations of your city.");
        this.measureManager = measureManager;
        this.gridRows = 2;
        this.gridCols = 3;
    }

    getGridParameters() {
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');
        const tileSize = Math.min(
            canvasWidth / (this.gridCols + 2),
            canvasHeight / (this.gridRows + 2)
        );
        const totalWidth = tileSize * this.gridCols;
        const totalHeight = tileSize * this.gridRows;
        const offsetX = (canvasWidth - totalWidth) / 2;
        const offsetY = (canvasHeight - totalHeight) / 2;
        return { tileSize, offsetX, offsetY, totalWidth, totalHeight };
    }

    draw(ctx) {
        const { tileSize, offsetX, offsetY, totalWidth, totalHeight } = this.getGridParameters();

        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;

        // vertical lines
        for (let i = 0; i <= this.gridCols; i++) {
            const x = offsetX + i * tileSize;
            ctx.beginPath();
            ctx.moveTo(x, offsetY);
            ctx.lineTo(x, offsetY + totalHeight);
            ctx.stroke();
        }

        // horizontal lines
        for (let i = 0; i <= this.gridRows; i++) {
            const y = offsetY + i * tileSize;
            ctx.beginPath();
            ctx.moveTo(offsetX, y);
            ctx.lineTo(offsetX + totalWidth, y);
            ctx.stroke();
        }
    }
}
