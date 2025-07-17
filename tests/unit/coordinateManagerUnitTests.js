import { CoordinateManager } from '../../js/managers/CoordinateManager.js';
import { ATTACK_TYPES } from '../../js/constants.js';

export function runCoordinateManagerUnitTests(battleSimulationManager, battleGridManager) {
    console.log("--- CoordinateManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트를 위한 Mock 유닛 데이터
    const mockUnits = [
        { id: 'hero1', name: 'Hero A', type: ATTACK_TYPES.MERCENARY, gridX: 2, gridY: 2, currentHp: 100 },
        { id: 'enemy1', name: 'Goblin X', type: ATTACK_TYPES.ENEMY, gridX: 5, gridY: 2, currentHp: 50 },
        { id: 'enemy2', name: 'Orc Y', type: ATTACK_TYPES.ENEMY, gridX: 3, gridY: 3, currentHp: 70 },
        { id: 'enemy3_dead', name: 'Dead Zombie', type: ATTACK_TYPES.ENEMY, gridX: 4, gridY: 4, currentHp: 0 },
        { id: 'ally2', name: 'Archer', type: ATTACK_TYPES.MERCENARY, gridX: 1, gridY: 1, currentHp: 80 }
    ];

    // Mock BattleSimulationManager (테스트마다 초기화)
    const mockBattleSimulationManager = {
        unitsOnGrid: [],
        isTileOccupied: (x, y, excludeId = null) => {
            return mockBattleSimulationManager.unitsOnGrid.some(u =>
                u.gridX === x && u.gridY === y && u.id !== excludeId && u.currentHp > 0
            );
        }
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = []; // 초기화
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        if (cm.battleSimulationManager === mockBattleSimulationManager) {
            console.log("CoordinateManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("CoordinateManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: getUnitPosition - 존재하는 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        const position = cm.getUnitPosition('hero1');
        if (position && position.x === 2 && position.y === 2) {
            console.log("CoordinateManager: getUnitPosition returned correct position for existing unit. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: getUnitPosition failed for existing unit. [FAIL]", position);
        }
    } catch (e) {
        console.error("CoordinateManager: Error during getUnitPosition (existing) test. [FAIL]", e);
    }

    // 테스트 3: getUnitPosition - 존재하지 않는 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        const position = cm.getUnitPosition('nonExistentUnit');
        if (position === null) {
            console.log("CoordinateManager: getUnitPosition returned null for non-existent unit. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: getUnitPosition failed for non-existent unit. [FAIL]", position);
        }
    } catch (e) {
        console.error("CoordinateManager: Error during getUnitPosition (non-existent) test. [FAIL]", e);
    }

    // 테스트 4: isTileOccupied - 점유된 타일
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        const occupied = cm.isTileOccupied(2, 2); // hero1 위치
        if (occupied) {
            console.log("CoordinateManager: isTileOccupied correctly identified occupied tile. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: isTileOccupied failed to identify occupied tile. [FAIL]");
        }
    } catch (e) {
        console.error("CoordinateManager: Error during isTileOccupied (occupied) test. [FAIL]", e);
    }

    // 테스트 5: isTileOccupied - 비어있는 타일
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        const occupied = cm.isTileOccupied(0, 0); // 비어있는 타일
        if (!occupied) {
            console.log("CoordinateManager: isTileOccupied correctly identified empty tile. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: isTileOccupied failed to identify empty tile. [FAIL]");
        }
    } catch (e) {
        console.error("CoordinateManager: Error during isTileOccupied (empty) test. [FAIL]", e);
    }

    // 테스트 6: isTileOccupied - 죽은 유닛이 있는 타일 (비어있다고 간주)
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        const occupied = cm.isTileOccupied(4, 4); // enemy3_dead 위치
        if (!occupied) {
            console.log("CoordinateManager: isTileOccupied correctly ignores dead units. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: isTileOccupied failed to ignore dead units. [FAIL]");
        }
    } catch (e) {
        console.error("CoordinateManager: Error during isTileOccupied (dead unit) test. [FAIL]", e);
    }

    // 테스트 7: getUnitsInRadius - 반경 내 적 유닛 (타입 필터 사용)
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        // hero1 (2,2) 기준 반경 2 내의 적 유닛: enemy2 (3,3) - 거리 2
        const enemies = cm.getUnitsInRadius(2, 2, 2, ATTACK_TYPES.ENEMY);
        if (enemies.length === 1 && enemies[0].id === 'enemy2') {
            console.log("CoordinateManager: getUnitsInRadius found correct enemy unit. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: getUnitsInRadius failed to find correct enemy unit. [FAIL]", enemies);
        }
    } catch (e) {
        console.error("CoordinateManager: Error during getUnitsInRadius (enemy filter) test. [FAIL]", e);
    }

    // 테스트 8: getUnitsInRadius - 반경 내 모든 유닛 (필터 없음)
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        // (3,3) 기준 반경 1 내의 유닛: enemy2 (3,3), hero1 (2,2) - 거리 1
        const units = cm.getUnitsInRadius(3, 3, 1, null);
        const unitIds = units.map(u => u.id).sort();
        if (unitIds.length === 2 && unitIds.includes('enemy2') && unitIds.includes('hero1')) {
            console.log("CoordinateManager: getUnitsInRadius found all units correctly. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: getUnitsInRadius failed to find all units. [FAIL]", unitIds);
        }
    } catch (e) {
        console.error("CoordinateManager: Error during getUnitsInRadius (no filter) test. [FAIL]", e);
    }

    // 테스트 9: findClosestUnit - 가장 가까운 적 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        // hero1 (2,2) 기준 가장 가까운 적: enemy2 (3,3) - 거리 2, enemy1 (5,2) - 거리 3
        const closestEnemy = cm.findClosestUnit('hero1', ATTACK_TYPES.ENEMY);
        if (closestEnemy && closestEnemy.id === 'enemy2') {
            console.log("CoordinateManager: findClosestUnit found closest enemy. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: findClosestUnit failed to find closest enemy. [FAIL]", closestEnemy);
        }
    } catch (e) {
        console.error("CoordinateManager: Error during findClosestUnit (closest enemy) test. [FAIL]", e);
    }

    // 테스트 10: findClosestUnit - 가장 가까운 아군 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        // enemy2 (3,3) 기준 가장 가까운 아군: hero1 (2,2) - 거리 2, ally2 (1,1) - 거리 4
        const closestAlly = cm.findClosestUnit('enemy2', ATTACK_TYPES.MERCENARY);
        if (closestAlly && closestAlly.id === 'hero1') {
            console.log("CoordinateManager: findClosestUnit found closest ally. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: findClosestUnit failed to find closest ally. [FAIL]", closestAlly);
        }
    } catch (e) {
        console.error("CoordinateManager: Error during findClosestUnit (closest ally) test. [FAIL]", e);
    }

    // 테스트 11: findClosestUnit - 죽은 유닛 포함 (죽은 좀비를 찾도록)
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        // hero1 (2,2) 기준 가장 가까운 적 (죽은 유닛 포함): enemy2 (3,3) - 거리 2, enemy3_dead (4,4) - 거리 4
        const closestDeadEnemy = cm.findClosestUnit('hero1', ATTACK_TYPES.ENEMY, true);
        // 이 경우 enemy2 (3,3)이 여전히 가장 가까움
        if (closestDeadEnemy && closestDeadEnemy.id === 'enemy2') {
            console.log("CoordinateManager: findClosestUnit (includeDeadUnits) returned closest *living* enemy as it's closer. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: findClosestUnit (includeDeadUnits) failed. [FAIL]", closestDeadEnemy);
        }
    } catch (e) {
        console.error("CoordinateManager: Error during findClosestUnit (includeDeadUnits) test. [FAIL]", e);
    }

    // 테스트 12: findClosestUnit - 대상 유닛 없음
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [mockUnits[0]]; // hero1만 존재
        const cm = new CoordinateManager(mockBattleSimulationManager, battleGridManager);
        const closest = cm.findClosestUnit('hero1', ATTACK_TYPES.ENEMY);
        if (closest === null) {
            console.log("CoordinateManager: findClosestUnit returned null when no target units found. [PASS]");
            passCount++;
        } else {
            console.error("CoordinateManager: findClosestUnit failed to return null when no target units. [FAIL]", closest);
        }
    } catch (e) {
        console.error("CoordinateManager: Error during findClosestUnit (no target) test. [FAIL]", e);
    }

    console.log(`--- CoordinateManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
