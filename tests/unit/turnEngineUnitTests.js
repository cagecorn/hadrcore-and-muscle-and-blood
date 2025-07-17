// tests/unit/turnEngineUnitTests.js

import { TurnEngine } from '../../js/managers/TurnEngine.js';

export function runTurnEngineUnitTests(eventManager, battleSimulationManager, turnOrderManager, classAIManager, delayEngine, timingEngine, animationManager, battleCalculationManager) {
    console.log("--- TurnEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockUnit1 = { id: 'u1', name: 'Hero', currentHp: 50, baseStats: { hp: 50, speed: 10 }, type: 'mercenary', classId: 'class_warrior', gridX: 0, gridY: 0 };
    const mockUnit2 = { id: 'u2', name: 'Goblin', currentHp: 30, baseStats: { hp: 30, speed: 5 }, type: 'enemy', classId: 'class_goblin', gridX: 5, gridY: 5 };

    battleSimulationManager.unitsOnGrid = [mockUnit1, mockUnit2];
    turnOrderManager.calculateTurnOrder();

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const turnEngine = new TurnEngine(eventManager, battleSimulationManager, turnOrderManager, classAIManager, delayEngine, timingEngine, animationManager, battleCalculationManager);
        if (turnEngine.currentTurn === 0 && turnEngine.turnPhaseCallbacks.startOfTurn instanceof Array) {
            console.log("TurnEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("TurnEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("TurnEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: initializeTurnOrder 호출
    testCount++;
    try {
        const turnEngine = new TurnEngine(eventManager, battleSimulationManager, turnOrderManager, classAIManager, delayEngine, timingEngine, animationManager, battleCalculationManager);
        turnEngine.initializeTurnOrder();
        if (turnEngine.turnOrder.length > 0 && turnEngine.turnOrder[0].id === 'u1') {
            console.log("TurnEngine: initializeTurnOrder called TurnOrderManager. [PASS]");
            passCount++;
        } else {
            console.error("TurnEngine: initializeTurnOrder failed. [FAIL]", turnEngine.turnOrder);
        }
    } catch (e) {
        console.error("TurnEngine: Error initializing turn order. [FAIL]", e);
    }

    // 테스트 3: 턴 단계 콜백 등록
    testCount++;
    try {
        const turnEngine = new TurnEngine(eventManager, battleSimulationManager, turnOrderManager, classAIManager, delayEngine, timingEngine, animationManager, battleCalculationManager);
        let callbackCalled = false;
        const testCallback = async () => { callbackCalled = true; };
        turnEngine.addTurnPhaseCallback('startOfTurn', testCallback);
        if (turnEngine.turnPhaseCallbacks.startOfTurn.includes(testCallback)) {
            console.log("TurnEngine: Added turn phase callback successfully. [PASS]");
            passCount++;
        } else {
            console.error("TurnEngine: Failed to add turn phase callback. [FAIL]");
        }
    } catch (e) {
        console.error("TurnEngine: Error adding turn phase callback. [FAIL]", e);
    }

    // 테스트 4: startBattleTurns 및 nextTurn 시작
    testCount++;
    let originalSetTimeout = window.setTimeout;
    window.setTimeout = (fn, delay) => fn();

    try {
        const turnEngine = new TurnEngine(eventManager, battleSimulationManager, turnOrderManager, classAIManager, delayEngine, timingEngine, animationManager, battleCalculationManager);
        classAIManager.getBasicClassAction = async (unit, allUnits) => {
            if (unit.id === 'u1') return { actionType: 'attack', targetId: 'u2' };
            if (unit.id === 'u2') return { actionType: 'attack', targetId: 'u1' };
            return null;
        };
        let unitAttackAttemptEmitted = false;
        eventManager.subscribe('unitAttackAttempt', () => { unitAttackAttemptEmitted = true; });
        eventManager.setGameRunningState(true);
        await turnEngine.nextTurn();

        if (turnEngine.currentTurn === 1 && unitAttackAttemptEmitted) {
            console.log("TurnEngine: First turn processed and attack attempted. [PASS]");
            passCount++;
        } else {
            console.error("TurnEngine: First turn processing failed or attack not attempted. [FAIL]");
        }
    } catch (e) {
        console.error("TurnEngine: Error during battle turn simulation. [FAIL]", e);
    } finally {
        window.setTimeout = originalSetTimeout;
        eventManager.setGameRunningState(false);
    }

    console.log(`--- TurnEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
