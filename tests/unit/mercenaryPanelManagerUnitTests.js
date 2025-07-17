// tests/unit/mercenaryPanelManagerUnitTests.js

import { MercenaryPanelManager } from '../../js/managers/MercenaryPanelManager.js';

export function runMercenaryPanelManagerUnitTests(measureManager, battleSimulationManager, logicManager, eventManager) {
    console.log("--- MercenaryPanelManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // Mock 캔버스와 컨텍스트 생성 (draw 테스트용)
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 600;
    mockCanvas.height = 200;
    const mockCtx = mockCanvas.getContext('2d');

    // 테스트 1: 초기화 및 캔버스 속성 확인
    testCount++;
    try {
        const panelManager = new MercenaryPanelManager(measureManager, battleSimulationManager, logicManager, eventManager);
        if (panelManager.gridRows === 2 && panelManager.gridCols === 6) {
            console.log("MercenaryPanelManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("MercenaryPanelManager: Initialization failed. [FAIL]", panelManager);
        }
    } catch (e) {
        console.error("MercenaryPanelManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: recalculatePanelDimensions 호출 후 슬롯 크기 확인
    testCount++;
    try {
        const panelManager = new MercenaryPanelManager(measureManager, battleSimulationManager, logicManager, eventManager);
        panelManager.recalculatePanelDimensions(); // 수동 호출
        const expectedSlotWidth = 600 / 6; // 600px / 6 cols
        const expectedSlotHeight = 200 / 2; // 200px / 2 rows

        if (panelManager.slotWidth === expectedSlotWidth && panelManager.slotHeight === expectedSlotHeight) {
            console.log("MercenaryPanelManager: Recalculated slot dimensions correctly. [PASS]");
            passCount++;
        } else {
            console.error("MercenaryPanelManager: Slot dimensions recalculation failed. [FAIL]", { slotWidth: panelManager.slotWidth, slotHeight: panelManager.slotHeight });
        }
    } catch (e) {
        console.error("MercenaryPanelManager: Error during recalculation. [FAIL]", e);
    }

    // 테스트 3: draw 메서드가 호출되는지 시각적 확인 (콘솔 로그를 통한 간접 확인)
    testCount++;
    try {
        const panelManager = new MercenaryPanelManager(measureManager, battleSimulationManager, logicManager, eventManager);
        const originalFillRect = mockCtx.fillRect;
        let fillRectCalled = false;
        mockCtx.fillRect = function(...args) {
            fillRectCalled = true;
            originalFillRect.apply(this, args);
        };

        panelManager.draw(mockCtx, 0, 0, 600, 200);

        if (fillRectCalled) {
            console.log("MercenaryPanelManager: Draw method called and performed basic drawing operations. [PASS]");
            passCount++;
        } else {
            console.error("MercenaryPanelManager: Draw method did not perform expected drawing operations. [FAIL]");
        }
        mockCtx.fillRect = originalFillRect; // 원본 복원
    } catch (e) {
        console.error("MercenaryPanelManager: Error during draw. [FAIL]", e);
    }

    // 테스트 4: 유닛이 있을 때 draw 메서드가 유닛 정보 그리는지 간접 확인
    testCount++;
    try {
        const mockUnit = {
            id: 'mockUnit1',
            name: 'Test Merc',
            currentHp: 70,
            baseStats: { hp: 100 },
            image: new Image()
        };
        const originalUnitsOnGrid = battleSimulationManager.unitsOnGrid;
        battleSimulationManager.unitsOnGrid = [mockUnit];

        const panelManager = new MercenaryPanelManager(measureManager, battleSimulationManager, logicManager, eventManager);
        const originalFillText = mockCtx.fillText;
        let fillTextCalledForUnit = false;
        mockCtx.fillText = function(text, ...args) {
            if (text.includes("Test Merc") || text.includes("HP:")) {
                fillTextCalledForUnit = true;
            }
            originalFillText.apply(this, args);
        };
        const originalDrawImage = mockCtx.drawImage;
        let drawImageCalledForUnit = false;
        mockCtx.drawImage = function(...args) {
            drawImageCalledForUnit = true;
            originalDrawImage.apply(this, args);
        };

        panelManager.draw(mockCtx, 0, 0, 600, 200);

        if (fillTextCalledForUnit && drawImageCalledForUnit) {
            console.log("MercenaryPanelManager: Draw method drew unit info and image. [PASS]");
            passCount++;
        } else {
            console.error("MercenaryPanelManager: Draw method failed to draw unit info/image. [FAIL]");
        }
        mockCtx.fillText = originalFillText; // 원본 복원
        mockCtx.drawImage = originalDrawImage; // 원본 복원
        battleSimulationManager.unitsOnGrid = originalUnitsOnGrid; // 복원

    } catch (e) {
        console.error("MercenaryPanelManager: Error during unit drawing test. [FAIL]", e);
    }

    console.log(`--- MercenaryPanelManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
