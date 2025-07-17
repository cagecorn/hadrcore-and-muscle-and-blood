/**
 * @file /tests/integration/fullCombatCycleTest.js
 * @description 여러 매니저가 연동되는 전투의 한 턴 전체 흐름을 검증하는 통합 테스트
 */

import { GAME_EVENTS } from '../../js/constants.js';

export function runFullCombatCycleTest(gameEngine) {
    console.log("%c--- 통합 테스트: 전투 전체 흐름 시작 ---", "color: orange; font-weight: bold;");

    const eventManager = gameEngine.getEventManager();
    const battleSim = gameEngine.getBattleSimulationManager();
    const turnEngine = gameEngine.getTurnEngine();
    const battleLog = gameEngine.getBattleLogManager();

    let testPassed = true;

    console.log("[전투 흐름 테스트] 1. 테스트 환경을 설정합니다...");
    const initialWarrior = battleSim.unitsOnGrid.find(u => u.id === 'unit_warrior_001');
    const initialSkeleton = battleSim.unitsOnGrid.find(u => u.id === 'unit_skeleton_001');

    if (!initialWarrior || !initialSkeleton) {
        console.error("  -> FAIL: 테스트에 필요한 전사 또는 해골 유닛을 찾을 수 없습니다.");
        return;
    }
    const initialSkeletonHP = initialSkeleton.currentHp;
    battleLog.logMessages = [];
    eventManager.setGameRunningState(true);

    console.log("[전투 흐름 테스트] 2. 전투를 시작하고 첫 턴의 진행을 관찰합니다...");

    const testPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("테스트 시간 초과: 턴 종료 이벤트가 5초 내에 발생하지 않았습니다."));
        }, 5000);

        eventManager.subscribe(GAME_EVENTS.TURN_PHASE, (data) => {
            if (data.phase === 'endOfTurn' && data.turn === 1) {
                clearTimeout(timeout);
                console.log("[전투 흐름 테스트] 3. 첫 턴 종료. 결과를 검증합니다...");

                const finalSkeleton = battleSim.unitsOnGrid.find(u => u.id === 'unit_skeleton_001');

                if (finalSkeleton.currentHp < initialSkeletonHP) {
                    console.log(`  -> SUCCESS: 해골의 체력이 정상적으로 감소했습니다. (${initialSkeletonHP} -> ${finalSkeleton.currentHp})`);
                } else {
                    console.error("  -> FAIL: 해골의 체력이 감소하지 않았습니다.");
                    testPassed = false;
                }

                const attackLogExists = battleLog.logMessages.some(msg => msg.includes('공격 시도') || msg.includes('피해를 입고'));
                if (attackLogExists) {
                    console.log("  -> SUCCESS: 전투 로그가 정상적으로 기록되었습니다.");
                } else {
                    console.error("  -> FAIL: 전투 로그가 기록되지 않았습니다.");
                    testPassed = false;
                }

                resolve(testPassed);
            }
        });
    });

    turnEngine.startBattleTurns();

    return testPromise.then(passed => {
        if (passed) {
            console.log("%c--- 통합 테스트: 전투 전체 흐름 성공 ---", "color: green; font-weight: bold;");
        } else {
            console.error("%c--- 통합 테스트: 전투 전체 흐름 실패 ---", "color: red; font-weight: bold;");
        }
        gameEngine.getSceneEngine().setCurrentScene('territoryScene');
        eventManager.setGameRunningState(false);
    }).catch(err => {
        console.error("%c--- 통합 테스트: 전투 전체 흐름 오류 ---", "color: red; font-weight: bold;", err);
    });
}
