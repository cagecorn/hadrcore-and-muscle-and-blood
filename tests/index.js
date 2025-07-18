export { runRendererTests } from './unit/rendererTests.js';
export { runGameLoopTests } from './unit/gameLoopTests.js';
export { runEventManagerTests } from './unit/eventManagerUnitTests.js';
export { runGuardianManagerTests } from './unit/guardianManagerUnitTests.js';
export { runMeasureManagerUnitTests } from './unit/measureManagerUnitTests.js';
export { runMapManagerUnitTests } from './unit/mapManagerUnitTests.js';
export { runUIEngineUnitTests } from './unit/uiEngineUnitTests.js';
export { runButtonEngineUnitTests } from './unit/buttonEngineUnitTests.js';
export { runDetailInfoManagerUnitTests } from './unit/detailInfoManagerUnitTests.js'; // ✨ DetailInfoManager 단위 테스트 추가
export { runSkillIconManagerUnitTests } from './unit/skillIconManagerUnitTests.js'; // ✨ SkillIconManager 단위 테스트 추가
export { runStatusIconManagerUnitTests } from './unit/statusIconManagerUnitTests.js'; // ✨ StatusIconManager 단위 테스트 추가
export { runMovingManagerUnitTests } from './unit/movingManagerUnitTests.js'; // ✨ MovingManager 단위 테스트 추가
export { runWarriorSkillsAIUnitTests } from './unit/warriorSkillsAIUnitTests.js'; // ✨ WarriorSkillsAI 테스트 임포트 확인
export { runShadowEngineUnitTests } from './unit/shadowEngineUnitTests.js'; // ✨ ShadowEngine 단위 테스트 추가
export { runMicrocosmHeroEngineUnitTests } from './unit/microcosmHeroEngineUnitTests.js'; // 👈 추가
export { runSoundEngineUnitTests } from './unit/soundEngineUnitTests.js'; // <-- 이 줄 추가

// new unit tests
export { runSceneEngineUnitTests } from './unit/sceneEngineUnitTests.js';
export { runLogicManagerUnitTests } from './unit/logicManagerUnitTests.js';
export { runCompatibilityManagerUnitTests } from './unit/compatibilityManagerUnitTests.js';
export { runMercenaryPanelManagerUnitTests } from './unit/mercenaryPanelManagerUnitTests.js';
export { runPanelEngineUnitTests } from './unit/panelEngineUnitTests.js';
export { runBattleLogManagerUnitTests } from './unit/battleLogManagerUnitTests.js';
export { runTurnEngineUnitTests } from './unit/turnEngineUnitTests.js';
export { runDelayEngineUnitTests } from './unit/delayEngineUnitTests.js';
export { runTimingEngineUnitTests } from './unit/timingEngineUnitTests.js';
export { runRuleManagerUnitTests } from './unit/ruleManagerUnitTests.js';
export { runTurnOrderManagerUnitTests } from './unit/turnOrderManagerUnitTests.js';
export { runBasicAIManagerUnitTests } from './unit/basicAIManagerUnitTests.js';
export { runClassAIManagerUnitTests } from './unit/classAIManagerUnitTests.js';
export { runBattleSimulationManagerUnitTests } from './unit/battleSimulationManagerUnitTests.js';
export { runAnimationManagerUnitTests } from './unit/animationManagerUnitTests.js';

// ✨ 새로 추가되거나 업데이트된 단위 테스트
export { runValorEngineUnitTests } from './unit/valorEngineUnitTests.js';
export { runWeightEngineUnitTests } from './unit/weightEngineUnitTests.js';
export { runStatManagerUnitTests } from './unit/statManagerUnitTests.js';
export { runVFXManagerUnitTests } from './unit/vfxManagerUnitTests.js';
export { runCanvasBridgeManagerUnitTests } from './unit/canvasBridgeManagerUnitTests.js';
export { runMeasureManagerUnitTests as runUpdatedMeasureManagerUnitTests } from './unit/measureManagerUnitTests.js';
export { runMapManagerUnitTests as runUpdatedMapManagerUnitTests } from './unit/mapManagerUnitTests.js';
export { runUIEngineUnitTests as runUpdatedUIEngineUnitTests } from './unit/uiEngineUnitTests.js';
// ✨ 다이스 관련 테스트 추가
export { runDiceEngineUnitTests } from './unit/diceEngineUnitTests.js';
export { runDiceRollManagerUnitTests } from './unit/diceRollManagerUnitTests.js';
export { runDiceBotEngineUnitTests } from './unit/diceBotEngineUnitTests.js';
export { runTurnCountManagerUnitTests } from './unit/turnCountManagerUnitTests.js';
export { runStatusEffectManagerUnitTests } from './unit/statusEffectManagerUnitTests.js';
export { runWorkflowManagerUnitTests } from './unit/workflowManagerUnitTests.js';
export { runDisarmManagerUnitTests } from './unit/disarmManagerUnitTests.js';
export { runCoordinateManagerUnitTests } from './unit/coordinateManagerUnitTests.js';
export { runTargetingManagerUnitTests } from './unit/targetingManagerUnitTests.js'; // ✨ TargetingManager 단위 테스트 추가
export { runHeroEngineUnitTests } from "./unit/heroEngineUnitTests.js"; // ✨ HeroEngine 단위 테스트 추가
export { runSynergyEngineUnitTests } from './unit/synergyEngineUnitTests.js'; // ✨ SynergyEngine 단위 테스트 추가

export { runMeasureManagerIntegrationTest } from './integration/measureManagerIntegrationTests.js';
export { runBattleSimulationIntegrationTest } from './integration/battleSimulationIntegrationTest.js';
export { runWarriorSkillsIntegrationTest } from './integration/warriorSkillsIntegrationTest.js';

export { injectRendererFault } from './fault_injection/rendererFaults.js';
export { injectGameLoopFault, getFaultFlags, setFaultFlag } from './fault_injection/gameLoopFaults.js';
export { injectEventManagerFaults } from './fault_injection/eventManagerFaults.js';
export { injectGuardianManagerFaults } from './fault_injection/guardianManagerFaults.js';
export { injectSceneEngineFaults } from './fault_injection/sceneEngineFaults.js';
export { injectLogicManagerFaults } from './fault_injection/logicManagerFaults.js';
export function runEngineTests(
    renderer,
    gameLoop,
    battleSimulationManager = null,
    battleGridManager = null,
    idManager = null,
    assetLoaderManager = null,
    diceEngine = null,
    diceBotEngine = null,
    eventManager = null,
    microcosmHeroEngine = null
) {
    runRendererTests(renderer);
    runGameLoopTests(gameLoop);
    if (battleSimulationManager && battleGridManager) {
        runCoordinateManagerUnitTests(battleSimulationManager, battleGridManager);
    }
    if (battleSimulationManager) {
        runTargetingManagerUnitTests(battleSimulationManager);
    }
    runHeroEngineUnitTests(idManager, assetLoaderManager, diceEngine, diceBotEngine, microcosmHeroEngine);
    if (idManager && eventManager) {
        runSynergyEngineUnitTests(idManager, eventManager);
    }
    runDetailInfoManagerUnitTests(); // 목업 사용
    runSkillIconManagerUnitTests(assetLoaderManager, idManager);
    runStatusIconManagerUnitTests(); // 목업 사용
    runMovingManagerUnitTests();
    runWarriorSkillsAIUnitTests();
    runShadowEngineUnitTests();
}
