// tests/unit/battleSimulationManagerUnitTests.js

import { BattleSimulationManager } from '../../js/managers/BattleSimulationManager.js';

export function runBattleSimulationManagerUnitTests(measureManager, assetLoaderManager, idManager, logicManager) {
    console.log("--- BattleSimulationManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockUnit1 = { id: 'u1', name: 'Test Unit 1', gridX: 0, gridY: 0, currentHp: 100, baseStats: { hp: 100 }, type: 'mercenary' };
    const mockUnit2 = { id: 'u2', name: 'Test Unit 2', gridX: 1, gridY: 1, currentHp: 80, baseStats: { hp: 100 }, type: 'enemy' };
    const mockUnit3 = { id: 'u3', name: 'Test Unit 3', gridX: 0, gridY: 0, currentHp: 0, baseStats: { hp: 100 }, type: 'mercenary' };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const bsm = new BattleSimulationManager(measureManager, assetLoaderManager, idManager, logicManager);
        if (bsm.unitsOnGrid instanceof Array && bsm.unitsOnGrid.length === 0) {
            console.log("BattleSimulationManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("BattleSimulationManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("BattleSimulationManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: addUnit 메서드
    testCount++;
    try {
        const bsm = new BattleSimulationManager(measureManager, assetLoaderManager, idManager, logicManager);
        const mockImage = new Image();
        bsm.addUnit(mockUnit1, mockImage, mockUnit1.gridX, mockUnit1.gridY);
        if (bsm.unitsOnGrid.length === 1 && bsm.unitsOnGrid[0].id === 'u1' && bsm.unitsOnGrid[0].image === mockImage) {
            console.log("BattleSimulationManager: addUnit added unit correctly. [PASS]");
            passCount++;
        } else {
            console.error("BattleSimulationManager: addUnit failed. [FAIL]");
        }
    } catch (e) {
        console.error("BattleSimulationManager: Error during addUnit. [FAIL]", e);
    }

    // 테스트 3: moveUnit 메서드 - 성공
    testCount++;
    try {
        const bsm = new BattleSimulationManager(measureManager, assetLoaderManager, idManager, logicManager);
        const mockImage = new Image();
        bsm.addUnit(mockUnit1, mockImage, 0, 0);
        const moved = bsm.moveUnit('u1', 2, 3);
        if (moved && bsm.unitsOnGrid[0].gridX === 2 && bsm.unitsOnGrid[0].gridY === 3) {
            console.log("BattleSimulationManager: moveUnit succeeded. [PASS]");
            passCount++;
        } else {
            console.error("BattleSimulationManager: moveUnit failed. [FAIL]");
        }
    } catch (e) {
        console.error("BattleSimulationManager: Error during moveUnit success. [FAIL]", e);
    }

    // 테스트 4: moveUnit 메서드 - 충돌
    testCount++;
    try {
        const bsm = new BattleSimulationManager(measureManager, assetLoaderManager, idManager, logicManager);
        const mockImage = new Image();
        bsm.addUnit(mockUnit1, mockImage, 0, 0);
        bsm.addUnit(mockUnit2, mockImage, 1, 0);

        const moved = bsm.moveUnit('u1', 1, 0);

        if (!moved && bsm.unitsOnGrid[0].gridX === 0 && bsm.unitsOnGrid[0].gridY === 0) {
            console.log("BattleSimulationManager: moveUnit failed due to collision. [PASS]");
            passCount++;
        } else {
            console.error("BattleSimulationManager: moveUnit succeeded despite collision. [FAIL]", bsm.unitsOnGrid[0]);
        }
    } catch (e) {
        console.error("BattleSimulationManager: Error during moveUnit collision. [FAIL]", e);
    }

    // 테스트 5: isTileOccupied - 점유된 타일
    testCount++;
    try {
        const bsm = new BattleSimulationManager(measureManager, assetLoaderManager, idManager, logicManager);
        const mockImage = new Image();
        bsm.addUnit(mockUnit1, mockImage, 5, 5);
        const occupied = bsm.isTileOccupied(5, 5);
        if (occupied) {
            console.log("BattleSimulationManager: isTileOccupied correctly identified occupied tile. [PASS]");
            passCount++;
        } else {
            console.error("BattleSimulationManager: isTileOccupied failed to identify occupied tile. [FAIL]");
        }
    } catch (e) {
        console.error("BattleSimulationManager: Error during isTileOccupied (occupied). [FAIL]", e);
    }

    // 테스트 6: isTileOccupied - 빈 타일
    testCount++;
    try {
        const bsm = new BattleSimulationManager(measureManager, assetLoaderManager, idManager, logicManager);
        bsm.unitsOnGrid = [];
        const occupied = bsm.isTileOccupied(5, 5);
        if (!occupied) {
            console.log("BattleSimulationManager: isTileOccupied correctly identified empty tile. [PASS]");
            passCount++;
        } else {
            console.error("BattleSimulationManager: isTileOccupied failed to identify empty tile. [FAIL]");
        }
    } catch (e) {
        console.error("BattleSimulationManager: Error during isTileOccupied (empty). [FAIL]", e);
    }

    // 테스트 7: isTileOccupied - 제외 유닛 ID
    testCount++;
    try {
        const bsm = new BattleSimulationManager(measureManager, assetLoaderManager, idManager, logicManager);
        const mockImage = new Image();
        bsm.addUnit(mockUnit1, mockImage, 5, 5);
        const occupied = bsm.isTileOccupied(5, 5, 'u1');
        if (!occupied) {
            console.log("BattleSimulationManager: isTileOccupied correctly excluded unit. [PASS]");
            passCount++;
        } else {
            console.error("BattleSimulationManager: isTileOccupied failed to exclude unit. [FAIL]");
        }
    } catch (e) {
        console.error("BattleSimulationManager: Error during isTileOccupied (exclude). [FAIL]", e);
    }

    // 테스트 8: isTileOccupied - 죽은 유닛은 점유로 간주하지 않음
    testCount++;
    try {
        const bsm = new BattleSimulationManager(measureManager, assetLoaderManager, idManager, logicManager);
        const mockImage = new Image();
        bsm.addUnit(mockUnit3, mockImage, 2, 2);
        const occupied = bsm.isTileOccupied(2, 2);
        if (!occupied) {
            console.log("BattleSimulationManager: isTileOccupied correctly ignores dead units. [PASS]");
            passCount++;
        } else {
            console.error("BattleSimulationManager: isTileOccupied failed to ignore dead units. [FAIL]");
        }
    } catch (e) {
        console.error("BattleSimulationManager: Error during isTileOccupied (dead unit). [FAIL]", e);
    }

    console.log(`--- BattleSimulationManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
