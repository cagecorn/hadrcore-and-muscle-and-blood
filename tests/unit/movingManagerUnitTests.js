// tests/unit/movingManagerUnitTests.js

import { MovingManager } from '../../js/managers/MovingManager.js';
import { GAME_DEBUG_MODE } from '../../js/constants.js'; // 디버그 모드 상수 임포트

export function runMovingManagerUnitTests() {
    if (GAME_DEBUG_MODE) console.log("--- MovingManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // Mock Dependencies
    const mockUnit = { id: 'testUnit', name: 'Test Unit', gridX: 0, gridY: 0, currentHp: 100 };
    const mockTargetUnit = { id: 'targetUnit', name: 'Target Unit', gridX: 3, gridY: 0, currentHp: 50 };

    const mockBattleSimulationManager = {
        unitsOnGrid: [mockUnit, mockTargetUnit],
        gridCols: 10,
        gridRows: 10,
        moveUnit: (unitId, newX, newY) => {
            const unit = mockBattleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
            if (unit) {
                unit.gridX = newX;
                unit.gridY = newY;
                return true;
            }
            return false;
        },
        isTileOccupied: (x, y, excludeId = null) => {
            return mockBattleSimulationManager.unitsOnGrid.some(u =>
                u.id !== excludeId && u.gridX === x && u.gridY === y && u.currentHp > 0
            );
        }
    };
    mockBattleSimulationManager.getUnitAt = (x, y) => {
        return mockBattleSimulationManager.unitsOnGrid.find(u => u.gridX === x && u.gridY === y && u.currentHp > 0);
    };

    const mockAnimationManager = {
        queueMoveAnimation: async (unitId, startX, startY, endX, endY) => {
            if (GAME_DEBUG_MODE) console.log(`[MockAnimationManager] Animating move for ${unitId} from (${startX},${startY}) to (${endX},${endY})`);
        },
        getAnimationDuration: (startX, startY, endX, endY) => 100,
        queueDashAnimation: async (unitId, startX, startY, endX, endY) => {
            if (GAME_DEBUG_MODE) console.log(`[MockAnimationManager] Dash move for ${unitId} from (${startX},${startY}) to (${endX},${endY})`);
        }
    };
    const mockDelayEngine = {
        waitFor: async (ms) => {
            await new Promise(resolve => setTimeout(resolve, ms));
            if (GAME_DEBUG_MODE) console.log(`[MockDelayEngine] Waited for ${ms}ms.`);
        }
    };
    const mockCoordinateManager = {
        isTileOccupied: (x, y, excludeId = null) => {
            return mockBattleSimulationManager.isTileOccupied(x, y, excludeId);
        }
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const mm = new MovingManager(mockBattleSimulationManager, mockAnimationManager, mockDelayEngine, mockCoordinateManager);
        if (mm.battleSimulationManager === mockBattleSimulationManager) {
            if (GAME_DEBUG_MODE) console.log("MovingManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("MovingManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("MovingManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: chargeMove - 대상 옆으로 성공적으로 돌진
    testCount++;
    mockUnit.gridX = 0;
    mockUnit.gridY = 0;
    mockBattleSimulationManager.unitsOnGrid = [mockUnit, mockTargetUnit];
    try {
        const mm = new MovingManager(mockBattleSimulationManager, mockAnimationManager, mockDelayEngine, mockCoordinateManager);
        const moved = await mm.chargeMove(mockUnit, mockTargetUnit.gridX, mockTargetUnit.gridY, 5);
        if (moved && mockUnit.gridX === 2 && mockUnit.gridY === 0) {
            if (GAME_DEBUG_MODE) console.log("MovingManager: chargeMove successfully moved to target side. [PASS]");
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("MovingManager: chargeMove failed to move to target side. [FAIL]", { moved, x: mockUnit.gridX, y: mockUnit.gridY });
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("MovingManager: Error during chargeMove (success) test. [FAIL]", e);
    }

    // 테스트 3: chargeMove - 이동 범위 부족으로 돌진 실패
    testCount++;
    mockUnit.gridX = 0;
    mockUnit.gridY = 0;
    mockBattleSimulationManager.unitsOnGrid = [mockUnit, mockTargetUnit];
    try {
        const mm = new MovingManager(mockBattleSimulationManager, mockAnimationManager, mockDelayEngine, mockCoordinateManager);
        const moved = await mm.chargeMove(mockUnit, mockTargetUnit.gridX, mockTargetUnit.gridY, 1);
        if (!moved && mockUnit.gridX === 0 && mockUnit.gridY === 0) {
            if (GAME_DEBUG_MODE) console.log("MovingManager: chargeMove correctly failed due to insufficient move range. [PASS]");
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("MovingManager: chargeMove failed on insufficient range. [FAIL]", { moved, x: mockUnit.gridX, y: mockUnit.gridY });
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("MovingManager: Error during chargeMove (insufficient range) test. [FAIL]", e);
    }

    // 테스트 4: chargeMove - 목표 옆 타일이 점유되어 돌진 실패
    testCount++;
    const mockOccupyingUnit = { id: 'occupy', name: 'Occupier', gridX: 2, gridY: 0, currentHp: 100 };
    mockUnit.gridX = 0;
    mockUnit.gridY = 0;
    mockBattleSimulationManager.unitsOnGrid = [mockUnit, mockTargetUnit, mockOccupyingUnit];
    try {
        const mm = new MovingManager(mockBattleSimulationManager, mockAnimationManager, mockDelayEngine, mockCoordinateManager);
        const moved = await mm.chargeMove(mockUnit, mockTargetUnit.gridX, mockTargetUnit.gridY, 5);
        if (!moved && mockUnit.gridX === 0 && mockUnit.gridY === 0) {
            if (GAME_DEBUG_MODE) console.log("MovingManager: chargeMove correctly failed due to occupied destination. [PASS]");
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("MovingManager: chargeMove failed on occupied destination. [FAIL]", { moved, x: mockUnit.gridX, y: mockUnit.gridY });
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("MovingManager: Error during chargeMove (occupied destination) test. [FAIL]", e);
    } finally {
        mockBattleSimulationManager.unitsOnGrid = [mockUnit, mockTargetUnit];
    }

    if (GAME_DEBUG_MODE) console.log(`--- MovingManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
