// data/warriorSkills.js

// 스킬 타입 상수는 필요에 따라 별도의 constants.js 파일로 이동 가능
export const SKILL_TYPES = {
    ACTIVE: 'active',
    PASSIVE: 'passive',
    DEBUFF: 'debuff',
    REACTION: 'reaction',
    BUFF: 'buff'
};

export const WARRIOR_SKILLS = {
    // 버프 스킬 (한 턴에 스킬 + 일반 공격 예시)
    BATTLE_CRY: {
        id: 'skill_warrior_battle_cry',
        name: '전투의 외침',
        type: SKILL_TYPES.BUFF,
        icon: 'assets/icons/skills/battle_cry.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        aiFunction: 'battleCry',
        description: '자신의 공격력을 일시적으로 증가시키고 일반 공격을 수행합니다.',
        effect: {
            dice: { num: 1, sides: 6 },
            statusEffectId: 'status_battle_cry', // 적용할 상태이상 ID
            allowAdditionalAttack: true // 버프 후 추가 공격 가능 플래그
        }
    },
    // 디버프 스킬 (일반 공격 시 묻어남 예시)
    RENDING_STRIKE: {
        id: 'skill_warrior_rending_strike',
        name: '찢어발기기',
        type: SKILL_TYPES.DEBUFF,
        icon: 'assets/icons/skills/rending_strike.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        probability: 0, // 평타에 묻어나는 스킬이라 자체 발동 확률은 0
        description: '일반 공격 시 일정 확률로 적에게 출혈 디버프를 부여합니다.',
        effect: {
            statusEffectId: 'status_bleed'
        }
    },
    // 리액션 스킬 (공격 받을 시 발동 예시)
    RETALIATE: {
        id: 'skill_warrior_retaliate',
        name: '반격',
        type: SKILL_TYPES.REACTION,
        icon: 'assets/icons/skills/retaliate.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        description: '공격을 받을 시 일정 확률로 즉시 80%의 피해로 반격합니다.',
        effect: {
            damageModifier: 0.8, // 반격 시 피해량 80%
            tags: ['일반공격'] // 이 공격이 평타 판정임을 명시
        }
    },

    SHIELD_BREAK: {
        id: 'skill_warrior_shield_break',
        name: '쉴드 브레이크',
        description: '일반 공격 시 대상이 3턴간 받는 피해를 10% 증가시킵니다.',
        type: SKILL_TYPES.DEBUFF,
        icon: 'assets/icons/skills/shield-break.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        effect: {
            statusEffectId: 'status_shield_break'
        }
    },
    // 액티브 스킬: 빠르게 두 번 공격
    DOUBLE_STRIKE: {
        id: 'skill_warrior_double_strike',
        name: '더블 스트라이크',
        description: '한 대상에게 빠르게 일반 공격을 2회 가합니다.',
        type: SKILL_TYPES.ACTIVE,
        icon: 'assets/icons/skills/double-strike-icon.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        aiFunction: 'doubleStrike',
        cost: 25,
        range: 1,
        cooldown: 2,
        effect: {
            tags: ['공격', '단일대상']
            // 이 스킬로 발생한 두 번의 공격은 평타 판정을 받습니다.
        },
        ai: {
            condition: (user, target) => target && user.getDistanceTo && user.getDistanceTo(target) <= 1
        }
    },
    STONE_SKIN: {
        id: 'skill_warrior_stone_skin',
        name: '스톤 스킨',
        description: '3턴 동안 받는 모든 피해가 15% 감소합니다.',
        type: 'active',
        icon: 'assets/icons/skills/stone-skin-icon.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        aiFunction: 'stoneSkin',
        cost: 20,
        range: 0,
        cooldown: 4,
        effect: {
            tags: ['방어', '버프'],
            appliesEffect: 'status_stone_skin'
        },
        ai: {}
    },
    // 패시브 스킬 (상시 발동 예시)
    IRON_WILL: {
        id: 'skill_warrior_iron_will',
        name: '강철 의지',
        type: SKILL_TYPES.PASSIVE,
        icon: 'assets/icons/skills/iron_will.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        description: '잃은 체력에 비례하여 받는 피해량이 최대 30%까지 감소합니다.',
        effect: {
            // 이 효과는 ConditionalManager가 실시간으로 계산하므로
            // 여기에는 패시브 식별용 정보만 남겨둡니다.
            type: 'damage_reduction_on_lost_hp',
            maxReduction: 0.3 // 최대 30% 감소
        }
    }
};
