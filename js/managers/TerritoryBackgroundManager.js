/**
 * Draws the background image for the territory scene.
 * If the image is missing a black fill is used instead.
 */
export class TerritoryBackgroundManager {
    constructor(assetLoaderManager) {
        console.log("🖼️ TerritoryBackgroundManager initialized. Managing the view of your lands.");
        // Grab the preloaded image from the asset loader
        this.backgroundImage = assetLoaderManager.getImage('territory_background');
    }

    draw(ctx) {
        const pixelRatio = window.devicePixelRatio || 1;
        const logicalWidth = ctx.canvas.width / pixelRatio;
        const logicalHeight = ctx.canvas.height / pixelRatio;

        if (this.backgroundImage) {
            // Fit the background image to the canvas
            ctx.drawImage(this.backgroundImage, 0, 0, logicalWidth, logicalHeight);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, logicalWidth, logicalHeight);
            console.warn('[TerritoryBackgroundManager] Background image not loaded.');
        }
    }
}
