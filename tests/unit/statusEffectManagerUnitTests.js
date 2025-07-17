// tests/unit/statusEffectManagerUnitTests.js

import { StatusEffectManager } from '../../js/managers/StatusEffectManager.js';
import { TurnCountManager } from '../../js/managers/TurnCountManager.js';
import { EventManager } from '../../js/managers/EventManager.js';

export function runStatusEffectManagerUnitTests(eventManager, idManager, turnCountManager, battleCalculationManager) {
    console.log("--- StatusEffectManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockBattleCalculationManager = {
        requestDamageCalculationCalled: false,
        requestDamageCalculation: function(attackerId, targetId, skillData) {
            this.requestDamageCalculationCalled = true;
            console.log(`[MockBattleCalculationManager] Damage calculation requested: ${attackerId} -> ${targetId} with ${JSON.stringify(skillData)}`);
        }
    };

    testCount++;
    try {
        const seManager = new StatusEffectManager(eventManager, idManager, turnCountManager, mockBattleCalculationManager);
        if (seManager.eventManager === eventManager && seManager.turnCountManager === turnCountManager) {
            console.log("StatusEffectManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("StatusEffectManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("StatusEffectManager: Error during initialization. [FAIL]", e);
    }

    testCount++;
    let effectAppliedEventFired = false;
    eventManager.subscribe('statusEffectApplied', (data) => {
        if (data.unitId === 'testUnit1' && data.statusEffectId === 'status_poison') {
            effectAppliedEventFired = true;
        }
    });
    turnCountManager.clearAllEffects();

    try {
        const seManager = new StatusEffectManager(eventManager, idManager, turnCountManager, mockBattleCalculationManager);
        seManager.applyStatusEffect('testUnit1', 'status_poison');
        const activeEffects = turnCountManager.getEffectsOfUnit('testUnit1');

        if (activeEffects && activeEffects.has('status_poison') && effectAppliedEventFired) {
            console.log("StatusEffectManager: applyStatusEffect applied effect and fired event. [PASS]");
            passCount++;
        } else {
            console.error("StatusEffectManager: applyStatusEffect failed. [FAIL]", activeEffects, effectAppliedEventFired);
        }
    } catch (e) {
        console.error("StatusEffectManager: Error during applyStatusEffect test. [FAIL]", e);
    }

    testCount++;
    let effectRemovedEventFired = false;
    eventManager.subscribe('statusEffectRemoved', (data) => {
        if (data.unitId === 'testUnit1' && data.statusEffectId === 'status_poison') {
            effectRemovedEventFired = true;
        }
    });

    try {
        const seManager = new StatusEffectManager(eventManager, idManager, turnCountManager, mockBattleCalculationManager);
        seManager.applyStatusEffect('testUnit1', 'status_poison');
        const removed = seManager.removeStatusEffect('testUnit1', 'status_poison');
        const activeEffects = turnCountManager.getEffectsOfUnit('testUnit1');

        if (removed && (!activeEffects || !activeEffects.has('status_poison')) && effectRemovedEventFired) {
            console.log("StatusEffectManager: removeStatusEffect removed effect and fired event. [PASS]");
            passCount++;
        } else {
            console.error("StatusEffectManager: removeStatusEffect failed. [FAIL]", removed, activeEffects, effectRemovedEventFired);
        }
    } catch (e) {
        console.error("StatusEffectManager: Error during removeStatusEffect test. [FAIL]", e);
    }

    testCount++;
    turnCountManager.clearAllEffects();
    try {
        const seManager = new StatusEffectManager(eventManager, idManager, turnCountManager, mockBattleCalculationManager);
        seManager.applyStatusEffect('testUnit2', 'status_stun');
        const activeEffects = seManager.getUnitActiveEffects('testUnit2');
        if (activeEffects && activeEffects.has('status_stun')) {
            console.log("StatusEffectManager: getUnitActiveEffects returned correct effects. [PASS]");
            passCount++;
        } else {
            console.error("StatusEffectManager: getUnitActiveEffects failed. [FAIL]", activeEffects);
        }
    } catch (e) {
        console.error("StatusEffectManager: Error during getUnitActiveEffects test. [FAIL]", e);
    }

    testCount++;
    turnCountManager.clearAllEffects();
    mockBattleCalculationManager.requestDamageCalculationCalled = false;
    let displayDamageEventFired = false;
    eventManager.subscribe('displayDamage', (data) => {
        if (data.unitId === 'testUnit3' && data.color === 'purple') {
            displayDamageEventFired = true;
        }
    });

    try {
        const seManager = new StatusEffectManager(eventManager, idManager, turnCountManager, mockBattleCalculationManager);
        seManager.applyStatusEffect('testUnit3', 'status_poison');

        eventManager.emit('unitTurnStart', { unitId: 'testUnit3' });

        if (mockBattleCalculationManager.requestDamageCalculationCalled && displayDamageEventFired) {
            console.log("StatusEffectManager: Poison damage applied on unitTurnStart. [PASS]");
            passCount++;
        } else {
            console.error("StatusEffectManager: Poison damage not applied on unitTurnStart. [FAIL]", mockBattleCalculationManager.requestDamageCalculationCalled, displayDamageEventFired);
        }
    } catch (e) {
        console.error("StatusEffectManager: Error during poison damage test. [FAIL]", e);
    }

    console.log(`--- StatusEffectManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
