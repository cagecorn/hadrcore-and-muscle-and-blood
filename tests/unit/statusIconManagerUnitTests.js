// tests/unit/statusIconManagerUnitTests.js

import { StatusIconManager } from '../../js/managers/StatusIconManager.js';
import { GAME_DEBUG_MODE } from '../../js/constants.js';
import { STATUS_EFFECT_TYPES } from '../../data/statusEffects.js';

export function runStatusIconManagerUnitTests() {
    console.log("--- StatusIconManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockSkillIconManager = {
        getSkillIcon: (id) => {
            if (id === 'status_poison') return { src: 'poison.png', width: 32, height: 32 };
            if (id === 'status_berserk') return { src: 'berserk.png', width: 32, height: 32 };
            return undefined;
        }
    };
    const mockBattleSimulationManager = {
        unitsOnGrid: [],
        getGridRenderParameters: () => ({ effectiveTileSize: 100, gridOffsetX: 0, gridOffsetY: 0 }),
        animationManager: {
            getRenderPosition: (unitId, gridX, gridY, effectiveTileSize, gridOffsetX, gridOffsetY) => ({
                drawX: gridX * effectiveTileSize + gridOffsetX,
                drawY: gridY * effectiveTileSize + gridOffsetY
            })
        }
    };
    const mockAnimationManager = mockBattleSimulationManager.animationManager;
    const mockMeasureManager = {
        get: (key) => 100
    };
    const mockTurnCountManager = {
        activeEffects: new Map(),
        getEffectsOfUnit: (unitId) => mockTurnCountManager.activeEffects.get(unitId)
    };

    const mockCtx = {
        save: () => {},
        restore: () => {},
        drawImage: function() { this.drawImageCalled = true; },
        strokeRect: function() { this.strokeRectCalled = true; },
        fillText: function() { this.fillTextCalled = true; },
        canvas: { width: 800, height: 600 },
        drawImageCalled: false, strokeRectCalled: false, fillTextCalled: false,
        strokeStyle: '', lineWidth: '', fillStyle: '', font: '', textAlign: '', textBaseline: ''
    };

    const mockUnitWithEffects = { id: 'hero1', name: 'Hero A', currentHp: 50, gridX: 1, gridY: 1 };
    const mockUnitWithoutEffects = { id: 'hero2', name: 'Hero B', currentHp: 50, gridX: 2, gridY: 2 };
    const mockDeadUnit = { id: 'hero3', name: 'Dead C', currentHp: 0, gridX: 3, gridY: 3 };


    testCount++;
    try {
        const sim = new StatusIconManager(mockSkillIconManager, mockBattleSimulationManager, mockAnimationManager, mockMeasureManager, mockTurnCountManager);
        if (sim.skillIconManager === mockSkillIconManager) {
            console.log("StatusIconManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("StatusIconManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("StatusIconManager: Error during initialization. [FAIL]", e);
    }

    testCount++;
    mockBattleSimulationManager.unitsOnGrid = [mockUnitWithEffects];
    mockTurnCountManager.activeEffects.set(mockUnitWithEffects.id, new Map([
        ['status_poison', { effectData: { id: 'status_poison', type: STATUS_EFFECT_TYPES.DEBUFF }, turnsRemaining: 2 }],
        ['status_berserk', { effectData: { id: 'status_berserk', type: STATUS_EFFECT_TYPES.BUFF }, turnsRemaining: 1 }]
    ]));
    mockCtx.drawImageCalled = false;
    mockCtx.strokeRectCalled = false;
    mockCtx.fillTextCalled = false;
    try {
        const sim = new StatusIconManager(mockSkillIconManager, mockBattleSimulationManager, mockAnimationManager, mockMeasureManager, mockTurnCountManager);
        sim.draw(mockCtx);

        if (mockCtx.drawImageCalled && mockCtx.strokeRectCalled && mockCtx.fillTextCalled) {
            console.log("StatusIconManager: draw called drawing operations for active effects. [PASS]");
            passCount++;
        } else {
            console.error("StatusIconManager: draw failed to call drawing operations for active effects. [FAIL]", mockCtx);
        }
    } catch (e) {
        console.error("StatusIconManager: Error during draw (active effects) test. [FAIL]", e);
    }

    testCount++;
    mockBattleSimulationManager.unitsOnGrid = [mockUnitWithoutEffects];
    mockTurnCountManager.activeEffects.clear();
    mockCtx.drawImageCalled = false;
    mockCtx.strokeRectCalled = false;
    mockCtx.fillTextCalled = false;
    try {
        const sim = new StatusIconManager(mockSkillIconManager, mockBattleSimulationManager, mockAnimationManager, mockMeasureManager, mockTurnCountManager);
        sim.draw(mockCtx);

        if (!mockCtx.drawImageCalled && !mockCtx.strokeRectCalled && !mockCtx.fillTextCalled) {
            console.log("StatusIconManager: draw correctly skipped drawing when no active effects. [PASS]");
            passCount++;
        } else {
            console.error("StatusIconManager: draw unexpectedly called drawing operations. [FAIL]", mockCtx);
        }
    } catch (e) {
        console.error("StatusIconManager: Error during draw (no active effects) test. [FAIL]", e);
    }

    testCount++;
    mockBattleSimulationManager.unitsOnGrid = [mockDeadUnit];
    mockTurnCountManager.activeEffects.set(mockDeadUnit.id, new Map([
        ['status_poison', { effectData: { id: 'status_poison', type: STATUS_EFFECT_TYPES.DEBUFF }, turnsRemaining: 1 }]
    ]));
    mockCtx.drawImageCalled = false;
    mockCtx.strokeRectCalled = false;
    mockCtx.fillTextCalled = false;
    try {
        const sim = new StatusIconManager(mockSkillIconManager, mockBattleSimulationManager, mockAnimationManager, mockMeasureManager, mockTurnCountManager);
        sim.draw(mockCtx);

        if (!mockCtx.drawImageCalled && !mockCtx.strokeRectCalled && !mockCtx.fillTextCalled) {
            console.log("StatusIconManager: draw correctly skipped drawing for dead unit. [PASS]");
            passCount++;
        } else {
            console.error("StatusIconManager: draw unexpectedly called drawing operations for dead unit. [FAIL]", mockCtx);
        }
    } catch (e) {
        console.error("StatusIconManager: Error during draw (dead unit) test. [FAIL]", e);
    }

    console.log(`--- StatusIconManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
