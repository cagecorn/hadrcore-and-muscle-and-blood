// tests/unit/shadowEngineUnitTests.js
import { ShadowEngine } from '../../js/managers/ShadowEngine.js';

export function runShadowEngineUnitTests() {
    console.log('--- ShadowEngine Unit Test Start ---');

    let testCount = 0;
    let passCount = 0;

    // Basic stubs
    const unit = { id: 'u1', name: 'Test', gridX: 0, gridY: 0, currentHp: 10, image: true };
    const battleSimulationManager = {
        unitsOnGrid: [unit],
        getGridRenderParameters: () => ({ effectiveTileSize: 64, gridOffsetX: 0, gridOffsetY: 0 })
    };
    const animationManager = {
        getRenderPosition: () => ({ drawX: 0, drawY: 0 })
    };
    const overlay = {
        app: {},
        shadowContainer: { children: [], addChild(c){ this.children.push(c); }, removeChild(c){ const i=this.children.indexOf(c); if(i>=0) this.children.splice(i,1); } }
    };

    // Test 1: initialization
    testCount++;
    try {
        const se = new ShadowEngine(battleSimulationManager, animationManager, overlay);
        console.log('ShadowEngine: Initialized. [PASS]');
        passCount++;
    } catch (e) {
        console.error('ShadowEngine: Initialization failed. [FAIL]', e);
    }

    // Test 2: update creates shadow graphics
    testCount++;
    try {
        const se = new ShadowEngine(battleSimulationManager, animationManager, overlay);
        se.update();
        if (overlay.shadowContainer.children.length === 1) {
            console.log('ShadowEngine: update created shadow. [PASS]');
            passCount++;
        } else {
            console.error('ShadowEngine: update did not create shadow. [FAIL]');
        }
    } catch (e) {
        console.error('ShadowEngine: Error during update. [FAIL]', e);
    }

    console.log(`--- ShadowEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
