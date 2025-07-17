// tests/unit/diceEngineUnitTests.js

import { DiceEngine } from '../../js/managers/DiceEngine.js';

export function runDiceEngineUnitTests() {
    console.log("--- DiceEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const diceEngine = new DiceEngine();
        if (diceEngine) {
            console.log("DiceEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("DiceEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("DiceEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: rollD - 기본 6면체 주사위 굴림 (범위 및 정수 확인)
    testCount++;
    try {
        const diceEngine = new DiceEngine();
        const roll = diceEngine.rollD(6);
        if (roll >= 1 && roll <= 6 && Number.isInteger(roll)) {
            console.log(`DiceEngine: rollD(6) returned a valid result (${roll}). [PASS]`);
            passCount++;
        } else {
            console.error(`DiceEngine: rollD(6) returned invalid result (${roll}). [FAIL]`);
        }
    } catch (e) {
        console.error("DiceEngine: Error during rollD(6) test. [FAIL]", e);
    }

    // 테스트 3: rollD - 20면체 주사위 굴림
    testCount++;
    try {
        const diceEngine = new DiceEngine();
        const roll = diceEngine.rollD(20);
        if (roll >= 1 && roll <= 20 && Number.isInteger(roll)) {
            console.log(`DiceEngine: rollD(20) returned a valid result (${roll}). [PASS]`);
            passCount++;
        } else {
            console.error(`DiceEngine: rollD(20) returned invalid result (${roll}). [FAIL]`);
        }
    } catch (e) {
        console.error("DiceEngine: Error during rollD(20) test. [FAIL]", e);
    }

    // 테스트 4: rollD - 0 또는 음수 면 수
    testCount++;
    try {
        const diceEngine = new DiceEngine();
        const rollZero = diceEngine.rollD(0);
        const rollNegative = diceEngine.rollD(-5);
        if (rollZero === 1 && rollNegative === 1) {
            console.log("DiceEngine: rollD handles 0 or negative sides gracefully (returns 1). [PASS]");
            passCount++;
        } else {
            console.error(`DiceEngine: rollD(0) returned ${rollZero}, rollD(-5) returned ${rollNegative}. [FAIL]`);
        }
    } catch (e) {
        console.error("DiceEngine: Error during rollD (zero/negative sides) test. [FAIL]", e);
    }

    // 테스트 5: getRandomFloat (범위 확인)
    testCount++;
    try {
        const diceEngine = new DiceEngine();
        const float = diceEngine.getRandomFloat();
        if (float >= 0 && float < 1) {
            console.log(`DiceEngine: getRandomFloat returned a valid result (${float}). [PASS]`);
            passCount++;
        } else {
            console.error(`DiceEngine: getRandomFloat returned invalid result (${float}). [FAIL]`);
        }
    } catch (e) {
        console.error("DiceEngine: Error during getRandomFloat test. [FAIL]", e);
    }

    // 테스트 6: getRandomInt (범위 및 정수 확인)
    testCount++;
    try {
        const diceEngine = new DiceEngine();
        const int = diceEngine.getRandomInt(10, 20);
        if (int >= 10 && int <= 20 && Number.isInteger(int)) {
            console.log(`DiceEngine: getRandomInt(10, 20) returned a valid result (${int}). [PASS]`);
            passCount++;
        } else {
            console.error(`DiceEngine: getRandomInt(10, 20) returned invalid result (${int}). [FAIL]`);
        }
    } catch (e) {
        console.error("DiceEngine: Error during getRandomInt test. [FAIL]", e);
    }

    console.log(`--- DiceEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
