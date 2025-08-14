import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

/**
 * 프로스트위버 (Frostweaver) 아키타입 정의
 * * 컨셉: 냉기 마법으로 적의 움직임을 묶고, 턴 순서를 지연시키며 전장을 얼어붙게 만드는 전장 통제 전문가.
 * 직접적인 파괴력보다는 적을 무력화시켜 서서히 승리를 가져옵니다.
 */
export const frostweaverArchetype = {
    id: 'Frostweaver',
    name: '프로스트위버',
    
    // 1. 핵심 코어 태그
    coreTags: [
        SKILL_TAGS.WATER, 
        SKILL_TAGS.DELAY, 
        SKILL_TAGS.PROHIBITION
    ],

    // 2. 선호 스킬 목록 (빌드의 정답지)
    preferredSkills: [
        'iceBolt',       // 아이스 볼트 (신규)
        'frostNova',     // 프로스트 노바 (신규)
        'blizzard',      // 블리자드 (신규)
        'iceball',       // 아이스볼 (기존)
        'suppressShot',  // 제압 사격 (DELAY 태그 공유)
        'stigma'         // 낙인 (PROHIBITION 태그 공유)
    ],

    // 3. 선호 장비 옵션
    preferredEquipment: {
        prefixes: [
            { name: '빙결의', stat: 'frostDamage' }, // (신규) 냉기 속성 데미지
            { name: '마력의', stat: 'magicAttack' }
        ],
        suffixes: [
            { name: '지연의', stat: 'statusEffectApplication' }, // (신규) 상태이상 적용 확률 증가
            { name: '끈기의', stat: 'aspirationDecayReduction' }
        ],
        mbtiEffects: [
            'I_FROSTWEAVER', // (신규) 내향형 장착 시, [물] 자원 1개로 턴 시작
            'N_FROSTWEAVER'  // (신규) 직관형 장착 시, 자신이 부여한 [둔화], [속박] 지속시간 +1턴
        ]
    },

    // 4. MBTI 선호도 프로필
    mbtiProfile: {
        I: 3, // 내향성 (후방, 제어)
        N: 3, // 직관형 (변수 창출)
        T: 1, // 사고형 (효율적 제어)
        P: 1  // 인식형 (유연한 대처)
    }
};
