import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 버프 스킬 데이터 정의
export const buffSkills = {
    // --- ▼ [신규] 집결의 뿔피리 스킬 추가 ▼ ---
    rallyingHorn: {
        yinYangValue: +4,
        NORMAL: {
            id: 'rallyingHorn',
            name: '집결의 뿔피리',
            type: 'BUFF',
            requiredClass: ['commander', 'paladin'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.AURA, SKILL_TAGS.WILL, SKILL_TAGS.STRATEGY],
            cost: 2,
            targetType: 'self',
            description: '전장에 있는 모든 아군에게 3턴간 [용맹] 스탯을 +2 증가시키는 버프를 부여합니다.',
            illustrationPath: null,
            cooldown: 5,
            range: 0,
            effect: {
                id: 'rallyingHornBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                isGlobal: true,
                modifiers: {
                    stat: 'valor',
                    type: 'flat',
                    value: 2
                }
            }
        }
    },
    // --- ▲ [신규] 집결의 뿔피리 스킬 추가 ▲ ---

    // --- ▼ [신규] 용맹의 증거 스킬 추가 ▼ ---
    proofOfValor: {
        yinYangValue: +4,
        NORMAL: {
            id: 'proofOfValor',
            name: '용맹의 증거',
            type: 'BUFF',
            requiredClass: ['commander', 'paladin'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.AURA, SKILL_TAGS.WILL, SKILL_TAGS.LIGHT, SKILL_TAGS.PRODUCTION],
            cost: 3,
            targetType: 'self',
            description: '3턴간 자신 주위 3타일 내 아군들의 용맹 보호막을 매 턴 최대치의 5%만큼 회복시키는 오라를 두릅니다. [빛] 자원을 2개 생성합니다. (쿨타임 5턴)',
            illustrationPath: null,
            cooldown: 5,
            range: 0, // 자신에게 거는 오라이므로 0
            generatesResource: { type: 'LIGHT', amount: 2 },
            effect: {
                id: 'proofOfValorAura',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                isAura: true,
                radius: 3,
                // 실제 회복 로직은 StatusEffectManager에서 처리됩니다.
            }
        }
    },
    // --- ▲ [신규] 용맹의 증거 스킬 추가 ▲ ---

    // --- ▼ [신규] 아퀼리퍼 전용 오라 스킬 2종 추가 ▼ ---
    sanctuary: {
        yinYangValue: +4, // 아군을 보호하는 강력한 양(Yang)의 기술
        NORMAL: {
            id: 'sanctuary',
            name: '성역',
            type: 'BUFF',
            requiredClass: ['paladin', 'medic'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.AURA, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.HOLY],
            cost: 3,
            targetType: 'self',
            description: '자신을 중심으로 성역을 펼칩니다. 3턴간 자신과 주위 2칸 내 모든 아군의 물리 및 마법 방어력을 15% 증가시킵니다.',
            illustrationPath: null,
            cooldown: 4,
            range: 0,
            effect: {
                id: 'sanctuaryAura',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                isAura: true,
                radius: 2,
                modifiers: [
                    { stat: 'physicalDefense', type: 'percentage', value: 0.15 },
                    { stat: 'magicDefense', type: 'percentage', value: 0.15 }
                ]
            }
        }
    },

    auraOfRetribution: {
        yinYangValue: +3,
        NORMAL: {
            id: 'auraOfRetribution',
            name: '응징의 오라',
            type: 'BUFF',
            requiredClass: ['paladin', 'commander'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.AURA, SKILL_TAGS.HOLY, SKILL_TAGS.LIGHT],
            cost: 2,
            targetType: 'self',
            description: '주위 2칸 내 모든 아군에게 응징의 오라를 부여합니다. 3턴간 오라 안의 아군이 공격 시, 대상에게 시전자 지혜의 30%만큼 추가 [신성] 피해를 입힙니다.',
            illustrationPath: null,
            cooldown: 4,
            range: 0,
            effect: {
                id: 'retributionAuraBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                isAura: true,
                radius: 2
                // 실제 추가 데미지 로직은 CombatCalculationEngine에서 이 버프 유무를 체크하여 처리해야 합니다.
            }
        }
    },
    // --- ▲ [신규] 아퀼리퍼 전용 오라 스킬 2종 추가 ▲ ---

    stoneSkin: {
        yinYangValue: +2,
        // NORMAL 등급: 기본 효과
        NORMAL: {
            id: 'stoneSkin',
            name: '스톤 스킨',
            type: 'BUFF',
            requiredClass: ['warrior', 'sentinel'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH, SKILL_TAGS.PRODUCTION],
            cost: 2,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}% 버프를 겁니다. 공유 자원 [대지]를 1개 생산합니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            cooldown: 3,
            generatesResource: { type: 'EARTH', amount: 1 },
            effect: {
                id: 'stoneSkin',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                modifiers: {
                    stat: 'damageReduction',
                    type: 'percentage',
                    value: 0.15
                }
            }
        },
        // RARE 등급: 토큰 소모량 감소
        RARE: {
            id: 'stoneSkin',
            name: '스톤 스킨 [R]',
            type: 'BUFF',
            requiredClass: ['warrior', 'sentinel'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}% 버프를 겁니다. 공유 자원 [대지]를 1개 생산합니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            cooldown: 3,
            generatesResource: { type: 'EARTH', amount: 1 },
            effect: {
                id: 'stoneSkin',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                modifiers: {
                    stat: 'damageReduction',
                    type: 'percentage',
                    value: 0.15
                }
            }
        },
        // EPIC 등급: 방어력 상승 효과 추가
        EPIC: {
            id: 'stoneSkin',
            name: '스톤 스킨 [E]',
            type: 'BUFF',
            requiredClass: ['warrior', 'sentinel'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}%, 방어력 상승 10% 버프를 겁니다. 공유 자원 [대지]를 1개 생산합니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            cooldown: 3,
            generatesResource: { type: 'EARTH', amount: 1 },
            effect: {
                id: 'stoneSkin',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                // 여러 효과를 적용할 수 있도록 modifiers를 배열로 변경
                modifiers: [
                    { stat: 'damageReduction', type: 'percentage', value: 0.15 },
                    { stat: 'physicalDefense', type: 'percentage', value: 0.10 }
                ]
            }
        },
        // LEGENDARY 등급: 방어력 상승 효과 강화
        LEGENDARY: {
            id: 'stoneSkin',
            name: '스톤 스킨 [L]',
            type: 'BUFF',
            requiredClass: ['warrior', 'sentinel'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}%, 방어력 상승 15% 버프를 겁니다. 공유 자원 [대지]를 1개 생산합니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            cooldown: 3,
            generatesResource: { type: 'EARTH', amount: 1 },
            effect: {
                id: 'stoneSkin',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                modifiers: [
                    { stat: 'damageReduction', type: 'percentage', value: 0.15 },
                    { stat: 'physicalDefense', type: 'percentage', value: 0.15 }
                ]
            }
        }
    },
    grindstone: {
        yinYangValue: +1,
        NORMAL: {
            id: 'grindstone',
            name: '숯돌 갈기',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.IRON, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '날카롭게 벼려낸 칼날이 번뜩입니다. 1턴간 자신의 공격력을 {{attackBonus}}% 상승시키고 공유 자원 [철]을 1개 생산합니다.',
            illustrationPath: 'assets/images/skills/grindstone.png',
            cooldown: 2,
            generatesResource: { type: 'IRON', amount: 1 },
            effect: {
                id: 'grindstoneBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        },
        RARE: {
            id: 'grindstone',
            name: '숯돌 갈기 [R]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.IRON, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '숙련된 솜씨로 무기를 손질합니다. 1턴간 자신의 공격력을 {{attackBonus}}% 상승시키고 [철]을 1개 생산합니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/grindstone.png',
            cooldown: 1,
            generatesResource: { type: 'IRON', amount: 1 },
            effect: {
                id: 'grindstoneBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        },
        EPIC: {
            id: 'grindstone',
            name: '숯돌 갈기 [E]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.IRON, SKILL_TAGS.PRODUCTION],
            cost: 0,
            targetType: 'self',
            description: '순식간에 무기를 최상의 상태로 만듭니다. 1턴간 자신의 공격력을 {{attackBonus}}% 상승시키고 [철]을 1개 생산합니다.',
            illustrationPath: 'assets/images/skills/grindstone.png',
            cooldown: 1,
            generatesResource: { type: 'IRON', amount: 1 },
            effect: {
                id: 'grindstoneBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        },
        LEGENDARY: {
            id: 'grindstone',
            name: '숯돌 갈기 [L]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.IRON, SKILL_TAGS.PRODUCTION],
            cost: 0,
            targetType: 'self',
            description: '장인의 경지에 이른 연마술입니다. 1턴간 자신의 공격력을 {{attackBonus}}% 상승시키고 [철]을 2개 생산합니다.',
            illustrationPath: 'assets/images/skills/grindstone.png',
            cooldown: 1,
            generatesResource: { type: 'IRON', amount: 2 },
            effect: {
                id: 'grindstoneBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        }
    },

    // --- ▼ [신규] 전투의 함성 스킬 추가 ▼ ---
    battleCry: {
        yinYangValue: +2,
        NORMAL: {
            id: 'battleCry',
            name: '전투의 함성',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 2,
            targetType: 'self',
            description: '2턴간 자신의 [공격력]을 {{attackBonus}}% 상승시키고, [근접 공격 등급]을 +1 상승시킵니다.',
            illustrationPath: 'assets/images/skills/battle_cry.png',
            cooldown: 3,
            effect: {
                id: 'battleCryBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                    { stat: 'meleeAttack', type: 'flat', value: 1 }
                ]
            }
        },
        RARE: {
            id: 'battleCry',
            name: '전투의 함성 [R]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '2턴간 자신의 [공격력]을 {{attackBonus}}% 상승시키고, [근접 공격 등급]을 +1 상승시킵니다.',
            illustrationPath: 'assets/images/skills/battle_cry.png',
            cooldown: 3,
            effect: {
                id: 'battleCryBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                    { stat: 'meleeAttack', type: 'flat', value: 1 }
                ]
            }
        },
        EPIC: {
            id: 'battleCry',
            name: '전투의 함성 [E]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '3턴간 자신의 [공격력]을 {{attackBonus}}% 상승시키고, [근접 공격 등급]을 +1 상승시킵니다.',
            illustrationPath: 'assets/images/skills/battle_cry.png',
            cooldown: 3,
            effect: {
                id: 'battleCryBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                    { stat: 'meleeAttack', type: 'flat', value: 1 }
                ]
            }
        },
        LEGENDARY: {
            id: 'battleCry',
            name: '전투의 함성 [L]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '3턴간 자신의 [공격력]을 {{attackBonus}}% 상승시키고, [근접 공격 등급]을 +1 상승시킵니다.',
            illustrationPath: 'assets/images/skills/battle_cry.png',
            cooldown: 3,
            effect: {
                id: 'battleCryBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                    { stat: 'meleeAttack', type: 'flat', value: 1 }
                ]
            }
        }
    },
    // --- ▲ [신규] 전투의 함성 스킬 추가 ▲ ---

    // --- ▼ [신규] 사냥꾼의 감각 스킬 추가 ▼ ---
    huntSense: {
        yinYangValue: +2,
        NORMAL: {
            id: 'huntSense',
            name: '사냥꾼의 감각',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 2,
            targetType: 'self',
            description: '3턴간 자신의 [원거리 공격 등급]을 +1, [치명타 확률]을 {{critChance}}% 상승시킵니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/hunt-sense.png',
            cooldown: 4,
            effect: {
                id: 'huntSenseBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'rangedAttack', type: 'flat', value: 1 },
                    { stat: 'criticalChance', type: 'percentage', value: 0.15 }
                ]
            }
        },
        RARE: {
            id: 'huntSense',
            name: '사냥꾼의 감각 [R]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '3턴간 자신의 [원거리 공격 등급]을 +1, [치명타 확률]을 {{critChance}}% 상승시킵니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/hunt-sense.png',
            cooldown: 4,
            effect: {
                id: 'huntSenseBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'rangedAttack', type: 'flat', value: 1 },
                    { stat: 'criticalChance', type: 'percentage', value: 0.15 }
                ]
            }
        },
        EPIC: {
            id: 'huntSense',
            name: '사냥꾼의 감각 [E]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '3턴간 자신의 [원거리 공격 등급]을 +1, [치명타 확률]을 {{critChance}}% 상승시킵니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/hunt-sense.png',
            cooldown: 3,
            effect: {
                id: 'huntSenseBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'rangedAttack', type: 'flat', value: 1 },
                    { stat: 'criticalChance', type: 'percentage', value: 0.15 }
                ]
            }
        },
        LEGENDARY: {
            id: 'huntSense',
            name: '사냥꾼의 감각 [L]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신의 [원거리 공격 등급]을 +1, [치명타 확률]을 {{critChance}}% 상승시킵니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/hunt-sense.png',
            cooldown: 3,
            effect: {
                id: 'huntSenseBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                modifiers: [
                    { stat: 'rangedAttack', type: 'flat', value: 1 },
                    { stat: 'criticalChance', type: 'percentage', value: 0.15 }
                ]
            }
        }
    },
    // --- ▲ [신규] 사냥꾼의 감각 스킬 추가 ▲ ---

    // --- ▼ [신규] 나노봇 스킬 추가 ▼ ---
    nanobot: {
        yinYangValue: +3,
        NORMAL: {
            id: 'nanobot',
            name: '나노봇',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.ON_HIT, SKILL_TAGS.MAGIC, SKILL_TAGS.PRODUCTION],
            cost: 3,
            targetType: 'self',
            description: '5턴간 [나노봇 착용] 상태가 됩니다. 이 상태에서 [액티브] 스킬로 적에게 피해를 주면, 공격력의 30%로 나노봇이 함께 공격합니다. (쿨타임 6턴)',
            illustrationPath: null,
            cooldown: 6,
            range: 0,
            effect: {
                id: 'nanobotBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 5,
            }
        }
    },
    // --- ▲ [신규] 나노봇 스킬 추가 ▲ ---

    // --- ▼ [신규] 버서커 & 스펠브레이커 버프 스킬 추가 ▼ ---
    bloodRage: {
        yinYangValue: -3,
        NORMAL: {
            id: 'bloodRage',
            name: '피의 격노',
            type: 'BUFF',
            requiredClass: ['warrior'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.PHYSICAL],
            cost: 2,
            targetType: 'self',
            description: '2턴간 물리 공격력이 20% 증가하지만 물리 방어력이 10% 감소합니다.',
            illustrationPath: null,
            cooldown: 3,
            effect: {
                id: 'bloodRageBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.2 },
                    { stat: 'physicalDefense', type: 'percentage', value: -0.1 }
                ]
            }
        }
    },

    nullField: {
        yinYangValue: +2,
        NORMAL: {
            id: 'nullField',
            name: '마력 차단장',
            type: 'BUFF',
            requiredClass: ['warrior'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.AURA],
            cost: 2,
            targetType: 'self',
            description: '2턴간 자신과 주변 아군의 마법 방어력이 25% 증가합니다.',
            illustrationPath: null,
            cooldown: 4,
            range: 0,
            aoe: { shape: 'SQUARE', radius: 2 },
            effect: {
                id: 'nullFieldBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: { stat: 'magicDefense', type: 'percentage', value: 0.25 }
            }
        }
    },
    // --- ▲ [신규] 버서커 & 스펠브레이커 버프 스킬 추가 ▲ ---
};
