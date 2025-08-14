import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

/**
 * 아케인 블레이드 (Arcane Blade)
 * 근접 전투와 마법을 융합하여, 칼과 주문을 동시에 휘두르는 전투 마법사.
 * 근접, 돌진, 마법, 버프 태그에 높은 가산점을 부여합니다.
 */
export const arcaneBladeArchetype = {
    id: 'ArcaneBlade',
    name: '아케인 블레이드',
    description: 'A mage who imbues their weapon with arcane power, seamlessly blending swordplay and sorcery in close-quarters combat.',

    preferredTags: [
        { tag: SKILL_TAGS.MELEE, weight: 200 },
        { tag: SKILL_TAGS.CHARGE, weight: 150 },
        { tag: SKILL_TAGS.MAGIC, weight: 120 },
        { tag: SKILL_TAGS.BUFF, weight: 100 },
        // 근접전을 위한 생존기에도 약간의 가산점
        { tag: 'SHIELD', weight: 50 },
        { tag: SKILL_TAGS.WILL_GUARD, weight: 50 },
    ],

    // 아키타입 보너스로 힘 스탯을 약간 부여하여 근접 스킬 효율을 높임
    startingBonus: {
        strength: 5,
    },

    // MBTI 선호도 프로필 (임시)
    mbtiProfile: {
        E: 2,
        S: 2,
        N: 1,
        T: 1,
    }
};

