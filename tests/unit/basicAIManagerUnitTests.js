// tests/unit/basicAIManagerUnitTests.js

import { BasicAIManager } from '../../js/managers/BasicAIManager.js';

export function runBasicAIManagerUnitTests(battleSimulationManager) {
    console.log("--- BasicAIManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockWarrior = { id: 'w1', name: 'Warrior', type: 'mercenary', gridX: 0, gridY: 0, currentHp: 100 };
    const mockEnemy1 = { id: 'e1', name: 'Enemy1', type: 'enemy', gridX: 3, gridY: 0, currentHp: 50 };
    const mockEnemy2 = { id: 'e2', name: 'Enemy2', type: 'enemy', gridX: 0, gridY: 5, currentHp: 50 };
    const mockObstacle = { id: 'o1', name: 'Obstacle', type: 'obstacle', gridX: 1, gridY: 0, currentHp: 100 };

    const originalUnitsOnGrid = battleSimulationManager.unitsOnGrid;
    const originalIsTileOccupied = battleSimulationManager.isTileOccupied;
    const originalGridCols = battleSimulationManager.gridCols;
    const originalGridRows = battleSimulationManager.gridRows;

    function setupTestEnvironment(units, gridCols = 15, gridRows = 10) {
        battleSimulationManager.unitsOnGrid = [...units];
        battleSimulationManager.gridCols = gridCols;
        battleSimulationManager.gridRows = gridRows;
        battleSimulationManager.isTileOccupied = (x, y, excludeId) => {
            return battleSimulationManager.unitsOnGrid.some(u => u.id !== excludeId && u.gridX === x && u.gridY === y && u.currentHp > 0);
        };
    }

    function teardownTestEnvironment() {
        battleSimulationManager.unitsOnGrid = originalUnitsOnGrid;
        battleSimulationManager.isTileOccupied = originalIsTileOccupied;
        battleSimulationManager.gridCols = originalGridCols;
        battleSimulationManager.gridRows = originalGridRows;
    }

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const basicAIManager = new BasicAIManager(battleSimulationManager);
        if (basicAIManager.battleSimulationManager === battleSimulationManager) {
            console.log("BasicAIManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("BasicAIManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("BasicAIManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: 적이 공격 범위 내에 있을 때 (공격)
    testCount++;
    setupTestEnvironment([mockWarrior, { ...mockEnemy1, gridX: 1, gridY: 0 }]);
    try {
        const basicAIManager = new BasicAIManager(battleSimulationManager);
        const action = basicAIManager.determineMoveAndTarget(mockWarrior, battleSimulationManager.unitsOnGrid, 3, 1);
        if (action && action.actionType === 'attack' && action.targetId === 'e1') {
            console.log("BasicAIManager: Determined 'attack' when target in range. [PASS]");
            passCount++;
        } else {
            console.error("BasicAIManager: Failed to determine 'attack' when target in range. [FAIL]", action);
        }
    } catch (e) {
        console.error("BasicAIManager: Error during attack range test. [FAIL]", e);
    } finally {
        teardownTestEnvironment();
    }

    // 테스트 3: 적이 멀리 있을 때 (이동)
    testCount++;
    setupTestEnvironment([mockWarrior, mockEnemy1]);
    try {
        const basicAIManager = new BasicAIManager(battleSimulationManager);
        const action = basicAIManager.determineMoveAndTarget(mockWarrior, battleSimulationManager.unitsOnGrid, 3, 1);
        if (action && action.actionType === 'move' && action.moveTargetX === 3 && action.moveTargetY === 0) {
            console.log("BasicAIManager: Determined 'move' towards distant target. [PASS]");
            passCount++;
        } else {
            console.error("BasicAIManager: Failed to determine 'move' towards distant target. [FAIL]", action);
        }
    } catch (e) {
        console.error("BasicAIManager: Error during distant target move test. [FAIL]", e);
    } finally {
        teardownTestEnvironment();
    }

    // 테스트 4: 이동 후 공격 범위에 들어올 때 (이동 + 공격)
    testCount++;
    setupTestEnvironment([mockWarrior, { ...mockEnemy1, gridX: 3, gridY: 0 }]);
    try {
        const basicAIManager = new BasicAIManager(battleSimulationManager);
        const action = basicAIManager.determineMoveAndTarget(mockWarrior, battleSimulationManager.unitsOnGrid, 3, 1);
        if (action && action.actionType === 'moveAndAttack' && action.targetId === 'e1' &&
            action.moveTargetX === 2 && action.moveTargetY === 0) {
            console.log("BasicAIManager: Determined 'moveAndAttack' when in range after move. [PASS]");
            passCount++;
        } else {
            console.error("BasicAIManager: Failed to determine 'moveAndAttack'. [FAIL]", action);
        }
    } catch (e) {
        console.error("BasicAIManager: Error during moveAndAttack test. [FAIL]", e);
    } finally {
        teardownTestEnvironment();
    }

    // 테스트 5: 이동 경로가 다른 유닛에 의해 막혔을 때 (충돌 회피)
    testCount++;
    setupTestEnvironment([mockWarrior, mockEnemy1, mockObstacle]);
    try {
        const basicAIManager = new BasicAIManager(battleSimulationManager);
        const action = basicAIManager.determineMoveAndTarget(mockWarrior, battleSimulationManager.unitsOnGrid, 3, 1);
        if (action && action.actionType === 'move' && action.moveTargetX === 0 && action.moveTargetY === 1) {
            console.log("BasicAIManager: Avoided obstacle and attempted alternative move. [PASS]");
            passCount++;
        } else {
            console.error("BasicAIManager: Failed to avoid obstacle or determine alternative move. [FAIL]", action);
        }
    } catch (e) {
        console.error("BasicAIManager: Error during obstacle avoidance test. [FAIL]", e);
    } finally {
        teardownTestEnvironment();
    }

    // 테스트 6: 타겟이 없을 때 null 반환
    testCount++;
    setupTestEnvironment([mockWarrior]);
    try {
        const basicAIManager = new BasicAIManager(battleSimulationManager);
        const action = basicAIManager.determineMoveAndTarget(mockWarrior, battleSimulationManager.unitsOnGrid, 3, 1);
        if (action === null) {
            console.log("BasicAIManager: Returns null when no targets available. [PASS]");
            passCount++;
        } else {
            console.error("BasicAIManager: Did not return null when no targets available. [FAIL]", action);
        }
    } catch (e) {
        console.error("BasicAIManager: Error when no targets available. [FAIL]", e);
    } finally {
        teardownTestEnvironment();
    }

    console.log(`--- BasicAIManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
