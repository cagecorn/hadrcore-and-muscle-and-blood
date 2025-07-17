// tests/unit/disarmManagerUnitTests.js

import { DisarmManager } from '../../js/managers/DisarmManager.js';
import { EventManager } from '../../js/managers/EventManager.js';
import { MeasureManager } from '../../js/managers/MeasureManager.js';

export function runDisarmManagerUnitTests(eventManager, measureManager, statusEffectManager, battleSimulationManager) {
    console.log("--- DisarmManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // mock BattleSimulationManager if not provided
    const bsm = battleSimulationManager || {
        unitsOnGrid: [
            {
                id: 'unit_zombie_001',
                name: '테스트 좀비',
                type: 'enemy',
                currentHp: 0,
                gridX: 0,
                gridY: 0,
                image: new Image(),
                assetLoaderManager: {
                    getImage: () => new Image()
                }
            },
            {
                id: 'unit_warrior_001',
                name: '테스트 전사',
                type: 'mercenary',
                currentHp: 0,
                gridX: 1,
                gridY: 0,
                image: new Image()
            }
        ],
        assetLoaderManager: {
            getImage: () => new Image()
        }
    };

    const mockStatusEffectManager = statusEffectManager || {
        applyStatusEffectCalled: false,
        appliedEffectId: null,
        applyStatusEffect(unitId, effectId) {
            this.applyStatusEffectCalled = true;
            this.appliedEffectId = effectId;
        }
    };

    const mm = measureManager || new MeasureManager();

    // 테스트 1: 초기화
    testCount++;
    try {
        const dm = new DisarmManager(eventManager, mockStatusEffectManager, bsm, mm);
        if (dm.eventManager === eventManager && dm.statusEffectManager === mockStatusEffectManager) {
            console.log("DisarmManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("DisarmManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("DisarmManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: 좀비 유닛 사망 처리
    testCount++;
    mockStatusEffectManager.applyStatusEffectCalled = false;
    let weaponEvent = false;
    let disarmedEvent = false;
    const originalSetting = mm.get('gameConfig.enableDisarmSystem');
    mm.set('gameConfig.enableDisarmSystem', true);

    eventManager.subscribe('weaponDropped', (data) => {
        if (data.unitId === 'unit_zombie_001') weaponEvent = true;
    });
    eventManager.subscribe('unitDisarmed', (data) => {
        if (data.unitId === 'unit_zombie_001') disarmedEvent = true;
    });

    try {
        const dm = new DisarmManager(eventManager, mockStatusEffectManager, bsm, mm);
        dm._onUnitDeath({ unitId: 'unit_zombie_001', unitName: '테스트 좀비', unitType: 'enemy' });
        const zombieUnit = bsm.unitsOnGrid[0];
        const imageChanged = zombieUnit.image !== null;
        if (mockStatusEffectManager.applyStatusEffectCalled && mockStatusEffectManager.appliedEffectId === 'status_disarmed' && weaponEvent && disarmedEvent && imageChanged) {
            console.log("DisarmManager: Zombie unit disarmed correctly. [PASS]");
            passCount++;
        } else {
            console.error("DisarmManager: Zombie unit disarm failed. [FAIL]");
        }
    } catch (e) {
        console.error("DisarmManager: Error during zombie disarm test. [FAIL]", e);
    } finally {
        mm.set('gameConfig.enableDisarmSystem', originalSetting);
    }

    // 테스트 3: 시스템 비활성화 시 동작하지 않음
    testCount++;
    mockStatusEffectManager.applyStatusEffectCalled = false;
    weaponEvent = false;
    disarmedEvent = false;
    mm.set('gameConfig.enableDisarmSystem', false);

    try {
        const dm = new DisarmManager(eventManager, mockStatusEffectManager, bsm, mm);
        dm._onUnitDeath({ unitId: 'unit_zombie_001', unitName: '테스트 좀비', unitType: 'enemy' });
        if (!mockStatusEffectManager.applyStatusEffectCalled && !weaponEvent && !disarmedEvent) {
            console.log("DisarmManager: Disarm skipped when disabled. [PASS]");
            passCount++;
        } else {
            console.error("DisarmManager: Disarm executed despite disabled. [FAIL]");
        }
    } catch (e) {
        console.error("DisarmManager: Error during disabled system test. [FAIL]", e);
    } finally {
        mm.set('gameConfig.enableDisarmSystem', originalSetting);
    }

    // 테스트 4: 다른 유닛 사망 시 로직 건너뜀
    testCount++;
    mockStatusEffectManager.applyStatusEffectCalled = false;
    weaponEvent = false;
    disarmedEvent = false;
    mm.set('gameConfig.enableDisarmSystem', true);

    try {
        const dm = new DisarmManager(eventManager, mockStatusEffectManager, bsm, mm);
        dm._onUnitDeath({ unitId: 'unit_warrior_001', unitName: '테스트 전사', unitType: 'mercenary' });
        if (!mockStatusEffectManager.applyStatusEffectCalled && !weaponEvent && !disarmedEvent) {
            console.log("DisarmManager: Non-zombie disarm skipped. [PASS]");
            passCount++;
        } else {
            console.error("DisarmManager: Disarm processed for non-zombie. [FAIL]");
        }
    } catch (e) {
        console.error("DisarmManager: Error during non-zombie test. [FAIL]", e);
    } finally {
        mm.set('gameConfig.enableDisarmSystem', originalSetting);
    }

    console.log(`--- DisarmManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
