// js/managers/DiceBotManager.js

export class DiceBotManager {
    constructor(diceEngine) {
        console.log("\uD83E\uDD16 DiceBotManager initialized. Ready for random spawns and gacha. \uD83E\uDD16");
        this.diceEngine = diceEngine;
    }

    /**
     * 가중치가 적용된 테이블에서 무작위 항목을 선택합니다.
     * (예: 아이템 드롭, 용병 가챠 등)
     * @param {Array<Object>} lootTable - { item: '아이템명', weight: 숫자 } 형식의 배열
     * @returns {Object | null} 선택된 항목 또는 null
     */
    pickWeightedRandom(lootTable) {
        let totalWeight = 0;
        for (const entry of lootTable) {
            totalWeight += entry.weight || 0;
        }

        if (totalWeight === 0) {
            console.warn("[DiceBotManager] Loot table has no weight. Returning null.");
            return null;
        }

        const randomNumber = this.diceEngine.getRandomFloat() * totalWeight;

        let cumulativeWeight = 0;
        for (const entry of lootTable) {
            cumulativeWeight += entry.weight || 0;
            if (randomNumber < cumulativeWeight) {
                console.log(`[DiceBotManager] Picked weighted random item: ${entry.item || 'N/A'}`);
                return entry;
            }
        }
        console.warn("[DiceBotManager] Failed to pick weighted random item. This should not happen.");
        return null; // Fallback
    }

    /**
     * 가챠 시스템을 시뮬레이션합니다.
     * @param {Array<Object>} gachaTable - { item: '아이템명', rarity: '희귀도', weight: 숫자 } 형식의 배열
     * @returns {Object | null} 획득한 가챠 아이템 또는 null
     */
    performGachaRoll(gachaTable) {
        const result = this.pickWeightedRandom(gachaTable);
        if (result) {
            console.log(`[DiceBotManager] Gacha Roll Result: ${result.item || 'N/A'} (Rarity: ${result.rarity || 'N/A'})`);
        } else {
            console.log("[DiceBotManager] Gacha Roll Result: Nothing found.");
        }
        return result;
    }

    /**
     * 특정 범위 내에서 무작위 그리드 좌표를 생성합니다.
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minY
     * @param {number} maxY
     * @returns {{x: number, y: number}} 무작위 그리드 좌표
     */
    getRandomGridCoordinate(minX, maxX, minY, maxY) {
        const x = this.diceEngine.getRandomInt(minX, maxX);
        const y = this.diceEngine.getRandomInt(minY, maxY);
        console.log(`[DiceBotManager] Random grid coordinate: (${x}, ${y})`);
        return { x, y };
    }
}
