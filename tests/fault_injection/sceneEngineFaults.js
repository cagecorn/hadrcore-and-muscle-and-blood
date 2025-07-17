// tests/fault_injection/sceneEngineFaults.js

export function injectSceneEngineFaults(sceneEngine) {
    console.warn("--- Injecting SceneEngine Faults ---");
    let faultTestCount = 0;
    let faultPassCount = 0;

    // \ud14c\uc2a4\ud2b8 1: \uc874\uc7ac\ud558\uc9c0 \uc54a\ub294 \uc2fc\uc73c\ub85c \uc124\uc815 \uc2dc \uacbd\uace0 \ubc1c\uc0dd \ud655\uc778
    faultTestCount++;
    const originalWarn = console.warn;
    let warnCalled = false;
    console.warn = (message) => {
        if (message.includes("SceneEngine] Scene 'nonExistentScene' not found.")) {
            warnCalled = true;
        }
        originalWarn(message);
    };

    try {
        console.log("SceneEngine Fault Test (Non-existent scene): Attempting to set non-existent scene...");
        sceneEngine.setCurrentScene('nonExistentScene');
        if (warnCalled) {
            console.log("SceneEngine Fault Test (Non-existent scene): Emitted expected warning. [PASS]");
            faultPassCount++;
        } else {
            console.error("SceneEngine Fault Test (Non-existent scene): Did not emit expected warning. [FAIL]");
        }
    } catch (e) {
        console.error("SceneEngine Fault Test (Non-existent scene): Threw unexpected error. [FAIL]", e);
    } finally {
        console.warn = originalWarn; // \uc6d0\ubcf8\uc73c\ub85c \ubcf5\uc6d0
    }

    // \ud14c\uc2a4\ud2b8 2: \ud604\uc7ac \uc2fc\uc774 \uc5c6\ub294 \uc0c1\ud0dc\uc5d0\uc11c update \ud638\ucd9c \uc2dc \uc624\ub958 \uc5c6\uc74c \ud655\uc778
    faultTestCount++;
    const originalCurrentSceneName = sceneEngine.getCurrentSceneName();
    sceneEngine.currentSceneName = null; // \uac15\uc81c\ub85c \ud604\uc7ac \uc2fc\uc744 null\ub85c \uc124\uc815
    try {
        console.log("SceneEngine Fault Test (Update with no current scene): Calling update with no scene set...");
        sceneEngine.update(16);
        console.log("SceneEngine Fault Test (Update with no current scene): Did not throw error. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("SceneEngine Fault Test (Update with no current scene): Threw unexpected error. [FAIL]", e);
    } finally {
        sceneEngine.setCurrentScene(originalCurrentSceneName); // \uc6d0\ubcf8\uc73c\ub85c \ubcf5\uc6d0
    }

    // \ud14c\uc2a4\ud2b8 3: \ud604\uc7ac \uc2fc\uc774 \uc5c6\ub294 \uc0c1\ud0dc\uc5d0\uc11c draw \ud638\ucd9c \uc2dc \uc624\ub958 \uc5c6\uc74c \ud655\uc778
    faultTestCount++;
    const mockCtx = {
        canvas: { width: 800, height: 600 },
        fillRect: () => {}, fillText: () => {}, strokeRect: () => {},
        save: () => {}, restore: () => {},
        translate: () => {}, scale: () => {},
        beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}
    };
    sceneEngine.currentSceneName = null; // \uac15\uc81c\ub85c \ud604\uc7ac \uc2fc\uc744 null\ub85c \uc124\uc815
    try {
        console.log("SceneEngine Fault Test (Draw with no current scene): Calling draw with no scene set...");
        sceneEngine.draw(mockCtx);
        console.log("SceneEngine Fault Test (Draw with no current scene): Did not throw error. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("SceneEngine Fault Test (Draw with no current scene): Threw unexpected error. [FAIL]", e);
    } finally {
        sceneEngine.setCurrentScene(originalCurrentSceneName); // \uc6d0\ubcf8\uc73c\ub85c \ubcf5\uc6d0
    }

    console.warn(`--- SceneEngine Fault Injection End: ${faultPassCount}/${faultTestCount} faults tested ---`);
}

