import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 지원(AID) 스킬 데이터 정의
export const aidSkills = {
    heal: {
        yinYangValue: +2,
        NORMAL: {
            id: 'heal',
            name: '힐',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.HEAL],
            cost: 1,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시킵니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            cooldown: 0,
            range: 2,
            healMultiplier: { min: 0.9, max: 1.1 },
        },
        RARE: {
            id: 'heal',
            name: '힐 [R]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.HEAL],
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시킵니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            cooldown: 0,
            range: 2,
            healMultiplier: { min: 0.9, max: 1.1 },
        },
        EPIC: {
            id: 'heal',
            name: '힐 [E]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.HEAL],
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시키고, 50% 확률로 해로운 효과 1개를 제거합니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            cooldown: 0,
            range: 2,
            healMultiplier: { min: 0.9, max: 1.1 },
            removesDebuff: { chance: 0.5 }
        },
        LEGENDARY: {
            id: 'heal',
            name: '힐 [L]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.HEAL],
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시키고, 100% 확률로 해로운 효과 1개를 제거합니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            cooldown: 0,
            range: 2,
            healMultiplier: { min: 0.9, max: 1.1 },
            removesDebuff: { chance: 1.0 }
        }
    },
    // --- ▼ [신규] 윌 가드 스킬 추가 ▼ ---
    willGuard: {
        yinYangValue: +3,
        NORMAL: {
            id: 'willGuard',
            name: '윌 가드',
            type: 'AID',
            requiredClass: ['medic', 'paladin'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.HEAL],
            cost: 3,
            targetType: 'ally',
            description: '아군에게 {{heal}}의 치유를 하고, 다음 2회의 공격을 [확정 막기]로 만듭니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/shield-buff.png',
            cooldown: 3,
            range: 3,
            healMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'willGuard',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'BLOCK', amount: 2 }
            }
        },
        RARE: {
            id: 'willGuard',
            name: '윌 가드 [R]',
            type: 'AID',
            requiredClass: ['medic', 'paladin'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.HEAL],
            cost: 2,
            targetType: 'ally',
            description: '아군에게 {{heal}}의 치유를 하고, 다음 2회의 공격을 [확정 막기]로 만듭니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/shield-buff.png',
            cooldown: 3,
            range: 3,
            healMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'willGuard',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'BLOCK', amount: 2 }
            }
        },
        EPIC: {
            id: 'willGuard',
            name: '윌 가드 [E]',
            type: 'AID',
            requiredClass: ['medic', 'paladin'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.HEAL],
            cost: 2,
            targetType: 'ally',
            description: '아군에게 {{heal}}의 치유를 하고, 다음 3회의 공격을 [확정 막기]로 만듭니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-buff.png',
            cooldown: 2,
            range: 4,
            healMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'willGuard',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'BLOCK', amount: 3 }
            }
        },
        LEGENDARY: {
            id: 'willGuard',
            name: '윌 가드 [L]',
            type: 'AID',
            requiredClass: ['medic', 'paladin'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.HEAL],
            cost: 2,
            targetType: 'ally',
            description: '아군에게 {{heal}}의 치유를 하고, 다음 3회의 공격을 [확정 막기]로 만듭니다. 보호막이 활성화된 동안 [지혜]가 10% 증가합니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-buff.png',
            cooldown: 2,
            range: 4,
            healMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'willGuard',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'BLOCK', amount: 3 },
                modifiers: {
                    stat: 'wisdom',
                    type: 'percentage',
                    value: 0.10
                }
            }
        }
    },
    // --- ▲ [신규] 윌 가드 스킬 추가 ▲ ---

    // --- ▼ [신규] 마이티 쉴드 스킬 추가 ▼ ---
    mightyShield: {
        yinYangValue: +4,
        NORMAL: {
            id: 'mightyShield',
            name: '마이티 쉴드',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '아군에게 2회의 공격을 완벽하게 막아내는 빛의 방패를 부여합니다. (쿨타임 10턴, 소모 자원: 빛 5)',
            illustrationPath: 'assets/images/skills/mighty-shield.png',
            cooldown: 10,
            range: 3,
            resourceCost: { type: 'LIGHT', amount: 5 },
            effect: {
                id: 'mightyShield',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'DAMAGE_IMMUNITY', amount: 2 }
            }
        },
        RARE: {
            id: 'mightyShield',
            name: '마이티 쉴드 [R]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '아군에게 3회의 공격을 완벽하게 막아내는 빛의 방패를 부여합니다. (쿨타임 9턴, 소모 자원: 빛 5)',
            illustrationPath: 'assets/images/skills/mighty-shield.png',
            cooldown: 9,
            range: 3,
            resourceCost: { type: 'LIGHT', amount: 5 },
            effect: {
                id: 'mightyShield',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'DAMAGE_IMMUNITY', amount: 3 }
            }
        },
        EPIC: {
            id: 'mightyShield',
            name: '마이티 쉴드 [E]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '아군에게 4회의 공격을 완벽하게 막아내는 빛의 방패를 부여합니다. (쿨타임 8턴, 소모 자원: 빛 4)',
            illustrationPath: 'assets/images/skills/mighty-shield.png',
            cooldown: 8,
            range: 4,
            resourceCost: { type: 'LIGHT', amount: 4 },
            effect: {
                id: 'mightyShield',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'DAMAGE_IMMUNITY', amount: 4 }
            }
        },
        LEGENDARY: {
            id: 'mightyShield',
            name: '마이티 쉴드 [L]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '아군에게 5회의 공격을 완벽하게 막아내는 빛의 방패를 부여하고, 대상의 해로운 효과를 1개 제거합니다. (쿨타임 7턴, 소모 자원: 빛 4)',
            illustrationPath: 'assets/images/skills/mighty-shield.png',
            cooldown: 7,
            range: 4,
            resourceCost: { type: 'LIGHT', amount: 4 },
            removesDebuff: { chance: 1.0 },
            effect: {
                id: 'mightyShield',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'DAMAGE_IMMUNITY', amount: 5 }
            }
        }
    },
    // --- ▲ [신규] 마이티 쉴드 스킬 추가 ▲ ---

    // --- ▼ [신규] 맹독 바르기 스킬 추가 ▼ ---
    applyPoison: {
        yinYangValue: +1,
        NORMAL: {
            id: 'applyPoison',
            name: '맹독 바르기',
            type: 'AID',
            requiredClass: ['plagueDoctor'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.BUFF, SKILL_TAGS.POISON, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'ally',
            description: '아군 하나의 무기에 독을 발라, 2턴간 공격 시 50% 확률로 적을 [중독]시킵니다. [독] 자원을 1 생산합니다.',
            illustrationPath: null,
            cooldown: 2,
            range: 2,
            generatesResource: { type: 'POISON', amount: 1 },
            effect: {
                id: 'poisonWeapon',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                poisonChance: 0.5 // 중독 확률 (나중에 CombatCalculationEngine에서 처리)
            }
        }
    },
    // --- ▲ [신규] 맹독 바르기 스킬 추가 ▲ ---

    // --- ▼ [신규] 안드로이드 전용 지원 스킬 2종 추가 ▼ ---
    overdrive: {
        yinYangValue: +3,
        NORMAL: {
            id: 'overdrive',
            name: '오버드라이브',
            type: 'AID',
            requiredClass: ['android'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.BUFF, SKILL_TAGS.SACRIFICE],
            cost: 3,
            targetType: 'ally',
            description: '자신의 최대 체력 10%를 소모하여 아군 하나의 모든 스킬 쿨타임을 1턴 감소시키고, 3턴간 [특수 스킬] 위력을 20% 증폭시킵니다.',
            illustrationPath: null,
            cooldown: 6,
            range: 2,
            selfDamage: { type: 'percentage', value: 0.10 }, // 자기 피해
            cooldownReduction: { amount: 1 }, // 쿨타임 감소 효과
            effect: { id: 'overdrive', type: EFFECT_TYPES.BUFF, duration: 3 }
        }
    },

    nobleSacrifice: {
        yinYangValue: +4,
        NORMAL: {
            id: 'nobleSacrifice',
            name: '고귀한 희생',
            type: 'AID',
            requiredClass: ['android'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.SACRIFICE, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '자신의 최대 체력 10%를 소모하여 아군 하나의 용맹 배리어를 최대치의 30%만큼 즉시 회복시킵니다. (소모 자원: 철 3)',
            illustrationPath: null,
            cooldown: 0,
            range: 2,
            resourceCost: { type: 'IRON', amount: 3 },
            selfDamage: { type: 'percentage', value: 0.10 },
            restoresBarrierPercent: 0.30 // 배리어 회복 효과
        }
    },

    // --- ▼ [신규] 링크 프로토콜, 부패의 손길, 긴급 수리 스킬 추가 ▼ ---
    linkProtocol: {
        yinYangValue: -3,
        NORMAL: {
            id: 'linkProtocol',
            name: '링크 프로토콜',
            type: 'AID',
            requiredClass: ['android'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.BUFF, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.SACRIFICE],
            cost: 2,
            targetType: 'ally',
            description: '아군 한 명과 자신을 연결합니다. 3턴 동안 대상이 받는 모든 피해의 50%를 자신이 대신 받습니다.',
            illustrationPath: null,
            cooldown: 4,
            range: 3,
            effect: {
                id: 'linkProtocolBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                // 실제 피해 공유 로직은 CombatCalculationEngine에서 처리 필요
            }
        }
    },

    handOfCorruption: {
        yinYangValue: +2,
        NORMAL: {
            id: 'handOfCorruption',
            name: '부패의 손길',
            type: 'AID',
            requiredClass: ['plagueDoctor'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.DEBUFF, SKILL_TAGS.HEAL, SKILL_TAGS.PROHIBITION],
            cost: 2,
            targetType: 'all',
            description: '아군에게 사용하면 모든 디버프를 제거하고, 적에게 사용하면 모든 버프를 제거합니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 2,
            // 이 스킬의 효과는 SkillEffectProcessor에서 분기 처리 필요
        }
    },

    emergencyRepair: {
        yinYangValue: -2,
        NORMAL: {
            id: 'emergencyRepair',
            name: '긴급 수리',
            type: 'AID',
            requiredClass: ['mechanic'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.HEAL, SKILL_TAGS.BUFF, SKILL_TAGS.SUMMON],
            cost: 2,
            targetType: 'ally',
            description: '아군 소환수 하나의 체력을 즉시 50% 회복시키고, 2턴간 공격력을 25% 증가시킵니다.',
            illustrationPath: null,
            cooldown: 4,
            range: 3,
            healMultiplier: 0.5,
            effect: {
                id: 'emergencyRepairBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.25 }
            }
        }
    }
    // --- ▲ [신규] 링크 프로토콜, 부패의 손길, 긴급 수리 스킬 추가 ▲ ---
    // --- ▲ [신규] 안드로이드 전용 지원 스킬 2종 추가 ▲ ---
};
