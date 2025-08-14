import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

/**
 * 스펠브레이커 (Spellbreaker) 아키타입 정의
 * * 컨셉: 적의 마법을 무력화하고 동료를 보호하는 안티 메이지 전사.
 */
export const spellbreakerArchetype = {
    id: 'Spellbreaker',
    name: '스펠브레이커',

    // 1. 핵심 코어 태그
    coreTags: [
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.MAGIC,
        SKILL_TAGS.PHYSICAL
    ],

    // 2. 선호 스킬 목록
    preferredSkills: [
        'manaSunder',
        'nullField',
        'shieldBreak',
        'stoneSkin'
    ],

    // 3. 선호 장비 옵션
    preferredEquipment: {
        prefixes: [
            { name: '침묵의', stat: 'magicDefense' },
            { name: '가속의', stat: 'cooldownReduction' }
        ],
        suffixes: [
            { name: '결계의', stat: 'effectDuration' }
        ],
        mbtiEffects: [
            'N_SPELLBREAKER',
            'T_SPELLBREAKER'
        ]
    },

    // 4. MBTI 선호도 프로필
    mbtiProfile: {
        N: 3,
        T: 2,
        J: 2,
        I: 1
    }
};
