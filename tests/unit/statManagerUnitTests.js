// tests/unit/statManagerUnitTests.js

import { StatManager } from '../../js/managers/StatManager.js';

export function runStatManagerUnitTests() {
    console.log("--- StatManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 모의 ValorEngine
    const mockValorEngine = {
        calculateInitialBarrier: (valorStat) => valorStat * 2,
        calculateDamageAmplification: (currentBarrier, maxBarrier) => 1.0 + (0.5 * (currentBarrier / maxBarrier))
    };

    // 모의 WeightEngine
    const mockWeightEngine = {
        calculateTotalWeight: (unitStats, equippedItems) => {
            let total = (unitStats.baseStats.weight || 0) + Math.floor((unitStats.baseStats.strength || 0) / 10);
            for (const item of equippedItems) {
                total += item.weight || 0;
            }
            return total;
        },
        getTurnWeightPenalty: (totalWeight) => totalWeight * 0.5
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const statManager = new StatManager(mockValorEngine, mockWeightEngine);
        if (statManager.valorEngine === mockValorEngine && statManager.weightEngine === mockWeightEngine) {
            console.log("StatManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("StatManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("StatManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: getCalculatedStats - 모든 스탯 포함
    testCount++;
    try {
        const statManager = new StatManager(mockValorEngine, mockWeightEngine);
        const unitData = {
            id: 'testUnit1',
            name: 'Test Warrior',
            baseStats: {
                hp: 100, valor: 50, strength: 25, endurance: 20,
                agility: 10, intelligence: 15, wisdom: 10, luck: 5,
                weight: 30
            }
        };
        const equippedItems = [{ weight: 5 }];

        const stats = statManager.getCalculatedStats(unitData, equippedItems);

        const expectedBarrier = 50 * 2;
        const expectedTotalWeight = 30 + Math.floor(25 / 10) + 5;
        const expectedTurnPenalty = expectedTotalWeight * 0.5;

        if (
            stats.hp === 100 &&
            stats.valor === 50 &&
            stats.strength === 25 &&
            stats.barrier === expectedBarrier &&
            stats.totalWeight === expectedTotalWeight &&
            stats.turnWeightPenalty === expectedTurnPenalty &&
            stats.physicalAttack === 25 * 1.5 &&
            stats.physicalDefense === 20 * 1.2 &&
            stats.magicAttack === 15 * 1.5 &&
            stats.magicDefense === 10 * 1.2 &&
            stats.physicalEvadeChance === 10 * 0.2 &&
            stats.accuracy === 10 * 0.15 &&
            stats.magicEvadeChance === 5 * 0.1 &&
            stats.criticalChance === 5 * 0.05 &&
            stats.criticalDamageMultiplier === 1.5 &&
            stats.statusEffectResistance === 20 * 0.1 &&
            stats.statusEffectApplication === 15 * 0.1
        ) {
            console.log("StatManager: getCalculatedStats calculated all stats correctly. [PASS]");
            passCount++;
        } else {
            console.error("StatManager: getCalculatedStats failed to calculate all stats correctly. [FAIL]", stats);
        }
    } catch (e) {
        console.error("StatManager: Error during getCalculatedStats (all stats) test. [FAIL]", e);
    }

    // 테스트 3: getCalculatedStats - baseStats 없을 때
    testCount++;
    try {
        const statManager = new StatManager(mockValorEngine, mockWeightEngine);
        const unitData = { id: 'testUnit2', name: 'No Stats Unit' };
        const stats = statManager.getCalculatedStats(unitData);

        if (Object.keys(stats).length > 0 && stats.hp === 0 && stats.valor === 0) {
            console.log("StatManager: getCalculatedStats handles missing baseStats gracefully. [PASS]");
            passCount++;
        } else {
            console.error("StatManager: getCalculatedStats failed to handle missing baseStats. [FAIL]", stats);
        }
    } catch (e) {
        console.error("StatManager: Error during getCalculatedStats (no baseStats) test. [FAIL]", e);
    }

    // 테스트 4: updateDamageAmplification
    testCount++;
    try {
        const statManager = new StatManager(mockValorEngine, mockWeightEngine);
        const currentBarrier = 75;
        const maxBarrier = 100;
        const expectedAmplification = mockValorEngine.calculateDamageAmplification(currentBarrier, maxBarrier);
        const calculatedAmplification = statManager.updateDamageAmplification(currentBarrier, maxBarrier);

        if (calculatedAmplification === expectedAmplification) {
            console.log("StatManager: updateDamageAmplification delegates correctly to ValorEngine. [PASS]");
            passCount++;
        } else {
            console.error("StatManager: updateDamageAmplification delegation failed. [FAIL]", calculatedAmplification);
        }
    } catch (e) {
        console.error("StatManager: Error during updateDamageAmplification test. [FAIL]", e);
    }

    console.log(`--- StatManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
