// tests/unit/uiEngineUnitTests.js

import { UIEngine } from '../../js/managers/UIEngine.js';
import { MeasureManager } from '../../js/managers/MeasureManager.js';
import { EventManager } from '../../js/managers/EventManager.js';

export function runUIEngineUnitTests() {
    console.log("--- UIEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockRenderer = {
        canvas: { width: 1280, height: 720, getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        ctx: {
            fillRect: function() { this.fillRectCalled = true; },
            fillText: function() { this.fillTextCalled = true; },
            clearRect: () => {}, save: () => {}, restore: () => {},
            font: '', textAlign: '', textBaseline: '', fillStyle: '',
            fillRectCalled: false, fillTextCalled: false
        }
    };
    const mockMeasureManager = new MeasureManager();
    const mockEventManager = new EventManager();
    const mockMercenaryPanelManager = { draw: () => {} };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager, mockMercenaryPanelManager);
        if (uiEngine.renderer === mockRenderer && uiEngine.getUIState() === 'mapScreen') {
            console.log("UIEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: Initialization failed. [FAIL]", uiEngine);
        }
    } catch (e) {
        console.error("UIEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: recalculateUIDimensions 호출 후 UI 폰트 크기 계산 확인
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager, mockMercenaryPanelManager);
        uiEngine.recalculateUIDimensions();

        const expectedFontSize = Math.floor(mockRenderer.canvas.height * mockMeasureManager.get('ui.fontSizeRatio'));

        if (uiEngine.uiFontSize === expectedFontSize) {
            console.log("UIEngine: Recalculated UI font size correctly. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: UI font size calculation failed. [FAIL]", uiEngine.uiFontSize);
        }
    } catch (e) {
        console.error("UIEngine: Error during recalculation. [FAIL]", e);
    }

    // 테스트 3: setUIState 및 getUIState
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager, mockMercenaryPanelManager);
        uiEngine.setUIState('combatScreen');
        if (uiEngine.getUIState() === 'combatScreen') {
            console.log("UIEngine: UI state set and retrieved correctly. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: Failed to set UI state. [FAIL]");
        }
    } catch (e) {
        console.error("UIEngine: Error setting/getting UI state. [FAIL]", e);
    }


    // 테스트 6: handleBattleStartClick - 이벤트 발생 확인 (간접)
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager, mockMercenaryPanelManager);
        let eventEmitted = false;
        mockEventManager.subscribe('battleStart', () => { eventEmitted = true; });

        uiEngine.handleBattleStartClick();

        if (eventEmitted) {
            console.log("UIEngine: handleBattleStartClick emitted 'battleStart' event. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: handleBattleStartClick failed to emit 'battleStart' event. [FAIL]");
        }
    } catch (e) {
        console.error("UIEngine: Error during handleBattleStartClick test. [FAIL]", e);
    }

    // 테스트 7: draw 메서드 (mapScreen)
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager, mockMercenaryPanelManager);
        uiEngine.setUIState('mapScreen');
        mockRenderer.ctx.fillRectCalled = false;
        mockRenderer.ctx.fillTextCalled = false;

        uiEngine.draw(mockRenderer.ctx);

        if (!mockRenderer.ctx.fillRectCalled && !mockRenderer.ctx.fillTextCalled) {
            console.log("UIEngine: draw (mapScreen) performed no canvas drawing as expected. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: draw (mapScreen) unexpectedly performed drawing ops. [FAIL]", { fillRect: mockRenderer.ctx.fillRectCalled, fillText: mockRenderer.ctx.fillTextCalled });
        }
    } catch (e) {
        console.error("UIEngine: Error during draw (mapScreen) test. [FAIL]", e);
    }

    // 테스트 8: draw 메서드 (combatScreen)
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager, mockMercenaryPanelManager);
        uiEngine.setUIState('combatScreen');
        mockRenderer.ctx.fillRectCalled = false;
        mockRenderer.ctx.fillTextCalled = false;

        uiEngine.draw(mockRenderer.ctx);

        if (!mockRenderer.ctx.fillRectCalled && !mockRenderer.ctx.fillTextCalled) {
            console.log("UIEngine: draw (combatScreen) performed no canvas drawing as expected. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: draw (combatScreen) unexpectedly performed drawing ops. [FAIL]", { fillRect: mockRenderer.ctx.fillRectCalled, fillText: mockRenderer.ctx.fillTextCalled });
        }
    } catch (e) {
        console.error("UIEngine: Error during draw (combatScreen) test. [FAIL]", e);
    }

    console.log(`--- UIEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
