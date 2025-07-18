// tests/unit/warriorSkillsAIUnitTests.js

import { WarriorSkillsAI, WARRIOR_SKILLS } from '../../js/managers/warriormanager.js';
import { GAME_EVENTS, ATTACK_TYPES, GAME_DEBUG_MODE } from '../../js/constants.js';

export function runWarriorSkillsAIUnitTests() {
    if (GAME_DEBUG_MODE) console.log("--- WarriorSkillsAI Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // --- Mock Setup ---
    // 각 테스트 전에 상태를 초기화하기 위해 함수로 만듭니다.
    const createMockManagers = () => ({
        eventManager: {
            emittedEvents: [],
            emit(eventName, data) {
                this.emittedEvents.push({ eventName, data });
                if (GAME_DEBUG_MODE) console.log(`[MockEventManager] Emitted: ${eventName}`, data);
            }
        },
        workflowManager: {
            triggeredEffects: [],
            triggerStatusEffectApplication(unitId, effectId) {
                this.triggeredEffects.push({ unitId, statusEffectId: effectId });
            }
        },
        delayEngine: {
            async waitFor(ms) { /* 테스트에서는 즉시 완료 */ }
        },
        // 다른 필요한 목업 매니저들...
    });


    // --- Test Case 1: Battle Cry (기존 테스트 유지) ---
    testCount++;
    (async () => {
        const mockManagers = createMockManagers();
        const mockUserUnit = { id: 'w1', name: 'Test Warrior', currentHp: 100 };

        try {
            const warriorSkillsAI = new WarriorSkillsAI(mockManagers);
            await warriorSkillsAI.battleCry(mockUserUnit, WARRIOR_SKILLS.BATTLE_CRY);

            const skillNameEvent = mockManagers.eventManager.emittedEvents.find(e => e.eventName === GAME_EVENTS.DISPLAY_SKILL_NAME);
            const effectApplied = mockManagers.workflowManager.triggeredEffects.some(e => e.statusEffectId === 'status_battle_cry');

            if (skillNameEvent && effectApplied) {
                if (GAME_DEBUG_MODE) console.log("WarriorSkillsAI: Battle Cry executed correctly. [PASS]");
                passCount++;
            } else {
                if (GAME_DEBUG_MODE) console.error("WarriorSkillsAI: Battle Cry failed. [FAIL]");
            }
        } catch (e) {
            if (GAME_DEBUG_MODE) console.error("WarriorSkillsAI: Error during Battle Cry test. [FAIL]", e);
        }
    })();


    // --- Test Case 2: Double Strike ---
    testCount++;
    (async () => {
        const mockManagers = createMockManagers();
        const mockUserUnit = { id: 'w1', name: 'Test Warrior', currentHp: 100 };
        const mockTargetUnit = { id: 'e1', name: 'Test Enemy', currentHp: 50 };

        try {
            const warriorSkillsAI = new WarriorSkillsAI(mockManagers);
            await warriorSkillsAI.doubleStrike(mockUserUnit, mockTargetUnit, WARRIOR_SKILLS.DOUBLE_STRIKE);

            const skillNameEvent = mockManagers.eventManager.emittedEvents.find(e => e.eventName === GAME_EVENTS.DISPLAY_SKILL_NAME && e.data.skillName === '더블 스트라이크');
            const attackEvents = mockManagers.eventManager.emittedEvents.filter(e => e.eventName === GAME_EVENTS.UNIT_ATTACK_ATTEMPT && e.data.skillId === null);

            if (skillNameEvent && attackEvents.length === 2) {
                if (GAME_DEBUG_MODE) console.log("WarriorSkillsAI: Double Strike executed two basic attacks correctly. [PASS]");
                passCount++;
            } else {
                if (GAME_DEBUG_MODE) console.error(`WarriorSkillsAI: Double Strike failed. Expected 2 attacks, got ${attackEvents.length}. [FAIL]`);
            }
        } catch (e) {
            if (GAME_DEBUG_MODE) console.error("WarriorSkillsAI: Error during Double Strike test. [FAIL]", e);
        }
    })();


    // --- Test Case 3: Stone Skin ---
    testCount++;
    (async () => {
        const mockManagers = createMockManagers();
        const mockUserUnit = { id: 'w1', name: 'Test Warrior', currentHp: 100 };

        try {
            const warriorSkillsAI = new WarriorSkillsAI(mockManagers);
            await warriorSkillsAI.stoneSkin(mockUserUnit, WARRIOR_SKILLS.STONE_SKIN);

            const skillNameEvent = mockManagers.eventManager.emittedEvents.find(e => e.eventName === GAME_EVENTS.DISPLAY_SKILL_NAME && e.data.skillName === '스톤 스킨');
            const effectApplied = mockManagers.workflowManager.triggeredEffects.some(e => e.statusEffectId === 'status_stone_skin' && e.unitId === 'w1');

            if (skillNameEvent && effectApplied) {
                if (GAME_DEBUG_MODE) console.log("WarriorSkillsAI: Stone Skin applied buff to self correctly. [PASS]");
                passCount++;
            } else {
                if (GAME_DEBUG_MODE) console.error("WarriorSkillsAI: Stone Skin failed to apply buff. [FAIL]");
            }
        } catch (e) {
            if (GAME_DEBUG_MODE) console.error("WarriorSkillsAI: Error during Stone Skin test. [FAIL]", e);
        }
    })();

    // 비동기 테스트들이 완료될 시간을 잠시 기다립니다.
    setTimeout(() => {
        if (GAME_DEBUG_MODE) console.log(`--- WarriorSkillsAI Unit Test End: ${passCount}/${testCount} tests passed ---`);
    }, 500);
}
