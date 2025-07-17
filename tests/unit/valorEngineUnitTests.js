// tests/unit/valorEngineUnitTests.js

import { ValorEngine } from '../../js/managers/ValorEngine.js';

export function runValorEngineUnitTests() {
    console.log("--- ValorEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const valorEngine = new ValorEngine();
        if (valorEngine) {
            console.log("ValorEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("ValorEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("ValorEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: calculateInitialBarrier - 기본 계산
    testCount++;
    try {
        const valorEngine = new ValorEngine();
        const valorStat = 50;
        const expectedBarrier = valorStat * 2;
        const calculatedBarrier = valorEngine.calculateInitialBarrier(valorStat);

        if (calculatedBarrier === expectedBarrier) {
            console.log(`ValorEngine: calculateInitialBarrier (${valorStat}) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`ValorEngine: calculateInitialBarrier (${valorStat}) failed. Expected ${expectedBarrier}, got ${calculatedBarrier}. [FAIL]`);
        }
    } catch (e) {
        console.error("ValorEngine: Error during calculateInitialBarrier test. [FAIL]", e);
    }

    // 테스트 3: calculateInitialBarrier - 용맹 0일 때
    testCount++;
    try {
        const valorEngine = new ValorEngine();
        const valorStat = 0;
        const expectedBarrier = 0;
        const calculatedBarrier = valorEngine.calculateInitialBarrier(valorStat);

        if (calculatedBarrier === expectedBarrier) {
            console.log(`ValorEngine: calculateInitialBarrier (${valorStat}) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`ValorEngine: calculateInitialBarrier (${valorStat}) failed. Expected ${expectedBarrier}, got ${calculatedBarrier}. [FAIL]`);
        }
    } catch (e) {
        console.error("ValorEngine: Error during calculateInitialBarrier (zero valor) test. [FAIL]", e);
    }

    // 테스트 4: calculateDamageAmplification - 배리어 가득 찼을 때 (최대 증폭)
    testCount++;
    try {
        const valorEngine = new ValorEngine();
        const currentBarrier = 100;
        const maxBarrier = 100;
        const expectedAmplification = 1.0 + (0.5 * (100 / 100));
        const calculatedAmplification = valorEngine.calculateDamageAmplification(currentBarrier, maxBarrier);

        if (calculatedAmplification === expectedAmplification) {
            console.log(`ValorEngine: calculateDamageAmplification (full barrier) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`ValorEngine: calculateDamageAmplification (full barrier) failed. Expected ${expectedAmplification}, got ${calculatedAmplification}. [FAIL]`);
        }
    } catch (e) {
        console.error("ValorEngine: Error during calculateDamageAmplification (full barrier) test. [FAIL]", e);
    }

    // 테스트 5: calculateDamageAmplification - 배리어 절반일 때
    testCount++;
    try {
        const valorEngine = new ValorEngine();
        const currentBarrier = 50;
        const maxBarrier = 100;
        const expectedAmplification = 1.0 + (0.5 * (50 / 100));
        const calculatedAmplification = valorEngine.calculateDamageAmplification(currentBarrier, maxBarrier);

        if (calculatedAmplification === expectedAmplification) {
            console.log(`ValorEngine: calculateDamageAmplification (half barrier) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`ValorEngine: calculateDamageAmplification (half barrier) failed. Expected ${expectedAmplification}, got ${calculatedAmplification}. [FAIL]`);
        }
    } catch (e) {
        console.error("ValorEngine: Error during calculateDamageAmplification (half barrier) test. [FAIL]", e);
    }

    // 테스트 6: calculateDamageAmplification - 배리어 0일 때 (증폭 없음)
    testCount++;
    try {
        const valorEngine = new ValorEngine();
        const currentBarrier = 0;
        const maxBarrier = 100;
        const expectedAmplification = 1.0;
        const calculatedAmplification = valorEngine.calculateDamageAmplification(currentBarrier, maxBarrier);

        if (calculatedAmplification === expectedAmplification) {
            console.log(`ValorEngine: calculateDamageAmplification (zero barrier) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`ValorEngine: calculateDamageAmplification (zero barrier) failed. Expected ${expectedAmplification}, got ${calculatedAmplification}. [FAIL]`);
        }
    } catch (e) {
        console.error("ValorEngine: Error during calculateDamageAmplification (zero barrier) test. [FAIL]", e);
    }

    // 테스트 7: calculateDamageAmplification - maxBarrier가 0일 때
    testCount++;
    try {
        const valorEngine = new ValorEngine();
        const currentBarrier = 10;
        const maxBarrier = 0;
        const expectedAmplification = 1.0;
        const calculatedAmplification = valorEngine.calculateDamageAmplification(currentBarrier, maxBarrier);

        if (calculatedAmplification === expectedAmplification) {
            console.log(`ValorEngine: calculateDamageAmplification (zero max barrier) correct. [PASS]`);
            passCount++;
        } else {
            console.error(`ValorEngine: calculateDamageAmplification (zero max barrier) failed. Expected ${expectedAmplification}, got ${calculatedAmplification}. [FAIL]`);
        }
    } catch (e) {
        console.error("ValorEngine: Error during calculateDamageAmplification (zero max barrier) test. [FAIL]", e);
    }

    console.log(`--- ValorEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
