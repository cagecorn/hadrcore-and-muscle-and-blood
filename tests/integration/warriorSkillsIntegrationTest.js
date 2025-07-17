// tests/integration/warriorSkillsIntegrationTest.js

import { GAME_DEBUG_MODE, ATTACK_TYPES } from '../../js/constants.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

/**
 * 전사 스킬의 통합 테스트를 실행합니다.
 * 이 테스트는 TurnEngine, DiceEngine, WarriorSkillsAI, BattleSimulationManager 등
 * 여러 매니저의 상호작용을 검증합니다.
 * @param {object} gameEngine - 모든 매니저에 접근할 수 있는 게임 엔진 인스턴스
 */
export async function runWarriorSkillsIntegrationTest(gameEngine) {
    if (!GAME_DEBUG_MODE) return;
    console.log("--- ⚔️ Warrior Skills Integration Test Start ⚔️ ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트에 필요한 매니저들 가져오기
    const turnEngine = gameEngine.getTurnEngine();
    const diceEngine = gameEngine.getDiceEngine();
    const warriorSkillsAI = gameEngine.getWarriorSkillsAI();
    const battleSimulationManager = gameEngine.getBattleSimulationManager();
    const idManager = gameEngine.getIdManager();
    const statusEffectManager = gameEngine.getStatusEffectManager();

    // --- 테스트 환경 설정 ---

    // 테스트용 유닛 생성
    const testWarrior = {
        id: 'test_warrior', name: '테스트 전사', type: ATTACK_TYPES.MERCENARY,
        gridX: 2, gridY: 4, currentHp: 100,
        baseStats: { hp: 100, attack: 20, speed: 80 }, // 빠른 속도로 선턴 확보
        classId: 'class_warrior_test'
    };
    const testEnemy = {
        id: 'test_enemy', name: '테스트 적', type: ATTACK_TYPES.ENEMY,
        gridX: 10, gridY: 4, currentHp: 100,
        baseStats: { hp: 100, attack: 10, speed: 50 }
    };

    // 원본 데이터 저장 및 복원 함수
    const originalDiceRoll = diceEngine.rollD;
    const originalRandomFloat = diceEngine.getRandomFloat;
    const originalUnits = [...battleSimulationManager.unitsOnGrid];
    const originalChargeAI = warriorSkillsAI.charge;
    let chargeCalled = false;

    const setup = (units, warriorSkills) => {
        chargeCalled = false;
        battleSimulationManager.unitsOnGrid = units.map(u => ({ ...u }));
        idManager.addOrUpdateId('class_warrior_test', {
            id: 'class_warrior_test', name: 'Test Warrior Class',
            skills: warriorSkills, // 테스트 케이스별 스킬 순서 주입
            moveRange: 5,
            tags: ['근접', '방어', '전사_클래스']
        });
        warriorSkillsAI.charge = async (...args) => {
            chargeCalled = true;
            return originalChargeAI.apply(warriorSkillsAI, args);
        };
    };

    const cleanup = () => {
        diceEngine.rollD = originalDiceRoll;
        diceEngine.getRandomFloat = originalRandomFloat;
        battleSimulationManager.unitsOnGrid = originalUnits;
        warriorSkillsAI.charge = originalChargeAI;
    };

    // --- 테스트 케이스 시작 ---

    // ✅ 테스트 1: 돌진 (Charge) 스킬 AI 및 발동 확률 (1번째 슬롯, 40%)
    testCount++;
    console.log("\n[Test 1] Charge Skill - 1st Slot (40% chance)");
    setup([testWarrior, testEnemy], [WARRIOR_SKILLS.CHARGE.id, WARRIOR_SKILLS.BATTLE_CRY.id, WARRIOR_SKILLS.RETALIATE.id]);

    // 40% 확률 성공을 위해 0.39 반환하도록 설정
    diceEngine.getRandomFloat = () => 0.39;

    // TurnEngine의 턴 처리 로직을 수동으로 한 단계 실행
    await turnEngine.nextTurn();

    if (chargeCalled) {
        console.log("  -> SUCCESS: Charge AI was correctly called.");
        const warrior = battleSimulationManager.unitsOnGrid.find(u => u.id === 'test_warrior');
        if (warrior.gridX === 9 && warrior.gridY === 4) {
            console.log("  -> SUCCESS: Warrior moved to the correct position next to the enemy.");
            passCount++;
        } else {
            console.error(`  -> FAIL: Warrior moved to the wrong position (${warrior.gridX}, ${warrior.gridY}).`);
        }
    } else {
        console.error("  -> FAIL: Charge AI was not called despite successful probability roll.");
    }
    cleanup();

    // ✅ 테스트 2: 돌진 (Charge) 스킬 발동 실패 (1번째 슬롯, 40%)
    testCount++;
    console.log("\n[Test 2] Charge Skill - 1st Slot (Failure case)");
    setup([testWarrior, testEnemy], [WARRIOR_SKILLS.CHARGE.id, WARRIOR_SKILLS.BATTLE_CRY.id, WARRIOR_SKILLS.RETALIATE.id]);

    // 40% 확률 실패를 위해 0.41 반환하도록 설정
    diceEngine.getRandomFloat = () => 0.41;
    chargeCalled = false;

    await turnEngine.nextTurn();

    if (!chargeCalled) {
        console.log("  -> SUCCESS: Charge AI was correctly NOT called, normal attack should have occurred.");
        passCount++;
    } else {
        console.error("  -> FAIL: Charge AI was called despite failing the probability roll.");
    }
    cleanup();

    // ✅ 테스트 3: 전투의 외침 (Battle Cry) 발동 확률 (2번째 슬롯, 30%)
    testCount++;
    console.log("\n[Test 3] Battle Cry - 2nd Slot (30% chance)");
    setup([testWarrior, testEnemy], [WARRIOR_SKILLS.CHARGE.id, WARRIOR_SKILLS.BATTLE_CRY.id, WARRIOR_SKILLS.RETALIATE.id]);

    // 1번 스킬(40%) 실패, 2번 스킬(30%) 성공 -> 0.4와 0.7 사이 값
    diceEngine.getRandomFloat = () => 0.65;

    // Battle Cry AI가 호출되었는지 확인하기 위한 스파이(spy)
    let battleCryCalled = false;
    const originalBattleCryAI = warriorSkillsAI.battleCry;
    warriorSkillsAI.battleCry = async (...args) => {
        battleCryCalled = true;
        return originalBattleCryAI.apply(warriorSkillsAI, args);
    };

    await turnEngine.nextTurn();

    if (battleCryCalled) {
        console.log("  -> SUCCESS: Battle Cry AI was correctly called.");
        const warriorEffects = statusEffectManager.getUnitActiveEffects(testWarrior.id);
        if (warriorEffects && warriorEffects.has('status_battle_cry')) {
            console.log("  -> SUCCESS: Battle Cry status effect was applied.");
            passCount++;
        } else {
            console.error("  -> FAIL: Battle Cry status effect was NOT applied.");
        }
    } else {
        console.error("  -> FAIL: Battle Cry AI was not called.");
    }
    warriorSkillsAI.battleCry = originalBattleCryAI; // 스파이 복원
    cleanup();


    console.log(`\n--- ⚔️ Warrior Skills Integration Test End: ${passCount}/${testCount} tests passed ---`);
}
