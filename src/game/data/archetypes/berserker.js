import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

/**
 * 버서커 (Berserker) 아키타입 정의
 * * 컨셉: 분노를 힘으로 바꾸어 전장을 휘젓는 광전사.
 * 공격에 모든 것을 쏟아붓지만 방어에는 취약합니다.
 */
export const berserkerArchetype = {
    id: 'Berserker',
    name: '버서커',

    // 1. 핵심 코어 태그
    coreTags: [
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.MELEE,
        SKILL_TAGS.ON_HIT
    ],

    // 2. 선호 스킬 목록
    preferredSkills: [
        'frenziedBlow',
        'bloodRage',
        'spinningSlash',
        'charge'
    ],

    // 3. 선호 장비 옵션
    preferredEquipment: {
        prefixes: [
            { name: '광폭의', stat: 'physicalAttack' },
            { name: '흡혈의', stat: 'lifeSteal' }
        ],
        suffixes: [
            { name: '맹공의', stat: 'criticalChance' },
            { name: '격노의', stat: 'damageIncrease' }
        ],
        mbtiEffects: [
            'E_BERSERKER',
            'P_BERSERKER'
        ]
    },

    // 4. MBTI 선호도 프로필
    mbtiProfile: {
        E: 3,
        P: 3,
        S: 1,
        T: 1
    }
};
