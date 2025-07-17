// tests/unit/microcosmHeroEngineUnitTests.js

import { MicrocosmHeroEngine } from '../../js/managers/MicrocosmHeroEngine.js';
import { GAME_DEBUG_MODE } from '../../js/constants.js';

// Web Worker는 Node.js 환경에서 사용할 수 없으므로, 테스트를 위한 Mock Worker를 만듭니다.
class MockWorker {
    constructor(script) {
        if (GAME_DEBUG_MODE) console.log(`[MockWorker] Created for script: ${script}`);
        this.onmessage = null;
        this.onerror = null;
    }

    postMessage(message) {
        if (GAME_DEBUG_MODE) console.log(`[MockWorker] Received message:`, message);
        // 'DETERMINE_ACTION' 메시지를 받으면, 잠시 후 'ACTION_DECIDED' 응답을 시뮬레이션합니다.
        if (message.type === 'DETERMINE_ACTION') {
            setTimeout(() => {
                if (this.onmessage) {
                    const mockAction = {
                        actionType: 'skill',
                        skillId: message.heroState.skillSlots[0],
                        targetId: message.battleState.enemies[0]?.id || 'mock_enemy',
                        logMessage: `${message.heroState.name}\uAC00 \uC790\uC2E0\uC758 \uC2A4\uD0AC '${message.heroState.skillSlots[0]}'(\uC744) \uC0AC\uC6A9\uD588\uB2E4!`
                    };
                    this.onmessage({ data: { type: 'ACTION_DECIDED', action: mockAction } });
                }
            }, 10); // 비동기 동작을 시뮬레이션하기 위해 약간의 딜레이를 줍니다.
        }
    }
}

// 실제 Worker를 MockWorker로 대체합니다.
globalThis.Worker = MockWorker;


export function runMicrocosmHeroEngineUnitTests() {
    if (GAME_DEBUG_MODE) console.log("--- MicrocosmHeroEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // Mock IdManager
    const mockIdManager = {
        data: new Map(),
        addOrUpdateId: async function(id, data) { this.data.set(id, data); },
        get: async function(id) { return this.data.get(id); }
    };

    const mockHeroData = {
        id: 'hero_grommash_001',
        name: '그롬마쉬',
        classId: 'class_warrior',
        skillSlots: ['skill_warrior_battle_cry', 'skill_warrior_rending_strike']
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const engine = new MicrocosmHeroEngine(mockIdManager);
        if (engine.idManager === mockIdManager && engine.heroInstances instanceof Map) {
            if (GAME_DEBUG_MODE) console.log("MicrocosmHeroEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: createHeroMicrocosm - 영웅 미시세계 생성
    testCount++;
    (async () => {
        try {
            const engine = new MicrocosmHeroEngine(mockIdManager);
            await engine.createHeroMicrocosm(mockHeroData);

            const instance = engine.heroInstances.get(mockHeroData.id);
            const storedData = await mockIdManager.get(mockHeroData.id);

            if (instance && instance.worker instanceof MockWorker && storedData.name === '그롬마쉬') {
                if (GAME_DEBUG_MODE) console.log("MicrocosmHeroEngine: createHeroMicrocosm created instance and stored data. [PASS]");
                passCount++;
            } else {
                if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: createHeroMicrocosm failed. [FAIL]", { instance, storedData });
            }
        } catch (e) {
            if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: Error during createHeroMicrocosm test. [FAIL]", e);
        }
    })();

    // 테스트 3: determineHeroAction - AI Worker와 상호작용
    testCount++;
    (async () => {
        try {
            const engine = new MicrocosmHeroEngine(mockIdManager);
            await engine.createHeroMicrocosm(mockHeroData);

            const mockBattleState = {
                enemies: [{ id: 'enemy_grunt_01', name: '그런트' }],
                allies: [mockHeroData]
            };

            const action = await engine.determineHeroAction(mockHeroData.id, mockBattleState);

            if (action && action.actionType === 'skill' && action.skillId === mockHeroData.skillSlots[0] && action.logMessage.includes('그롬마쉬')) {
                if (GAME_DEBUG_MODE) console.log("MicrocosmHeroEngine: determineHeroAction received correct action from worker. [PASS]");
                passCount++;
            } else {
                if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: determineHeroAction failed. [FAIL]", action);
            }
        } catch (e) {
            if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: Error during determineHeroAction test. [FAIL]", e);
        }
    })();


    setTimeout(() => {
        if (GAME_DEBUG_MODE) console.log(`--- MicrocosmHeroEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
    }, 200);
}
