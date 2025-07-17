// tests/fault_injection/logicManagerFaults.js

export function injectLogicManagerFaults(logicManager) {
    console.warn("--- Injecting LogicManager Faults ---");
    let faultTestCount = 0;
    let faultPassCount = 0;

    // \ubaa8\uc758 MeasureManager
    const mockMeasureManager = {
        get: (keyPath) => {
            if (keyPath === 'gameResolution.width') return 1280;
            if (keyPath === 'gameResolution.height') return 720;
            if (keyPath === 'battleStage.widthRatio') return 1.0;
            if (keyPath === 'battleStage.heightRatio') return 1.0;
            if (keyPath === 'battleStage.padding') return 40;
            // \uc874\uc7ac\ud558\uc9c0 \uc54a\ub294 \ud0a4 \uacbd\ub85c\uc5d0 \ub300\ud55c \ubc18\ud55c\uac12 \ud14c\uc2a4\ud2b8
            if (keyPath === 'nonExistent.key') return undefined;
            return undefined;
        }
    };

    // \ud14c\uc2a4\ud2b8 1: \uc874\uc7ac\ud558\uc9c0 \uc54a\ub294 \uc2fc \uc774\ub984\uc5d0 \ub300\ud55c getCurrentSceneContentDimensions
    faultTestCount++;
    const mockSceneManagerUnknown = {
        getCurrentSceneName: () => 'completelyUnknownScene'
    };
    const faultyLogicManager1 = new logicManager.constructor(mockMeasureManager, mockSceneManagerUnknown);
    const originalWarn = console.warn;
    let warnCalled1 = false;
    console.warn = (message) => {
        if (message.includes("[LogicManager] Unknown scene name 'completelyUnknownScene'")) {
            warnCalled1 = true;
        }
        originalWarn(message);
    };
    try {
        console.log("LogicManager Fault Test (Unknown scene content dimensions): Checking unknown scene...");
        const dims = faultyLogicManager1.getCurrentSceneContentDimensions();
        if (warnCalled1 && dims.width === 1280 && dims.height === 720) {
            console.log("LogicManager Fault Test (Unknown scene content dimensions): Handled unknown scene gracefully with warning. [PASS]");
            faultPassCount++;
        } else {
            console.error("LogicManager Fault Test (Unknown scene content dimensions): Failed to handle unknown scene. [FAIL]", dims);
        }
    } catch (e) {
        console.error("LogicManager Fault Test (Unknown scene content dimensions): Threw unexpected error. [FAIL]", e);
    } finally {
        console.warn = originalWarn;
    }

    // \ud14c\uc2a4\ud2b8 2: MeasureManager\uc5d0\uc11c \ud544\uc218 \ud574\uc0c1\ub3c4 \uc815\ubcf4\ub97c \uc5bb\uc9c0 \ubabb\ud560 \ub54c (e.g., undefined \ubc18\ud658)
    faultTestCount++;
    const mockMeasureManagerNoResolution = {
        get: (keyPath) => {
            if (keyPath === 'gameResolution.width') return undefined; // \ub108\ube44 \uc5c6\uc74c
            if (keyPath === 'gameResolution.height') return 720;
            return undefined;
        }
    };
    const mockSceneManagerTerritory = {
        getCurrentSceneName: () => 'territoryScene'
    };
    const faultyLogicManager2 = new logicManager.constructor(mockMeasureManagerNoResolution, mockSceneManagerTerritory);
    let warnCalled2 = false;
    const originalWarn2 = console.warn;
    console.warn = (message) => {
        if (message.includes("Measurement key 'gameResolution.width' not found.")) {
            warnCalled2 = true;
        }
        originalWarn2(message);
    };

    try {
        console.log("LogicManager Fault Test (Missing game resolution data): Checking content dimensions...");
        const dims = faultyLogicManager2.getCurrentSceneContentDimensions();
        if (warnCalled2 && (isNaN(dims.width) || dims.width === undefined)) {
            console.log("LogicManager Fault Test (Missing game resolution data): Handled gracefully (e.g., NaN, undefined width). [PASS]");
            faultPassCount++;
        } else {
            console.error("LogicManager Fault Test (Missing game resolution data): Did not handle missing data as expected. [FAIL]", dims);
        }
    } catch (e) {
        console.error("LogicManager Fault Test (Missing game resolution data): Threw unexpected error. [FAIL]", e);
    } finally {
        console.warn = originalWarn2;
    }

    console.warn(`--- LogicManager Fault Injection End: ${faultPassCount}/${faultTestCount} faults tested ---`);
}

