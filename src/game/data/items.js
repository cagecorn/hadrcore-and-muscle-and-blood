/**
 * 게임에 등장하는 모든 아이템의 기본 데이터와
 * 무작위로 부여될 수 있는 접두사, 접미사,
 * 그리고 등급별로 적용 가능한 MBTI 특성 효과를 정의하는 파일
 */

// 아이템이 장착될 수 있는 부위 정의
export const EQUIPMENT_SLOTS = {
    WEAPON: '무기',
    ARMOR: '갑옷',
    ACCESSORY: '장신구'
};

// 1. 장비 기본 스탯 데이터베이스
export const itemBaseData = {
    // --- 무기 ---
    axe: {
        id: 'axe',
        name: '도끼',
        type: EQUIPMENT_SLOTS.WEAPON,
        synergy: '광기의 학살자',
        illustrationPath: 'assets/images/item/throwing-axe.png',
        baseStats: {
            physicalAttack: { min: 8, max: 12 }
        },
        weight: 10
    },
    baseballBat: {
        id: 'baseballBat',
        name: '야구 방망이',
        type: EQUIPMENT_SLOTS.WEAPON,
        illustrationPath: null,
        baseStats: {
            physicalAttack: { min: 6, max: 9 }
        },
        weight: 8
    },

    // --- 방어구 ---
    plateArmor: {
        id: 'plateArmor',
        name: '판금 갑옷',
        type: EQUIPMENT_SLOTS.ARMOR,
        synergy: '신뢰의 방패',
        illustrationPath: 'assets/images/item/plate-armor.png',
        baseStats: {
            physicalDefense: { min: 15, max: 20 },
            hp: { min: 20, max: 30 }
        },
        weight: 25
    }
};

// 2. 장비 접두사/접미사 부가 스탯 데이터베이스
export const itemAffixes = {
    // --- 접두사 (주로 공격, 성능 관련) ---
    prefixes: [
        { name: '날카로운', stat: 'criticalChance', value: { min: 3, max: 5 } },
        { name: '파괴적인', stat: 'criticalDamageMultiplier', value: { min: 10, max: 15 } },
        { name: '맹공의', stat: 'physicalAttack', value: { min: 5, max: 8 }, isPercentage: true },
        { name: '마력의', stat: 'magicAttack', value: { min: 5, max: 8 }, isPercentage: true },
        { name: '정밀한', stat: 'accuracy', value: { min: 5, max: 10 } },
        // --- ▼ [신규] 드레드노트용 접두사 추가 ▼ ---
        { name: '도발하는', stat: 'threat', value: { min: 10, max: 20 } },
        { name: '응보의', stat: 'retaliationDamage', value: { min: 5, max: 10 } },
        // --- ▼ [신규] 프로스트위버용 접두사 추가 ▼ ---
        { name: '빙결의', stat: 'frostDamage', value: { min: 8, max: 12 } }, // 냉기 속성 데미지를 추가하는 신규 스탯
        // --- ▼ [신규] 아퀼리퍼용 접두사 추가 ▼ ---
        { name: '지휘관의', stat: 'auraRadius', value: { min: 1, max: 1 } } // 오라 반경
    ],

    // --- 접미사 (주로 방어, 유틸리티 관련) ---
    suffixes: [
        { name: '견고함의', stat: 'physicalDefense', value: { min: 5, max: 8 }, isPercentage: true },
        { name: '회피의', stat: 'physicalEvadeChance', value: { min: 3, max: 5 } },
        { name: '재생의', stat: 'hpRegen', value: { min: 5, max: 10 } },
        { name: '흡혈의', stat: 'lifeSteal', value: { min: 2, max: 4 } },
        { name: '끈기의', stat: 'aspirationDecayReduction', value: { min: 10, max: 15 } },
        // --- ▼ [신규] 드레드노트용 접미사 추가 ▼ ---
        { name: '수호의', stat: 'allyDamageReduction', value: { min: 3, max: 5 } },
        { name: '철벽의', stat: 'damageReduction', value: { min: 2, max: 4 }, isPercentage: true },
        { name: '용기의', stat: 'valor', value: { min: 2, max: 5 } },
        // --- ▼ [신규] 프로스트위버용 접미사 추가 ▼ ---
        { name: '지연의', stat: 'statusEffectApplication', value: { min: 5, max: 8 } }, // 상태이상 적용 확률 증가
        // --- ▼ [신규] 아퀼리퍼용 접미사 추가 ▼ ---
        { name: '신념의', stat: 'effectDuration', value: { min: 1, max: 1 } } // 효과 지속시간
    ]
};

// --- ▼ [신규] MBTI 성향별 등급 효과 데이터베이스 ▼ ---
export const mbtiGradeEffects = {
    E: [{ trait: 'E', description: '외향형 장착 시, 주변 아군 수 비례 공격력 +{value}%', stat: 'physicalAttackPercentagePerAlly', value: { min: 1, max: 2 } }],
    I: [{ trait: 'I', description: '내향형 장착 시, 스킬 토큰 소모량 -{value}%', stat: 'tokenCostReduction', value: { min: 5, max: 10 } }],
    S: [{ trait: 'S', description: '감각형 장착 시, 명중률 +{value}', stat: 'accuracy', value: { min: 5, max: 10 } }],
    N: [{ trait: 'N', description: '직관형 장착 시, 스킬 효과 지속시간 +{value}턴', stat: 'effectDuration', value: { min: 1, max: 1 } }],
    T: [{ trait: 'T', description: '사고형 장착 시, 받는 치명타 피해량 -{value}%', stat: 'criticalDamageReduction', value: { min: 10, max: 15 } }],
    F: [{ trait: 'F', description: '감정형 장착 시, 아군에게 주는 치유량 +{value}%', stat: 'healingGivenPercentage', value: { min: 5, max: 10 } }],
    J: [{ trait: 'J', description: '판단형 장착 시, 모든 스킬 재사용 대기시간 -{value}턴', stat: 'cooldownReduction', value: { min: 1, max: 1 } }],
    P: [{ trait: 'P', description: '인식형 장착 시, {value}% 확률로 토큰 미소모', stat: 'tokenFreeChance', value: { min: 5, max: 10 } }],

    // --- ▼ [신규] 드레드노트용 MBTI 효과 추가 ▼ ---
    // ISTJ, ISFJ 같은 수호자 타입을 위한 효과들
    I_DREADNOUGHT: [{ trait: 'I', description: '내향형 장착 시, [방어 태세] 발동. 턴 종료 시 방어력 +{value}% (최대 3중첩)', stat: 'defenseStackOnTurnEnd', value: { min: 3, max: 5 } }],
    S_DREADNOUGHT: [{ trait: 'S', description: '감각형 장착 시, [의지 방패] 스킬로 생성되는 스택 +{value}개', stat: 'willGuardStackBonus', value: { min: 1, max: 1 } }],
    J_DREADNOUGHT: [{ trait: 'J', description: '판단형 장착 시, 피격 시 {value}% 확률로 [철] 자원 1개 생성', stat: 'ironGenerationOnHitChance', value: { min: 15, max: 25 } }],
    // --- ▼ [신규] 프로스트위버용 MBTI 효과 추가 ▼ ---
    I_FROSTWEAVER: [{ trait: 'I', description: '내향형 장착 시, 매 턴 [물] 자원 1개를 가지고 시작', stat: 'startingWaterResource', value: { min: 1, max: 1 } }],
    N_FROSTWEAVER: [{ trait: 'N', description: '직관형 장착 시, [둔화], [속박] 효과 지속시간 +{value}턴', stat: 'debuffDurationBonus', value: { min: 1, max: 1 } }],
    // --- ▼ [신규] 아퀼리퍼용 MBTI 효과 추가 ▼ ---
    F_AQUILIFER: [{ trait: 'F', description: '감정형 장착 시, [오라] 스킬의 효과가 {value}% 증폭됩니다.', stat: 'auraEffectAmplification', value: { min: 10, max: 15 } }],
    J_AQUILIFER: [{ trait: 'J', description: '판단형 장착 시, 전투 시작 시 [빛] 자원 {value}개를 가지고 시작합니다.', stat: 'startingLightResource', value: { min: 1, max: 2 } }]
};

// --- ▼ [신규] 장비 시너지 세트 효과 데이터베이스 ▼ ---
export const synergySets = {
    '신뢰의 방패': {
        name: '신뢰의 방패',
        description: '용맹 배리어가 활성화되어 있는 동안 받는 모든 피해 15% 감소.',
        effect: { stat: 'damageReductionWhileBarrierActive', value: 15 }
    },
    '광기의 학살자': {
        name: '광기의 학살자',
        description: '적을 처치할 때마다 즉시 추가 턴을 1회 얻습니다 (연속 획득 불가).',
        effect: { trigger: 'onKill', action: 'gainExtraTurn' }
    }
    // ... 다른 세트 효과들을 여기에 추가 ...
};

// --- ▼ [신규] 보석 데이터베이스 ▼ ---
export const gemData = {
    ruby: {
        id: 'ruby',
        name: '화염의 루비',
        effects: {
            [EQUIPMENT_SLOTS.WEAPON]: { stat: 'fireDamage', value: { min: 10, max: 15 } },
            [EQUIPMENT_SLOTS.ARMOR]: { stat: 'fireResistance', value: { min: 5, max: 8 } }
        },
        illustrationPath: 'assets/images/placeholder.png'
    },
    sapphire: {
        id: 'sapphire',
        name: '서리의 사파이어',
        effects: {
            [EQUIPMENT_SLOTS.WEAPON]: { stat: 'frostDamage', value: { min: 10, max: 15 } },
            [EQUIPMENT_SLOTS.ARMOR]: { stat: 'frostResistance', value: { min: 5, max: 8 } }
        },
        illustrationPath: 'assets/images/placeholder.png'
    },
    massiveFireGem: {
        id: 'massiveFireGem',
        name: '거대한 불의 보석',
        effects: {
            [EQUIPMENT_SLOTS.WEAPON]: { stat: 'fireDamage', value: { min: 20, max: 25 } },
            [EQUIPMENT_SLOTS.ARMOR]: { stat: 'fireResistance', value: { min: 10, max: 15 } }
        },
        illustrationPath: 'assets/images/placeholder.png'
    }
    // ... 다른 보석들 추가 ...
};
