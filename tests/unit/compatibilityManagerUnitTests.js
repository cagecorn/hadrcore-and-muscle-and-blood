// tests/unit/compatibilityManagerUnitTests.js

export function runCompatibilityManagerUnitTests(compatibilityManagerClass) {
    console.log("--- CompatibilityManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // \ubaa8\uc758 MeasureManager
    const mockMeasureManager = {
        _resolution: { width: 1280, height: 720 },
        get: (keyPath) => {
            if (keyPath === 'gameResolution.width') return mockMeasureManager._resolution.width;
            if (keyPath === 'gameResolution.height') return mockMeasureManager._resolution.height;
            return undefined;
        },
        updateGameResolution: function(width, height) {
            this._resolution.width = width;
            this._resolution.height = height;
        }
    };

    // \ubaa8\uc758 Renderer
    const mockRenderer = {
        canvas: { width: 0, height: 0 }
    };

    // mock LogicManager with minimum resolution info
    const mockLogicManager = {
        getMinGameResolution: () => ({ minWidth: 800, minHeight: 600 })
    };

    // \ubaa8\uc758 UIEngine, MapManager
    const mockUIEngine = {
        recalculateUIDimensionsCalled: false,
        recalculateUIDimensions: function() { this.recalculateUIDimensionsCalled = true; }
    };
    const mockMapManager = {
        recalculateMapDimensionsCalled: false,
        recalculateMapDimensions: function() { this.recalculateMapDimensionsCalled = true; }
    };

    // \ud14c\uc2a4\ud2b8 \ud658\uacbd \uc124\uc815 (window.innerWidth/Height \ubaa8\uc758)
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    function setViewport(width, height) {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: width });
        Object.defineProperty(window, 'innerHeight', { writable: true, value: height });
    }

    // \ud14c\uc2a4\ud2b8 1: \ucd08\uae30\ud654 \ubc0f \ucd08\uae30 \uc870\uc815 \ud655\uc778 (Landscape)
    testCount++;
    setViewport(1920, 1080);
    const compatibilityManager1 = new compatibilityManagerClass(mockMeasureManager, mockRenderer, mockUIEngine, mockMapManager, mockLogicManager);
    compatibilityManager1.adjustResolution();

    if (mockMeasureManager._resolution.width === 1920 && mockMeasureManager._resolution.height === 1080 &&
        mockRenderer.canvas.width === 1920 && mockRenderer.canvas.height === 1080) {
        console.log("CompatibilityManager: Initial adjustment (Landscape) correct. [PASS]");
        passCount++;
    } else {
        console.error("CompatibilityManager: Initial adjustment (Landscape) failed. [FAIL]", mockMeasureManager._resolution, mockRenderer.canvas);
    }
    mockUIEngine.recalculateUIDimensionsCalled = false;
    mockMapManager.recalculateMapDimensionsCalled = false;

    // \ud14c\uc2a4\ud2b8 2: \uc138\ub85c \ubaa8\ub4dc (Portrait) - \ub108\ube44\uc5d0 \ub9de\ucf1c \ub192\uc774 \uc2a4\ucf04
    testCount++;
    setViewport(720, 1280);
    compatibilityManager1.adjustResolution();

    const expectedWidth2 = 720;
    const expectedHeight2 = Math.floor(expectedWidth2 / compatibilityManager1.baseAspectRatio);
    if (mockMeasureManager._resolution.width === expectedWidth2 && mockMeasureManager._resolution.height === expectedHeight2 &&
        mockRenderer.canvas.width === expectedWidth2 && mockRenderer.canvas.height === expectedHeight2) {
        console.log("CompatibilityManager: Adjustment (Portrait - fit width) correct. [PASS]");
        passCount++;
    } else {
        console.error("CompatibilityManager: Adjustment (Portrait - fit width) failed. [FAIL]", mockMeasureManager._resolution, mockRenderer.canvas);
    }
    if (mockUIEngine.recalculateUIDimensionsCalled && mockMapManager.recalculateMapDimensionsCalled) {
        console.log("CompatibilityManager: UIEngine and MapManager recalculation called. [PASS]");
        passCount++;
    } else {
        console.error("CompatibilityManager: UIEngine and MapManager recalculation NOT called. [FAIL]");
    }
    mockUIEngine.recalculateUIDimensionsCalled = false;
    mockMapManager.recalculateMapDimensionsCalled = false;

    // \ud14c\uc2a4\ud2b8 3: \uac70\ubd80 \ubaa8\ub4dc (Landscape) - \ub192\uc774\uc5d0 \ub9de\ucf1c \ub108\ube44 \uc2a4\ucf04
    testCount++;
    setViewport(1000, 500);
    compatibilityManager1.adjustResolution();

    const expectedHeight3 = 500;
    const expectedWidth3 = Math.floor(expectedHeight3 * compatibilityManager1.baseAspectRatio);
    if (mockMeasureManager._resolution.width === expectedWidth3 && mockMeasureManager._resolution.height === expectedHeight3 &&
        mockRenderer.canvas.width === expectedWidth3 && mockRenderer.canvas.height === expectedHeight3) {
        console.log("CompatibilityManager: Adjustment (Landscape - fit height) correct. [PASS]");
        passCount++;
    } else {
        console.error("CompatibilityManager: Adjustment (Landscape - fit height) failed. [FAIL]", mockMeasureManager._resolution, mockRenderer.canvas);
    }

    // \ud14c\uc2a4\ud2b8 4: \ubdf0\ud3ec\ud2b8\uac00 0\uc77c \ub54c (\uc608\uc81c \ucc98\ub9ac)
    testCount++;
    setViewport(0, 0);
    const originalWarn = console.warn;
    let warnCalled = false;
    console.warn = (msg) => {
        if (msg.includes("[CompatibilityManager] Viewport dimensions are zero, cannot adjust resolution.")) {
            warnCalled = true;
        }
        originalWarn(msg);
    };
    try {
        compatibilityManager1.adjustResolution();
        if (mockMeasureManager._resolution.width === 800 && mockMeasureManager._resolution.height === 600 && warnCalled) {
            console.log("CompatibilityManager: Handles zero viewport gracefully. [PASS]");
            passCount++;
        } else {
            console.error("CompatibilityManager: Failed to handle zero viewport. [FAIL]", mockMeasureManager._resolution);
        }
    } catch (e) {
        console.error("CompatibilityManager: Threw unexpected error with zero viewport. [FAIL]", e);
    } finally {
        console.warn = originalWarn;
    }

    // \ubdf0\ud3ec\ud2b8 \uc6d0\ubcf8\uc73c\ub85c \ubcf5\uc6d0
    setViewport(originalInnerWidth, originalInnerHeight);

    console.log(`--- CompatibilityManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}

