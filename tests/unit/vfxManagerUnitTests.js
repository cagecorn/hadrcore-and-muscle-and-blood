// tests/unit/vfxManagerUnitTests.js

import { VFXManager } from '../../js/managers/VFXManager.js';
import { BattleSimulationManager } from '../../js/managers/BattleSimulationManager.js';
import { AnimationManager } from '../../js/managers/AnimationManager.js';
import { MeasureManager } from '../../js/managers/MeasureManager.js';
import { LogicManager } from '../../js/managers/LogicManager.js';
import { EventManager } from '../../js/managers/EventManager.js';

export function runVFXManagerUnitTests() {
    console.log("--- VFXManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 모의 객체들
    const mockRenderer = { canvas: { width: 800, height: 600 }, ctx: {} };
    const mockMeasureManager = new MeasureManager();
    const mockCameraEngine = {};
    const mockLogicManager = new LogicManager(mockMeasureManager, { getCurrentSceneName: () => 'battleScene' });
    const mockEventManager = new EventManager();

    const mockAnimationManager = new AnimationManager(mockMeasureManager);
    const mockBattleSimulationManager = new BattleSimulationManager(
        mockMeasureManager,
        {},
        {},
        mockLogicManager,
        mockAnimationManager,
        {}
    );
    mockAnimationManager.battleSimulationManager = mockBattleSimulationManager;

    const mockCtx = {
        fillRectCalled: false,
        fillTextCalled: false,
        strokeRectCalled: false,
        clearRect: () => {},
        fillRect: function() { this.fillRectCalled = true; },
        fillText: function() { this.fillTextCalled = true; },
        strokeRect: function() { this.strokeRectCalled = true; },
        save: () => {},
        restore: () => {},
        globalAlpha: 1,
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: ''
    };
    mockRenderer.ctx = mockCtx;

    const mockUnit = {
        id: 'u1',
        name: 'Test Unit',
        gridX: 5, gridY: 5,
        currentHp: 70, baseStats: { hp: 100, valor: 30 },
        currentBarrier: 45, maxBarrier: 60
    };
    mockBattleSimulationManager.addUnit(mockUnit, new Image(), mockUnit.gridX, mockUnit.gridY);

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const vfxManager = new VFXManager(mockRenderer, mockMeasureManager, mockCameraEngine, mockBattleSimulationManager, mockAnimationManager, mockEventManager);
        if (vfxManager.activeDamageNumbers instanceof Array && vfxManager.eventManager === mockEventManager) {
            console.log("VFXManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("VFXManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("VFXManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: addDamageNumber 메서드
    testCount++;
    try {
        const vfxManager = new VFXManager(mockRenderer, mockMeasureManager, mockCameraEngine, mockBattleSimulationManager, mockAnimationManager, mockEventManager);
        vfxManager.addDamageNumber(mockUnit.id, 25, 'yellow');
        if (vfxManager.activeDamageNumbers.length === 1 &&
            vfxManager.activeDamageNumbers[0].damage === 25 &&
            vfxManager.activeDamageNumbers[0].color === 'yellow') {
            console.log("VFXManager: addDamageNumber added number correctly. [PASS]");
            passCount++;
        } else {
            console.error("VFXManager: addDamageNumber failed. [FAIL]", vfxManager.activeDamageNumbers);
        }
    } catch (e) {
        console.error("VFXManager: Error during addDamageNumber test. [FAIL]", e);
    }

    // 테스트 3: update 메서드 - 데미지 숫자 제거 확인
    testCount++;
    try {
        const vfxManager = new VFXManager(mockRenderer, mockMeasureManager, mockCameraEngine, mockBattleSimulationManager, mockAnimationManager, mockEventManager);
        vfxManager.addDamageNumber(mockUnit.id, 10, 'red');
        const dmgNum = vfxManager.activeDamageNumbers[0];
        dmgNum.startTime = performance.now() - dmgNum.duration - 100;
        vfxManager.update(16);
        if (vfxManager.activeDamageNumbers.length === 0) {
            console.log("VFXManager: update removed expired damage number. [PASS]");
            passCount++;
        } else {
            console.error("VFXManager: update failed to remove expired damage number. [FAIL]", vfxManager.activeDamageNumbers);
        }
    } catch (e) {
        console.error("VFXManager: Error during update (remove expired) test. [FAIL]", e);
    }

    // 테스트 4: drawBarrierBar 메서드
    testCount++;
    try {
        const vfxManager = new VFXManager(mockRenderer, mockMeasureManager, mockCameraEngine, mockBattleSimulationManager, mockAnimationManager, mockEventManager);
        mockCtx.fillRectCalled = false;
        mockCtx.strokeRectCalled = false;

        const effectiveTileSize = 100;
        const actualDrawX = 100;
        const actualDrawY = 100;

        vfxManager.drawBarrierBar(mockCtx, mockUnit, effectiveTileSize, actualDrawX, actualDrawY);

        if (mockCtx.fillRectCalled && mockCtx.strokeRectCalled) {
            console.log("VFXManager: drawBarrierBar called drawing operations. [PASS]");
            passCount++;
        } else {
            console.error("VFXManager: drawBarrierBar did not call drawing operations. [FAIL]");
        }
    } catch (e) {
        console.error("VFXManager: Error during drawBarrierBar test. [FAIL]", e);
    }

    // 테스트 5: draw 메서드 - HP 바와 배리어 바, 데미지 숫자 그리기 호출 확인
    testCount++;
    try {
        const vfxManager = new VFXManager(mockRenderer, mockMeasureManager, mockCameraEngine, mockBattleSimulationManager, mockAnimationManager, mockEventManager);
        vfxManager.addDamageNumber(mockUnit.id, 50, 'red');

        mockCtx.fillRectCalled = false;
        mockCtx.strokeRectCalled = false;
        mockCtx.fillTextCalled = false;

        vfxManager.draw(mockCtx);

        if (mockCtx.fillRectCalled && mockCtx.strokeRectCalled && mockCtx.fillTextCalled) {
            console.log("VFXManager: draw called drawing operations for HP, Barrier, and Damage Numbers. [PASS]");
            passCount++;
        } else {
            console.error("VFXManager: draw failed to call all expected drawing operations. [FAIL]", {
                fillRect: mockCtx.fillRectCalled,
                strokeRect: mockCtx.strokeRectCalled,
                fillText: mockCtx.fillTextCalled
            });
        }
    } catch (e) {
        console.error("VFXManager: Error during draw method test. [FAIL]", e);
    }

    // 테스트 6: 이벤트 매니저를 통한 damageNumberDisplay 연동 확인 (간접적)
    testCount++;
    try {
        const vfxManager = new VFXManager(mockRenderer, mockMeasureManager, mockCameraEngine, mockBattleSimulationManager, mockAnimationManager, mockEventManager);
        vfxManager.activeDamageNumbers = [];
        mockEventManager.emit('displayDamage', { unitId: mockUnit.id, damage: 123, color: 'yellow' });

        setTimeout(() => {
            if (vfxManager.activeDamageNumbers.length > 0 &&
                vfxManager.activeDamageNumbers[0].damage === 123 &&
                vfxManager.activeDamageNumbers[0].color === 'yellow') {
                console.log("VFXManager: Successfully received and added damage number via EventManager. [PASS]");
                passCount++;
            } else {
                console.error("VFXManager: Failed to receive or add damage number via EventManager. [FAIL]", vfxManager.activeDamageNumbers);
            }
        }, 50);
    } catch (e) {
        console.error("VFXManager: Error during EventManager integration test. [FAIL]", e);
    }

    setTimeout(() => {
        console.log(`--- VFXManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
    }, 100);
}
