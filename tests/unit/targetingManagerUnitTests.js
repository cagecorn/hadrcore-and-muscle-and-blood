// tests/unit/targetingManagerUnitTests.js

import { TargetingManager } from '../../js/managers/TargetingManager.js';
import { ATTACK_TYPES } from '../../js/constants.js';

export function runTargetingManagerUnitTests(battleSimulationManager) {
    console.log("--- TargetingManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트를 위한 Mock 유닛 데이터
    const mockUnits = [
        { id: 'hero1', name: 'Tank', type: ATTACK_TYPES.MERCENARY, currentHp: 50, baseStats: { hp: 100, attack: 10, magic: 5 } },
        { id: 'hero2', name: 'DPS', type: ATTACK_TYPES.MERCENARY, currentHp: 20, baseStats: { hp: 80, attack: 30, magic: 0 } },
        { id: 'hero3', name: 'Healer', type: ATTACK_TYPES.MERCENARY, currentHp: 80, baseStats: { hp: 90, attack: 5, magic: 25 } },
        { id: 'enemy1', name: 'Bruiser', type: ATTACK_TYPES.ENEMY, currentHp: 30, baseStats: { hp: 60, attack: 25, magic: 0 } },
        { id: 'enemy2', name: 'Caster', type: ATTACK_TYPES.ENEMY, currentHp: 10, baseStats: { hp: 40, attack: 5, magic: 40 } },
        { id: 'enemy3_dead', name: 'Dead', type: ATTACK_TYPES.ENEMY, currentHp: 0, baseStats: { hp: 10, attack: 1, magic: 1 } },
    ];

    // Mock BattleSimulationManager (테스트마다 초기화)
    const mockBattleSimulationManager = {
        unitsOnGrid: []
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = []; // 초기화
        const tm = new TargetingManager(mockBattleSimulationManager);
        if (tm.battleSimulationManager === mockBattleSimulationManager) {
            console.log("TargetingManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("TargetingManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: getUnitsByCondition - 체력 50 이하인 모든 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const lowHpUnits = tm.getUnitsByCondition(unit => unit.currentHp <= 50);
        const lowHpUnitIds = lowHpUnits.map(u => u.id).sort();
        // hero1 (50), hero2 (20), enemy1 (30), enemy2 (10)
        if (lowHpUnitIds.length === 4 && lowHpUnitIds.includes('hero1') && lowHpUnitIds.includes('hero2') && lowHpUnitIds.includes('enemy1') && lowHpUnitIds.includes('enemy2')) {
            console.log("TargetingManager: getUnitsByCondition found correct low HP units. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getUnitsByCondition failed for low HP units. [FAIL]", lowHpUnitIds);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getUnitsByCondition test. [FAIL]", e);
    }

    // 테스트 3: getUnitsByCondition - 적군 중 마법 공격력 20 이상인 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const highMagicEnemies = tm.getUnitsByCondition(unit => unit.baseStats.magic >= 20, ATTACK_TYPES.ENEMY);
        const highMagicEnemyIds = highMagicEnemies.map(u => u.id).sort();
        // enemy2 (40)
        if (highMagicEnemyIds.length === 1 && highMagicEnemyIds.includes('enemy2')) {
            console.log("TargetingManager: getUnitsByCondition found correct high magic enemies. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getUnitsByCondition failed for high magic enemies. [FAIL]", highMagicEnemyIds);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getUnitsByCondition (filtered) test. [FAIL]", e);
    }

    // 테스트 4: getLowestHpUnit - 아군 중 가장 체력이 낮은 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const lowestHpAlly = tm.getLowestHpUnit(ATTACK_TYPES.MERCENARY);
        // hero1 (50), hero2 (20), hero3 (80) -> hero2
        if (lowestHpAlly && lowestHpAlly.id === 'hero2') {
            console.log("TargetingManager: getLowestHpUnit found correct lowest HP ally. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getLowestHpUnit failed for lowest HP ally. [FAIL]", lowestHpAlly);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getLowestHpUnit (ally) test. [FAIL]", e);
    }

    // 테스트 5: getLowestHpUnit - 적군 중 가장 체력이 낮은 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const lowestHpEnemy = tm.getLowestHpUnit(ATTACK_TYPES.ENEMY);
        // enemy1 (30), enemy2 (10) -> enemy2
        if (lowestHpEnemy && lowestHpEnemy.id === 'enemy2') {
            console.log("TargetingManager: getLowestHpUnit found correct lowest HP enemy. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getLowestHpUnit failed for lowest HP enemy. [FAIL]", lowestHpEnemy);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getLowestHpUnit (enemy) test. [FAIL]", e);
    }

    // 테스트 6: getLowestHpUnit - 유닛이 없을 때
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const noUnit = tm.getLowestHpUnit(ATTACK_TYPES.MERCENARY);
        if (noUnit === null) {
            console.log("TargetingManager: getLowestHpUnit returned null for no units. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getLowestHpUnit failed for no units. [FAIL]", noUnit);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getLowestHpUnit (no units) test. [FAIL]", e);
    }

    // 테스트 7: getHighestAttackUnit - 아군 중 가장 공격력이 높은 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const highestAttackAlly = tm.getHighestAttackUnit(ATTACK_TYPES.MERCENARY);
        // hero1 (10), hero2 (30), hero3 (5) -> hero2
        if (highestAttackAlly && highestAttackAlly.id === 'hero2') {
            console.log("TargetingManager: getHighestAttackUnit found correct highest attack ally. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getHighestAttackUnit failed for highest attack ally. [FAIL]", highestAttackAlly);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getHighestAttackUnit (ally) test. [FAIL]", e);
    }

    // 테스트 8: getHighestAttackUnit - 적군 중 가장 공격력이 높은 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const highestAttackEnemy = tm.getHighestAttackUnit(ATTACK_TYPES.ENEMY);
        // enemy1 (25), enemy2 (5) -> enemy1
        if (highestAttackEnemy && highestAttackEnemy.id === 'enemy1') {
            console.log("TargetingManager: getHighestAttackUnit found correct highest attack enemy. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getHighestAttackUnit failed for highest attack enemy. [FAIL]", highestAttackEnemy);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getHighestAttackUnit (enemy) test. [FAIL]", e);
    }

    // 테스트 9: getHighestMagicUnit - 아군 중 가장 마법 공격력이 높은 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const highestMagicAlly = tm.getHighestMagicUnit(ATTACK_TYPES.MERCENARY);
        // hero1 (5), hero2 (0), hero3 (25) -> hero3
        if (highestMagicAlly && highestMagicAlly.id === 'hero3') {
            console.log("TargetingManager: getHighestMagicUnit found correct highest magic ally. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getHighestMagicUnit failed for highest magic ally. [FAIL]", highestMagicAlly);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getHighestMagicUnit (ally) test. [FAIL]", e);
    }

    // 테스트 10: getHighestMagicUnit - 적군 중 가장 마법 공격력이 높은 유닛
    testCount++;
    try {
        mockBattleSimulationManager.unitsOnGrid = [...mockUnits];
        const tm = new TargetingManager(mockBattleSimulationManager);
        const highestMagicEnemy = tm.getHighestMagicUnit(ATTACK_TYPES.ENEMY);
        // enemy1 (0), enemy2 (40) -> enemy2
        if (highestMagicEnemy && highestMagicEnemy.id === 'enemy2') {
            console.log("TargetingManager: getHighestMagicUnit found correct highest magic enemy. [PASS]");
            passCount++;
        } else {
            console.error("TargetingManager: getHighestMagicUnit failed for highest magic enemy. [FAIL]", highestMagicEnemy);
        }
    } catch (e) {
        console.error("TargetingManager: Error during getHighestMagicUnit (enemy) test. [FAIL]", e);
    }

    console.log(`--- TargetingManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}

