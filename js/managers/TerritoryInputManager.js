export class TerritoryInputManager {
    constructor(eventManager, territoryGridManager, canvas) {
        console.log("\ud83d\udcbb TerritoryInputManager initialized. Awaiting your command.");
        this.eventManager = eventManager;
        this.territoryGridManager = territoryGridManager;
        this.canvas = canvas;
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this._onClick(e));
        }
        this.onTileClick = null;
    }

    _onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.handleGridClick(x, y);
    }

    handleGridClick(mouseX, mouseY) {
        const { tileSize, offsetX, offsetY, totalWidth, totalHeight } = this.territoryGridManager.getGridParameters();
        if (mouseX < offsetX || mouseX > offsetX + totalWidth || mouseY < offsetY || mouseY > offsetY + totalHeight) {
            return;
        }
        const col = Math.floor((mouseX - offsetX) / tileSize);
        const row = Math.floor((mouseY - offsetY) / tileSize);
        const tileId = row * this.territoryGridManager.gridCols + col;
        console.log(`[TerritoryInputManager] Tile clicked: ${tileId}`);
        if (typeof this.onTileClick === 'function') {
            this.onTileClick(tileId);
        }
    }
}
