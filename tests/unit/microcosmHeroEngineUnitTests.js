// tests/unit/microcosmHeroEngineUnitTests.js

import { MicrocosmHeroEngine } from '../../js/managers/MicrocosmHeroEngine.js';
import { GAME_DEBUG_MODE } from '../../js/constants.js';

// 웹 워커가 제거되었으므로, 더 이상 MockWorker가 필요하지 않습니다.


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

    // 테스트 2: createHeroMicrocosm - 영웅 미시세계 생성 (No Worker)
    testCount++;
    (async () => {
        try {
            const engine = new MicrocosmHeroEngine(mockIdManager);
            await engine.createHeroMicrocosm(mockHeroData);

            const instance = engine.heroInstances.get(mockHeroData.id);
            const storedData = await mockIdManager.get(mockHeroData.id);

            // worker 인스턴스가 없는지 확인합니다.
            if (instance && instance.worker === undefined && storedData.name === '그롬마쉬') {
                if (GAME_DEBUG_MODE) console.log("MicrocosmHeroEngine: createHeroMicrocosm created instance without worker. [PASS]");
                passCount++;
            } else {
                if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: createHeroMicrocosm failed. [FAIL]", { instance, storedData });
            }
        } catch (e) {
            if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: Error during createHeroMicrocosm test. [FAIL]", e);
        }
    })();

    // 테스트 3: determineHeroAction - 이제 null을 반환해야 합니다.
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

            if (action === null) {
                if (GAME_DEBUG_MODE) console.log("MicrocosmHeroEngine: determineHeroAction returned null as expected. [PASS]");
                passCount++;
            } else {
                if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: determineHeroAction failed. Expected null. [FAIL]", action);
            }
        } catch (e) {
            if (GAME_DEBUG_MODE) console.error("MicrocosmHeroEngine: Error during determineHeroAction test. [FAIL]", e);
        }
    })();


    setTimeout(() => {
        if (GAME_DEBUG_MODE) console.log(`--- MicrocosmHeroEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
    }, 200);
}
