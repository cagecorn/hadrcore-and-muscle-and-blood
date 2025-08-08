import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

/**
 * 아퀼리퍼 (Aquilifer) 아키타입 정의
 * * 컨셉: 군단의 깃발을 들고 아군 전체의 사기를 드높이는 지휘관형 지원가.
 * 자신을 중심으로 한 강력한 오라(Aura)를 통해 아군 전체에 지속적인 버프를 제공하며,
 * 전투의 흐름을 유리하게 이끕니다.
 */
export const aquiliferArchetype = {
    id: 'Aquilifer',
    name: '아퀼리퍼',

    // 1. 핵심 코어 태그
    coreTags: [
        SKILL_TAGS.AURA,
        SKILL_TAGS.BUFF,
        SKILL_TAGS.HOLY
    ],

    // 2. 선호 스킬 목록
    preferredSkills: [
        'sanctuary',            // 성역 (신규)
        'auraOfRetribution',    // 응징의 오라 (신규)
        'proofOfValor',         // 용맹의 증거
        'rallyingHorn',         // 집결의 뿔피리
        'chargeOrder',          // 돌격 명령
        'mightyShield'          // 마이티 쉴드
    ],

    // 3. 선호 장비 옵션
    preferredEquipment: {
        prefixes: [
            { name: '지휘관의', stat: 'auraRadius' },      // (신규) 오라 스킬의 반경 증가
            { name: '축복받은', stat: 'healingGivenPercentage' }
        ],
        suffixes: [
            { name: '신념의', stat: 'effectDuration' },     // (신규) 자신이 건 버프/디버프 지속시간 증가
            { name: '용기의', stat: 'valor' }
        ],
        mbtiEffects: [
            'F_AQUILIFER', // (신규) 감정형: 오라 스킬 효과 증폭
            'J_AQUILIFER'  // (신규) 판단형: 빛 자원을 가지고 전투 시작
        ]
    },

    // 4. MBTI 선호도 프로필
    mbtiProfile: {
        E: 2, // 외향성 (지휘관)
        F: 3, // 감정형 (아군 지원)
        J: 3, // 판단형 (계획, 통솔)
        S: 1
    }
};

