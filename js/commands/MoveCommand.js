export class MoveCommand {
    constructor(unitId, destX, destY) {
        this.unitId = unitId;
        this.destX = destX;
        this.destY = destY;
    }

    async execute({ battleSimulationManager, animationManager }) {
        const unit = battleSimulationManager.unitsOnGrid.find(u => u.id === this.unitId);
        if (!unit) return;
        const startX = unit.gridX;
        const startY = unit.gridY;
        const moved = battleSimulationManager.moveUnit(this.unitId, this.destX, this.destY);
        if (moved && animationManager) {
            await animationManager.queueMoveAnimation(this.unitId, startX, startY, this.destX, this.destY);
        }
    }
}
