// tests/unit/turnOrderManagerUnitTests.js

import { TurnOrderManager } from '../../js/managers/TurnOrderManager.js';

export function runTurnOrderManagerUnitTests(eventManager, battleSimulationManager) {
    console.log("--- TurnOrderManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockUnitFast = { id: 'fast', name: 'Fast Unit', baseStats: { speed: 100 }, currentHp: 1 };
    const mockUnitNormal = { id: 'normal', name: 'Normal Unit', baseStats: { speed: 50 }, currentHp: 1 };
    const mockUnitSlow = { id: 'slow', name: 'Slow Unit', baseStats: { speed: 10 }, currentHp: 1 };
    const mockUnitDead = { id: 'dead', name: 'Dead Unit', baseStats: { speed: 20 }, currentHp: 0 };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const turnOrderManager = new TurnOrderManager(eventManager, battleSimulationManager);
        if (turnOrderManager.currentTurnOrder instanceof Array && turnOrderManager.currentTurnOrder.length === 0) {
            console.log("TurnOrderManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("TurnOrderManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("TurnOrderManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: calculateTurnOrder - 속도 기반 정렬
    testCount++;
    try {
        const turnOrderManager = new TurnOrderManager(eventManager, battleSimulationManager);
        battleSimulationManager.unitsOnGrid = [mockUnitNormal, mockUnitSlow, mockUnitFast];
        const order = turnOrderManager.calculateTurnOrder();

        if (order.length === 3 &&
            order[0].id === 'fast' &&
            order[1].id === 'normal' &&
            order[2].id === 'slow') {
            console.log("TurnOrderManager: Calculated turn order correctly based on speed. [PASS]");
            passCount++;
        } else {
            console.error("TurnOrderManager: Failed to calculate turn order correctly. [FAIL]", order.map(u => u.id));
        }
    } catch (e) {
        console.error("TurnOrderManager: Error calculating turn order. [FAIL]", e);
    }

    // 테스트 3: getTurnOrder
    testCount++;
    try {
        const turnOrderManager = new TurnOrderManager(eventManager, battleSimulationManager);
        battleSimulationManager.unitsOnGrid = [mockUnitFast, mockUnitNormal];
        turnOrderManager.calculateTurnOrder();
        const retrievedOrder = turnOrderManager.getTurnOrder();
        if (retrievedOrder === turnOrderManager.currentTurnOrder) {
            console.log("TurnOrderManager: getTurnOrder returns current turn order. [PASS]");
            passCount++;
        } else {
            console.error("TurnOrderManager: getTurnOrder returned incorrect or new array. [FAIL]");
        }
    } catch (e) {
        console.error("TurnOrderManager: Error getting turn order. [FAIL]", e);
    }

    // 테스트 4: removeUnitFromOrder - 유닛 제거
    testCount++;
    try {
        const turnOrderManager = new TurnOrderManager(eventManager, battleSimulationManager);
        battleSimulationManager.unitsOnGrid = [mockUnitFast, mockUnitNormal, mockUnitSlow];
        turnOrderManager.calculateTurnOrder();
        turnOrderManager.removeUnitFromOrder('normal');
        const orderAfterRemoval = turnOrderManager.getTurnOrder();

        if (orderAfterRemoval.length === 2 &&
            orderAfterRemoval[0].id === 'fast' &&
            orderAfterRemoval[1].id === 'slow') {
            console.log("TurnOrderManager: Removed unit from order correctly. [PASS]");
            passCount++;
        } else {
            console.error("TurnOrderManager: Failed to remove unit from order. [FAIL]", orderAfterRemoval.map(u => u.id));
        }
    } catch (e) {
        console.error("TurnOrderManager: Error removing unit. [FAIL]", e);
    }

    // 테스트 5: removeUnitFromOrder - 없는 유닛 제거 시도
    testCount++;
    const originalLog = console.log;
    let logCalledForNonExistent = false;
    console.log = (message) => {
        if (message.includes("Unit 'nonExistent' removed from turn order.")) {
            logCalledForNonExistent = true;
        }
        originalLog(message);
    };
    try {
        const turnOrderManager = new TurnOrderManager(eventManager, battleSimulationManager);
        battleSimulationManager.unitsOnGrid = [mockUnitFast];
        turnOrderManager.calculateTurnOrder();
        const initialLength = turnOrderManager.getTurnOrder().length;
        turnOrderManager.removeUnitFromOrder('nonExistent');
        const orderAfterNonExistentRemoval = turnOrderManager.getTurnOrder();

        if (orderAfterNonExistentRemoval.length === initialLength && !logCalledForNonExistent) {
            console.log("TurnOrderManager: Attempt to remove non-existent unit handled gracefully. [PASS]");
            passCount++;
        } else {
            console.error("TurnOrderManager: Failed to handle non-existent unit removal. [FAIL]");
        }
    } catch (e) {
        console.error("TurnOrderManager: Error handling non-existent unit removal. [FAIL]", e);
    } finally {
        console.log = originalLog;
    }

    // 테스트 6: clearTurnOrder
    testCount++;
    try {
        const turnOrderManager = new TurnOrderManager(eventManager, battleSimulationManager);
        battleSimulationManager.unitsOnGrid = [mockUnitFast, mockUnitNormal];
        turnOrderManager.calculateTurnOrder();
        turnOrderManager.clearTurnOrder();
        if (turnOrderManager.getTurnOrder().length === 0) {
            console.log("TurnOrderManager: clearTurnOrder cleared the order. [PASS]");
            passCount++;
        } else {
            console.error("TurnOrderManager: clearTurnOrder failed to clear order. [FAIL]");
        }
    } catch (e) {
        console.error("TurnOrderManager: Error clearing turn order. [FAIL]", e);
    }

    console.log(`--- TurnOrderManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
