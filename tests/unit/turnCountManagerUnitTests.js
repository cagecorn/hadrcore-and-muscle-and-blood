// tests/unit/turnCountManagerUnitTests.js

import { TurnCountManager } from '../../js/managers/TurnCountManager.js';

export function runTurnCountManagerUnitTests() {
    console.log("--- TurnCountManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockEffectData1 = { id: 'effect1', name: 'TestEffect1', duration: 3 };
    const mockEffectData2 = { id: 'effect2', name: 'TestEffect2', duration: 1 };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const turnCountManager = new TurnCountManager();
        if (turnCountManager.activeEffects instanceof Map && turnCountManager.activeEffects.size === 0) {
            console.log("TurnCountManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("TurnCountManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("TurnCountManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: addEffect 메서드
    testCount++;
    try {
        const turnCountManager = new TurnCountManager();
        turnCountManager.addEffect('unitA', mockEffectData1);
        if (turnCountManager.activeEffects.has('unitA') && turnCountManager.activeEffects.get('unitA').has('effect1')) {
            console.log("TurnCountManager: addEffect added effect correctly. [PASS]");
            passCount++;
        } else {
            console.error("TurnCountManager: addEffect failed. [FAIL]");
        }
    } catch (e) {
        console.error("TurnCountManager: Error during addEffect. [FAIL]", e);
    }

    // 테스트 3: updateTurns 메서드 - 턴 감소 및 만료 확인
    testCount++;
    try {
        const turnCountManager = new TurnCountManager();
        turnCountManager.addEffect('unitB', mockEffectData1); // duration 3
        turnCountManager.addEffect('unitB', mockEffectData2); // duration 1

        // 1턴 업데이트
        let expired = turnCountManager.updateTurns('unitB');
        let unitEffects = turnCountManager.getEffectsOfUnit('unitB');
        if (unitEffects.get('effect1').turnsRemaining === 2 && expired.length === 0) {
            console.log("TurnCountManager: updateTurns decremented correctly (1st turn). [PASS]");
            passCount++;
        } else {
            console.error("TurnCountManager: updateTurns failed (1st turn). [FAIL]", unitEffects.get('effect1').turnsRemaining, expired);
        }

        // 2턴 업데이트 (effect2 만료 예정)
        expired = turnCountManager.updateTurns('unitB');
        unitEffects = turnCountManager.getEffectsOfUnit('unitB');
        if (unitEffects.get('effect1').turnsRemaining === 1 && expired.includes('effect2') && !unitEffects.has('effect2')) {
            console.log("TurnCountManager: updateTurns expired effect2 correctly (2nd turn). [PASS]");
            passCount++;
        } else {
            console.error("TurnCountManager: updateTurns failed (2nd turn). [FAIL]", unitEffects, expired);
        }

        // 3턴 업데이트 (effect1 만료 예정)
        expired = turnCountManager.updateTurns('unitB');
        unitEffects = turnCountManager.getEffectsOfUnit('unitB');
        if (expired.includes('effect1') && !unitEffects) {
            console.log("TurnCountManager: updateTurns expired effect1 and removed unit (3rd turn). [PASS]");
            passCount++;
        } else {
            console.error("TurnCountManager: updateTurns failed (3rd turn). [FAIL]", unitEffects, expired);
        }

    } catch (e) {
        console.error("TurnCountManager: Error during updateTurns test. [FAIL]", e);
    }

    // 테스트 4: getEffectsOfUnit 메서드
    testCount++;
    try {
        const turnCountManager = new TurnCountManager();
        turnCountManager.addEffect('unitC', mockEffectData1);
        const effects = turnCountManager.getEffectsOfUnit('unitC');
        if (effects && effects.get('effect1')) {
            console.log("TurnCountManager: getEffectsOfUnit returned correct effects. [PASS]");
            passCount++;
        } else {
            console.error("TurnCountManager: getEffectsOfUnit failed. [FAIL]");
        }
    } catch (e) {
        console.error("TurnCountManager: Error during getEffectsOfUnit. [FAIL]", e);
    }

    // 테스트 5: removeEffect 메서드
    testCount++;
    try {
        const turnCountManager = new TurnCountManager();
        turnCountManager.addEffect('unitD', mockEffectData1);
        const removed = turnCountManager.removeEffect('unitD', 'effect1');
        if (removed && !turnCountManager.activeEffects.has('unitD')) {
            console.log("TurnCountManager: removeEffect removed effect and unit correctly. [PASS]");
            passCount++;
        } else {
            console.error("TurnCountManager: removeEffect failed. [FAIL]");
        }
    } catch (e) {
        console.error("TurnCountManager: Error during removeEffect. [FAIL]", e);
    }

    // 테스트 6: clearAllEffects 메서드
    testCount++;
    try {
        const turnCountManager = new TurnCountManager();
        turnCountManager.addEffect('unitE', mockEffectData1);
        turnCountManager.addEffect('unitF', mockEffectData2);
        turnCountManager.clearAllEffects();
        if (turnCountManager.activeEffects.size === 0) {
            console.log("TurnCountManager: clearAllEffects cleared all effects. [PASS]");
            passCount++;
        } else {
            console.error("TurnCountManager: clearAllEffects failed. [FAIL]");
        }
    } catch (e) {
        console.error("TurnCountManager: Error during clearAllEffects. [FAIL]", e);
    }

    console.log(`--- TurnCountManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
