export class TerritoryInputManager {
    constructor(canvas, territoryGridManager, territoryUIManager) {
        console.log("🖱️ TerritoryInputManager initialized. Awaiting your command.");
        this.canvas = canvas;
        this.territoryGridManager = territoryGridManager;
        this.territoryUIManager = territoryUIManager;
        this.hoveredTile = null;

        this._onMouseMove = (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            this.handleMouseMove(mouseX, mouseY, this.canvas.width, this.canvas.height);
        };

        this._onMouseDown = (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            this.handleMouseClick(mouseX, mouseY, this.canvas.width, this.canvas.height);
        };

        if (this.canvas) {
            this.canvas.addEventListener('mousemove', this._onMouseMove);
            this.canvas.addEventListener('mousedown', this._onMouseDown);
        }
    }

    cleanup() {
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this._onMouseMove);
            this.canvas.removeEventListener('mousedown', this._onMouseDown);
        }
        this.territoryUIManager.hideTooltip();
        this.territoryUIManager.stopAnimation('tavern-icon');
        console.log('[TerritoryInputManager] Event listeners removed.');
    }

    handleMouseClick(mouseX, mouseY, canvasWidth, canvasHeight) {
        const clickedCell = this.territoryGridManager.getCellAtPosition(mouseX, mouseY, canvasWidth, canvasHeight);
        if (clickedCell && this.territoryGridManager.getBuildingAt(clickedCell.row, clickedCell.col)?.id === 'tavern') {
            console.log("여관 타일 클릭!");
            // 여관 클릭 시 로직 (추후 구현)
        }
    }

    handleMouseMove(mouseX, mouseY, canvasWidth, canvasHeight) {
        const hoveredCell = this.territoryGridManager.getCellAtPosition(mouseX, mouseY, canvasWidth, canvasHeight);
        if (hoveredCell) {
            const building = this.territoryGridManager.getBuildingAt(hoveredCell.row, hoveredCell.col);
            if (building?.id === 'tavern') {
                this.hoveredTile = { row: hoveredCell.row, col: hoveredCell.col };
                this.territoryUIManager.showTooltip('여관', mouseX, mouseY);
                this.territoryUIManager.animateIcon('tavern-icon');
            } else {
                this.hoveredTile = null;
                this.territoryUIManager.hideTooltip();
                this.territoryUIManager.stopAnimation('tavern-icon');
            }
        } else {
            this.hoveredTile = null;
            this.territoryUIManager.hideTooltip();
            this.territoryUIManager.stopAnimation('tavern-icon');
        }
    }
}

