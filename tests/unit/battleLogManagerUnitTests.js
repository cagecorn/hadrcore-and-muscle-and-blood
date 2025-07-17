// tests/unit/battleLogManagerUnitTests.js

import { BattleLogManager } from '../../js/managers/BattleLogManager.js';

export function runBattleLogManagerUnitTests(eventManager, measureManager) {
    console.log("--- BattleLogManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // Mock 캔버스 요소 및 컨텍스트 생성
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 600;
    mockCanvas.height = 120;
    const mockCtx = mockCanvas.getContext('2d');

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const logManager = new BattleLogManager(mockCanvas, eventManager, measureManager);
        if (logManager.logMessages instanceof Array && logManager.logMessages.length === 0) {
            console.log("BattleLogManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("BattleLogManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("BattleLogManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: 로그 메시지 추가
    testCount++;
    try {
        const logManager = new BattleLogManager(mockCanvas, eventManager, measureManager);
        logManager.addLog("Test message 1.");
        if (logManager.logMessages.length === 1 && logManager.logMessages[0].includes("Test message 1.")) {
            console.log("BattleLogManager: Added log message successfully. [PASS]");
            passCount++;
        } else {
            console.error("BattleLogManager: Failed to add log message. [FAIL]");
        }
    } catch (e) {
        console.error("BattleLogManager: Error adding log. [FAIL]", e);
    }

    // 테스트 3: 최대 로그 줄 수 초과 시 오래된 메시지 제거
    testCount++;
    try {
        const logManager = new BattleLogManager(mockCanvas, eventManager, measureManager);
        logManager.maxLogLines = 2;
        logManager.addLog("Oldest message.");
        logManager.addLog("Middle message.");
        logManager.addLog("Newest message.");

        if (logManager.logMessages.length === 2 &&
            logManager.logMessages[0].includes("Middle message.") &&
            logManager.logMessages[1].includes("Newest message.")) {
            console.log("BattleLogManager: Managed max log lines correctly. [PASS]");
            passCount++;
        } else {
            console.error("BattleLogManager: Failed to manage max log lines. [FAIL]", logManager.logMessages);
        }
    } catch (e) {
        console.error("BattleLogManager: Error managing log lines. [FAIL]", e);
    }

    // 테스트 4: draw 메서드 호출 시 캔버스에 그리는지 간접 확인
    testCount++;
    try {
        const logManager = new BattleLogManager(mockCanvas, eventManager, measureManager);
        logManager.addLog("Drawing test message.");

        const originalFillText = mockCtx.fillText;
        let fillTextCalled = false;
        mockCtx.fillText = function(text, ...args) {
            if (text.includes("Drawing test message.")) {
                fillTextCalled = true;
            }
            originalFillText.apply(this, args);
        };
        const originalFillRect = mockCtx.fillRect;
        let fillRectCalled = false;
        mockCtx.fillRect = function(...args) {
            fillRectCalled = true;
            originalFillRect.apply(this, args);
        };

        logManager.draw(mockCtx);

        if (fillTextCalled && fillRectCalled) {
            console.log("BattleLogManager: Draw method called and performed basic drawing operations. [PASS]");
            passCount++;
        } else {
            console.error("BattleLogManager: Draw method failed to perform expected drawing operations. [FAIL]");
        }
        mockCtx.fillText = originalFillText;
        mockCtx.fillRect = originalFillRect;
    } catch (e) {
        console.error("BattleLogManager: Error during draw. [FAIL]", e);
    }

    console.log(`--- BattleLogManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
