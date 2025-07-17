// tests/unit/diceRollManagerUnitTests.js

import { DiceRollManager } from '../../js/managers/DiceRollManager.js';
import { DiceEngine } from '../../js/managers/DiceEngine.js';


export function runDiceRollManagerUnitTests() {
    console.log("--- DiceRollManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockDiceEngine = {
        rollDResults: [],
        rollDIndex: 0,
        rollD: function (sides) {
            const result = this.rollDResults[this.rollDIndex % this.rollDResults.length] || 1;
            this.rollDIndex++;
            return result;
        },
        getRandomFloat: () => Math.random(),
        getRandomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
    };

    const mockValorEngine = {
        calculateDamageAmplification: () => 1.0
    };

    const mockStatusEffectManager = {
        getUnitActiveEffects: () => null
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        if (drm.diceEngine === mockDiceEngine) {
            console.log("DiceRollManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("DiceRollManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("DiceRollManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: rollDice (2d6, 고정 결과)
    testCount++;
    mockDiceEngine.rollDResults = [3, 4];
    mockDiceEngine.rollDIndex = 0;
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        const result = drm.rollDice(2, 6);
        if (result === 7) {
            console.log("DiceRollManager: rollDice(2, 6) returned correct sum. [PASS]");
            passCount++;
        } else {
            console.error(`DiceRollManager: rollDice(2, 6) failed. Expected 7, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceRollManager: Error during rollDice test. [FAIL]", e);
    }

    // 테스트 3: rollWithAdvantage (d20, 고정 결과)
    testCount++;
    mockDiceEngine.rollDResults = [10, 15];
    mockDiceEngine.rollDIndex = 0;
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        const result = drm.rollWithAdvantage(20);
        if (result === 15) {
            console.log("DiceRollManager: rollWithAdvantage returned correct higher value. [PASS]");
            passCount++;
        } else {
            console.error(`DiceRollManager: rollWithAdvantage failed. Expected 15, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceRollManager: Error during rollWithAdvantage test. [FAIL]", e);
    }

    // 테스트 4: rollWithDisadvantage (d20, 고정 결과)
    testCount++;
    mockDiceEngine.rollDResults = [12, 5];
    mockDiceEngine.rollDIndex = 0;
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        const result = drm.rollWithDisadvantage(20);
        if (result === 5) {
            console.log("DiceRollManager: rollWithDisadvantage returned correct lower value. [PASS]");
            passCount++;
        } else {
            console.error(`DiceRollManager: rollWithDisadvantage failed. Expected 5, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceRollManager: Error during rollWithDisadvantage test. [FAIL]", e);
    }

    // 테스트 5: performDamageRoll (물리 공격)
    testCount++;
    mockDiceEngine.rollDResults = [6, 6];
    mockDiceEngine.rollDIndex = 0;
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        const attackerUnit = { baseStats: { attack: 10 }, currentBarrier: 0, maxBarrier: 0 };
        const skillData = { type: 'physical', dice: { num: 2, sides: 6 } };
        const result = drm.performDamageRoll(attackerUnit, skillData);
        if (result === 22) {
            console.log("DiceRollManager: performDamageRoll (physical) calculated correctly. [PASS]");
            passCount++;
        } else {
            console.error(`DiceRollManager: performDamageRoll (physical) failed. Expected 22, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceRollManager: Error during performDamageRoll (physical) test. [FAIL]", e);
    }

    // 테스트 6: performDamageRoll (마법 공격)
    testCount++;
    mockDiceEngine.rollDResults = [4];
    mockDiceEngine.rollDIndex = 0;
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        const attackerUnit = { baseStats: { magic: 15 }, currentBarrier: 0, maxBarrier: 0 };
        const skillData = { type: 'magic', dice: { num: 1, sides: 8 } };
        const result = drm.performDamageRoll(attackerUnit, skillData);
        if (result === 19) {
            console.log("DiceRollManager: performDamageRoll (magic) calculated correctly. [PASS]");
            passCount++;
        } else {
            console.error(`DiceRollManager: performDamageRoll (magic) failed. Expected 19, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceRollManager: Error during performDamageRoll (magic) test. [FAIL]", e);
    }

    // 테스트 7: 버프 상태 적용 시 공격력 증가 확인
    testCount++;
    mockDiceEngine.rollDResults = [5];
    mockDiceEngine.rollDIndex = 0;
    mockStatusEffectManager.getUnitActiveEffects = () => new Map([
        ['status_battle_cry', { effectData: { effect: { attackModifier: 1.5 } } }]
    ]);
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        const attackerUnit = { id: 'test', baseStats: { attack: 10 }, currentBarrier: 0, maxBarrier: 0 };
        const skillData = { type: 'physical', dice: { num: 1, sides: 6 } };
        const result = drm.performDamageRoll(attackerUnit, skillData);
        if (result === 22) {
            console.log("DiceRollManager: attack modifier applied correctly. [PASS]");
            passCount++;
        } else {
            console.error(`DiceRollManager: attack modifier failed. Expected 22, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceRollManager: Error during attack modifier test. [FAIL]", e);
    }

    // 테스트 8: performSavingThrow (성공)
    testCount++;
    mockDiceEngine.rollDResults = [18];
    mockDiceEngine.rollDIndex = 0;
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        const unitStats = { strength: 3 };
        const difficultyClass = 20;
        const result = drm.performSavingThrow(unitStats, difficultyClass, 'strength');
        if (result === true) {
            console.log("DiceRollManager: performSavingThrow (success) calculated correctly. [PASS]");
            passCount++;
        } else {
            console.error(`DiceRollManager: performSavingThrow (success) failed. Expected true, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceRollManager: Error during performSavingThrow (success) test. [FAIL]", e);
    }

    // 테스트 9: performSavingThrow (실패)
    testCount++;
    mockDiceEngine.rollDResults = [5];
    mockDiceEngine.rollDIndex = 0;
    try {
        const drm = new DiceRollManager(mockDiceEngine, mockValorEngine, mockStatusEffectManager);
        const unitStats = { agility: 2 };
        const difficultyClass = 10;
        const result = drm.performSavingThrow(unitStats, difficultyClass, 'dexterity');
        if (result === false) {
            console.log("DiceRollManager: performSavingThrow (failure) calculated correctly. [PASS]");
            passCount++;
        } else {
            console.error(`DiceRollManager: performSavingThrow (failure) failed. Expected false, got ${result}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceRollManager: Error during performSavingThrow (failure) test. [FAIL]", e);
    }

    console.log(`--- DiceRollManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
