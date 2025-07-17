// tests/unit/panelEngineUnitTests.js

import { PanelEngine } from '../../js/managers/PanelEngine.js';

export function runPanelEngineUnitTests() {
    console.log("--- PanelEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // Mock PanelManager
    const mockPanelManager = {
        drawCalled: false,
        draw: function(ctx) {
            this.drawCalled = true;
            ctx.testDrawCalled = true;
        }
    };

    // Mock Canvas Context
    const mockCtx = {
        testDrawCalled: false,
        clearRect: () => {},
        fillRect: () => {},
        fillText: () => {}
    };

    // 테스트 1: PanelEngine 초기화
    testCount++;
    try {
        const panelEngine = new PanelEngine();
        if (panelEngine.panels instanceof Map && panelEngine.panels.size === 0) {
            console.log("PanelEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("PanelEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("PanelEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: 패널 등록
    testCount++;
    try {
        const panelEngine = new PanelEngine();
        panelEngine.registerPanel('testPanel', mockPanelManager);
        if (panelEngine.panels.has('testPanel')) {
            console.log("PanelEngine: Panel registered successfully. [PASS]");
            passCount++;
        } else {
            console.error("PanelEngine: Panel registration failed. [FAIL]");
        }
    } catch (e) {
        console.error("PanelEngine: Error during panel registration. [FAIL]", e);
    }

    // 테스트 3: 패널 그리기 (등록된 패널)
    testCount++;
    try {
        const panelEngine = new PanelEngine();
        panelEngine.registerPanel('testPanel', mockPanelManager);
        mockPanelManager.drawCalled = false;
        mockCtx.testDrawCalled = false;

        panelEngine.drawPanel('testPanel', mockCtx);

        if (mockPanelManager.drawCalled && mockCtx.testDrawCalled) {
            console.log("PanelEngine: drawPanel called registered panel's draw method. [PASS]");
            passCount++;
        } else {
            console.error("PanelEngine: drawPanel failed to call registered panel's draw method. [FAIL]");
        }
    } catch (e) {
        console.error("PanelEngine: Error during drawPanel call. [FAIL]", e);
    }

    // 테스트 4: 패널 그리기 (등록되지 않은 패널)
    testCount++;
    const originalWarn = console.warn;
    let warnCalled = false;
    console.warn = (message) => {
        if (message.includes("PanelEngine] Panel 'nonExistentPanel' not found.")) {
            warnCalled = true;
        }
        originalWarn(message);
    };

    try {
        const panelEngine = new PanelEngine();
        mockPanelManager.drawCalled = false;
        panelEngine.drawPanel('nonExistentPanel', mockCtx);
        if (warnCalled && !mockPanelManager.drawCalled) {
            console.log("PanelEngine: drawPanel handled non-existent panel gracefully with warning. [PASS]");
            passCount++;
        } else {
            console.error("PanelEngine: drawPanel failed to handle non-existent panel. [FAIL]");
        }
    } catch (e) {
        console.error("PanelEngine: Error during non-existent panel draw. [FAIL]", e);
    } finally {
        console.warn = originalWarn;
    }

    console.log(`--- PanelEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
