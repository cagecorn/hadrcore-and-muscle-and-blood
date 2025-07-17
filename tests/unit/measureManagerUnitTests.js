// tests/unit/measureManagerUnitTests.js

import { MeasureManager } from '../../js/managers/MeasureManager.js';

export function runMeasureManagerUnitTests() {
    console.log("--- MeasureManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const measureManager = new MeasureManager();
        if (measureManager._measurements) {
            console.log("MeasureManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("MeasureManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("MeasureManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: get 메서드 - 유효한 경로
    testCount++;
    try {
        const measureManager = new MeasureManager();
        const tileSize = measureManager.get('tileSize');
        if (typeof tileSize === 'number' && tileSize > 0) {
            console.log("MeasureManager: get('tileSize') returned expected value. [PASS]");
            passCount++;
        } else {
            console.error("MeasureManager: get('tileSize') failed. [FAIL]", tileSize);
        }
    } catch (e) {
        console.error("MeasureManager: Error during get (valid path) test. [FAIL]", e);
    }

    // 테스트 3: get 메서드 - 중첩 경로
    testCount++;
    try {
        const measureManager = new MeasureManager();
        const width = measureManager.get('gameResolution.width');
        if (typeof width === 'number' && width > 0) {
            console.log("MeasureManager: get('gameResolution.width') returned expected value. [PASS]");
            passCount++;
        } else {
            console.error("MeasureManager: get('gameResolution.width') failed. [FAIL]", width);
        }
    } catch (e) {
        console.error("MeasureManager: Error during get (nested path) test. [FAIL]", e);
    }

    // 테스트 4: get 메서드 - 존재하지 않는 경로
    testCount++;
    const originalWarn = console.warn;
    let warnCalled = false;
    console.warn = (message) => {
        if (message.includes("Measurement key 'nonExistent.key' not found.")) {
            warnCalled = true;
        }
        originalWarn(message);
    };
    try {
        const measureManager = new MeasureManager();
        const nonExistent = measureManager.get('nonExistent.key');
        if (nonExistent === undefined && warnCalled) {
            console.log("MeasureManager: get (non-existent path) returned undefined with warning. [PASS]");
            passCount++;
        } else {
            console.error("MeasureManager: get (non-existent path) failed. [FAIL]", nonExistent);
        }
    } catch (e) {
        console.error("MeasureManager: Error during get (non-existent path) test. [FAIL]", e);
    } finally {
        console.warn = originalWarn;
    }

    // 테스트 5: set 메서드 - 값 설정
    testCount++;
    try {
        const measureManager = new MeasureManager();
        const newValue = 1024;
        const setResult = measureManager.set('gameResolution.width', newValue);
        const retrievedValue = measureManager.get('gameResolution.width');

        if (setResult === true && retrievedValue === newValue) {
            console.log("MeasureManager: set('gameResolution.width') updated value correctly. [PASS]");
            passCount++;
        } else {
            console.error("MeasureManager: set('gameResolution.width') failed. [FAIL]", retrievedValue);
        }
    } catch (e) {
        console.error("MeasureManager: Error during set (valid path) test. [FAIL]", e);
    }

    // 테스트 6: set 메서드 - 존재하지 않는 경로에 설정 시도
    testCount++;
    const originalWarn2 = console.warn;
    let warnCalled2 = false;
    console.warn = (message) => {
        if (message.includes("Cannot set measurement. Path 'newCategory.value' does not exist.")) {
            warnCalled2 = true;
        }
        originalWarn2(message);
    };
    try {
        const measureManager = new MeasureManager();
        const setResult = measureManager.set('newCategory.value', 100);
        if (setResult === false && warnCalled2) {
            console.log("MeasureManager: set (non-existent parent path) failed with warning. [PASS]");
            passCount++;
        } else {
            console.error("MeasureManager: set (non-existent parent path) succeeded unexpectedly. [FAIL]");
        }
    } catch (e) {
        console.error("MeasureManager: Error during set (non-existent parent path) test. [FAIL]", e);
    } finally {
        console.warn = originalWarn2;
    }

    // 테스트 7: updateGameResolution 메서드
    testCount++;
    try {
        const measureManager = new MeasureManager();
        const newWidth = 1920;
        const newHeight = 1080;
        measureManager.updateGameResolution(newWidth, newHeight);
        const currentResolution = measureManager.get('gameResolution');

        if (currentResolution.width === newWidth && currentResolution.height === newHeight) {
            console.log("MeasureManager: updateGameResolution updated correctly. [PASS]");
            passCount++;
        } else {
            console.error("MeasureManager: updateGameResolution failed. [FAIL]", currentResolution);
        }
    } catch (e) {
        console.error("MeasureManager: Error during updateGameResolution test. [FAIL]", e);
    }

    console.log(`--- MeasureManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
