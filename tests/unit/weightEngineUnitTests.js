// tests/unit/weightEngineUnitTests.js

import { WeightEngine } from '../../js/managers/WeightEngine.js';

export function runWeightEngineUnitTests() {
    console.log("--- WeightEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const weightEngine = new WeightEngine();
        if (weightEngine) {
            console.log("WeightEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("WeightEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("WeightEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: calculateTotalWeight - 기본 유닛 스탯만 있을 때
    testCount++;
    try {
        const weightEngine = new WeightEngine();
        const unitStats = { baseStats: { weight: 20, strength: 0 } };
        const expectedWeight = 20;
        const calculatedWeight = weightEngine.calculateTotalWeight(unitStats);

        if (calculatedWeight === expectedWeight) {
            console.log(`WeightEngine: calculateTotalWeight (base only) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`WeightEngine: calculateTotalWeight (base only) failed. Expected ${expectedWeight}, got ${calculatedWeight}. [FAIL]`);
        }
    } catch (e) {
        console.error("WeightEngine: Error during calculateTotalWeight (base only) test. [FAIL]", e);
    }

    // 테스트 3: calculateTotalWeight - 힘 스탯이 있을 때
    testCount++;
    try {
        const weightEngine = new WeightEngine();
        const unitStats = { baseStats: { weight: 20, strength: 30 } };
        const expectedWeight = 20 + 3;
        const calculatedWeight = weightEngine.calculateTotalWeight(unitStats);

        if (calculatedWeight === expectedWeight) {
            console.log(`WeightEngine: calculateTotalWeight (with strength) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`WeightEngine: calculateTotalWeight (with strength) failed. Expected ${expectedWeight}, got ${calculatedWeight}. [FAIL]`);
        }
    } catch (e) {
        console.error("WeightEngine: Error during calculateTotalWeight (with strength) test. [FAIL]", e);
    }

    // 테스트 4: calculateTotalWeight - 아이템이 있을 때
    testCount++;
    try {
        const weightEngine = new WeightEngine();
        const unitStats = { baseStats: { weight: 20, strength: 10 } };
        const equippedItems = [{ weight: 5 }, { weight: 10 }];
        const expectedWeight = 20 + 1 + 5 + 10;
        const calculatedWeight = weightEngine.calculateTotalWeight(unitStats, equippedItems);

        if (calculatedWeight === expectedWeight) {
            console.log(`WeightEngine: calculateTotalWeight (with items) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`WeightEngine: calculateTotalWeight (with items) failed. Expected ${expectedWeight}, got ${calculatedWeight}. [FAIL]`);
        }
    } catch (e) {
        console.error("WeightEngine: Error during calculateTotalWeight (with items) test. [FAIL]", e);
    }

    // 테스트 5: getTurnWeightPenalty - 기본 계산
    testCount++;
    try {
        const weightEngine = new WeightEngine();
        const totalWeight = 50;
        const expectedPenalty = totalWeight * 0.5;
        const calculatedPenalty = weightEngine.getTurnWeightPenalty(totalWeight);

        if (calculatedPenalty === expectedPenalty) {
            console.log(`WeightEngine: getTurnWeightPenalty (${totalWeight}) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`WeightEngine: getTurnWeightPenalty (${totalWeight}) failed. Expected ${expectedPenalty}, got ${calculatedPenalty}. [FAIL]`);
        }
    } catch (e) {
        console.error("WeightEngine: Error during getTurnWeightPenalty test. [FAIL]", e);
    }

    // 테스트 6: getTurnWeightPenalty - 무게 0일 때
    testCount++;
    try {
        const weightEngine = new WeightEngine();
        const totalWeight = 0;
        const expectedPenalty = 0;
        const calculatedPenalty = weightEngine.getTurnWeightPenalty(totalWeight);

        if (calculatedPenalty === expectedPenalty) {
            console.log(`WeightEngine: getTurnWeightPenalty (${totalWeight}) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`WeightEngine: getTurnWeightPenalty (${totalWeight}) failed. Expected ${expectedPenalty}, got ${calculatedPenalty}. [FAIL]`);
        }
    } catch (e) {
        console.error("WeightEngine: Error during getTurnWeightPenalty (zero weight) test. [FAIL]", e);
    }

    console.log(`--- WeightEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
