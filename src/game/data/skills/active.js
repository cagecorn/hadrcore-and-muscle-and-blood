import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';
import { SHARED_RESOURCE_TYPES } from '../../utils/SharedResourceEngine.js';

// 액티브 스킬 데이터 정의
export const activeSkills = {
    // --- ▼ [신규] 프로스트위버 전용 스킬 3종 추가 ▼ ---
    iceBolt: {
        yinYangValue: -1, // 가벼운 견제 기술
        NORMAL: {
            id: 'iceBolt',
            name: '아이스 볼트',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.WATER],
            cost: 1,
            targetType: 'enemy',
            description:
                '날카로운 얼음 조각을 날려 적에게 80%의 마법 피해를 주고, 20% 확률로 1턴간 [둔화](이동력 -1)시킵니다.',
            illustrationPath: null,
            cooldown: 0,
            range: 3,
            damageMultiplier: { min: 0.75, max: 0.85 },
            effect: {
                id: 'slow',
                type: EFFECT_TYPES.DEBUFF,
                duration: 1,
                chance: 0.2,
                modifiers: { stat: 'movement', type: 'flat', value: -1 },
            },
        },
    },

    frostNova: {
        yinYangValue: -4, // 다수의 적을 무력화시키는 강력한 기술
        NORMAL: {
            id: 'frostNova',
            name: '프로스트 노바',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [
                SKILL_TAGS.ACTIVE,
                SKILL_TAGS.RANGED,
                SKILL_TAGS.MAGIC,
                SKILL_TAGS.WATER,
                SKILL_TAGS.AREA_DENIAL,
                SKILL_TAGS.BIND,
            ],
            cost: 3,
            targetType: 'enemy', // 타겟 지점을 중심으로 발동
            description:
                '지정한 위치를 중심으로 차가운 폭발을 일으켜, 3x3 범위 내 모든 적에게 50%의 마법 피해를 주고 1턴간 [속박](이동 불가) 상태로 만듭니다.',
            illustrationPath: null,
            cooldown: 4,
            range: 3,
            aoe: { shape: 'SQUARE', radius: 1 }, // 3x3 정사각형 범위
            damageMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'bind',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 1,
            },
        },
    },

    blizzard: {
        yinYangValue: -5, // 광범위한 지역을 장악하는 궁극기
        NORMAL: {
            id: 'blizzard',
            name: '블리자드',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [
                SKILL_TAGS.ACTIVE,
                SKILL_TAGS.RANGED,
                SKILL_TAGS.MAGIC,
                SKILL_TAGS.WATER,
                SKILL_TAGS.AREA_DENIAL,
                SKILL_TAGS.DELAY,
            ],
            cost: 0, // 자원만 소모
            targetType: 'enemy',
            description:
                '지정한 위치에 2턴 동안 눈보라를 소환합니다. 눈보라 범위(3x3)에 들어온 모든 적은 이동력이 2 감소합니다. (소모 자원: 물 3)',
            illustrationPath: null,
            cooldown: 5,
            range: 4,
            resourceCost: { type: 'WATER', amount: 3 },
            aoe: { shape: 'SQUARE', radius: 1 },
            effect: {
                id: 'blizzardSlow', // 고유 효과 ID
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
                modifiers: { stat: 'movement', type: 'flat', value: -2 },
            },
        },
    },
    // --- ▲ [신규] 프로스트위버 전용 스킬 3종 추가 ▲ ---

    // --- ▼ [신규] 드레드노트 전용 스킬 2종 추가 ▼ ---
    taunt: {
        yinYangValue: -3,
        NORMAL: {
            id: 'taunt',
            name: '도발',
            type: 'ACTIVE',
            requiredClass: ['sentinel', 'warrior'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.DEBUFF, SKILL_TAGS.AURA, SKILL_TAGS.GUARDIAN],
            cost: 2,
            targetType: 'self',
            description:
                '주위 3타일 내의 모든 적을 2턴간 [도발]하여 자신을 공격하게 만듭니다. 효과가 지속되는 동안 자신의 물리 방어력이 20% 증가합니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 0,
            aoe: { shape: 'SQUARE', radius: 3 },
            effect: {
                id: 'tauntDebuff',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
            },
            selfEffect: {
                id: 'tauntBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: { stat: 'physicalDefense', type: 'percentage', value: 0.2 },
            },
        },
    },

    shieldBash: {
        yinYangValue: -2,
        NORMAL: {
            id: 'shieldBash',
            name: '방패 치기',
            type: 'ACTIVE',
            requiredClass: ['sentinel', 'warrior', 'paladin'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.GUARDIAN],
            cost: 2,
            targetType: 'enemy',
            description:
                '자신의 최대 체력의 15%에 해당하는 물리 피해를 입히고, 30% 확률로 1턴간 [기절]시킵니다.',
            illustrationPath: null,
            cooldown: 1,
            range: 1,
            damageBasedOn: { stat: 'hp', percentage: 0.15 },
            effect: {
                id: 'stun',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 1,
                chance: 0.3,
            },
        },
    },
    // --- ▲ [신규] 드레드노트 전용 스킬 2종 추가 ▲ ---

    // --- ▼ [신규] 회전 베기 스킬 추가 ▼ ---
    spinningSlash: {
        yinYangValue: -3,
        NORMAL: {
            id: 'spinningSlash',
            name: '회전 베기',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.PRODUCTION, SKILL_TAGS.AURA, SKILL_TAGS.WIND],
            cost: 3,
            targetType: 'enemy', // 자신 주부의 적을 대상으로 함
            description: '자신의 주위 4타일(상하좌우)에 있는 모든 적군을 70%의 물리 데미지로 공격하고, [바람] 자원을 1개 생산합니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 0, // 자신을 중심으로 하므로 사거리는 0
            aoe: { shape: 'CROSS', radius: 1 }, // 십자 형태 범위
            damageMultiplier: { min: 0.65, max: 0.75 }, // 70% 데미지
            generatesResource: { type: 'WIND', amount: 1 }
        }
    },
    // --- ▲ [신규] 회전 베기 스킬 추가 ▲ ---

    // --- ▼ [신규] 대지 가르기 스킬 추가 ▼ ---
    earthSplitter: {
        yinYangValue: -3,
        NORMAL: {
            id: 'earthSplitter',
            name: '대지 가르기',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.PRODUCTION, SKILL_TAGS.EARTH],
            cost: 3,
            targetType: 'enemy',
            description: '자신으로부터 3타일 일지선상의 모든 적군에게 70%의 물리 데미지를 주고, [대지] 자원을 1개 생산합니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 3, // 스킬 사거리
            aoe: { shape: 'LINE', length: 3 }, // 직선 형태 범위
            damageMultiplier: { min: 0.65, max: 0.75 }, // 70% 데미지
            generatesResource: { type: 'EARTH', amount: 1 }
        }
    },
    // --- ▲ [신규] 대지 가르기 스킬 추가 ▲ ---

    // 기본 공격 스킬
    attack: {
        yinYangValue: -1,
        NORMAL: {
            id: 'attack',
            name: '공격',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE],
            cost: 1, // SKILL-SYSTEM.md 규칙에 따라 토큰 1개 소모
            description: '적을 {{damage}}% 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
        },
        RARE: {
            id: 'attack',
            name: '공격 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE],
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
        },
        EPIC: {
            id: 'attack',
            name: '공격 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE],
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격하고, 50% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
            generatesToken: { chance: 0.5, amount: 1 }
        },
        LEGENDARY: {
            id: 'attack',
            name: '공격 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE],
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격하고, 100% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
            generatesToken: { chance: 1.0, amount: 1 }
        }
    },
    charge: {
        yinYangValue: -2,
        NORMAL: {
            id: 'charge',
            name: '차지',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.CHARGE],
            cost: 2,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 3,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        RARE: {
            id: 'charge',
            name: '차지 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.CHARGE],
            cost: 2,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        EPIC: {
            id: 'charge',
            name: '차지 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.CHARGE],
            cost: 1,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        LEGENDARY: {
            id: 'charge',
            name: '차지 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.CHARGE],
            cost: 1,
            description: '적을 {{damage}}%의 데미지로 공격하고, 2턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 2,
            },
        }
    },
    knockbackShot: {
        yinYangValue: -2,
        NORMAL: {
            id: 'knockbackShot',
            name: '넉백샷',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 2,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 2,
            range: 3,
            push: 1
        },
        RARE: {
            id: 'knockbackShot',
            name: '넉백샷 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 2,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 1,
            range: 3,
            push: 1
        },
        EPIC: {
            id: 'knockbackShot',
            name: '넉백샷 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 1,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 1,
            range: 3,
            push: 1
        },
        LEGENDARY: {
            id: 'knockbackShot',
            name: '넉백샷 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 1,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 2칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 1,
            range: 3,
            push: 2
        }
    },

    // --- ▼ [신규] 도탄 사격 스킬 추가 ▼ ---
    ricochetShot: {
        yinYangValue: +3,
        NORMAL: {
            id: 'ricochetShot',
            name: '도탄 사격',
            type: 'ACTIVE',
            requiredClass: ['gunner'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 2,
            targetType: 'enemy',
            description: '주 대상에게 80%의 피해를 주고, 주변의 다른 적 최대 2명에게 튕겨 40%의 피해를 입힙니다.',
            illustrationPath: null,
            cooldown: 2,
            range: 3,
            damageMultiplier: { min: 0.75, max: 0.85 },
            // 도탄 효과는 SkillEffectProcessor에서 별도 로직 구현 필요
        }
    },
    // --- ▲ [신규] 도탄 사격 스킬 추가 ▲ ---

    // --- ▼ [신규] 나노빔 스킬 추가 ▼ ---
    nanobeam: {
        yinYangValue: -1,
        NORMAL: {
            id: 'nanobeam',
            name: '나노빔',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC],
            cost: 1,
            description: '나노 입자 빔을 발사하여 적을 {{damage}}% 마법 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/nanobeam.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
        },
        RARE: {
            id: 'nanobeam',
            name: '나노빔 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC],
            cost: 0,
            description: '나노 입자 빔을 발사하여 적을 {{damage}}% 마법 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/nanobeam.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
        },
        EPIC: {
            id: 'nanobeam',
            name: '나노빔 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC],
            cost: 0,
            description: '나노 입자 빔을 발사하여 적을 {{damage}}% 마법 공격력으로 공격하고, 50% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/nanobeam.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
            generatesToken: { chance: 0.5, amount: 1 }
        },
        LEGENDARY: {
            id: 'nanobeam',
            name: '나노빔 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC],
            cost: 0,
            description: '나노 입자 빔을 발사하여 적을 {{damage}}% 마법 공격력으로 공격하고, 100% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/nanobeam.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
            generatesToken: { chance: 1.0, amount: 1 }
        }
    },
    // --- ▲ [신규] 나노빔 스킬 추가 ▲ ---

    // --- ▼ [신규] 도끼 참격 스킬 추가 ▼ ---
    axeStrike: {
        yinYangValue: -2,
        NORMAL: {
            id: 'axeStrike',
            name: '도끼 참격',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 1,
            description: '적을 {{damage}}% 위력으로 공격하고, 최대 용맹 배리어의 5%를 회복합니다.',
            illustrationPath: 'assets/images/skills/axe-strike.png',
            damageMultiplier: { min: 0.45, max: 0.55 },
            cooldown: 0,
            restoresBarrierPercent: 0.05
        },
        RARE: {
            id: 'axeStrike',
            name: '도끼 참격 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 0,
            description: '적을 {{damage}}% 위력으로 공격하고, 최대 용맹 배리어의 5%를 회복합니다.',
            illustrationPath: 'assets/images/skills/axe-strike.png',
            damageMultiplier: { min: 0.45, max: 0.55 },
            cooldown: 0,
            restoresBarrierPercent: 0.05
        },
        EPIC: {
            id: 'axeStrike',
            name: '도끼 참격 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 0,
            description: '적을 {{damage}}% 위력으로 공격하고, 최대 용맹 배리어의 7%를 회복합니다.',
            illustrationPath: 'assets/images/skills/axe-strike.png',
            damageMultiplier: { min: 0.45, max: 0.55 },
            cooldown: 0,
            restoresBarrierPercent: 0.07
        },
        LEGENDARY: {
            id: 'axeStrike',
            name: '도끼 참격 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 0,
            description: '적을 {{damage}}% 위력으로 공격하고, 최대 용맹 배리어의 10%를 회복합니다.',
            illustrationPath: 'assets/images/skills/axe-strike.png',
            damageMultiplier: { min: 0.45, max: 0.55 },
            cooldown: 0,
            restoresBarrierPercent: 0.10
        }
    },
    // --- ▲ [신규] 도끼 참격 스킬 추가 ▲ ---
    // --- ▼ [신규] 제압 사격 스킬 추가 ▼ ---
    suppressShot: {
        yinYangValue: -3,
        NORMAL: {
            id: 'suppressShot',
            name: '제압 사격',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DELAY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '적을 80% 데미지로 제압 사격하여, 턴 순서를 가장 마지막으로 밀어냅니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/suppress-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 0.7, max: 0.9 },
            resourceCost: { type: 'IRON', amount: 2 },
            turnOrderEffect: 'pushToBack'
        },
        RARE: {
            id: 'suppressShot',
            name: '제압 사격 [R]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DELAY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '적을 100% 데미지로 제압 사격하여, 턴 순서를 가장 마지막으로 밀어냅니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/suppress-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 0.9, max: 1.1 },
            resourceCost: { type: 'IRON', amount: 2 },
            turnOrderEffect: 'pushToBack'
        },
        EPIC: {
            id: 'suppressShot',
            name: '제압 사격 [E]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DELAY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '적을 120% 데미지로 제압 사격하여, 턴 순서를 가장 마지막으로 밀어냅니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/suppress-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 2 },
            turnOrderEffect: 'pushToBack'
        },
        LEGENDARY: {
            id: 'suppressShot',
            name: '제압 사격 [L]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DELAY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '적을 120% 데미지로 제압 사격하여, 턴 순서를 가장 마지막으로 밀어내고 1턴간 토큰 하나를 잃게 합니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/suppress-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 2 },
            turnOrderEffect: 'pushToBack',
            effect: {
                id: 'tokenLoss',
                duration: 1,
                applyOnce: true,
                tokenLoss: 1
            }
        }
    },
    // --- ▲ [신규] 제압 사격 스킬 추가 ▲ ---
    throwingAxe: {
        yinYangValue: -2,
        NORMAL: {
            id: 'throwingAxe',
            name: '도끼 던지기',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 도끼를 던져 120%의 피해를 입힙니다. (소모 자원: 철 1)',
            illustrationPath: 'assets/images/skills/throwing-axe.png',
            cooldown: 1,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 1 }
        },
        RARE: {
            id: 'throwingAxe',
            name: '도끼 던지기 [R]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 도끼를 던져 120%의 피해를 입힙니다. (쿨타임 없음, 소모 자원: 철 1)',
            illustrationPath: 'assets/images/skills/throwing-axe.png',
            cooldown: 0,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 1 }
        },
        EPIC: {
            id: 'throwingAxe',
            name: '도끼 던지기 [E]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 도끼를 던져 120%의 피해를 입히고, 20% 확률로 기절시킵니다. (소모 자원: 철 1)',
            illustrationPath: 'assets/images/skills/throwing-axe.png',
            cooldown: 0,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 1 },
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
                chance: 0.2
            }
        },
        LEGENDARY: {
            id: 'throwingAxe',
            name: '도끼 던지기 [L]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 도끼를 던져 120%의 피해를 입히고, 40% 확률로 기절시킵니다. (소모 자원: 철 1)',
            illustrationPath: 'assets/images/skills/throwing-axe.png',
            cooldown: 0,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 1 },
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
                chance: 0.4
            }
        }
    },
    // --- ▼ [신규] 크리티컬 샷 스킬 추가 ▼ ---
    criticalShot: {
        yinYangValue: -3,
        NORMAL: {
            id: 'criticalShot',
            name: '크리티컬 샷',
            type: 'ACTIVE',
            requiredClass: 'gunner',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 3,
            targetType: 'enemy',
            description: '적에게 {{damage}}% 데미지를 줍니다. 이 공격은 확정적으로 [치명타]가 됩니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/critical-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 0.9, max: 1.1 },
            fixedDamage: 'CRITICAL',
        },
        RARE: {
            id: 'criticalShot',
            name: '크리티컬 샷 [R]',
            type: 'ACTIVE',
            requiredClass: 'gunner',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 {{damage}}% 데미지를 줍니다. 이 공격은 확정적으로 [치명타]가 됩니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/critical-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 0.9, max: 1.1 },
            fixedDamage: 'CRITICAL',
        },
        EPIC: {
            id: 'criticalShot',
            name: '크리티컬 샷 [E]',
            type: 'ACTIVE',
            requiredClass: 'gunner',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 {{damage}}% 데미지를 줍니다. 이 공격은 확정적으로 [치명타]가 됩니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/critical-shot.png',
            cooldown: 2,
            range: 4,
            damageMultiplier: { min: 0.9, max: 1.1 },
            fixedDamage: 'CRITICAL',
        },
        LEGENDARY: {
            id: 'criticalShot',
            name: '크리티컬 샷 [L]',
            type: 'ACTIVE',
            requiredClass: 'gunner',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 {{damage}}% 데미지를 줍니다. 이 공격은 확정적으로 [치명타]가 되며, 대상의 방어력을 15% 무시합니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/critical-shot.png',
            cooldown: 2,
            range: 4,
            damageMultiplier: { min: 0.9, max: 1.1 },
            fixedDamage: 'CRITICAL',
        armorPenetration: 0.15,
        },
    },
    // --- ▼ [신규] '낙인' 스킬을 DEBUFF에서 ACTIVE로 이동 및 수정 ▼ ---
    stigma: {
        yinYangValue: +2,
        NORMAL: {
            id: 'stigma',
            name: '낙인',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다. (소모 자원: 철 3)',
            illustrationPath: 'assets/images/skills/stigma.png',
            cooldown: 5,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        RARE: {
            id: 'stigma',
            name: '낙인 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 4턴, 소모 자원: 철 3)',
            illustrationPath: 'assets/images/skills/stigma.png',
            cooldown: 4,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        EPIC: {
            id: 'stigma',
            name: '낙인 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 3턴, 소모 자원: 철 3)',
            illustrationPath: 'assets/images/skills/stigma.png',
            cooldown: 3,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        LEGENDARY: {
            id: 'stigma',
            name: '낙인 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 2명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 3턴, 소모 자원: 철 3)',
            illustrationPath: 'assets/images/skills/stigma.png',
            cooldown: 3,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            numberOfTargets: 2,
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        }
    },
    // --- ▲ [신규] '낙인' 스킬을 DEBUFF에서 ACTIVE로 이동 및 수정 ▲ ---
    // --- ▲ [신규] 크리티컬 샷 스킬 추가 ▲ ---
    // --- ▼ [신규] 끌어당기기 스킬 추가 ▼ ---
    pulling: {
        yinYangValue: -3,
        NORMAL: {
            id: 'pulling',
            name: '끌어당기기',
            type: 'ACTIVE',
            requiredClass: ['clown', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.BIND, SKILL_TAGS.KINETIC],
            cost: 3,
            targetType: 'enemy',
            description: '5타일 내의 적을 자신의 바로 앞으로 끌어옵니다. (쿨타임 5턴)',
            illustrationPath: 'assets/images/skills/pulling.png',
            cooldown: 5,
            range: 5,
            pull: true
        },
        RARE: {
            id: 'pulling',
            name: '끌어당기기 [R]',
            type: 'ACTIVE',
            requiredClass: ['clown', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.BIND, SKILL_TAGS.KINETIC],
            cost: 3,
            targetType: 'enemy',
            description: '5타일 내의 적을 자신의 바로 앞으로 끌어오고, 1턴간 이동력을 1 감소시킵니다. (쿨타임 5턴)',
            illustrationPath: 'assets/images/skills/pulling.png',
            cooldown: 5,
            range: 5,
            pull: true,
            effect: {
                id: 'slow',
                type: EFFECT_TYPES.DEBUFF,
                duration: 1,
                modifiers: { stat: 'movement', type: 'flat', value: -1 }
            }
        },
        EPIC: {
            id: 'pulling',
            name: '끌어당기기 [E]',
            type: 'ACTIVE',
            requiredClass: ['clown', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.BIND, SKILL_TAGS.KINETIC],
            cost: 2,
            targetType: 'enemy',
            description: '5타일 내의 적을 자신의 바로 앞으로 끌어오고, 1턴간 이동력을 1 감소시킵니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/pulling.png',
            cooldown: 4,
            range: 5,
            pull: true,
            effect: {
                id: 'slow',
                type: EFFECT_TYPES.DEBUFF,
                duration: 1,
                modifiers: { stat: 'movement', type: 'flat', value: -1 }
            }
        },
        LEGENDARY: {
            id: 'pulling',
            name: '끌어당기기 [L]',
            type: 'ACTIVE',
            requiredClass: ['clown', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.BIND, SKILL_TAGS.KINETIC],
            cost: 2,
            targetType: 'enemy',
            description: '5타일 내의 적을 자신의 바로 앞으로 끌어오고, 2턴간 [속박](이동 불가) 상태로 만듭니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/pulling.png',
            cooldown: 4,
            range: 5,
            pull: true,
            effect: {
                id: 'bind',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2
            }
        }
    },
    // --- ▲ [신규] 끌어당기기 스킬 추가 ▲ ---
    // --- ▼ [신규] 파이어볼 스킬 추가 ▼ ---
    fireball: {
        yinYangValue: -4,
        NORMAL: {
            id: 'fireball',
            name: '파이어볼',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.FIRE, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 거대한 화염구를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 2턴간 [화상] 효과를 부여합니다.',
            illustrationPath: 'assets/images/skills/fire-ball.png',
            cooldown: 3,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.0, max: 1.2 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
            }
        },
        RARE: {
            id: 'fireball',
            name: '파이어볼 [R]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.FIRE, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 거대한 화염구를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 2턴간 [화상] 효과를 부여합니다. (쿨타임 1 감소)',
            illustrationPath: 'assets/images/skills/fire-ball.png',
            cooldown: 2,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.1, max: 1.3 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
            }
        },
        EPIC: {
            id: 'fireball',
            name: '파이어볼 [E]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.FIRE, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 거대한 화염구를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 3턴간 [화상] 효과를 부여합니다.',
            illustrationPath: 'assets/images/skills/fire-ball.png',
            cooldown: 2,
            range: 5,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.2, max: 1.4 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
            }
        },
        LEGENDARY: {
            id: 'fireball',
            name: '파이어볼 [L]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.FIRE, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 거대한 화염구를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 3턴간 [화상] 효과를 부여하며, 중심부의 적을 1턴간 기절시킵니다.',
            illustrationPath: 'assets/images/skills/fire-ball.png',
            cooldown: 2,
            range: 5,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.3, max: 1.5 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
            },
            centerTargetEffect: {
                id: 'stun',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 1,
            }
        }
    },
    // --- ▲ [신규] 파이어볼 스킬 추가 ▲ ---

    // --- ▼ [신규] 아이스볼 스킬 추가 ▼ ---
    iceball: {
        yinYangValue: -4,
        NORMAL: {
            id: 'iceball',
            name: '아이스볼',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.WATER, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 얼음 덩어리를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 2턴간 [동상] 효과를 부여합니다.',
            illustrationPath: 'assets/images/skills/ice-ball.png',
            cooldown: 3,
            range: 4,
            aoe: {
                shape: 'CROSS',
                radius: 1
            },
            damageMultiplier: { min: 0.9, max: 1.1 },
            effect: {
                id: 'frost',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
            }
        },
        RARE: {
            id: 'iceball',
            name: '아이스볼 [R]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.WATER, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 얼음 덩어리를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 2턴간 [동상] 효과를 부여합니다. (쿨타임 1 감소)',
            illustrationPath: 'assets/images/skills/ice-ball.png',
            cooldown: 2,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.0, max: 1.2 },
            effect: {
                id: 'frost',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
            }
        },
        EPIC: {
            id: 'iceball',
            name: '아이스볼 [E]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.WATER, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 얼음 덩어리를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 3턴간 [동상] 효과를 부여합니다.',
            illustrationPath: 'assets/images/skills/ice-ball.png',
            cooldown: 2,
            range: 5,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.1, max: 1.3 },
            effect: {
                id: 'frost',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
            }
        },
        LEGENDARY: {
            id: 'iceball',
            name: '아이스볼 [L]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.WATER, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 얼음 덩어리를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 3턴간 [동상] 효과를 부여하며, 중심부의 적을 1턴간 [속박]시킵니다.',
            illustrationPath: 'assets/images/skills/ice-ball.png',
            cooldown: 2,
            range: 5,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.2, max: 1.4 },
            effect: {
                id: 'frost',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
            },
            centerTargetEffect: {
                id: 'bind', // 속박 효과
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 1
            }
        }
    },
    // --- ▲ [신규] 아이스볼 스킬 추가 ▲ ---

    // --- ▼ [신규] 4대 원소 마법 스킬 추가 (NORMAL 등급) ▼ ---
    lightningStrike: {
        yinYangValue: -4,
        NORMAL: {
            id: 'lightningStrike',
            name: '라이트닝 스트라이크',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.WIND, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '번개 구체를 날려 십자(5칸) 범위의 적들에게 {{damage}}% 마법 피해를 주고, 2턴간 [감전] 효과를 부여합니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 0.8, max: 1.1 },
            effect: { id: 'shock', type: EFFECT_TYPES.DEBUFF, duration: 2 }
        }
    },

    stoneBlast: {
        yinYangValue: -4,
        NORMAL: {
            id: 'stoneBlast',
            name: '스톤 블라스트',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.EARTH, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '바위 파편을 날려 십자(5칸) 범위의 적들에게 {{damage}}% 마법 피해를 주고, 2턴간 [약화] 효과를 부여합니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 0.8, max: 1.1 },
            effect: { id: 'weaken', type: EFFECT_TYPES.DEBUFF, duration: 2 }
        }
    },

    holyLight: {
        yinYangValue: -4,
        NORMAL: {
            id: 'holyLight',
            name: '홀리 라이트',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '성스러운 빛으로 십자(5칸) 범위의 적들에게 {{damage}}% 마법 피해를 주고, 2턴간 [취약] 상태로 만듭니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 0.8, max: 1.1 },
            effect: { id: 'vulnerable', type: EFFECT_TYPES.DEBUFF, duration: 2 }
        }
    },

    shadowBolt: {
        yinYangValue: -4,
        NORMAL: {
            id: 'shadowBolt',
            name: '섀도우 볼트',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.DARK, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '어둠의 구체를 날려 십자(5칸) 범위의 적들에게 {{damage}}% 마법 피해를 주고, 2턴간 [정기 흡수] 효과를 부여합니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 0.8, max: 1.1 },
            effect: { id: 'drain', type: EFFECT_TYPES.DEBUFF, duration: 2 }
        }
    },
    // --- ▲ [신규] 4대 원소 마법 스킬 추가 (NORMAL 등급) ▲ ---

    // --- ▼ [신규] 관통 사격 스킬 추가 ▼ ---
    piercingShot: {
        yinYangValue: -3,
        NORMAL: {
            id: 'piercingShot',
            name: '관통 사격',
            type: 'ACTIVE',
            requiredClass: ['gunner'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '목표를 향해 3칸짜리 일직선 관통탄을 발사하여 경로상의 모든 적에게 {{damage}}%의 물리 피해를 줍니다.',
            illustrationPath: 'assets/images/skills/impale-shot.png',
            cooldown: 3,
            range: 4,
            aoe: {
                shape: 'LINE',
                length: 3
            },
            damageMultiplier: { min: 0.8, max: 1.0 }
        },
        RARE: {
            id: 'piercingShot',
            name: '관통 사격 [R]',
            type: 'ACTIVE',
            requiredClass: ['gunner'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '목표를 향해 3칸짜리 일직선 관통탄을 발사하여 경로상의 모든 적에게 {{damage}}%의 물리 피해를 줍니다. (쿨타임 1 감소)',
            illustrationPath: 'assets/images/skills/impale-shot.png',
            cooldown: 2,
            range: 4,
            aoe: { shape: 'LINE', length: 3 },
            damageMultiplier: { min: 0.9, max: 1.1 }
        },
        EPIC: {
            id: 'piercingShot',
            name: '관통 사격 [E]',
            type: 'ACTIVE',
            requiredClass: ['gunner'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.SPECIAL],
            cost: 2,
            targetType: 'enemy',
            description: '목표를 향해 3칸짜리 일직선 관통탄을 발사하여 경로상의 모든 적에게 {{damage}}%의 물리 피해를 줍니다. (비용 1 감소)',
            illustrationPath: 'assets/images/skills/impale-shot.png',
            cooldown: 2,
            range: 5,
            aoe: { shape: 'LINE', length: 3 },
            damageMultiplier: { min: 1.0, max: 1.2 }
        },
        LEGENDARY: {
            id: 'piercingShot',
            name: '관통 사격 [L]',
            type: 'ACTIVE',
            requiredClass: ['gunner'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.SPECIAL],
            cost: 2,
            targetType: 'enemy',
            description: '목표를 향해 3칸짜리 일직선 관통탄을 발사하여 경로상의 모든 적에게 {{damage}}%의 물리 피해를 주고, 대상의 방어력을 25% 무시합니다.',
            illustrationPath: 'assets/images/skills/impale-shot.png',
            cooldown: 2,
            range: 5,
            aoe: { shape: 'LINE', length: 3 },
            damageMultiplier: { min: 1.0, max: 1.2 },
            armorPenetration: 0.25
        }
    },
    // --- ▲ [신규] 관통 사격 스킬 추가 ▲ ---
    // --- ▼ [신규] 더블 스트라이크 스킬 추가 ▼ ---
    doubleStrike: {
        yinYangValue: -2,
        NORMAL: {
            id: 'doubleStrike',
            name: '더블 스트라이크',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.COMBO],
            cost: 2,
            targetType: 'enemy',
            description: '적을 80%의 위력으로 두 번 연속 공격합니다.',
            illustrationPath: 'assets/images/skills/double-strike.png',
            cooldown: 0,
            range: 1,
            damageMultiplier: { min: 0.75, max: 0.85 },
            hitCount: 2
        },
        RARE: {
            id: 'doubleStrike',
            name: '더블 스트라이크 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.COMBO],
            cost: 1,
            targetType: 'enemy',
            description: '적을 80%의 위력으로 두 번 연속 공격합니다.',
            illustrationPath: 'assets/images/skills/double-strike.png',
            cooldown: 0,
            range: 1,
            damageMultiplier: { min: 0.75, max: 0.85 },
            hitCount: 2
        },
        EPIC: {
            id: 'doubleStrike',
            name: '더블 스트라이크 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.COMBO],
            cost: 1,
            targetType: 'enemy',
            description: '적을 80%의 위력으로 두 번 연속 공격하며, 매 타격 시 2턴간 방어력을 5% 감소시킵니다.',
            illustrationPath: 'assets/images/skills/double-strike.png',
            cooldown: 0,
            range: 1,
            damageMultiplier: { min: 0.75, max: 0.85 },
            hitCount: 2,
            effect: {
                id: 'armorBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
                stackable: true,
                modifiers: { stat: 'physicalDefense', type: 'percentage', value: -0.05 }
            }
        },
        LEGENDARY: {
            id: 'doubleStrike',
            name: '더블 스트라이크 [L]',
            type: 'ACTIVE',
            tags: [
                SKILL_TAGS.ACTIVE,
                SKILL_TAGS.PHYSICAL,
                SKILL_TAGS.MELEE,
                SKILL_TAGS.COMBO,
                SKILL_TAGS.PRODUCTION
            ],
            cost: 1,
            targetType: 'enemy',
            description:
                '적을 80%의 위력으로 두 번 연속 공격하며, 매 타격 시 방어력을 5% 감소시키고 [철] 자원을 1 생산합니다.',
            illustrationPath: 'assets/images/skills/double-strike.png',
            cooldown: 0,
            range: 1,
            damageMultiplier: { min: 0.75, max: 0.85 },
            hitCount: 2,
            effect: {
                id: 'armorBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
                stackable: true,
                modifiers: { stat: 'physicalDefense', type: 'percentage', value: -0.05 }
            },
            generatesResource: { type: 'IRON', amount: 1 }
        }
    },
    // --- ▲ [신규] 더블 스트라이크 스킬 추가 ▲ ---

    // --- ▼ [신규] 광대 전용 스킬 추가 ▼ ---
    surpriseShow: {
        yinYangValue: -3,
        NORMAL: {
            id: 'surpriseShow',
            name: '깜짝쇼',
            type: 'ACTIVE',
            requiredClass: ['clown'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.KINETIC, SKILL_TAGS.MIND, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy', // 타겟팅 시스템이 'healer', 'supporter'를 우선하도록 만들어야 함
            description: '적 진영의 힐러나 서포터 중 한 명과 자신의 위치를 강제로 뒤바꿉니다. (소모 자원: 바람 3)',
            illustrationPath: null,
            cooldown: 5,
            range: 99, // 맵 전체
            resourceCost: { type: 'WIND', amount: 3 },
            swapPosition: true // 위치 교환 플래그
        }
    },

    harmlessJoke: {
        yinYangValue: +2,
        NORMAL: {
            id: 'harmlessJoke',
            name: '무해한 농담',
            type: 'ACTIVE', // 버프와 디버프를 동시에 하므로 ACTIVE로 분류
            requiredClass: ['clown'],
            tags: [SKILL_TAGS.AURA, SKILL_TAGS.MIND],
            cost: 2,
            targetType: 'self', // 자신을 중심으로 발동
            description: '주위 3타일 내 모든 아군의 열망을 10 올리고, 모든 적의 열망을 10 내립니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 0,
            aoe: { shape: 'SQUARE', radius: 3 },
            aspirationEffect: { ally: 10, enemy: -10 } // 열망 조작 효과
        }
    },
    // --- ▲ [신규] 광대 전용 스킬 추가 ▲ ---

    // --- ▼ [신규] 맹독 구름, 아드레날린 주사 스킬 추가 ▼ ---
    poisonCloud: {
        yinYangValue: -3,
        NORMAL: {
            id: 'poisonCloud',
            name: '맹독 구름',
            type: 'ACTIVE',
            requiredClass: ['plagueDoctor'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.POISON, SKILL_TAGS.DEBUFF, SKILL_TAGS.AURA],
            cost: 0, // 자원만 소모
            targetType: 'enemy',
            description: '넓은(3x3) 범위에 독안개를 살포하여 3턴간 [중독] 효과를 부여합니다. (소모 자원: 독 2)',
            illustrationPath: null,
            cooldown: 4,
            range: 3,
            resourceCost: { type: 'POISON', amount: 2 },
            aoe: { shape: 'SQUARE', radius: 1 },
            effect: { id: 'poison', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        }
    },

    adrenalineShot: {
        yinYangValue: +3,
        NORMAL: {
            id: 'adrenalineShot',
            name: '아드레날린 주사',
            type: 'AID', // 지원 스킬이지만 액티브로도 분류 가능
            tags: [SKILL_TAGS.AID, SKILL_TAGS.BUFF],
            cost: 3,
            // 대상을 '아군'으로 명확히 지정해 AI가 올바른 유닛을 선택하도록 합니다.
            targetType: 'ally',
            description: '아군 하나의 [둔화]와 [속박]을 즉시 해제하고, 2턴간 [아드레날린] 버프를 부여합니다.',
            illustrationPath: null,
            cooldown: 5,
            range: 1,
            cleanses: ['slow', 'bind'], // 해제할 상태이상 목록 (나중에 SkillEffectProcessor에서 처리)
            effect: { id: 'adrenaline', type: EFFECT_TYPES.BUFF, duration: 2 }
        }
    },
    // --- ▲ [신규] 암살 일격, 맹독 구름, 아드레날린 주사 스킬 추가 ▲ ---

    // --- ▼ [신규] 쟈벨린 투척 스킬 추가 ▼ ---
    javelinThrow: {
        yinYangValue: -2,
        NORMAL: {
            id: 'javelinThrow',
            name: '쟈벨린 투척',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.IRON, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '5타일 거리의 적에게 100%의 물리 피해를 주는 쟈벨린을 투척합니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/throwing-javelin.png',
            cooldown: 0,
            range: 5,
            damageMultiplier: { min: 0.95, max: 1.05 },
            resourceCost: { type: 'IRON', amount: 2 }
        }
    },
    // --- ▲ [신규] 쟈벨린 투척 스킬 추가 ▲ ---

    // --- ▼ [신규] 저격 스킬 추가 ▼ ---
    snipe: {
        yinYangValue: -3,
        NORMAL: {
            id: 'snipe',
            name: '저격',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 3,
            targetType: 'enemy',
            description: '5타일 거리의 적에게 100%의 물리 피해를 줍니다. 기본 사거리가 2 이상일 경우, 20%의 추가 피해를 입힙니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/gunner-attack-icon.png',
            cooldown: 2,
            range: 5,
            damageMultiplier: { min: 0.95, max: 1.05 }
            // 추가 데미지 로직은 CombatCalculationEngine에서 처리됩니다.
        }
    },
    // --- ▲ [신규] 저격 스킬 추가 ▲ ---

    // --- ▼ [신규] 화염병 투척 스킬 추가 ▼ ---
    fireBottle: {
        yinYangValue: -2,
        NORMAL: {
            id: 'fireBottle',
            name: '화염병 투척',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.FIRE, SKILL_TAGS.PRODUCTION],
            cost: 2,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 80%의 물리 피해를 주고 2턴간 [화상] 상태로 만듭니다. 기본 사거리가 1 이하일 경우, 20%의 추가 피해를 입힙니다. [불] 자원을 1 생산합니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/fire-bottle.png',
            cooldown: 2,
            range: 3,
            damageMultiplier: { min: 0.75, max: 0.85 },
            generatesResource: { type: 'FIRE', amount: 1 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
            }
            // 추가 데미지 로직은 CombatCalculationEngine에서 처리됩니다.
        }
    },
    // --- ▲ [신규] 화염병 투척 스킬 추가 ▲ ---

    // --- ▼ [신규] 나노레일건 스킬 추가 ▼ ---
    // --- ▼ [신규] 트랩마스터용 함정 스킬 추가 ▼ ---
    steelTrap: {
        yinYangValue: +3,
        NORMAL: {
            id: 'steelTrap',
            name: '강철 덫',
            type: 'ACTIVE',
            requiredClass: ['gunner', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.TRAP, SKILL_TAGS.PROHIBITION],
            cost: 2,
            targetType: 'tile',
            description: '지정한 타일에 3턴 동안 유지되는 강철 덫을 설치합니다. 덫을 밟은 적은 1턴간 [속박] 상태가 됩니다.',
            illustrationPath: null,
            cooldown: 2,
            range: 3,
            trapData: {
                duration: 3,
                effect: {
                    id: 'bind',
                    type: EFFECT_TYPES.STATUS_EFFECT,
                    duration: 1
                }
            }
        }
    },
    venomTrap: {
        yinYangValue: +2,
        NORMAL: {
            id: 'venomTrap',
            name: '맹독 함정',
            type: 'ACTIVE',
            requiredClass: ['gunner', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.TRAP, SKILL_TAGS.DEBUFF],
            cost: 2,
            targetType: 'tile',
            description: '3턴 동안 유지되는 독 함정을 설치합니다. 밟은 적은 2턴간 [중독] 상태가 됩니다.',
            illustrationPath: null,
            cooldown: 3,
            range: 3,
            trapData: {
                duration: 3,
                effect: {
                    id: 'poison',
                    type: EFFECT_TYPES.DEBUFF,
                    duration: 2
                }
            }
        }
    },
    shockTrap: {
        yinYangValue: +2,
        NORMAL: {
            id: 'shockTrap',
            name: '전격 함정',
            type: 'ACTIVE',
            requiredClass: ['gunner', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.TRAP, SKILL_TAGS.DEBUFF],
            cost: 3,
            targetType: 'tile',
            description: '2턴 동안 유지되는 전격 함정을 설치합니다. 밟은 적은 2턴간 [감전] 상태가 됩니다.',
            illustrationPath: null,
            cooldown: 4,
            range: 3,
            trapData: {
                duration: 2,
                effect: {
                    id: 'shock',
                    type: EFFECT_TYPES.DEBUFF,
                    duration: 2
                }
            }
        }
    },
    frostTrap: {
        yinYangValue: +1,
        NORMAL: {
            id: 'frostTrap',
            name: '빙결 함정',
            type: 'ACTIVE',
            requiredClass: ['gunner', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.TRAP, SKILL_TAGS.DEBUFF],
            cost: 1,
            targetType: 'tile',
            description: '3턴 동안 유지되는 냉기 함정을 설치합니다. 밟은 적은 2턴간 [동상] 상태가 됩니다.',
            illustrationPath: null,
            cooldown: 2,
            range: 3,
            trapData: {
                duration: 3,
                effect: {
                    id: 'frost',
                    type: EFFECT_TYPES.DEBUFF,
                    duration: 2
                }
            }
        }
    },
    // --- ▲ [신규] 트랩마스터용 함정 스킬 추가 ▲ ---
    nanoRailgun: {
        yinYangValue: -4,
        NORMAL: {
            id: 'nanoRailgun',
            name: '나노레일건',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MAGIC, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 50%의 물리 피해와 50%의 마법 피해를 동시에 입힙니다. 나노맨서/에스퍼가 사용 시 마법 피해가 20% 증가합니다. (소모 자원: 빛 2, 쿨타임 4턴)',
            illustrationPath: null,
            cooldown: 4,
            range: 3,
            resourceCost: { type: 'LIGHT', amount: 2 },
            // 이 스킬은 CombatCalculationEngine에서 특별하게 처리됩니다.
            damageMultiplier: { physical: 0.5, magic: 0.5 }
        }
    },
    // --- ▲ [신규] 나노레일건 스킬 추가 ▲ ---
    // --- ▼ [신규] 엑시큐셔너 전용 '암살' 스킬 추가 ▼ ---
    assassinate: {
        yinYangValue: -5, // 매우 공격적인 음(Yin)의 기술
        NORMAL: {
            id: 'assassinate',
            name: '암살',
            type: 'ACTIVE',
            requiredClass: ['ghost'], // '고스트' 클래스 전용
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.EXECUTE],
            cost: 3,
            targetType: 'enemy',
            description: '적에게 100%의 물리 피해를 줍니다. 대상의 체력이 30% 이하라면 피해량이 2배로 증가합니다.',
            illustrationPath: null, // 임시 아이콘
            cooldown: 2,
            range: 1,
            damageMultiplier: { min: 0.95, max: 1.05 }
            // 실제 처형 로직은 CombatCalculationEngine에서 처리됩니다.
        }
    },
    // --- ▲ [신규] 엑시큐셔너 전용 '암살' 스킬 추가 ▲ ---

    // --- ▼ [신규] 나노맨서 전용 스킬 4종 추가 ▼ ---
    manaStrike: {
        yinYangValue: -1,
        NORMAL: {
            id: 'manaStrike',
            name: 'Mana Strike',
            type: 'ACTIVE',
            requiredClass: ['nanomancer'],
            tags: [SKILL_TAGS.MELEE, SKILL_TAGS.MAGIC, 'ATTACK'],
            cost: 2,
            targetType: 'enemy',
            description: 'Strike a nearby enemy with a mana-infused blade. Damage scales with both Strength and Intelligence.',
            illustrationPath: null,
            cooldown: 0,
            range: 1,
        },
    },

    arcaneCharge: {
        yinYangValue: +2,
        NORMAL: {
            id: 'arcaneCharge',
            name: 'Arcane Charge',
            type: 'ACTIVE',
            requiredClass: ['nanomancer'],
            tags: [SKILL_TAGS.CHARGE, 'MOVEMENT', SKILL_TAGS.BUFF, 'SHIELD'],
            cost: 3,
            targetType: 'enemy',
            description: 'Dash towards an enemy up to 3 tiles away. Upon arrival, gain a 10 point magic shield for 1 turn.',
            illustrationPath: null,
            cooldown: 2,
            range: 3,
            effect: { id: 'arcaneShield', duration: 1, shield: 10 },
        },
    },

    forceUnleashed: {
        yinYangValue: +4,
        NORMAL: {
            id: 'forceUnleashed',
            name: 'Force Unleashed',
            type: 'ACTIVE',
            requiredClass: ['nanomancer'],
            tags: ['FORCE', SKILL_TAGS.MAGIC, 'AOE', 'ATTACK'],
            cost: 4,
            targetType: 'self',
            description: 'Emit a devastating shockwave of pure force, hitting all enemies within 2 tiles for heavy magic damage.',
            illustrationPath: null,
            cooldown: 3,
            range: 0,
            aoe: { shape: 'SQUARE', radius: 2 },
        },
    },

    kineticBeam: {
        yinYangValue: +3,
        NORMAL: {
            id: 'kineticBeam',
            name: 'Kinetic Beam',
            type: 'ACTIVE',
            requiredClass: ['nanomancer'],
            tags: ['BEAM', SKILL_TAGS.KINETIC, SKILL_TAGS.RANGED, 'ATTACK'],
            cost: 3,
            targetType: 'line',
            description: 'Fire a concentrated beam of kinetic energy in a straight line, damaging and pushing back all enemies it passes through.',
            illustrationPath: null,
            cooldown: 2,
            range: 4,
            aoe: { shape: 'LINE', length: 4 },
        },
    },
    // --- ▲ [신규] 나노맨서 전용 스킬 4종 추가 ▲ ---

    // --- ▼ [신규] 버서커 & 스펠브레이커 전용 액티브 스킬 추가 ▼ ---
    frenziedBlow: {
        yinYangValue: -4,
        NORMAL: {
            id: 'frenziedBlow',
            name: '광폭 일격',
            type: 'ACTIVE',
            requiredClass: ['warrior'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 120%의 물리 피해를 주고, 자신은 1턴간 물리 방어력이 10% 감소합니다.',
            illustrationPath: null,
            cooldown: 1,
            range: 1,
            damageMultiplier: { min: 1.2, max: 1.4 },
            selfEffect: {
                id: 'frenzyDefenseDown',
                type: EFFECT_TYPES.DEBUFF,
                duration: 1,
                modifiers: { stat: 'physicalDefense', type: 'percentage', value: -0.1 }
            }
        }
    },

    manaSunder: {
        yinYangValue: -2,
        NORMAL: {
            id: 'manaSunder',
            name: '마나 분쇄',
            type: 'ACTIVE',
            requiredClass: ['warrior'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DEBUFF],
            cost: 2,
            targetType: 'enemy',
            description: '80%의 물리 피해를 주고, 대상의 마법 공격력을 2턴간 15% 감소시킵니다.',
            illustrationPath: null,
            cooldown: 2,
            range: 1,
            damageMultiplier: { min: 0.8, max: 1.0 },
            effect: {
                id: 'manaSunderDebuff',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
                modifiers: { stat: 'magicAttack', type: 'percentage', value: -0.15 }
            }
        }
    },
    // --- ▲ [신규] 버서커 & 스펠브레이커 전용 액티브 스킬 추가 ▲ ---
};
