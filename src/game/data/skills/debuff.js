import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 디버프 스킬 데이터 정의
export const debuffSkills = {
    shieldBreak: {
        yinYangValue: +2,
        // NORMAL 등급: 기본 효과
        NORMAL: {
            id: 'shieldBreak',
            name: '쉴드 브레이크',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.MELEE],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 증가 {{increase}}% 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
            cooldown: 2,
            range: 1,
            effect: {
                id: 'shieldBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                modifiers: [ // 객체에서 배열로 수정
                    {
                        stat: 'damageIncrease',
                        type: 'percentage',
                        value: 0.15 // 4순위 기준 기본값
                    }
                ]
            }
        },
        // RARE 등급: 토큰 소모량 감소
        RARE: {
            id: 'shieldBreak',
            name: '쉴드 브레이크 [R]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.MELEE],
            cost: 1, // 토큰 소모량 1로 감소
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 증가 {{increase}}% 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
            cooldown: 2,
            range: 1,
            effect: {
                id: 'shieldBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                modifiers: [ // 객체에서 배열로 수정
                    {
                        stat: 'damageIncrease',
                        type: 'percentage',
                        value: 0.15
                    }
                ]
            }
        },
        // EPIC 등급: 방어력 감소 효과 추가
        EPIC: {
            id: 'shieldBreak',
            name: '쉴드 브레이크 [E]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.MELEE],
            cost: 1,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 {{increase}}% 증가, 방어력 5% 감소 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
            cooldown: 2,
            range: 1,
            effect: {
                id: 'shieldBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                // 여러 효과를 적용하기 위해 modifiers를 배열로 변경
                modifiers: [
                    { stat: 'damageIncrease', type: 'percentage', value: 0.15 },
                    { stat: 'physicalDefense', type: 'percentage', value: -0.05 } // 방어력 5% 감소
                ]
            }
        },
        // LEGENDARY 등급: 방어력 감소 효과 강화
        LEGENDARY: {
            id: 'shieldBreak',
            name: '쉴드 브레이크 [L]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.MELEE],
            cost: 1,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 {{increase}}% 증가, 방어력 10% 감소 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
            cooldown: 2,
            range: 1,
            effect: {
                id: 'shieldBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                modifiers: [
                    { stat: 'damageIncrease', type: 'percentage', value: 0.15 },
                    { stat: 'physicalDefense', type: 'percentage', value: -0.10 } // 방어력 10% 감소
                ]
            }
        }
    },
    // --- ▼ [신규] 집중 포화 스킬 추가 ▼ ---
    focusFire: {
        yinYangValue: +3,
        NORMAL: {
            id: 'focusFire',
            name: '집중 포화',
            type: 'DEBUFF',
            requiredClass: ['gunner', 'commander'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.STRATEGY, SKILL_TAGS.SPECIAL],
            cost: 0, // 자원만 소모
            targetType: 'enemy',
            description: '대상의 약점을 아군에게 공유합니다. 3턴간 대상이 받는 모든 피해가 15% 증가합니다. (소모 자원: 철 2)',
            illustrationPath: null,
            cooldown: 4,
            range: 5,
            resourceCost: { type: 'IRON', amount: 2 },
            effect: { id: 'focusFireMark', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        RARE: {
            id: 'focusFire',
            name: '집중 포화 [R]',
            type: 'DEBUFF',
            requiredClass: ['gunner', 'commander'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.STRATEGY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '대상의 약점을 아군에게 공유합니다. 3턴간 대상이 받는 모든 피해가 20% 증가합니다. (소모 자원: 철 2)',
            illustrationPath: null,
            cooldown: 4,
            range: 5,
            resourceCost: { type: 'IRON', amount: 2 },
            effect: {
                id: 'focusFireMark',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.20 } // 피해량 증가
            }
        },
        EPIC: {
            id: 'focusFire',
            name: '집중 포화 [E]',
            type: 'DEBUFF',
            requiredClass: ['gunner', 'commander'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.STRATEGY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '대상의 약점을 아군에게 공유합니다. 3턴간 대상이 받는 모든 피해가 25% 증가하고, 물리 방어력이 10% 감소합니다. (소모 자원: 철 2)',
            illustrationPath: null,
            cooldown: 3,
            range: 6,
            resourceCost: { type: 'IRON', amount: 2 },
            effect: {
                id: 'focusFireMark',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                modifiers: [ // 두 가지 효과
                    { stat: 'damageIncrease', type: 'percentage', value: 0.25 },
                    { stat: 'physicalDefense', type: 'percentage', value: -0.10 }
                ]
            }
        },
        LEGENDARY: {
            id: 'focusFire',
            name: '집중 포화 [L]',
            type: 'DEBUFF',
            requiredClass: ['gunner', 'commander'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.STRATEGY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '대상의 약점을 아군에게 공유합니다. 4턴간 대상이 받는 모든 피해가 30% 증가하고, 모든 방어력이 15% 감소합니다. (소모 자원: 철 1)',
            illustrationPath: null,
            cooldown: 3,
            range: 6,
            resourceCost: { type: 'IRON', amount: 1 }, // 비용 감소
            effect: {
                id: 'focusFireMark',
                type: EFFECT_TYPES.DEBUFF,
                duration: 4, // 지속시간 증가
                modifiers: [
                    { stat: 'damageIncrease', type: 'percentage', value: 0.30 },
                    { stat: 'physicalDefense', type: 'percentage', value: -0.15 },
                    { stat: 'magicDefense', type: 'percentage', value: -0.15 }
                ]
            }
        }
    },
    // --- ▲ [신규] 집중 포화 스킬 추가 ▲ ---
    // --- ▼ [신규] 컨퓨전 스킬 추가 ▼ ---
    confusion: {
        yinYangValue: +4, // 전장을 뒤흔드는 강력한 양(Yang)의 기술로 +4의 높은 점수를 부여했습니다.
        NORMAL: {
            id: 'confusion',
            name: '컨퓨전',
            type: 'DEBUFF',
            requiredClass: ['esper'], // 에스퍼 전용 스킬로 설정
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '적을 2턴간 [혼란] 상태로 만들어, 아군을 공격하게 만듭니다.',
            illustrationPath: 'assets/images/skills/confusion.png',
            cooldown: 3,
            range: 3,
            effect: {
                id: 'confusion',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 2,
            }
        },
        RARE: {
            id: 'confusion',
            name: '컨퓨전 [R]',
            type: 'DEBUFF',
            requiredClass: ['esper'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 2, // 토큰 소모량 1 감소
            targetType: 'enemy',
            description: '적을 2턴간 [혼란] 상태로 만들어, 아군을 공격하게 만듭니다.',
            illustrationPath: 'assets/images/skills/confusion.png',
            cooldown: 3,
            range: 3,
            effect: {
                id: 'confusion',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 2,
            }
        },
        EPIC: {
            id: 'confusion',
            name: '컨퓨전 [E]',
            type: 'DEBUFF',
            requiredClass: ['esper'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 2,
            targetType: 'enemy',
            description: '적을 2턴간 [혼란] 상태로 만들어, 아군을 공격하게 만듭니다.',
            illustrationPath: 'assets/images/skills/confusion.png',
            cooldown: 2, // 쿨타임 1 감소
            range: 4, // 사거리 1 증가
            effect: {
                id: 'confusion',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 2,
            }
        },
        LEGENDARY: {
            id: 'confusion',
            name: '컨퓨전 [L]',
            type: 'DEBUFF',
            requiredClass: ['esper'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 2,
            targetType: 'enemy',
            description: '적을 2턴간 [혼란] 상태로 만들고, 대상의 공격력을 15% 감소시킵니다.',
            illustrationPath: 'assets/images/skills/confusion.png',
            cooldown: 2,
            range: 4,
            effect: {
                id: 'confusion',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 2,
                // 레전더리 등급에는 공격력 감소 디버프를 추가하여 더욱 강력하게 만들었습니다.
                modifiers: { stat: 'physicalAttack', type: 'percentage', value: -0.15 }
            }
        }
    },
    // --- ▲ [신규] 컨퓨전 스킬 추가 ▲ ---

    // --- ▼ [신규] 시스템 해킹 스킬 추가 ▼ ---
    systemHack: {
        yinYangValue: +3,
        NORMAL: {
            id: 'systemHack',
            name: '시스템 해킹',
            type: 'DEBUFF',
            requiredClass: ['hacker'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.PROHIBITION, SKILL_TAGS.MIND, SKILL_TAGS.SPECIAL],
            cost: 2,
            targetType: 'enemy',
            description: '적의 시스템을 교란하여 1턴간 [무장 해제] 상태로 만듭니다. (공격/스킬 사용 불가)',
            illustrationPath: null,
            cooldown: 4,
            range: 3,
            effect: { id: 'disarm', type: EFFECT_TYPES.DEBUFF, duration: 1 }
        }
    },
    // --- ▲ [신규] 시스템 해킹 스킬 추가 ▲ ---

    nullify: {
        yinYangValue: +3,
        NORMAL: {
            id: 'nullify',
            name: '무효화',
            type: 'DEBUFF',
            requiredClass: ['hacker'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION],
            cost: 2,
            targetType: 'enemy',
            description: '적 하나의 모든 이로운 버프를 해제합니다. 대상이 버프를 가지고 있지 않았다면, 대신 1턴간 [바이러스] 상태로 만듭니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 4,
            removesAllBuffs: true, // 버프 제거 플래그
            fallbackEffect: { id: 'virus', type: EFFECT_TYPES.DEBUFF, duration: 1 } // 대체 효과
        }
    }
};
