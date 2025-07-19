import { ShadowEngine } from '../../js/managers/ShadowEngine.js';
import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.mjs';
import { GAME_DEBUG_MODE } from '../../js/constants.js';

export function runShadowEngineUnitTests() {
    if (!GAME_DEBUG_MODE) return;
    console.log('--- ShadowEngine Unit Test Start ---');

    const mockUnit = { id: 'u1', name: 'Test', gridX: 0, gridY: 0, currentHp: 10, image: true };
    const battleSimulationManager = {
        unitsOnGrid: [mockUnit],
        getGridRenderParameters: () => ({ effectiveTileSize: 64, gridOffsetX: 0, gridOffsetY: 0 })
    };
    const animationManager = {
        getRenderPosition: () => ({ drawX: 0, drawY: 0 })
    };

    const app = new PIXI.Application({ width: 100, height: 100, autoStart: false });
    const overlay = { app, shadowContainer: new PIXI.Container() };

    let se;
    try {
        se = new ShadowEngine(battleSimulationManager, animationManager, overlay);
        console.log('ShadowEngine: Initialized. [PASS]');
    } catch (e) {
        console.error('ShadowEngine: Initialization failed. [FAIL]', e);
    }

    try {
        se.update();
        if (overlay.shadowContainer.children.length === 1) {
            console.log('ShadowEngine: update created shadow. [PASS]');
        } else {
            console.error('ShadowEngine: update did not create shadow. [FAIL]');
        }
    } catch (e) {
        console.error('ShadowEngine: Error during update. [FAIL]', e);
    }

    console.log('--- ShadowEngine Unit Test End ---');
}
