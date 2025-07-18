// tests/unit/classAIManagerUnitTests.js

import { ClassAIManager } from '../../js/managers/ClassAIManager.js';

export async function runClassAIManagerUnitTests() {
    console.log("--- ClassAIManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockHeroAIManager = {
        called: false,
        async determineAction(unit, allUnits) {
            this.called = true;
            return { actionType: 'heroAction', unitId: unit.id };
        }
    };

    const mockMonsterAI = {
        called: false,
        async getMeleeAIAction(unit, allUnits) {
            this.called = true;
            return { actionType: 'monsterAction', unitId: unit.id };
        }
    };

    const mockWarriorSkillsAI = {
        calledWith: null,
        async someSkill(user, target, skill) {
            this.calledWith = { user, target, skill };
        }
    };

    // Test 1: initialization
    testCount++;
    try {
        const manager = new ClassAIManager(mockHeroAIManager, mockMonsterAI, mockWarriorSkillsAI);
        if (manager.heroAIManager === mockHeroAIManager && manager.monsterAI === mockMonsterAI) {
            console.log("ClassAIManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("ClassAIManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("ClassAIManager: Error during initialization. [FAIL]", e);
    }

    // Test 2: hero unit delegates to HeroAIManager
    testCount++;
    mockHeroAIManager.called = false;
    mockMonsterAI.called = false;
    try {
        const manager = new ClassAIManager(mockHeroAIManager, mockMonsterAI, mockWarriorSkillsAI);
        const action = await manager.getBasicClassAction({ id: 'h1', type: 'mercenary' }, []);
        if (mockHeroAIManager.called && action && action.actionType === 'heroAction') {
            console.log("ClassAIManager: Hero action delegated correctly. [PASS]");
            passCount++;
        } else {
            console.error("ClassAIManager: Hero delegation failed. [FAIL]", action);
        }
    } catch (e) {
        console.error("ClassAIManager: Error during hero delegation test. [FAIL]", e);
    }

    // Test 3: enemy unit delegates to MonsterAI
    testCount++;
    mockHeroAIManager.called = false;
    mockMonsterAI.called = false;
    try {
        const manager = new ClassAIManager(mockHeroAIManager, mockMonsterAI, mockWarriorSkillsAI);
        const action = await manager.getBasicClassAction({ id: 'e1', type: 'enemy' }, []);
        if (mockMonsterAI.called && action && action.actionType === 'monsterAction') {
            console.log("ClassAIManager: Enemy action delegated correctly. [PASS]");
            passCount++;
        } else {
            console.error("ClassAIManager: Enemy delegation failed. [FAIL]", action);
        }
    } catch (e) {
        console.error("ClassAIManager: Error during enemy delegation test. [FAIL]", e);
    }

    // Test 4: executeSkillAI uses warriorSkillsAI
    testCount++;
    try {
        const manager = new ClassAIManager(mockHeroAIManager, mockMonsterAI, mockWarriorSkillsAI);
        await manager.executeSkillAI({ id: 'u1' }, { aiFunction: 'someSkill', name: 'TestSkill' }, { id: 't1' });
        if (mockWarriorSkillsAI.calledWith && mockWarriorSkillsAI.calledWith.skill.name === 'TestSkill') {
            console.log("ClassAIManager: executeSkillAI invoked correctly. [PASS]");
            passCount++;
        } else {
            console.error("ClassAIManager: executeSkillAI failed. [FAIL]");
        }
    } catch (e) {
        console.error("ClassAIManager: Error during executeSkillAI test. [FAIL]", e);
    }

    console.log(`--- ClassAIManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
