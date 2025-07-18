// tests/unit/logicManagerUnitTests.js

export function runLogicManagerUnitTests(logicManager) {
    console.log("--- LogicManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // \ubaa8\uc758 MeasureManager
    const mockMeasureManager = {
        get: (keyPath) => {
            if (keyPath === 'gameResolution.width') return 1280;
            if (keyPath === 'gameResolution.height') return 720;
            if (keyPath === 'battleStage.widthRatio') return 1.0;
            if (keyPath === 'battleStage.heightRatio') return 1.0;
            if (keyPath === 'battleStage.padding') return 40;
            return undefined;
        }
    };

    // \ubaa8\uc758 SceneManager (\ud14c\uc2a4\ud2b8\ub97c \uc704\ud574 setCurrentScene\uc744 \uc9c1\uc811 \ud638\ucd9c\ud558\uc9c0 \uc54a\uace0 currentSceneName\uc744 \uc124\uc815)
    const mockSceneManagerTerritory = {
        getCurrentSceneName: () => 'territoryScene'
    };
    const mockSceneManagerBattle = {
        getCurrentSceneName: () => 'battleScene'
    };
    const mockSceneManagerUnknown = {
        getCurrentSceneName: () => 'unknownScene'
    };

    // \ud14c\uc2a4\ud2b8 1: \uc601\uc9c0 \uc2fc\uc758 \ucee8\ud150\uce20 \ud06c\uae30
    testCount++;
    let logicManagerTerritory = new logicManager.constructor(mockMeasureManager, mockSceneManagerTerritory);
    const territoryContent = logicManagerTerritory.getCurrentSceneContentDimensions();
    if (territoryContent.width === 1280 && territoryContent.height === 720) {
        console.log("LogicManager: Territory scene content dimensions correct. [PASS]");
        passCount++;
    } else {
        console.error("LogicManager: Territory scene content dimensions incorrect. [FAIL]", territoryContent);
    }

    // \ud14c\uc2a4\ud2b8 2: \ubc30\ud2c0 \uc2fc\uc758 \ucee8\ud150\uce20 \ud06c\uae30
    testCount++;
    let logicManagerBattle = new logicManager.constructor(mockMeasureManager, mockSceneManagerBattle);
    const battleContent = logicManagerBattle.getCurrentSceneContentDimensions();
    if (battleContent.width === 1280 && battleContent.height === 720) {
        console.log("LogicManager: Battle scene content dimensions correct. [PASS]");
        passCount++;
    } else {
        console.error("LogicManager: Battle scene content dimensions incorrect. [FAIL]", battleContent);
    }

    // \ud14c\uc2a4\ud2b8 3: \uc90c \uc81c\ud55c (\ucee8\ud150\uce20\uac00 \uce74\ubc84\uc2a4 \ud06c\uae30\uc77c \ub54c)
    testCount++;
    const zoomLimits = logicManagerBattle.getZoomLimits();
    const expectedMinZoom = 1.0; // 콘텐츠와 캔버스 크기가 동일
    if (Math.abs(zoomLimits.minZoom - expectedMinZoom) < 0.01 && zoomLimits.maxZoom === 10.0) {
        console.log("LogicManager: Zoom limits correct for canvas-sized content. [PASS]");
        passCount++;
    } else {
        console.error("LogicManager: Zoom limits incorrect. [FAIL]", zoomLimits);
    }

    // \ud14c\uc2a4\ud2b8 4: \ud310 \uc81c\uc57d (\uc90c 1.0\uc77c \ub54c, \ucee8\ud150\uce20\uac00 \uce74\ubc84\uc2a4 \ud06c\uae30\uc774\ub85c \uc911\uc559 \uc815\ub82c)
    testCount++;
    const panPos1 = logicManagerBattle.applyPanConstraints(50, 50, 1.0);
    if (panPos1.x === 0 && panPos1.y === 0) {
        console.log("LogicManager: Pan constraints correct for zoom 1.0 (centered). [PASS]");
        passCount++;
    } else {
        console.error("LogicManager: Pan constraints incorrect for zoom 1.0. [FAIL]", panPos1);
    }

    // \ud14c\uc2a4\ud2b8 5: \ud310 \uc81c\uc57d (\uc90c 2.0\uc77c \ub54c, \ucee8\ud150\uce20\uac00 \uce74\ubc84\uc2a4\ubcf4\ub2e4 \ucf00\uc57c \uc774\ub3d9 \uac00\ub2a5)
    testCount++;
    const panPos2 = logicManagerBattle.applyPanConstraints(100, 100, 2.0);
    if (panPos2.x === 0 && panPos2.y === 0) {
        console.log("LogicManager: Pan constraints correct for zoom 2.0 (within bounds). [PASS]");
        passCount++;
    } else {
        console.error("LogicManager: Pan constraints incorrect for zoom 2.0 (within bounds). [FAIL]", panPos2);
    }

    // \ud14c\uc2a4\ud2b8 6: \ud310 \uc81c\uc57d (\ubc94\uc704\ub97c \ubc8c\uc5b4\ub098\ub294 \uacbd\uc6b0)
    testCount++;
    const panPos3 = logicManagerBattle.applyPanConstraints(-2000, -1000, 2.0);
    if (panPos3.x === -1280 && panPos3.y === -720) {
        console.log("LogicManager: Pan constraints correct for out-of-bounds (clamped). [PASS]");
        passCount++;
    } else {
        console.error("LogicManager: Pan constraints incorrect for out-of-bounds. [FAIL]", panPos3);
    }

    console.log(`--- LogicManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}

