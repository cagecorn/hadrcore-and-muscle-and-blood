import { SKILL_TAGS } from '../utils/SkillTagManager.js';
import { EFFECT_TYPES } from '../utils/EffectTypes.js';

/**
 * 각 클래스별 특화 태그와 이에 따른 보너스 효과 정의
 * 해당 태그의 스킬을 사용하면 지정된 효과가 1턴 동안 부여됩니다.
 * 중첩 가능하도록 duration은 1로 설정했습니다.
 */
export const classSpecializations = {
    warrior: [
        {
            tag: SKILL_TAGS.WILL,
            description: "'의지' 태그 스킬 사용 시, 1턴간 방어력 5% 증가 (중첩 가능)",
            effect: {
                id: 'warriorWillBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'physicalDefense', type: 'percentage', value: 0.05 }
            }
        }
    ],
    gunner: [
        {
            tag: SKILL_TAGS.KINETIC,
            description: "'관성' 태그 스킬 사용 시, 1턴간 치명타 확률 4% 증가 (중첩 가능)",
            effect: {
                id: 'gunnerKineticBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'criticalChance', type: 'percentage', value: 0.04 }
            }
        }
    ],
    mechanic: [
        {
            tag: SKILL_TAGS.SUMMON,
            description: "'소환' 태그 스킬 사용 시, 자신이 소환한 모든 소환물의 모든 스탯을 5%씩 영구적으로 향상시킵니다.",
            effect: {
                id: 'mechanicSummonBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 99,
                isGlobal: true,
                modifiers: { stat: 'all_stats', type: 'percentage', value: 0.05 }
            }
        }
    ],
    medic: [
        {
            tag: SKILL_TAGS.HEAL,
            description: "'치유' 태그 스킬 사용 시, 1턴간 지혜 5% 증가 (중첩 가능)",
            effect: {
                id: 'medicHealBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'wisdom', type: 'percentage', value: 0.05 }
            }
        }
    ],
    nanomancer: [
        {
            tag: SKILL_TAGS.PRODUCTION,
            description: "'생산' 태그 스킬 사용 시, 1턴간 마법 방어력 8% 증가 (중첩 가능)",
            effect: {
                id: 'nanomancerProductionBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'magicDefense', type: 'percentage', value: 0.08 }
            }
        }
    ],
    flyingmen: [
        {
            tag: SKILL_TAGS.CHARGE,
            description: "'돌진' 태그 스킬 사용 시, 1턴간 회피율 3% 증가 (중첩 가능)",
            effect: {
                id: 'flyingmenChargeBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'physicalEvadeChance', type: 'percentage', value: 0.03 }
            }
        }
    ],
    esper: [
        {
            tag: SKILL_TAGS.MIND,
            description: "'정신' 태그 스킬 사용 시, 1턴간 상태이상 적용 확률 5% 증가 (중첩 가능)",
            effect: {
                id: 'esperMindBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'statusEffectApplication', type: 'percentage', value: 0.05 }
            }
        }
    ],
    // ✨ [신규] 커맨더 특화 태그 추가
    commander: [
        {
            tag: SKILL_TAGS.STRATEGY,
            description: "'전략' 태그 스킬 사용 시, 주변 2칸 내 모든 아군의 용맹(Valor)이 1턴간 2 증가합니다.",
            effect: {
                id: 'commanderStrategyBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                isGlobal: false,
                radius: 2,
                modifiers: { stat: 'valor', type: 'flat', value: 2 }
            }
        }
    ],
    clown: [
        {
            tag: SKILL_TAGS.BIND,
            description: "'속박' 태그 스킬 사용 시, 1턴간 치명타율 2% 및 상태이상 적용 확률 4%가 증가합니다 (중첩 가능).",
            effect: {
                id: 'clownBindBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: [
                    { stat: 'criticalChance', type: 'percentage', value: 0.02 },
                    { stat: 'statusEffectApplication', type: 'percentage', value: 0.04 }
                ]
            }
        }
    ],
    android: [
        {
            tag: SKILL_TAGS.SACRIFICE,
            description: "'희생' 태그 스킬 사용 시, 자신은 최대 체력의 5% 피해를 입고 주변 2칸 내 모든 아군에게 1턴간 '받는 데미지 10% 감소' 효과를 부여합니다.",
            effect: {
                id: 'androidSacrificeBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                isGlobal: false, // 광역이지만 전체는 아님
                radius: 2,       // 주변 2칸
                selfDamage: { type: 'percentage', value: 0.05 }, // 자신에게 주는 피해
                modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.10 }
            }
        }
    ],
    // --- ▼ [신규] 역병 의사 특화 태그 추가 ▼ ---
    plagueDoctor: [
        {
            tag: SKILL_TAGS.POISON,
            description: "'독' 태그 스킬 사용 시, 1턴간 상태이상 적용 확률 5% 증가 (중첩 가능)",
            effect: {
                id: 'poisonAttributeBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'statusEffectApplication', type: 'percentage', value: 0.05 }
            }
        }
    ],
    // --- ▲ [신규] 역병 의사 특화 태그 추가 ▲ ---

    // --- ▼ [신규] 팔라딘 특화 태그 추가 ▼ ---
    paladin: [
        {
            tag: SKILL_TAGS.AURA,
            description: "'오라' 태그 스킬 사용 시, 2턴간 자신의 모든 방어력이 10% 증가합니다.",
            effect: {
                id: 'paladinAuraBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: [
                    { stat: 'physicalDefense', type: 'percentage', value: 0.10 },
                    { stat: 'magicDefense', type: 'percentage', value: 0.10 }
                ]
            }
        }
    ],
    // --- ▲ [신규] 팔라딘 특화 태그 추가 ▲ ---

    // --- ▼ [신규] 센티넬 특화 태그 추가 ▼ ---
    sentinel: [
        {
            tag: SKILL_TAGS.GUARDIAN,
            description: "'가디언' 태그 스킬 사용 시, 1턴간 자신의 모든 방어 등급(+1)이 오릅니다.",
            effect: {
                id: 'sentinelGuardianBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: [
                    { stat: 'meleeDefense', type: 'flat', value: 1 },
                    { stat: 'rangedDefense', type: 'flat', value: 1 },
                    { stat: 'magicDefense', type: 'flat', value: 1 }
                ]
            }
        }
    ],
    // --- ▲ [신규] 센티넬 특화 태그 추가 ▲ ---

    // --- ▼ [신규] 해커 특화 태그 추가 ▼ ---
    hacker: [
        {
            tag: SKILL_TAGS.PROHIBITION,
            description: "'금지' 태그 스킬 사용 시, 1턴간 자신의 상태이상 적용 확률이 8% 증가합니다. (중첩 가능)",
            effect: {
                id: 'hackerProhibitionBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'statusEffectApplication', type: 'percentage', value: 0.08 }
            }
        }
    ],
    // --- ▲ [신규] 해커 특화 태그 추가 ▲ ---

    // --- ▼ [신규] 고스트 특화 태그 추가 ▼ ---
    ghost: [
        {
            tag: SKILL_TAGS.EXECUTE,
            description: "'처형' 태그 스킬로 적을 처치했을 경우, 자신의 토큰을 1개 회복합니다.",
            // 이 효과는 SkillEffectProcessor에서 직접 처리됩니다.
        }
    ],
    // --- ▲ [신규] 고스트 특화 태그 추가 ▲ ---
    // --- ▼ [신규] 다크나이트 특화 태그 추가 ▼ ---
    darkKnight: [
        {
            tag: SKILL_TAGS.DARK,
            description: "'어둠' 태그 스킬 사용 시, 2턴간 자신의 생명력 흡수율이 5% 증가합니다.",
            effect: {
                id: 'darkKnightDarkBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: { stat: 'lifeSteal', type: 'percentage', value: 0.05 }
            }
        }
    ]
    // --- ▲ [신규] 다크나이트 특화 태그 추가 ▲ ---
};
