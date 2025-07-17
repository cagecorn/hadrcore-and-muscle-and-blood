// tests/unit/classAIManagerUnitTests.js

import { ClassAIManager } from '../../js/managers/ClassAIManager.js';

export function runClassAIManagerUnitTests(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager) {
    console.log("--- ClassAIManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockWarriorUnit = {
        id: 'mockWarrior1', name: 'Warrior Test', type: 'mercenary',
        gridX: 0, gridY: 0, currentHp: 100, classId: 'class_warrior'
    };
    const mockWarriorClassData = {
        id: 'class_warrior', name: 'Warrior', moveRange: 3, attackRange: 1
    };
    const mockEnemyUnit = {
        id: 'mockEnemy1', name: 'Enemy Test', type: 'enemy',
        gridX: 5, gridY: 0, currentHp: 50
    };
    const mockUnknownClassUnit = {
        id: 'mockUnknown1', name: 'Unknown Unit', type: 'mercenary',
        gridX: 0, gridY: 0, currentHp: 100, classId: 'class_unknown'
    };
    const mockUnknownClassData = {
        id: 'class_unknown', name: 'Unknown', moveRange: 1, attackRange: 1
    };

    idManager.get = async (id) => {
        if (id === 'class_warrior') return mockWarriorClassData;
        if (id === 'class_unknown') return mockUnknownClassData;
        return undefined;
    };

    let basicAIManagerCalled = false;
    basicAIManager.determineMoveAndTarget = (unit, allUnits, moveRange, attackRange) => {
        basicAIManagerCalled = true;
        if (unit.id === 'mockWarrior1' && allUnits.includes(mockEnemyUnit)) {
            return { actionType: 'moveAndAttack', targetId: mockEnemyUnit.id, moveTargetX: 2, moveTargetY: 0 };
        }
        return null;
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const classAIManager = new ClassAIManager(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager);
        if (classAIManager.basicAIManager === basicAIManager) {
            console.log("ClassAIManager: Initialized correctly with BasicAIManager. [PASS]");
            passCount++;
        } else {
            console.error("ClassAIManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("ClassAIManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: 전사 유닛 행동 결정 (BasicAIManager 위임 확인)
    testCount++;
    basicAIManagerCalled = false;
    try {
        const classAIManager = new ClassAIManager(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager);
        battleSimulationManager.unitsOnGrid = [mockWarriorUnit, mockEnemyUnit];
        const action = await classAIManager.getBasicClassAction(mockWarriorUnit, battleSimulationManager.unitsOnGrid);

        if (basicAIManagerCalled && action && action.actionType === 'moveAndAttack') {
            console.log("ClassAIManager: Warrior action delegated to BasicAIManager correctly. [PASS]");
            passCount++;
        } else {
            console.error("ClassAIManager: Warrior action delegation failed. [FAIL]", action);
        }
    } catch (e) {
        console.error("ClassAIManager: Error during warrior action delegation test. [FAIL]", e);
    }

    // 테스트 3: 알 수 없는 클래스 유닛 행동 결정
    testCount++;
    basicAIManagerCalled = false;
    try {
        const classAIManager = new ClassAIManager(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager);
        battleSimulationManager.unitsOnGrid = [mockUnknownClassUnit, mockEnemyUnit];
        const action = await classAIManager.getBasicClassAction(mockUnknownClassUnit, battleSimulationManager.unitsOnGrid);

        if (basicAIManagerCalled && action === null) {
            console.log("ClassAIManager: Unknown class action delegated to BasicAIManager as default. [PASS]");
            passCount++;
        } else {
            console.error("ClassAIManager: Unknown class action delegation failed or returned unexpected. [FAIL]", action);
        }
    } catch (e) {
        console.error("ClassAIManager: Error during unknown class action test. [FAIL]", e);
    }

    // 테스트 4: 클래스 데이터 없을 때 경고 및 null 반환
    testCount++;
    const originalWarn = console.warn;
    let warnCalled = false;
    idManager.get = async (id) => {
        if (id === 'class_nonexistent') {
            return undefined;
        }
        return mockWarriorClassData;
    };
    console.warn = (message) => {
        if (message.includes("Class data not found for unit")) {
            warnCalled = true;
        }
        originalWarn(message);
    };

    try {
        const classAIManager = new ClassAIManager(idManager, battleSimulationManager, measureManager, basicAIManager, warriorSkillsAI, diceEngine, targetingManager);
        const mockUnitNoClass = { ...mockWarriorUnit, classId: 'class_nonexistent' };
        const action = await classAIManager.getBasicClassAction(mockUnitNoClass, battleSimulationManager.unitsOnGrid);

        if (warnCalled && action === null) {
            console.log("ClassAIManager: Handles missing class data gracefully with warning. [PASS]");
            passCount++;
        } else {
            console.error("ClassAIManager: Failed to handle missing class data. [FAIL]", action);
        }
    } catch (e) {
        console.error("ClassAIManager: Error during missing class data test. [FAIL]", e);
    } finally {
        console.warn = originalWarn;
    }

    console.log(`--- ClassAIManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
