// tests/unit/shadowEngineUnitTests.js

import { ShadowEngine } from '../../js/managers/ShadowEngine.js';
import { GAME_DEBUG_MODE } from '../../js/constants.js'; // 디버그 모드 상수 임포트

export function runShadowEngineUnitTests() {
    if (GAME_DEBUG_MODE) console.log("--- ShadowEngine Unit Test Start ---"); // \u2728 조건부 로그

    let testCount = 0;
    let passCount = 0;

    // Mock Dependencies
    const mockUnit = {
        id: 'u1', name: 'Test Unit', gridX: 5, gridY: 5, currentHp: 100,
        image: { width: 64, height: 64, src: 'mock_unit.png' } // 목업 이미지 객체
    };
    const mockBattleSimulationManager = {
        unitsOnGrid: [mockUnit],
        getGridRenderParameters: () => ({ effectiveTileSize: 100, gridOffsetX: 0, gridOffsetY: 0 })
    };
    const mockAnimationManager = {
        getRenderPosition: (unitId, gridX, gridY, effectiveTileSize, gridOffsetX, gridOffsetY) => ({
            drawX: gridX * effectiveTileSize + gridOffsetX,
            drawY: gridY * effectiveTileSize + gridOffsetY
        })
    };
    const mockMeasureManager = {};

    const mockCtx = {
        save: () => {},
        restore: () => {},
        beginPath: function() { this.beginPathCalled = true; },
        ellipse: function() { this.ellipseCalled = true; },
        fill: function() { this.fillCalled = true; },
        translate: () => {},
        scale: () => {},
        // 속성 추적
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        fillStyle: '',
        beginPathCalled: false,
        ellipseCalled: false,
        fillCalled: false,
    };


    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const se = new ShadowEngine(mockBattleSimulationManager, mockAnimationManager, mockMeasureManager);
        if (se.battleSimulationManager === mockBattleSimulationManager && se.shadowsEnabled === true) {
            if (GAME_DEBUG_MODE) console.log("ShadowEngine: Initialized correctly. [PASS]"); // \u2728 조건부 로그
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("ShadowEngine: Initialization failed. [FAIL]"); // \u2728 조건부 로그
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("ShadowEngine: Error during initialization. [FAIL]", e); // \u2728 조건부 로그
    }

    // 테스트 2: setShadowsEnabled 및 toggleShadows
    testCount++;
    try {
        const se = new ShadowEngine(mockBattleSimulationManager, mockAnimationManager, mockMeasureManager);
        se.setShadowsEnabled(false);
        if (se.shadowsEnabled === false) {
            if (GAME_DEBUG_MODE) console.log("ShadowEngine: setShadowsEnabled works. [PASS]"); // \u2728 조건부 로그
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("ShadowEngine: setShadowsEnabled failed. [FAIL]"); // \u2728 조건부 로그
        }

        se.toggleShadows();
        if (se.shadowsEnabled === true) {
            if (GAME_DEBUG_MODE) console.log("ShadowEngine: toggleShadows works. [PASS]"); // \u2728 조건부 로그
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("ShadowEngine: toggleShadows failed. [FAIL]"); // \u2728 조건부 로그
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("ShadowEngine: Error during toggle/set test. [FAIL]", e); // \u2728 조건부 로그
    }

    // 테스트 3: draw - 그림자가 활성화되어 있을 때 그리기 호출 확인
    testCount++;
    mockCtx.ellipseCalled = false;
    mockCtx.fillCalled = false;
    try {
        const se = new ShadowEngine(mockBattleSimulationManager, mockAnimationManager, mockMeasureManager);
        se.setShadowsEnabled(true);
        se.draw(mockCtx);

        if (mockCtx.ellipseCalled && mockCtx.fillCalled) {
            if (GAME_DEBUG_MODE) console.log("ShadowEngine: draw called drawing operations when enabled. [PASS]"); // \u2728 조건부 로그
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("ShadowEngine: draw failed to call drawing operations when enabled. [FAIL]"); // \u2728 조건부 로그
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("ShadowEngine: Error during draw (enabled) test. [FAIL]", e); // \u2728 조건부 로그
    }

    // 테스트 4: draw - 그림자가 비활성화되어 있을 때 그리기 호출 없음
    testCount++;
    mockCtx.ellipseCalled = false;
    mockCtx.fillCalled = false;
    try {
        const se = new ShadowEngine(mockBattleSimulationManager, mockAnimationManager, mockMeasureManager);
        se.setShadowsEnabled(false);
        se.draw(mockCtx);

        if (!mockCtx.ellipseCalled && !mockCtx.fillCalled) {
            if (GAME_DEBUG_MODE) console.log("ShadowEngine: draw correctly skipped drawing when disabled. [PASS]"); // \u2728 조건부 로그
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("ShadowEngine: draw unexpectedly called drawing operations when disabled. [FAIL]"); // \u2728 조건부 로그
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("ShadowEngine: Error during draw (disabled) test. [FAIL]", e); // \u2728 조건부 로그
    }

    // 테스트 5: draw - 죽은 유닛의 그림자는 그리지 않음
    testCount++;
    const mockDeadUnit = { ...mockUnit, currentHp: 0 };
    const originalUnits = mockBattleSimulationManager.unitsOnGrid;
    mockBattleSimulationManager.unitsOnGrid = [mockDeadUnit];
    mockCtx.ellipseCalled = false;
    mockCtx.fillCalled = false;
    try {
        const se = new ShadowEngine(mockBattleSimulationManager, mockAnimationManager, mockMeasureManager);
        se.setShadowsEnabled(true);
        se.draw(mockCtx);

        if (!mockCtx.ellipseCalled && !mockCtx.fillCalled) {
            if (GAME_DEBUG_MODE) console.log("ShadowEngine: draw correctly skipped drawing for dead unit. [PASS]"); // \u2728 조건부 로그
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("ShadowEngine: draw unexpectedly called drawing operations for dead unit. [FAIL]"); // \u2728 조건부 로그
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("ShadowEngine: Error during draw (dead unit) test. [FAIL]", e); // \u2728 조건부 로그
    } finally {
        mockBattleSimulationManager.unitsOnGrid = originalUnits; // 원본 복구
    }

    if (GAME_DEBUG_MODE) console.log(`--- ShadowEngine Unit Test End: ${passCount}/${testCount} tests passed ---`); // \u2728 조건부 로그
}
