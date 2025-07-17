// js/managers/TurnOrderManager.js

export class TurnOrderManager {
    constructor(eventManager, battleSimulationManager, weightEngine) {
        console.log("\uD83D\uDCDC TurnOrderManager initialized. Ready to compute turn sequences. \uD83D\uDCDC");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.weightEngine = weightEngine;
        this.currentTurnOrder = [];
    }

    /**
     * 현재 전장에 있는 유닛들의 턴 순서를 계산하여 설정합니다.
     * (예: 속도 스탯 기반으로 정렬)
     * @returns {object[]} 계산된 턴 순서 유닛 배열
     */
    calculateTurnOrder() {
        const units = this.battleSimulationManager.unitsOnGrid;
        this.currentTurnOrder = [...units].sort((a, b) => {
            const speedA = a.baseStats ? a.baseStats.speed : 0;
            const speedB = b.baseStats ? b.baseStats.speed : 0;

            const penaltyA = this.weightEngine.getTurnWeightPenalty(
                this.weightEngine.calculateTotalWeight(a, [])
            );
            const penaltyB = this.weightEngine.getTurnWeightPenalty(
                this.weightEngine.calculateTotalWeight(b, [])
            );

            const initiativeA = speedA - penaltyA;
            const initiativeB = speedB - penaltyB;

            return initiativeB - initiativeA;
        });
        console.log("[TurnOrderManager] Calculated turn order:", this.currentTurnOrder.map(unit => `${unit.name} (Initiative: ${( (unit.baseStats.speed || 0) - this.weightEngine.getTurnWeightPenalty(this.weightEngine.calculateTotalWeight(unit, []))).toFixed(2)})`));
        return this.currentTurnOrder;
    }

    /**
     * 현재 활성화된 턴 순서 배열을 반환합니다.
     * @returns {object[]}
     */
    getTurnOrder() {
        return this.currentTurnOrder;
    }

    /**
     * 특정 유닛을 턴 순서에서 제거합니다. (예: 유닛 사망 시)
     * @param {string} unitId - 제거할 유닛의 ID
     */
    removeUnitFromOrder(unitId) {
        const initialLength = this.currentTurnOrder.length;
        this.currentTurnOrder = this.currentTurnOrder.filter(unit => unit.id !== unitId);
        if (this.currentTurnOrder.length < initialLength) {
            console.log(`[TurnOrderManager] Unit '${unitId}' removed from turn order.`);
        }
    }

    /**
     * 턴 순서를 초기화합니다.
     */
    clearTurnOrder() {
        this.currentTurnOrder = [];
        console.log("[TurnOrderManager] Turn order cleared.");
    }
}
