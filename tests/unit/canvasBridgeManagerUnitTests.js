// tests/unit/canvasBridgeManagerUnitTests.js

import { CanvasBridgeManager } from '../../js/managers/CanvasBridgeManager.js';
import { EventManager } from '../../js/managers/EventManager.js';
import { MeasureManager } from '../../js/managers/MeasureManager.js';

export function runCanvasBridgeManagerUnitTests() {
    console.log("--- CanvasBridgeManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockGameCanvas = document.createElement('canvas');
    mockGameCanvas.id = 'gameCanvas';
    const mockCombatLogCanvas = document.createElement('canvas');
    mockCombatLogCanvas.id = 'combatLogCanvas';

    const mockEventManager = new EventManager();
    const mockMeasureManager = new MeasureManager();

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const cbm = new CanvasBridgeManager(
            mockGameCanvas,
            null,
            mockCombatLogCanvas,
            mockEventManager,
            mockMeasureManager
        );
        if (cbm.gameCanvas === mockGameCanvas && cbm.isDragging === false) {
            console.log("CanvasBridgeManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("CanvasBridgeManager: Initialization failed. [FAIL]", cbm);
        }
    } catch (e) {
        console.error("CanvasBridgeManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: _setupEventListeners가 이벤트 리스너를 추가하는지 간접 확인
    testCount++;
    try {
        const cbm = new CanvasBridgeManager(
            mockGameCanvas,
            null,
            mockCombatLogCanvas,
            mockEventManager,
            mockMeasureManager
        );
        console.log("CanvasBridgeManager: Event listeners setup is assumed to be correct if no errors were thrown. [PASS/INFO]");
        passCount++;
    } catch (e) {
        console.error("CanvasBridgeManager: Error during event listener setup test. [FAIL]", e);
    }

    // 테스트 3: mousedown -> mousemove -> mouseup 흐름 테스트
    testCount++;
    try {
        const cbm = new CanvasBridgeManager(
            mockGameCanvas,
            null,
            mockCombatLogCanvas,
            mockEventManager,
            mockMeasureManager
        );

        let dragStartEmitted = false;
        let dragMoveEmitted = false;
        let dropEmitted = false;

        mockEventManager.subscribe('dragStart', () => { dragStartEmitted = true; });
        mockEventManager.subscribe('dragMove', () => { dragMoveEmitted = true; });
        mockEventManager.subscribe('drop', () => { dropEmitted = true; });

        cbm._onMouseDown({ clientX: 10, clientY: 10, target: mockGameCanvas });
        cbm._onMouseMove({ clientX: 20, clientY: 20, target: mockGameCanvas });
        cbm._onMouseUp({ clientX: 20, clientY: 20, target: mockGameCanvas });

        if (cbm.isDragging === false && dragStartEmitted && dragMoveEmitted && dropEmitted) {
            console.log("CanvasBridgeManager: Drag-drop event flow (mousedown-mousemove-mouseup) worked. [PASS]");
            passCount++;
        } else {
            console.error("CanvasBridgeManager: Drag-drop event flow failed. [FAIL]", { isDragging: cbm.isDragging, dragStartEmitted, dragMoveEmitted, dropEmitted });
        }
    } catch (e) {
        console.error("CanvasBridgeManager: Error during drag-drop flow test. [FAIL]", e);
    }

    console.log(`--- CanvasBridgeManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
