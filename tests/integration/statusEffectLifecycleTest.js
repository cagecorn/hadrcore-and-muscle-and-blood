/**
 * @file /tests/integration/statusEffectLifecycleTest.js
 * @description 상태 이상의 적용, 지속, 만료까지의 전체 생명주기를 검증하는 통합 테스트
 */

import { GAME_EVENTS } from '../../js/constants.js';
import { STATUS_EFFECTS } from '../../data/statusEffects.js';

export async function runStatusEffectLifecycleTest(gameEngine) {
    console.log("%c--- 통합 테스트: 상태 이상 생명주기 시작 ---", "color: orange; font-weight: bold;");

    const eventManager = gameEngine.getEventManager();
    const workflowManager = gameEngine.getWorkflowManager();
    const turnCountManager = gameEngine.getTurnCountManager();
    const battleSim = gameEngine.getBattleSimulationManager();
    const turnEngine = gameEngine.getTurnEngine();

    console.log("[상태 이상 테스트] 1. 테스트 환경을 설정합니다...");
    const skeleton = battleSim.unitsOnGrid.find(u => u.id === 'unit_skeleton_001');
    if (!skeleton) {
        console.error("  -> FAIL: 해골 유닛을 찾을 수 없습니다.");
        return;
    }
    const skeletonId = skeleton.id;
    turnCountManager.clearAllEffects();

    console.log(`[상태 이상 테스트] 2. 해골에게 '${STATUS_EFFECTS.POISON.name}' 효과를 적용합니다.`);
    workflowManager.triggerStatusEffectApplication(skeletonId, STATUS_EFFECTS.POISON.id);

    let activeEffects = turnCountManager.getEffectsOfUnit(skeletonId);
    if (activeEffects && activeEffects.has(STATUS_EFFECTS.POISON.id) && activeEffects.get(STATUS_EFFECTS.POISON.id).turnsRemaining === 3) {
        console.log("  -> SUCCESS: 독 효과가 3턴 지속시간으로 정상 적용되었습니다.");
    } else {
        console.error("  -> FAIL: 독 효과 적용에 실패했습니다.");
        return;
    }

    console.log("[상태 이상 테스트] 3. 턴을 진행하며 효과가 정상 작동하는지 확인합니다.");

    eventManager.setGameRunningState(true);
    await turnEngine.startBattleTurns();

    const testPromise = new Promise((resolve) => {
        let turnCounter = 0;
        const maxTurns = 4;
        const handler = (data) => {
            if (data.phase !== 'endOfTurn') return;
            turnCounter++;
            console.log(`  [진행] ${data.turn}턴 종료.`);
            activeEffects = turnCountManager.getEffectsOfUnit(skeletonId);

            if (turnCounter === 1) {
                if (activeEffects && activeEffects.get(STATUS_EFFECTS.POISON.id)?.turnsRemaining === 2) {
                    console.log("  -> SUCCESS: 1턴 후 독 효과의 남은 턴이 2가 되었습니다.");
                } else {
                    console.error("  -> FAIL: 1턴 후 남은 턴 계산이 올바르지 않습니다.");
                    resolve(false);
                }
            }

            if (turnCounter === 3) {
                if (!activeEffects || !activeEffects.has(STATUS_EFFECTS.POISON.id)) {
                    console.log("  -> SUCCESS: 3턴 후 독 효과가 정상적으로 만료 및 제거되었습니다.");
                    resolve(true);
                } else {
                    console.error("  -> FAIL: 3턴이 지나도 독 효과가 제거되지 않았습니다.");
                    resolve(false);
                }
            }

            if (turnCounter >= maxTurns) {
                console.error("  -> FAIL: 테스트가 예상 턴 수를 초과했습니다.");
                resolve(false);
            }
        };
        eventManager.subscribe(GAME_EVENTS.TURN_PHASE, handler);
    });

    const result = await testPromise;

    if (result) {
        console.log("%c--- 통합 테스트: 상태 이상 생명주기 성공 ---", "color: green; font-weight: bold;");
    } else {
        console.error("%c--- 통합 테스트: 상태 이상 생명주기 실패 ---", "color: red; font-weight: bold;");
    }

    gameEngine.getSceneEngine().setCurrentScene('territoryScene');
    eventManager.setGameRunningState(false);
}
