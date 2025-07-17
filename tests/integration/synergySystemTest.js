/**
 * @file /tests/integration/synergySystemTest.js
 * @description 팀 구성에 따른 시너지의 활성화 및 효과 적용까지의 과정을 검증하는 통합 테스트
 */

import { GAME_EVENTS } from '../../js/constants.js';

export async function runSynergySystemTest(gameEngine) {
    console.log("%c--- 통합 테스트: 시너지 시스템 시작 ---", "color: orange; font-weight: bold;");

    const heroEngine = gameEngine.getHeroEngine();
    const synergyEngine = gameEngine.getSynergyEngine();
    const eventManager = gameEngine.getEventManager();

    let testPassed = true;

    console.log("[시너지 테스트] 1. 테스트용 영웅들을 생성합니다. (2 전사, 1 마법사)");
    const warrior1 = await heroEngine.generateHero({ classId: 'class_warrior', synergies: ['synergy_warrior', 'synergy_melee'] });
    const warrior2 = await heroEngine.generateHero({ classId: 'class_warrior', synergies: ['synergy_warrior', 'synergy_tank'] });
    const mage1 = await heroEngine.generateHero({ classId: 'class_mage', synergies: ['synergy_mage', 'synergy_ranged'] });

    const team = [warrior1, warrior2, mage1];

    console.log("[시너지 테스트] 2. 현재 팀 구성으로 활성화된 시너지를 계산합니다.");
    const activeSynergies = synergyEngine.calculateActiveSynergies(team);

    console.log("[시너지 테스트] 3. 계산된 시너지 결과를 검증합니다.");
    const warriorSynergy = activeSynergies.find(s => s.synergyId === 'synergy_warrior');

    if (warriorSynergy && warriorSynergy.tier === 2) {
        console.log(`  -> SUCCESS: 2-전사 시너지가 정상적으로 활성화되었습니다. (효과: attackBonus ${warriorSynergy.effect.attackBonus})`);
    } else {
        console.error("  -> FAIL: 2-전사 시너지가 활성화되지 않았거나 티어 계산이 잘못되었습니다.");
        testPassed = false;
    }

    let eventFired = false;
    const eventHandler = (data) => {
        if (data.synergyId === 'synergy_warrior' && data.effect.attackBonus === 10) {
            eventFired = true;
        }
    };
    eventManager.subscribe(GAME_EVENTS.SYNERGY_ACTIVATED, eventHandler);

    console.log("[시너지 테스트] 4. 시너지 활성화 이벤트를 발행하고 결과를 검증합니다.");
    synergyEngine.emitActiveSynergyEvents(activeSynergies);

    if (eventFired) {
        console.log("  -> SUCCESS: 올바른 데이터와 함께 SYNERGY_ACTIVATED 이벤트가 발행되었습니다.");
    } else {
        console.error("  -> FAIL: SYNERGY_ACTIVATED 이벤트가 발행되지 않았거나 데이터가 올바르지 않습니다.");
        testPassed = false;
    }

    if (testPassed) {
        console.log("%c--- 통합 테스트: 시너지 시스템 성공 ---", "color: green; font-weight: bold;");
    } else {
        console.error("%c--- 통합 테스트: 시너지 시스템 실패 ---", "color: red; font-weight: bold;");
    }
}
