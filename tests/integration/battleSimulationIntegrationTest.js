export function runBattleSimulationIntegrationTest(gameEngine) {
    console.log("--- Battle Simulation Integration Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const eventManager = gameEngine.getEventManager();
    const battleSimulationManager = gameEngine.getBattleSimulationManager();
    const battleLogManager = gameEngine.getBattleLogManager();
    const vfxManager = gameEngine.getVFXManager();
    const uiEngine = gameEngine.getUIEngine();
    const sceneEngine = gameEngine.getSceneEngine();
    const cameraEngine = gameEngine.getCameraEngine();

    let initialWarriorHp;
    let initialWarriorBarrier;
    let initialSkeletonHp;
    let initialSkeletonBarrier;

    function setupTestState() {
        const warrior = battleSimulationManager.unitsOnGrid.find(u => u.id === 'unit_warrior_001');
        const skeleton = battleSimulationManager.unitsOnGrid.find(u => u.id === 'unit_skeleton_001');

        if (warrior) {
            warrior.currentHp = warrior.baseStats.hp;
            warrior.currentBarrier = warrior.maxBarrier;
            initialWarriorHp = warrior.baseStats.hp;
            initialWarriorBarrier = warrior.maxBarrier;
        }
        if (skeleton) {
            skeleton.currentHp = skeleton.baseStats.hp;
            skeleton.currentBarrier = skeleton.maxBarrier;
            initialSkeletonHp = skeleton.baseStats.hp;
            initialSkeletonBarrier = skeleton.maxBarrier;
        }

        battleLogManager.logMessages = [];
        vfxManager.activeDamageNumbers = [];

        uiEngine.setUIState('mapScreen');
        sceneEngine.setCurrentScene('territoryScene');
        cameraEngine.reset();

        eventManager.setGameRunningState(true);
    }

    testCount++;
    console.log("Integration Test: Setting up initial battle state...");
    setupTestState();

    eventManager.emit('battleStart', { mapId: 'testMap', difficulty: 'easy' });
    console.log("Integration Test: 'battleStart' event emitted. Observing battle flow...");

    const observationDuration = 5000;

    setTimeout(() => {
        let allTestsPassed = true;

        const warrior = battleSimulationManager.unitsOnGrid.find(u => u.id === 'unit_warrior_001');
        const skeleton = battleSimulationManager.unitsOnGrid.find(u => u.id === 'unit_skeleton_001');

        testCount++;
        const warriorTookDamage = warrior && (warrior.currentHp < initialWarriorHp || warrior.currentBarrier < initialWarriorBarrier);
        const skeletonTookDamage = skeleton && (skeleton.currentHp < initialSkeletonHp || skeleton.currentBarrier < initialSkeletonBarrier);
        if (warriorTookDamage && skeletonTookDamage) {
            console.log("Integration Test (HP/Barrier Reduction): Both units' HP or Barrier decreased. [PASS]");
            passCount++;
        } else {
            console.error("Integration Test (HP/Barrier Reduction): HP or Barrier did not decrease as expected. [FAIL]", { warrior: {hp: warrior.currentHp, barrier: warrior.currentBarrier}, skeleton: {hp: skeleton.currentHp, barrier: skeleton.currentBarrier} });
            allTestsPassed = false;
        }

        testCount++;
        const battleLogUpdated = battleLogManager.logMessages.some(msg => msg.includes('공격 시도!') || msg.includes('피해를 입고 HP') || msg.includes('쓰러졌습니다!'));
        if (battleLogUpdated) {
            console.log("Integration Test (Battle Log): Battle log contains relevant messages. [PASS]");
            passCount++;
        } else {
            console.error("Integration Test (Battle Log): Battle log was not updated. [FAIL]", battleLogManager.logMessages);
            allTestsPassed = false;
        }

        testCount++;
        const hasDamageNumbers = vfxManager.activeDamageNumbers.length > 0;
        const hasYellowDamage = vfxManager.activeDamageNumbers.some(dmg => dmg.color === 'yellow');
        if (hasDamageNumbers && hasYellowDamage) {
            console.log("Integration Test (Damage Numbers & Color): Damage numbers (including yellow for barrier) were added to VFXManager. [PASS]");
            passCount++;
        } else {
            console.error("Integration Test (Damage Numbers & Color): Damage numbers were not registered or yellow damage missing. [FAIL]", vfxManager.activeDamageNumbers);
            allTestsPassed = false;
        }

        testCount++;
        const isGameStillRunning = eventManager.getGameRunningState();
        if (!isGameStillRunning) {
            if ((warrior && warrior.currentHp <= 0) || (skeleton && skeleton.currentHp <= 0)) {
                console.log("Integration Test (Battle End): Battle ended due to unit defeat. [PASS]");
                passCount++;
            } else {
                console.error("Integration Test (Battle End): Battle ended, but no unit defeated. [FAIL]");
                allTestsPassed = false;
            }
        } else {
            console.log("Integration Test (Battle End): Battle still ongoing (increase observationDuration if a quick end is expected). [INFO]");
            passCount++;
        }

        if (allTestsPassed && passCount === testCount) {
            console.log(`--- Battle Simulation Integration Test End: ALL ${passCount}/${testCount} tests passed ---`);
        } else {
            console.error(`--- Battle Simulation Integration Test End: ${passCount}/${testCount} tests passed. FAILURES detected. ---`);
        }

        uiEngine.setUIState('mapScreen');
        sceneEngine.setCurrentScene('territoryScene');
        cameraEngine.reset();
        eventManager.setGameRunningState(false);
        console.log("Integration Test: Game state reset to map screen and game loop stopped.");
    }, observationDuration);
}
