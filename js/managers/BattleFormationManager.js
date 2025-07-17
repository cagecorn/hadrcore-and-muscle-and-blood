// js/managers/BattleFormationManager.js

export class BattleFormationManager {
    constructor(battleSimulationManager) {
        console.log("\uD83D\uDCCB BattleFormationManager initialized. Arranging heroes for battle. \uD83D\uDCCB");
        this.battleSimulationManager = battleSimulationManager;
    }

    /**
     * 제공된 아군 유닛들을 지정된 포메이션에 따라 배치합니다.
     * @param {object[]} allyUnits - 배치할 아군 유닛 데이터 배열
     */
    placeAllies(allyUnits) {
        const formationPositions = [
            { x: 2, y: 3 }, { x: 2, y: 5 }, { x: 4, y: 4 },
            { x: 4, y: 2 }, { x: 4, y: 6 }, { x: 0, y: 4 }
            // 필요하다면 더 많은 포지션 추가
        ];

        for (const unit of allyUnits) {
            const placedAlliesCount = this.battleSimulationManager.unitsOnGrid.filter(u => u.type === 'mercenary').length;

            if (placedAlliesCount < formationPositions.length) {
                const pos = formationPositions[placedAlliesCount];
                unit.gridX = pos.x;
                unit.gridY = pos.y;
                const unitImage = this.battleSimulationManager.assetLoaderManager.getImage(unit.spriteId);
                this.battleSimulationManager.addUnit(unit, unitImage, pos.x, pos.y);
                console.log(`[BattleFormationManager] Placed ${unit.name} at (${pos.x}, ${pos.y})`);
            } else {
                console.warn(`[BattleFormationManager] No available slots to place ${unit.name}.`);
            }
        }
    }
}
