// js/managers/DiceBotEngine.js

export class DiceBotEngine {
    /**
     * 게임의 모든 무작위 요소를 총괄하는 엔진입니다.
     * @param {DiceEngine} diceEngine - 기본적인 주사위 굴림 기능을 제공하는 엔진
     */
    constructor(diceEngine) {
        console.log("\uD83C\uDFB2 DiceBotEngine initialized. The master of fate and fortune is ready. \uD83C\uDFB2");
        this.diceEngine = diceEngine;
    }

    /**
     * 가중치가 적용된 테이블에서 무작위 항목을 선택합니다.
     * @param {Array<Object>} table - { item: '아이템명', weight: 숫자 } 형식의 배열
     * @returns {Object | null} 선택된 항목 또는 null
     */
    pickWeightedRandom(table) {
        if (!table || table.length === 0) {
            console.warn("[DiceBotEngine] The provided table for weighted random is empty.");
            return null;
        }

        const totalWeight = table.reduce((sum, entry) => sum + (entry.weight || 0), 0);
        if (totalWeight <= 0) {
            console.warn("[DiceBotEngine] Total weight of the table is zero. Cannot pick an item.");
            return null;
        }

        const randomNumber = this.diceEngine.getRandomFloat() * totalWeight;
        let cumulativeWeight = 0;

        for (const entry of table) {
            cumulativeWeight += entry.weight || 0;
            if (randomNumber < cumulativeWeight) {
                return entry;
            }
        }
        console.warn("[DiceBotEngine] Failed to pick a weighted random item. This should not happen if weights are positive.");
        return null;
    }

    /**
     * 주어진 목록에서 중복되지 않는 여러 개의 항목을 무작위로 선택합니다.
     * @param {Array<any>} itemList - 선택할 항목들이 들어있는 배열
     * @param {number} count - 선택할 항목의 개수
     * @returns {Array<any>} 무작위로 선택된, 중복 없는 항목들의 배열
     */
    pickUniqueItems(itemList, count) {
        if (!itemList || itemList.length < count) {
            console.error(`[DiceBotEngine] Cannot pick ${count} unique items from a list of size ${itemList ? itemList.length : 0}.`);
            return [];
        }

        const shuffled = [...itemList];
        let currentIndex = shuffled.length;
        let randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(this.diceEngine.getRandomFloat() * currentIndex);
            currentIndex--;
            [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
        }

        return shuffled.slice(0, count);
    }

    /**
     * 가챠 시스템을 시뮬레이션합니다.
     * @param {Array<Object>} gachaTable - { item: '아이템명', rarity: '희귀도', weight: 숫자 } 형식의 배열
     * @returns {Object | null} 획득한 가챠 아이템 또는 null
     */
    performGachaRoll(gachaTable) {
        const result = this.pickWeightedRandom(gachaTable);
        if (result) {
            console.log(`[DiceBotEngine] Gacha Roll Result: ${result.item || 'N/A'} (Rarity: ${result.rarity || 'N/A'})`);
        } else {
            console.log("[DiceBotEngine] Gacha Roll Result: Nothing found.");
        }
        return result;
    }
}

