import { TagManager } from '../../js/managers/TagManager.js';

export function runTagManagerUnitTests(idManager) {
    console.log("--- TagManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // Mock IdManager for testing validateDataTags
    const mockIdManager = idManager || {
        get: async (id) => {
            switch (id) {
                case 'class_warrior':
                    return { id: 'class_warrior', name: '전사', tags: ['근접', '방어', '용병'] };
                case 'class_mage':
                    return { id: 'class_mage', name: '마법사', tags: ['원거리', '마법', '용병'] };
                case 'class_skeleton':
                    return { id: 'class_skeleton', name: '해골', tags: ['근접', '언데드', '적'] };
                case 'item_sword':
                    return { id: 'item_sword', name: '강철 검', type: '무기', tags: ['무기', '검'], requiredUnitTags: ['근접'] };
                case 'item_staff':
                    return { id: 'item_staff', name: '마법 지팡이', type: '무기', tags: ['무기', '지팡이'], requiredUnitTags: ['마법'] };
                case 'item_heavy_armor':
                    return { id: 'item_heavy_armor', name: '중갑', type: '방어구', tags: ['방어구', '중갑'], requiredUnitTags: ['방어'] };
                case 'skill_charge':
                    return { id: 'skill_charge', name: '돌격', tags: ['이동', '공격'], requiredUserTags: ['근접'] };
                case 'skill_fireball':
                    return { id: 'skill_fireball', name: '화염구', tags: ['마법', '원거리', '공격'], requiredUserTags: ['마법'] };
                default:
                    return undefined;
            }
        }
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        if (tm.idManager === mockIdManager) {
            console.log("TagManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: hasTag - 단일 태그 포함 여부
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const warriorData = await mockIdManager.get('class_warrior');
        if (tm.hasTag(warriorData, '근접') && !tm.hasTag(warriorData, '마법')) {
            console.log("TagManager: hasTag correctly identified tag presence. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: hasTag failed. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during hasTag test. [FAIL]", e);
    }

    // 테스트 3: hasAllTags - 모든 태그 포함 여부
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const warriorData = await mockIdManager.get('class_warrior');
        if (tm.hasAllTags(warriorData, ['근접', '방어']) && !tm.hasAllTags(warriorData, ['근접', '마법'])) {
            console.log("TagManager: hasAllTags correctly identified all tags presence. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: hasAllTags failed. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during hasAllTags test. [FAIL]", e);
    }

    // 테스트 4: hasAnyTag - 하나라도 태그 포함 여부
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const warriorData = await mockIdManager.get('class_warrior');
        if (tm.hasAnyTag(warriorData, ['방어', '마법']) && !tm.hasAnyTag(warriorData, ['원거리', '지팡이'])) {
            console.log("TagManager: hasAnyTag correctly identified any tag presence. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: hasAnyTag failed. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during hasAnyTag test. [FAIL]", e);
    }

    // 테스트 5: canEquipItem - 장착 가능 (전사-검)
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const warriorData = await mockIdManager.get('class_warrior');
        const swordData = await mockIdManager.get('item_sword');
        if (tm.canEquipItem(warriorData, swordData)) {
            console.log("TagManager: canEquipItem correctly allowed Warrior to equip Sword. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: canEquipItem failed to allow Warrior to equip Sword. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during canEquipItem (Warrior-Sword) test. [FAIL]", e);
    }

    // 테스트 6: canEquipItem - 장착 불가 (전사-지팡이)
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const warriorData = await mockIdManager.get('class_warrior');
        const staffData = await mockIdManager.get('item_staff');
        if (!tm.canEquipItem(warriorData, staffData)) {
            console.log("TagManager: canEquipItem correctly denied Warrior to equip Staff. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: canEquipItem failed to deny Warrior to equip Staff. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during canEquipItem (Warrior-Staff) test. [FAIL]", e);
    }

    // 테스트 7: canUseSkill - 사용 가능 (전사-돌격)
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const warriorData = await mockIdManager.get('class_warrior');
        const chargeSkillData = await mockIdManager.get('skill_charge');
        if (tm.canUseSkill(warriorData, chargeSkillData)) {
            console.log("TagManager: canUseSkill correctly allowed Warrior to use Charge. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: canUseSkill failed to allow Warrior to use Charge. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during canUseSkill (Warrior-Charge) test. [FAIL]", e);
    }

    // 테스트 8: canUseSkill - 사용 불가 (전사-화염구)
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const warriorData = await mockIdManager.get('class_warrior');
        const fireballSkillData = await mockIdManager.get('skill_fireball');
        if (!tm.canUseSkill(warriorData, fireballSkillData)) {
            console.log("TagManager: canUseSkill correctly denied Warrior to use Fireball. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: canUseSkill failed to deny Warrior to use Fireball. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during canUseSkill (Warrior-Fireball) test. [FAIL]", e);
    }

    // 테스트 9: validateDataTags - 태그 검증 성공
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const isValid = await tm.validateDataTags('class_warrior', ['근접', '방어', '용병']);
        if (isValid) {
            console.log("TagManager: validateDataTags succeeded for Warrior. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: validateDataTags failed for Warrior. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during validateDataTags (success) test. [FAIL]", e);
    }

    // 테스트 10: validateDataTags - 태그 검증 실패 (누락)
    testCount++;
    try {
        const tm = new TagManager(mockIdManager);
        const isValid = await tm.validateDataTags('class_warrior', ['근접', '방어', '치유']); // '치유' 누락
        if (!isValid) {
            console.log("TagManager: validateDataTags correctly failed for missing tag. [PASS]");
            passCount++;
        } else {
            console.error("TagManager: validateDataTags unexpectedly passed for missing tag. [FAIL]");
        }
    } catch (e) {
        console.error("TagManager: Error during validateDataTags (missing) test. [FAIL]", e);
    }

    console.log(`--- TagManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
