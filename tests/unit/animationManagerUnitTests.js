// tests/unit/animationManagerUnitTests.js
import { AnimationManager } from '../../js/managers/AnimationManager.js';

export function runAnimationManagerUnitTests() {
    console.log('--- AnimationManager Unit Test Start ---');

    let testCount = 0;
    let passCount = 0;

    const mockMeasureManager = {
        get: (key) => {
            if (key === 'battleStage.padding') return 0;
            return undefined;
        }
    };

    const mockLogicManager = {
        getCurrentSceneContentDimensions: () => ({ width: 1000, height: 1000 })
    };

    const mockBattleSimulationManager = {
        gridCols: 10,
        gridRows: 10,
        logicManager: mockLogicManager
    };

    // Test 1: Initialization
    testCount++;
    try {
        const am = new AnimationManager(mockMeasureManager, mockBattleSimulationManager);
        if (am.activeAnimations instanceof Map && am.animationSpeed > 0) {
            console.log('AnimationManager: Initialized correctly. [PASS]');
            passCount++;
        } else {
            console.error('AnimationManager: Initialization failed. [FAIL]');
        }
    } catch (e) {
        console.error('AnimationManager: Error during initialization. [FAIL]', e);
    }

    // Test 2: queueMoveAnimation and completion
    testCount++;
    try {
        const am = new AnimationManager(mockMeasureManager, mockBattleSimulationManager);
        let resolved = false;
        const promise = am.queueMoveAnimation('u1', 0, 0, 1, 0).then(() => { resolved = true; });
        const anim = am.activeAnimations.get('u1');
        anim.startTime = performance.now() - anim.duration - 1;
        am.update(0);
        promise.then(() => {
            if (resolved && !am.hasActiveAnimations()) {
                console.log('AnimationManager: queueMoveAnimation resolves after update. [PASS]');
                passCount++;
            } else {
                console.error('AnimationManager: Animation did not resolve correctly. [FAIL]');
            }
        });
    } catch (e) {
        console.error('AnimationManager: Error during queueMoveAnimation. [FAIL]', e);
    }

    // Test 3: getRenderPosition without animation
    testCount++;
    try {
        const am = new AnimationManager(mockMeasureManager, mockBattleSimulationManager);
        const pos = am.getRenderPosition('u1', 2, 3, 100, 0, 0);
        if (pos.drawX === 200 && pos.drawY === 300) {
            console.log('AnimationManager: getRenderPosition returns grid position when idle. [PASS]');
            passCount++;
        } else {
            console.error('AnimationManager: getRenderPosition returned unexpected value. [FAIL]', pos);
        }
    } catch (e) {
        console.error('AnimationManager: Error during getRenderPosition. [FAIL]', e);
    }

    setTimeout(() => {
        console.log(`--- AnimationManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
    }, 50);
}
