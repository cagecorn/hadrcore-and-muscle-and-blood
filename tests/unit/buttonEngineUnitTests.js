// tests/unit/buttonEngineUnitTests.js
import { ButtonEngine } from '../../js/managers/ButtonEngine.js';

export function runButtonEngineUnitTests() {
    console.log('--- ButtonEngine Unit Test Start ---');

    let testCount = 0;
    let passCount = 0;

    // Test 1: Initialization
    testCount++;
    try {
        const be = new ButtonEngine();
        if (be.buttons instanceof Map && be.buttons.size === 0) {
            console.log('ButtonEngine: Initialized correctly. [PASS]');
            passCount++;
        } else {
            console.error('ButtonEngine: Initialization failed. [FAIL]');
        }
    } catch (e) {
        console.error('ButtonEngine: Error during initialization. [FAIL]', e);
    }

    // Test 2: registerButton and getButtonRect
    testCount++;
    try {
        const be = new ButtonEngine();
        let called = false;
        be.registerButton('btn', 10, 10, 20, 20, () => { called = true; });
        const rect = be.getButtonRect('btn');
        if (rect && rect.x === 10 && rect.y === 10 && rect.width === 20 && rect.height === 20) {
            console.log('ButtonEngine: registerButton stored rect correctly. [PASS]');
            passCount++;
        } else {
            console.error('ButtonEngine: registerButton did not store rect. [FAIL]', rect);
        }
    } catch (e) {
        console.error('ButtonEngine: Error during registerButton test. [FAIL]', e);
    }

    // Test 3: updateButtonRect
    testCount++;
    try {
        const be = new ButtonEngine();
        be.registerButton('btn', 0, 0, 10, 10, () => {});
        be.updateButtonRect('btn', 5, 5, 15, 15);
        const rect = be.getButtonRect('btn');
        if (rect && rect.x === 5 && rect.y === 5 && rect.width === 15 && rect.height === 15) {
            console.log('ButtonEngine: updateButtonRect updated rect correctly. [PASS]');
            passCount++;
        } else {
            console.error('ButtonEngine: updateButtonRect failed. [FAIL]', rect);
        }
    } catch (e) {
        console.error('ButtonEngine: Error during updateButtonRect test. [FAIL]', e);
    }

    // Test 4: handleCanvasClick
    testCount++;
    try {
        const be = new ButtonEngine();
        let invoked = false;
        be.registerButton('btn', 0, 0, 10, 10, () => { invoked = true; });
        const id = be.handleCanvasClick(5, 5);
        if (invoked && id === 'btn') {
            console.log('ButtonEngine: handleCanvasClick triggered callback. [PASS]');
            passCount++;
        } else {
            console.error('ButtonEngine: handleCanvasClick failed. [FAIL]', { invoked, id });
        }
    } catch (e) {
        console.error('ButtonEngine: Error during handleCanvasClick test. [FAIL]', e);
    }

    console.log(`--- ButtonEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
