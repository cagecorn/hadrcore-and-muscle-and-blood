// tests/unit/diceBotEngineUnitTests.js

import { DiceBotEngine } from '../../js/managers/DiceBotEngine.js';
import { DiceEngine } from '../../js/managers/DiceEngine.js';

export function runDiceBotEngineUnitTests() {
    console.log("--- DiceBotEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockDiceEngine = {
        getRandomFloatResults: [],
        getRandomFloatIndex: 0,
        getRandomIntResults: [],
        getRandomIntIndex: 0,
        getRandomFloat: function () {
            const result = this.getRandomFloatResults[this.getRandomFloatIndex % this.getRandomFloatResults.length] || 0.5;
            this.getRandomFloatIndex++;
            return result;
        },
        getRandomInt: function (min, max) {
            const result = this.getRandomIntResults[this.getRandomIntIndex % this.getRandomIntResults.length] || min;
            this.getRandomIntIndex++;
            return result;
        },
        rollD: (sides) => Math.floor(Math.random() * sides) + 1
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const dbm = new DiceBotEngine(mockDiceEngine);
        if (dbm.diceEngine === mockDiceEngine) {
            console.log("DiceBotEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("DiceBotEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("DiceBotEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: pickWeightedRandom - 가중치에 따라 아이템 선택
    testCount++;
    mockDiceEngine.getRandomFloatResults = [0.4];
    mockDiceEngine.getRandomFloatIndex = 0;
    try {
        const dbm = new DiceBotEngine(mockDiceEngine);
        const lootTable = [
            { item: 'itemA', weight: 3 },
            { item: 'itemB', weight: 4 },
            { item: 'itemC', weight: 3 }
        ];
        const result = dbm.pickWeightedRandom(lootTable);
        if (result && result.item === 'itemB') {
            console.log("DiceBotEngine: pickWeightedRandom selected itemB correctly. [PASS]");
            passCount++;
        } else {
            console.error(`DiceBotEngine: pickWeightedRandom failed. Expected itemB, got ${result ? result.item : 'null'}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceBotEngine: Error during pickWeightedRandom test. [FAIL]", e);
    }

    // 테스트 3: pickWeightedRandom - 빈 테이블
    testCount++;
    try {
        const dbm = new DiceBotEngine(mockDiceEngine);
        const result = dbm.pickWeightedRandom([]);
        if (result === null) {
            console.log("DiceBotEngine: pickWeightedRandom handles empty table gracefully. [PASS]");
            passCount++;
        } else {
            console.error(`DiceBotEngine: pickWeightedRandom failed for empty table. Expected null, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceBotEngine: Error during pickWeightedRandom (empty table) test. [FAIL]", e);
    }

    // 테스트 4: performGachaRoll
    testCount++;
    mockDiceEngine.getRandomFloatResults = [0.8];
    mockDiceEngine.getRandomFloatIndex = 0;
    try {
        const dbm = new DiceBotEngine(mockDiceEngine);
        const gachaTable = [
            { item: 'common sword', rarity: 'common', weight: 70 },
            { item: 'rare shield', rarity: 'rare', weight: 20 },
            { item: 'legendary artifact', rarity: 'legendary', weight: 10 }
        ];
        const result = dbm.performGachaRoll(gachaTable);
        if (result && result.item === 'legendary artifact' && result.rarity === 'legendary') {
            console.log("DiceBotEngine: performGachaRoll returned legendary artifact correctly. [PASS]");
            passCount++;
        } else {
            console.error(`DiceBotEngine: performGachaRoll failed. Expected legendary artifact, got ${result ? result.item : 'null'}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceBotEngine: Error during performGachaRoll test. [FAIL]", e);
    }

    // 테스트 5: getRandomGridCoordinate
    testCount++;
    mockDiceEngine.getRandomIntResults = [5, 3];
    mockDiceEngine.getRandomIntIndex = 0;
    try {
        const dbm = new DiceBotEngine(mockDiceEngine);
        const coord = dbm.getRandomGridCoordinate(1, 10, 1, 5);
        if (coord.x === 5 && coord.y === 3) {
            console.log("DiceBotEngine: getRandomGridCoordinate returned correct coordinates. [PASS]");
            passCount++;
        } else {
            console.error(`DiceBotEngine: getRandomGridCoordinate failed. Expected (5, 3), got (${coord.x}, ${coord.y}). [FAIL]`);
        }
    } catch (e) {
        console.error("DiceBotEngine: Error during getRandomGridCoordinate test. [FAIL]", e);
    }

    console.log(`--- DiceBotEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
