import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

/**
 * 포스 메이저 (Force Major)
 * 순수한 힘과 파괴에 집중하여, 압도적인 원거리 마법 피해를 선호합니다.
 * FORCE, KINETIC, BEAM 태그에 막대한 보너스를 부여합니다.
 */
export const forceMajorArchetype = {
    id: 'ForceMajor',
    name: '포스 메이저',
    description: 'A specialist in raw power, who casts aside subtlety to unleash overwhelming waves of pure kinetic and magical force.',

    preferredTags: [
        { tag: 'FORCE', weight: 250 },
        { tag: SKILL_TAGS.KINETIC, weight: 200 },
        { tag: 'BEAM', weight: 180 },
        // 돌진기 역시 위치 선점을 위해 중요한 스킬로 간주
        { tag: SKILL_TAGS.CHARGE, weight: 100 },
        { tag: 'AOE', weight: 80 }, // 광역 피해도 선호
    ],

    // 아키타입 보너스로 지능을 높여 순수 마법 피해량을 극대화
    startingBonus: {
        intelligence: 5,
    },

    // MBTI 선호도 프로필 (임시)
    mbtiProfile: {
        N: 3,
        J: 2,
    }
};

