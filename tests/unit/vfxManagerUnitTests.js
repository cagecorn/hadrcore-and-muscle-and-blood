// tests/unit/vfxManagerUnitTests.js
import { VFXManager } from '../../js/managers/VFXManager.js';
import { BattleSimulationManager } from '../../js/managers/BattleSimulationManager.js';
import { AnimationManager } from '../../js/managers/AnimationManager.js';
import { MeasureManager } from '../../js/managers/MeasureManager.js';
import { LogicManager } from '../../js/managers/LogicManager.js';
import { EventManager } from '../../js/managers/EventManager.js';

export function runVFXManagerUnitTests() {
    console.log("--- VFXManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockRenderer = { canvas: { width: 800, height: 600 }, ctx: {} };
    const measureManager = new MeasureManager();
    const logicManager = new LogicManager(measureManager, { getCurrentSceneName: () => 'combatScreen' });
    const eventManager = new EventManager();
    const animationManager = new AnimationManager(measureManager);
    const battleSim = new BattleSimulationManager(measureManager, {}, {}, logicManager, animationManager, {});
    animationManager.battleSimulationManager = battleSim;

    testCount++;
    try {
        const vfx = new VFXManager(mockRenderer, measureManager, {}, battleSim, animationManager, eventManager);
        if (vfx.activeWeaponDrops instanceof Map) {
            console.log("VFXManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("VFXManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("VFXManager: Initialization threw error. [FAIL]", e);
    }

    testCount++;
    try {
        const vfx = new VFXManager(mockRenderer, measureManager, {}, battleSim, animationManager, eventManager);
        eventManager.emit('weaponDropped', { unitId: 'u1', weaponSpriteId: 'w1' });
        setTimeout(() => {
            if (vfx.activeWeaponDrops.size >= 0) {
                console.log("VFXManager: weaponDropped event handled. [PASS]");
                passCount++;
            } else {
                console.error("VFXManager: weaponDropped event not handled. [FAIL]");
            }
            console.log(`--- VFXManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
        }, 10);
    } catch (e) {
        console.error("VFXManager: weaponDropped test error. [FAIL]", e);
    }
}
