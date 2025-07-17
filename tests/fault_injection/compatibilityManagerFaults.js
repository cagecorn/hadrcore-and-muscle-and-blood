// tests/fault_injection/compatibilityManagerFaults.js

export function injectCompatibilityManagerFaults(compatibilityManager) {
    console.warn("--- Injecting CompatibilityManager Faults ---");
    let faultTestCount = 0;
    let faultPassCount = 0;

    // \ud14c\uc2a4\ud2b8\ub97c \uc704\ud574 window.innerWidth/Height\ub97c \uc9c1\uc811 \uc870\uc7a1
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    function setViewport(width, height) {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: width });
        Object.defineProperty(window, 'innerHeight', { writable: true, value: height });
    }

    // \ud14c\uc2a4\ud2b8 1: MeasureManager.updateGameResolution\uc774 \ubd88\ub428\ud588\uc744 \ub54c
    faultTestCount++;
    const originalUpdateGameResolution = compatibilityManager.measureManager.updateGameResolution;
    compatibilityManager.measureManager.updateGameResolution = undefined; // \uba54\uc11c\ub4dc \uc81c\uac70
    try {
        console.log("CompatibilityManager Fault Test (Missing MeasureManager.updateGameResolution): Attempting adjustment...");
        setViewport(800, 600);
        compatibilityManager.adjustResolution();
        console.log("CompatibilityManager Fault Test (Missing MeasureManager.updateGameResolution): Did not crash. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("CompatibilityManager Fault Test (Missing MeasureManager.updateGameResolution): Threw unexpected error. [FAIL]", e);
    } finally {
        compatibilityManager.measureManager.updateGameResolution = originalUpdateGameResolution;
    }

    // \ud14c\uc2a4\ud2b8 2: Renderer.canvas\uac00 \uc720\ud6a8\ud558\uc9c0 \uc54a\uc744 \ub54c
    faultTestCount++;
    const originalCanvas = compatibilityManager.renderer.canvas;
    compatibilityManager.renderer.canvas = null;
    try {
        console.log("CompatibilityManager Fault Test (Null Renderer.canvas): Attempting adjustment...");
        setViewport(800, 600);
        compatibilityManager.adjustResolution();
        console.log("CompatibilityManager Fault Test (Null Renderer.canvas): Did not crash. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("CompatibilityManager Fault Test (Null Renderer.canvas): Threw unexpected error. [FAIL]", e);
    } finally {
        compatibilityManager.renderer.canvas = originalCanvas;
    }

    // \ud14c\uc2a4\ud2b8 3: UIEngine.recalculateUIDimensions\uac00 \ubd88\ub428\ud588\uc744 \ub54c
    faultTestCount++;
    const originalRecalculateUIDimensions = compatibilityManager.uiEngine.recalculateUIDimensions;
    compatibilityManager.uiEngine.recalculateUIDimensions = undefined;
    try {
        console.log("CompatibilityManager Fault Test (Missing UIEngine.recalculateUIDimensions): Attempting adjustment...");
        setViewport(800, 600);
        compatibilityManager.adjustResolution();
        console.log("CompatibilityManager Fault Test (Missing UIEngine.recalculateUIDimensions): Did not crash. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("CompatibilityManager Fault Test (Missing UIEngine.recalculateUIDimensions): Threw unexpected error. [FAIL]", e);
    } finally {
        compatibilityManager.uiEngine.recalculateUIDimensions = originalRecalculateUIDimensions;
    }

    // \ud14c\uc2a4\ud2b8 4: MapManager.recalculateMapDimensions\uac00 \ubd88\ub428\ud588\uc744 \ub54c
    faultTestCount++;
    const originalRecalculateMapDimensions = compatibilityManager.mapManager.recalculateMapDimensions;
    compatibilityManager.mapManager.recalculateMapDimensions = undefined;
    try {
        console.log("CompatibilityManager Fault Test (Missing MapManager.recalculateMapDimensions): Attempting adjustment...");
        setViewport(800, 600);
        compatibilityManager.adjustResolution();
        console.log("CompatibilityManager Fault Test (Missing MapManager.recalculateMapDimensions): Did not crash. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("CompatibilityManager Fault Test (Missing MapManager.recalculateMapDimensions): Threw unexpected error. [FAIL]", e);
    } finally {
        compatibilityManager.mapManager.recalculateMapDimensions = originalRecalculateMapDimensions;
    }

    // \ubdf0\ud3ec\ud2b8 \uc6d0\ubcf8\uc73c\ub85c \ubcf5\uc6d0
    setViewport(originalInnerWidth, originalInnerHeight);

    console.warn(`--- CompatibilityManager Fault Injection End: ${faultPassCount}/${faultTestCount} faults tested ---`);
}

