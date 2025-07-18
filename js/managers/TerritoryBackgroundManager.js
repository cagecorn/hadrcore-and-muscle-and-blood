export class TerritoryBackgroundManager {
    constructor(assetLoaderManager) {
        console.log("\ud83c\udfde\ufe0f TerritoryBackgroundManager initialized. Managing the view of your lands.");
        this.backgroundImage = assetLoaderManager.getImage('territory_background');
        this.assetLoaderManager = assetLoaderManager;
    }

    draw(ctx) {
        if (!this.backgroundImage) {
            this.backgroundImage = this.assetLoaderManager.getImage('territory_background');
        }

        if (this.backgroundImage) {
            const pixelRatio = window.devicePixelRatio || 1;
            const logicalWidth = ctx.canvas.width / pixelRatio;
            const logicalHeight = ctx.canvas.height / pixelRatio;
            ctx.drawImage(this.backgroundImage, 0, 0, logicalWidth, logicalHeight);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
}
