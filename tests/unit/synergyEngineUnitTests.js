// tests/unit/synergyEngineUnitTests.js

import { SynergyEngine } from '../../js/managers/SynergyEngine.js';
import { EventManager } from '../../js/managers/EventManager.js';
import { GAME_EVENTS } from '../../js/constants.js';

export function runSynergyEngineUnitTests(idManager, eventManager) {
    console.log("--- SynergyEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockIdManager = idManager || {};

    const mockEventManager = eventManager || new EventManager();
    let emittedEvents = [];
    const originalEmit = mockEventManager.emit;
    mockEventManager.emit = (eventName, data) => {
        emittedEvents.push({ eventName, data });
        originalEmit.call(mockEventManager, eventName, data);
    };

    testCount++;
    try {
        const se = new SynergyEngine(mockIdManager, mockEventManager);
        if (se.idManager === mockIdManager && se.eventManager === mockEventManager && se.synergyDefinitions instanceof Map && se.synergyDefinitions.size > 0) {
            console.log("SynergyEngine: Initialized correctly and loaded definitions. [PASS]");
            passCount++;
        } else {
            console.error("SynergyEngine: Initialization failed or no definitions loaded. [FAIL]");
        }
    } catch (e) {
        console.error("SynergyEngine: Error during initialization. [FAIL]", e);
    }

    testCount++;
    emittedEvents = [];
    try {
        const se = new SynergyEngine(mockIdManager, mockEventManager);
        const team = [
            { id: 'h1', synergies: ['synergy_warrior'] },
            { id: 'h2', synergies: ['synergy_warrior'] },
            { id: 'h3', synergies: ['synergy_mage'] }
        ];
        const activeSynergies = se.calculateActiveSynergies(team);

        if (activeSynergies.length === 2 &&
            activeSynergies.some(s => s.synergyId === 'synergy_warrior' && s.tier === 2) &&
            activeSynergies.some(s => s.synergyId === 'synergy_mage' && s.tier === 1)
        ) {
            console.log("SynergyEngine: calculateActiveSynergies correctly identified active synergies (Tier 1). [PASS]");
            passCount++;
        } else {
            console.error("SynergyEngine: calculateActiveSynergies failed for Tier 1. [FAIL]", activeSynergies);
        }
    } catch (e) {
        console.error("SynergyEngine: Error during calculateActiveSynergies (Tier 1) test. [FAIL]", e);
    }

    testCount++;
    emittedEvents = [];
    try {
        const se = new SynergyEngine(mockIdManager, mockEventManager);
        const team = [
            { id: 'h1', synergies: ['synergy_warrior'] },
            { id: 'h2', synergies: ['synergy_warrior'] },
            { id: 'h3', synergies: ['synergy_warrior'] },
            { id: 'h4', synergies: ['synergy_warrior'] }
        ];
        const activeSynergies = se.calculateActiveSynergies(team);

        if (activeSynergies.length === 1 &&
            activeSynergies[0].synergyId === 'synergy_warrior' &&
            activeSynergies[0].tier === 4 &&
            activeSynergies[0].effect.attackBonus === 25) {
            console.log("SynergyEngine: calculateActiveSynergies correctly identified highest active tier. [PASS]");
            passCount++;
        } else {
            console.error("SynergyEngine: calculateActiveSynergies failed for high tier. [FAIL]", activeSynergies);
        }
    } catch (e) {
        console.error("SynergyEngine: Error during calculateActiveSynergies (high tier) test. [FAIL]", e);
    }

    testCount++;
    emittedEvents = [];
    try {
        const se = new SynergyEngine(mockIdManager, mockEventManager);
        const team = [
            { id: 'h1', synergies: ['synergy_warrior'] },
            { id: 'h2', synergies: ['synergy_warrior'] },
            { id: 'h3', synergies: ['synergy_mage'] },
            { id: 'h4', synergies: ['synergy_mage'] }
        ];
        const activeSynergies = se.calculateActiveSynergies(team);

        const warriorSynergy = activeSynergies.find(s => s.synergyId === 'synergy_warrior');
        const mageSynergy = activeSynergies.find(s => s.synergyId === 'synergy_mage');

        if (activeSynergies.length === 2 &&
            warriorSynergy && warriorSynergy.tier === 2 &&
            mageSynergy && mageSynergy.tier === 2) {
            console.log("SynergyEngine: calculateActiveSynergies correctly identified multiple active synergies. [PASS]");
            passCount++;
        } else {
            console.error("SynergyEngine: calculateActiveSynergies failed for multiple synergies. [FAIL]", activeSynergies);
        }
    } catch (e) {
        console.error("SynergyEngine: Error during calculateActiveSynergies (multiple) test. [FAIL]", e);
    }

    testCount++;
    emittedEvents = [];
    try {
        const se = new SynergyEngine(mockIdManager, mockEventManager);
        const team = [
            { id: 'h1', synergies: ['synergy_unique_1'] },
            { id: 'h2', synergies: ['synergy_unique_2'] }
        ];
        const activeSynergies = se.calculateActiveSynergies(team);

        if (activeSynergies.length === 0) {
            console.log("SynergyEngine: calculateActiveSynergies correctly returned no active synergies. [PASS]");
            passCount++;
        } else {
            console.error("SynergyEngine: calculateActiveSynergies failed to return no active synergies. [FAIL]", activeSynergies);
        }
    } catch (e) {
        console.error("SynergyEngine: Error during calculateActiveSynergies (none active) test. [FAIL]", e);
    }

    testCount++;
    emittedEvents = [];
    try {
        const se = new SynergyEngine(mockIdManager, mockEventManager);
        const active = se.calculateActiveSynergies([
            { id: 'h1', synergies: ['synergy_warrior'] },
            { id: 'h2', synergies: ['synergy_warrior'] }
        ]);
        se.emitActiveSynergyEvents(active);

        const activatedEvents = emittedEvents.filter(e => e.eventName === GAME_EVENTS.SYNERGY_ACTIVATED);
        if (activatedEvents.length === 1 && activatedEvents[0].data.synergyId === 'synergy_warrior') {
            console.log("SynergyEngine: emitActiveSynergyEvents correctly emitted SYNERGY_ACTIVATED. [PASS]");
            passCount++;
        } else {
            console.error("SynergyEngine: emitActiveSynergyEvents failed to emit SYNERGY_ACTIVATED. [FAIL]", activatedEvents);
        }
    } catch (e) {
        console.error("SynergyEngine: Error during emitActiveSynergyEvents (active) test. [FAIL]", e);
    }

    testCount++;
    emittedEvents = [];
    try {
        const se = new SynergyEngine(mockIdManager, mockEventManager);
        const active = se.calculateActiveSynergies([]);
        se.emitActiveSynergyEvents(active);

        const deactivatedEvents = emittedEvents.filter(e => e.eventName === GAME_EVENTS.SYNERGY_DEACTIVATED);
        if (deactivatedEvents.length === 1 && deactivatedEvents[0].data.reason === 'noSynergiesActive') {
            console.log("SynergyEngine: emitActiveSynergyEvents correctly emitted SYNERGY_DEACTIVATED when no synergies are active. [PASS]");
            passCount++;
        } else {
            console.error("SynergyEngine: emitActiveSynergyEvents failed to emit SYNERGY_DEACTIVATED. [FAIL]", deactivatedEvents);
        }
    } catch (e) {
        console.error("SynergyEngine: Error during emitActiveSynergyEvents (no active) test. [FAIL]", e);
    }

    console.log(`--- SynergyEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
