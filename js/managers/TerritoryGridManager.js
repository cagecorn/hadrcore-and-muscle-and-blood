export class TerritoryGridManager {
    constructor(measureManager) {
        console.log("▦ TerritoryGridManager initialized. Laying the foundations of your city.");
        this.measureManager = measureManager;
        this.gridRows = 2;
        this.gridCols = 3;
        this.grid = this.createGridData();
    }

    createGridData() {
        const grid = [];
        for (let i = 0; i < this.gridRows; i++) {
            grid.push(Array(this.gridCols).fill(null));
        }
        grid[0][0] = { type: 'building', id: 'tavern', icon: 'tavern-icon' };
        return grid;
    }

    getGridCellBounds(row, col, canvasWidth, canvasHeight) {
        const gridAreaWidth = canvasWidth * 0.8;
        const gridAreaHeight = canvasHeight * 0.8;
        const offsetX = (canvasWidth - gridAreaWidth) / 2;
        const offsetY = (canvasHeight - gridAreaHeight) / 2;
        const cellWidth = gridAreaWidth / this.gridCols;
        const cellHeight = gridAreaHeight / this.gridRows;

        const x = offsetX + col * cellWidth;
        const y = offsetY + row * cellHeight;
        return { x, y, width: cellWidth, height: cellHeight };
    }

    getCellAtPosition(x, y, canvasWidth, canvasHeight) {
        const gridAreaWidth = canvasWidth * 0.8;
        const gridAreaHeight = canvasHeight * 0.8;
        const offsetX = (canvasWidth - gridAreaWidth) / 2;
        const offsetY = (canvasHeight - gridAreaHeight) / 2;
        const cellWidth = gridAreaWidth / this.gridCols;
        const cellHeight = gridAreaHeight / this.gridRows;

        if (x >= offsetX && x < offsetX + gridAreaWidth && y >= offsetY && y < offsetY + gridAreaHeight) {
            const col = Math.floor((x - offsetX) / cellWidth);
            const row = Math.floor((y - offsetY) / cellHeight);
            return { row, col };
        }
        return null;
    }

    draw(ctx, canvasWidth, canvasHeight, assetLoaderManager) {
        for (let i = 0; i < this.gridRows; i++) {
            for (let j = 0; j < this.gridCols; j++) {
                const bounds = this.getGridCellBounds(i, j, canvasWidth, canvasHeight);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

                const cellData = this.grid[i][j];
                if (cellData && cellData.icon) {
                    const icon = assetLoaderManager.getImage(cellData.icon);
                    if (icon) {
                        const iconX = bounds.x + (bounds.width - icon.width) / 2;
                        const iconY = bounds.y + (bounds.height - icon.height) / 2;
                        ctx.drawImage(icon, iconX, iconY);
                    }
                }
            }
        }
    }

    getTavernPosition(canvasWidth, canvasHeight) {
        const bounds = this.getGridCellBounds(0, 0, canvasWidth, canvasHeight);
        return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    }

    getBuildingAt(row, col) {
        return this.grid?.[row]?.[col];
    }
}
