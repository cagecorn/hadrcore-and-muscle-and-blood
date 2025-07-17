// tests/unit/workflowManagerUnitTests.js

import { WorkflowManager } from '../../js/managers/WorkflowManager.js';
import { EventManager } from '../../js/managers/EventManager.js';
import { StatusEffectManager } from '../../js/managers/StatusEffectManager.js';
import { TurnCountManager } from '../../js/managers/TurnCountManager.js';
import { STATUS_EFFECTS } from '../../data/statusEffects.js';

export function runWorkflowManagerUnitTests(eventManager, statusEffectManager, battleSimulationManager) {
    console.log("--- WorkflowManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockStatusEffectManager = {
        applyStatusEffectCalled: false,
        applyStatusEffect: function(unitId, effectId) {
            this.applyStatusEffectCalled = true;
            console.log(`[MockStatusEffectManager] applyStatusEffect called for ${unitId}, ${effectId}`);
        }
    };

    const mockBattleSimulationManager = {
        unitsOnGrid: [
            { id: 'mockUnit1', name: 'Mock Unit 1', type: 'mercenary' },
            { id: 'mockUnit2', name: 'Mock Unit 2', type: 'enemy' }
        ]
    };

    testCount++;
    try {
        const wfManager = new WorkflowManager(eventManager, mockStatusEffectManager, mockBattleSimulationManager);
        if (wfManager.eventManager === eventManager && wfManager.statusEffectManager === mockStatusEffectManager) {
            console.log("WorkflowManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("WorkflowManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("WorkflowManager: Error during initialization. [FAIL]", e);
    }

    testCount++;
    let requestEventFired = false;
    eventManager.subscribe('requestStatusEffectApplication', (data) => {
        if (data.unitId === 'mockUnit1' && data.statusEffectId === 'status_poison') {
            requestEventFired = true;
        }
    });

    try {
        const wfManager = new WorkflowManager(eventManager, mockStatusEffectManager, mockBattleSimulationManager);
        wfManager.triggerStatusEffectApplication('mockUnit1', 'status_poison');
        if (requestEventFired) {
            console.log("WorkflowManager: triggerStatusEffectApplication fired request event. [PASS]");
            passCount++;
        } else {
            console.error("WorkflowManager: triggerStatusEffectApplication failed to fire request event. [FAIL]");
        }
    } catch (e) {
        console.error("WorkflowManager: Error during triggerStatusEffectApplication test. [FAIL]", e);
    }

    testCount++;
    mockStatusEffectManager.applyStatusEffectCalled = false;
    let logMessageEventFired = false;
    eventManager.subscribe('logMessage', (data) => {
        if (data.message.includes('독')) {
            logMessageEventFired = true;
        }
    });

    try {
        const wfManager = new WorkflowManager(eventManager, mockStatusEffectManager, mockBattleSimulationManager);
        wfManager._processStatusEffectApplication({ unitId: 'mockUnit2', statusEffectId: STATUS_EFFECTS.POISON.id });

        if (mockStatusEffectManager.applyStatusEffectCalled && logMessageEventFired) {
            console.log("WorkflowManager: _processStatusEffectApplication executed correctly. [PASS]");
            passCount++;
        } else {
            console.error("WorkflowManager: _processStatusEffectApplication failed. [FAIL]", mockStatusEffectManager.applyStatusEffectCalled, logMessageEventFired);
        }
    } catch (e) {
        console.error("WorkflowManager: Error during _processStatusEffectApplication test. [FAIL]", e);
    }

    testCount++;
    const originalWarn = console.warn;
    let warnCalled = false;
    console.warn = (message) => {
        if (message.includes("Target unit 'nonExistentUnit' not found")) {
            warnCalled = true;
        }
        originalWarn(message);
    };

    try {
        const wfManager = new WorkflowManager(eventManager, mockStatusEffectManager, mockBattleSimulationManager);
        mockStatusEffectManager.applyStatusEffectCalled = false;
        wfManager._processStatusEffectApplication({ unitId: 'nonExistentUnit', statusEffectId: STATUS_EFFECTS.POISON.id });

        if (warnCalled && !mockStatusEffectManager.applyStatusEffectCalled) {
            console.log("WorkflowManager: Handled non-existent unit gracefully. [PASS]");
            passCount++;
        } else {
            console.error("WorkflowManager: Failed to handle non-existent unit. [FAIL]");
        }
    } catch (e) {
        console.error("WorkflowManager: Error during non-existent unit test. [FAIL]", e);
    } finally {
        console.warn = originalWarn;
    }

    console.log(`--- WorkflowManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
