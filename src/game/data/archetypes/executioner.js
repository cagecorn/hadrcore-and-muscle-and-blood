import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

/**
 * 엑시큐셔너 (Executioner) 아키타입 정의
 * * 컨셉: 은신으로 숨어 기회를 엿보다가, 체력이 낮은 적을 단숨에 마무리하는 암살자.
 * 확정 치명타나 방어 무시 스킬로 약해진 적의 숨통을 확실하게 끊는 데 특화되어 있습니다.
 */
export const executionerArchetype = {
    id: 'Executioner',
    name: '엑시큐셔너',
    
    // 1. 핵심 코어 태그: AI가 이 덱을 구성할 때 최우선으로 고려하는 스킬 태그
    coreTags: [
        SKILL_TAGS.EXECUTE, 
        SKILL_TAGS.STEALTH, 
        SKILL_TAGS.FIXED
    ],

    // 2. 선호 스킬 목록 (빌드의 정답지)
    preferredSkills: [
        'assassinate',      // 암살 (신규)
        'criticalShot',     // 크리티컬 샷
        'ghosting',         // 투명화 (고스트 패시브 효과를 스킬로 만든 버전)
        'charge'            // 돌진
    ],

    // 3. 선호 장비 옵션
    preferredEquipment: {
        prefixes: [
            { name: '파괴적인', stat: 'criticalDamageMultiplier' },
            { name: '정밀한', stat: 'accuracy' }
        ],
        suffixes: [
            { name: '흡혈의', stat: 'lifeSteal' }
        ],
        mbtiEffects: [
            'I_EXECUTIONER', // (신규) 내향형: 은신 상태에서 첫 공격 시 데미지 증가
            'P_EXECUTIONER'  // (신규) 인식형: 처형 스킬로 적 처치 시 토큰 1개 회복
        ]
    },

    // 4. MBTI 선호도 프로필
    mbtiProfile: {
        I: 2, // 내향성 (은신, 잠행)
        S: 1, // 감각형 (확실한 마무리)
        P: 3, // 인식형 (기회 포착)
        T: 1  // 사고형 (효율적 처치)
    }
};

