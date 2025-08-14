import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

/**
 * 드레드노트 (Dreadnought) 아키타입 정의
 * * 컨셉: 최전방에서 적의 공격을 모두 받아내는 강철의 요새.
 * 자신과 아군에게 보호막과 방어 버프를 부여하고, 적의 핵심 공격을 버텨내며
 * 전선을 유지하는 데 모든 것을 집중합니다.
 */
export const dreadnoughtArchetype = {
    id: 'Dreadnought',
    name: '드레드노트',
    
    // 1. 핵심 코어 태그: 이 아키타입의 정체성
    // AI는 이 태그를 가진 스킬을 최우선으로 장착하려 합니다.
    coreTags: [
        SKILL_TAGS.WILL_GUARD, 
        SKILL_TAGS.GUARDIAN, 
        SKILL_TAGS.PHYSICAL
    ],

    // 2. 선호 스킬 목록 (빌드의 정답지)
    // AI는 이 목록에 있는 스킬들을 우선적으로 장착합니다.
    preferredSkills: [
        'taunt',         // 도발 (신규)
        'shieldBash',    // 방패 치기 (신규)
        'willGuard',     // 윌 가드
        'stoneSkin',     // 스톤 스킨
        'ironWill',      // 아이언 윌 (패시브)
        'mightyShield'   // 마이티 쉴드
    ],

    // 3. 선호 장비 옵션
    // AI는 이 옵션들이 붙은 장비를 다른 장비보다 높은 가치로 평가합니다.
    preferredEquipment: {
        // 접두사
        prefixes: [
            { name: '도발하는', stat: 'threat' },
            { name: '응보의', stat: 'retaliationDamage' }
        ],
        // 접미사
        suffixes: [
            { name: '수호의', stat: 'allyDamageReduction' },
            { name: '철벽의', stat: 'damageReduction' },
            { name: '용기의', stat: 'valor' }
        ],
        // MBTI 등급 효과
        mbtiEffects: [
            'I_DREADNOUGHT',
            'S_DREADNOUGHT',
            'J_DREADNOUGHT'
        ]
    },

    // 4. MBTI 선호도 프로필
    // ArchetypeAssignmentEngine이 이 프로필을 사용하여 용병에게 아키타입을 부여합니다.
    mbtiProfile: {
        I: 3, // 내향성 (방어적)
        S: 2, // 감각형 (확실한 효과 선호)
        J: 2, // 판단형 (계획적)
        F: 1  // 감정형 (아군 보호)
    }
};
