import { statusEffectManager } from "../utils/StatusEffectManager.js";
import { stackManager } from "../utils/StackManager.js";
import { FIXED_DAMAGE_TYPES } from "../utils/FixedDamageManager.js";
import { EFFECT_TYPES } from "../utils/EffectTypes.js"; // EFFECT_TYPES import 추가

/**
 * 모든 상태 효과의 정의를 담는 데이터베이스입니다.
 * StatusEffectManager는 이 데이터를 참조하여 효과를 적용하고 해제합니다.
 */
export const statusEffects = {
    stun: {
        id: 'stun',
        name: '기절',
        description: '이동, 공격, 스킬 사용이 불가능한 상태가 됩니다.',
        iconPath: 'assets/images/status-effects/stun.png',
        onApply: (unit) => {
            console.log(`${unit.instanceName}이(가) 기절했습니다!`);
            unit.isStunned = true;
        },
        onRemove: (unit) => {
            console.log(`${unit.instanceName}의 기절 효과 중 하나가 해제됩니다.`);
            // 현재 유닛에게 적용된 다른 'stun' 효과가 있는지 확인합니다.
            const remainingStuns = (statusEffectManager.activeEffects.get(unit.uniqueId) || [])
                .filter(effect => effect.id === 'stun').length;

            // 남아있는 기절 효과가 없다면, 그때 상태를 해제합니다.
            if (remainingStuns === 0) {
                console.log(`${unit.instanceName}의 모든 기절이 풀렸습니다.`);
                unit.isStunned = false;
                unit.justRecoveredFromStun = true;
            } else {
                console.log(`${unit.instanceName}에게 아직 ${remainingStuns}개의 기절 효과가 남아있습니다.`);
            }
        },
    },
    // ▼▼▼ [신규] 화상, 동상 효과 추가 ▼▼▼
    burn: {
        id: 'burn',
        name: '화상',
        type: EFFECT_TYPES.DEBUFF,
        description: '턴이 끝날 때마다 최대 체력의 5%만큼 화염 피해를 받습니다.',
        iconPath: 'assets/images/status-effects/burn.png',
        // onApply, onRemove는 지금 당장 필요 없지만, 나중에 확장할 수 있습니다.
    },
    frost: {
        id: 'frost',
        name: '동상',
        type: EFFECT_TYPES.DEBUFF,
        description: '이동력이 1 감소하고, 턴이 끝날 때마다 최대 체력의 3%만큼 냉기 피해를 받습니다.',
        iconPath: 'assets/images/status-effects/frost.png',
        modifiers: { stat: 'movement', type: 'flat', value: -1 } // 이동력 1 감소
    },
    // ▲▲▲ [신규] 추가 완료 ▲▲▲
    // --- ▼ [신규] 4대 원소 상태이상 효과 추가 ▼ ---
    shock: {
        id: 'shock',
        name: '감전',
        type: EFFECT_TYPES.DEBUFF,
        description: '턴 시작 시 50% 확률로 토큰 1개를 잃습니다.',
        iconPath: null, // 추후 전용 아이콘 추가 예정
    },
    weaken: {
        id: 'weaken',
        name: '약화',
        type: EFFECT_TYPES.DEBUFF,
        description: '물리 및 마법 공격력이 15% 감소합니다.',
        iconPath: null,
        modifiers: [
            { stat: 'physicalAttack', type: 'percentage', value: -0.15 },
            { stat: 'magicAttack', type: 'percentage', value: -0.15 }
        ]
    },
    vulnerable: {
        id: 'vulnerable',
        name: '취약',
        type: EFFECT_TYPES.DEBUFF,
        description: '받는 모든 피해가 15% 증가합니다.',
        iconPath: null,
        modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 }
    },
    drain: {
        id: 'drain',
        name: '정기 흡수',
        type: EFFECT_TYPES.DEBUFF,
        description: '지능과 지혜가 15% 감소합니다.',
        iconPath: null,
        modifiers: [
            { stat: 'intelligence', type: 'percentage', value: -0.15 },
            { stat: 'wisdom', type: 'percentage', value: -0.15 }
        ]
    },
    // --- ▲ [신규] 추가 완료 ▲ ---
    // ✨ [신규] 이동력 감소(slow) 및 속박(bind) 효과 추가
    slow: {
        id: 'slow',
        name: '둔화',
        description: '이동력이 감소합니다.',
        iconPath: 'assets/images/status-effects/slow.png',
    },
    bind: {
        id: 'bind',
        name: '속박',
        description: '이동할 수 없습니다.',
        iconPath: 'assets/images/status-effects/bind.png',
        onApply: (unit) => {
            unit.isBound = true;
        },
        onRemove: (unit) => {
            unit.isBound = false;
        },
    },
    // --- ▼ [신규] 회피 기동 버프 효과 추가 ▼ ---
    evasiveManeuverBuff: {
        id: 'evasiveManeuverBuff',
        name: '회피 기동',
        type: EFFECT_TYPES.BUFF, // 이 효과는 버프입니다.
        iconPath: 'assets/images/skills/evasive-maneuver.png',
        maxStacks: 3, // 최대 3번 중첩 가능
        modifiers: { stat: 'physicalEvadeChance', type: 'percentage', value: 0.08 } // 물리 회피율 8% 증가
    },
    // --- ▲ [신규] 회피 기동 버프 효과 추가 ▲ ---
    // 전투의 함성: 일시적으로 근접 공격 등급을 상승시킵니다.
    battleCryBuff: {
        id: 'battleCryBuff',
        name: '전투의 함성',
        iconPath: 'assets/images/skills/battle_cry.png',
        // 등급 보정치 예시: 근접 공격 등급 +1
        modifiers: { stat: 'meleeAttack', type: 'flat', value: 1 }
    },
    // ✨ 스톤 스킨 효과 추가
    stoneSkin: {
        id: 'stoneSkin',
        name: '스톤 스킨',
        iconPath: 'assets/images/skills/ston-skin.png',
    },
    // ✨ 쉴드 브레이크 효과 추가
    shieldBreak: {
        id: 'shieldBreak',
        name: '쉴드 브레이크',
        iconPath: 'assets/images/skills/shield-break.png',
    },
    // ✨ 아이언 윌 효과 추가
    ironWill: {
        id: 'ironWill',
        name: '아이언 윌',
        iconPath: 'assets/images/skills/iron_will.png',
    },
    // ✨ 돌격 명령 버프 추가
    chargeOrderBuff: {
        id: 'chargeOrderBuff',
        name: '돌격 명령',
        iconPath: 'assets/images/skills/charge-order.png',
    },
    // ✨ 숯돌 갈기 버프 추가
    grindstoneBuff: {
        id: 'grindstoneBuff',
        name: '숯돌 갈기',
        iconPath: 'assets/images/skills/grindstone.png',
    },
    huntSenseBuff: {
        id: 'huntSenseBuff',
        name: '사냥꾼의 감각',
        // ▼▼▼ [수정] iconPath를 올바른 경로로 변경합니다. ▼▼▼
        description: '다음 3턴간 치명타 확률이 15% 증가합니다.',
        iconPath: 'assets/images/skills/hunt-sense.png',
        duration: 3,
        type: EFFECT_TYPES.BUFF,
        stats: {
            critChance: 0.15,
        },
        tags: ['buff', 'crit'],
    },
    // 치료 불가 디버프
    stigma: {
        id: 'stigma',
        name: '낙인',
        description: '지원(AID) 스킬의 효과를 받을 수 없습니다.',
        iconPath: 'assets/images/skills/stigma.png',
        onApply: (unit) => {
            unit.isHealingProhibited = true;
            console.log(`${unit.instanceName}에게 [치료 금지] 효과가 적용됩니다.`);
        },
        onRemove: (unit) => {
            unit.isHealingProhibited = false;
            console.log(`${unit.instanceName}의 [치료 금지] 효과가 해제됩니다.`);
        },
    },
    // --- ▼ [신규] 혼란 효과 추가 ▼ ---
    confusion: {
        id: 'confusion',
        name: '혼란',
        type: EFFECT_TYPES.STATUS_EFFECT,
        description: '제어 불능 상태가 되어 아군을 공격합니다.',
        iconPath: 'assets/images/skills/confusion.png', // 스킬 아이콘 재사용
        onApply: (unit) => {
            unit.isConfused = true;
            console.log(`%c[상태이상] ${unit.instanceName}이(가) 혼란에 빠졌습니다!`, "color: #f43f5e;");
        },
        onRemove: (unit) => {
            unit.isConfused = false;
            console.log(`%c[상태이상] ${unit.instanceName}이(가) 혼란에서 벗어났습니다.`, "color: #a3e635;");
        },
    },
    // --- ▲ [신규] 혼란 효과 추가 ▲ ---
    // --- ▼ [신규] 윌 가드 효과 추가 ▼ ---
    willGuard: {
        id: 'willGuard',
        name: '의지 방패',
        description: '다음 공격을 확정적으로 [막기]로 판정합니다.',
        iconPath: 'assets/images/skills/shield-buff.png',
        onApply: (unit, effectData) => {
            if (effectData && effectData.stack) {
                stackManager.addStack(unit.uniqueId, FIXED_DAMAGE_TYPES.BLOCK, effectData.stack.amount);
            }
        },
        onRemove: (unit) => {
            // 스택은 자동 소모되므로 특별한 로직이 필요 없을 수 있습니다.
        },
    },
    // --- ▲ [신규] 윌 가드 효과 추가 ▲ ---

    // --- ▼ [신규] 마이티 쉴드 효과 추가 ▼ ---
    mightyShield: {
        id: 'mightyShield',
        name: '마이티 쉴드',
        description: '다음 공격의 피해를 완전히 무효화합니다.',
        iconPath: 'assets/images/skills/mighty-shield.png',
        onApply: (unit, effectData) => {
            if (effectData && effectData.stack) {
                stackManager.addStack(unit.uniqueId, FIXED_DAMAGE_TYPES.DAMAGE_IMMUNITY, effectData.stack.amount);
            }
        },
        onRemove: (unit) => {
            // 스택은 공격받을 때 자동으로 소모되므로 별도 로직 불필요
        },
    },
    // --- ▲ [신규] 마이티 쉴드 효과 추가 ▲ ---

    // --- ▼ [신규] 클래스 특화 보너스 효과 추가 ▼ ---
    warriorWillBonus: {
        id: 'warriorWillBonus',
        name: '투지',
        iconPath: 'assets/images/skills/battle_cry.png',
    },
    gunnerKineticBonus: {
        id: 'gunnerKineticBonus',
        name: '반동 제어',
        iconPath: 'assets/images/skills/knock-back-shot.png',
    },
    medicHealBonus: {
        id: 'medicHealBonus',
        name: '집중',
        iconPath: 'assets/images/skills/heal.png',
    },
    nanomancerProductionBonus: {
        id: 'nanomancerProductionBonus',
        name: '과부하',
        iconPath: 'assets/images/skills/nanobeam.png',
    },
    // ✨ 광대의 농담 버프 효과 추가
    clownsJokeBuff: {
        id: 'clownsJokeBuff',
        name: '광대의 농담',
        iconPath: 'assets/images/skills/clown-s-joke.png',
    },
    // ✨ [신규] 강화 학습 버프 효과 추가
    reinforcementLearningBuff: {
        id: 'reinforcementLearningBuff',
        name: '강화 학습',
        iconPath: 'assets/images/skills/reinforcement-learning.png',
        // 이 버프는 스택만 쌓고, 실제 스탯 보너스는 CombatCalculationEngine에서 동적으로 계산됩니다.
    },
    // --- ▼ [신규] 해커의 침입 패시브 효과 추가 ▼ ---
    hackersInvade: {
        id: 'hackersInvade',
        name: '해커의 침입',
        iconPath: 'assets/images/skills/hacker\'s-invade.png',
        // onApply는 SkillEffectProcessor에서 처리합니다.
    },
    // --- ▲ [신규] 해커의 침입 패시브 효과 추가 ▲ ---
    // --- ▼ [신규] 전방 주시 디버프 효과 추가 ▼ ---
    sentryDutyDebuff: {
        id: 'sentryDutyDebuff',
        name: '전방 주시',
        type: EFFECT_TYPES.DEBUFF,
        iconPath: 'assets/images/skills/eye-of-guard.png',
        description: '이 유닛은 센티넬에게 가하는 피해량이 감소합니다.',
    },
    // --- ▲ [신규] 전방 주시 디버프 효과 추가 ▲ ---
    // --- ▼ [신규] 투명화 버프 효과 추가 ▼ ---
    ghostingBuff: {
        id: 'ghostingBuff',
        name: '투명화',
        type: EFFECT_TYPES.BUFF,
        iconPath: 'assets/images/skills/ghosting.png',
        description: '회피율이 50% 상승합니다.',
        modifiers: { stat: 'physicalEvadeChance', type: 'percentage', value: 0.50 }
    },
    // --- ▲ [신규] 투명화 버프 효과 추가 ▲ ---
    // --- ▼ [신규] 저거너트 버프 효과 추가 ▼ ---
    juggernautBuff: {
        id: 'juggernautBuff',
        name: '저거너트',
        type: EFFECT_TYPES.BUFF,
        iconPath: 'assets/images/skills/flyingmen\'s-charge.png',
        description: '이동 거리에 비례하여 방어력이 증가합니다.',
        // modifiers는 MoveToTargetNode에서 동적으로 계산하여 적용합니다.
    },
    // --- ▲ [신규] 저거너트 버프 효과 추가 ▲ ---
    flyingmenChargeBonus: {
        id: 'flyingmenChargeBonus',
        name: '신속',
        iconPath: 'assets/images/skills/charge.png',
    },
    // --- ▼ [신규] 역병 의사 특화 보너스 효과 추가 ▼ ---
    poisonAttributeBonus: {
        id: 'poisonAttributeBonus',
        name: '맹독 확산',
        description: '상태이상 적용 확률이 증가합니다.',
        iconPath: 'assets/images/skills/antidote.png', // 임시 아이콘, 추후 전용 아이콘으로 교체 가능
    },
    // --- ▲ [신규] 역병 의사 특화 보너스 효과 추가 ▲ ---
    // --- ▲ [신규] 클래스 특화 보너스 효과 추가 ▲ ---

    // --- ▼ [신규] 다크나이트 패시브 및 특화 효과 추가 ▼ ---
    despairAuraDebuff: {
        id: 'despairAuraDebuff',
        name: '절망의 오라',
        type: EFFECT_TYPES.DEBUFF,
        iconPath: 'assets/images/skills/curse-of-darkness.png',
        description: '공격력과 방어력이 5% 감소합니다.'
    },
    darkKnightDarkBonus: {
        id: 'darkKnightDarkBonus',
        name: '어둠 흡수',
        iconPath: 'assets/images/skills/curse-of-darkness.png',
    },
    // --- ▲ [신규] 다크나이트 패시브 및 특화 효과 추가 ▲ ---

    // --- ▼ [신규] 5가지 신규 상태이상 및 버프 효과 추가 ▼ ---
    disarm: {
        id: 'disarm',
        name: '무장 해제',
        type: EFFECT_TYPES.DEBUFF,
        description: '공격 및 스킬 사용이 불가능합니다.',
        iconPath: null, // 시스템 해킹
        onApply: (unit) => { unit.isDisarmed = true; },
        onRemove: (unit) => { unit.isDisarmed = false; }
    },

    poisonWeapon: {
        id: 'poisonWeapon',
        name: '맹독 부여',
        type: EFFECT_TYPES.BUFF,
        description: '다음 공격 시 50% 확률로 적을 [중독]시킵니다.',
        iconPath: null, // 맹독 바르기
    },

    poison: {
        id: 'poison',
        name: '중독',
        type: EFFECT_TYPES.DEBUFF,
        description: '턴 종료 시 최대 체력의 8%만큼 지속 피해를 입고, 받는 치유량이 25% 감소합니다.',
        iconPath: null, // 맹독 구름
        modifiers: { stat: 'healingReceived', type: 'percentage', value: -0.25 }
        // 지속 피해 로직은 나중에 StatusEffectManager.js에서 별도 처리가 필요합니다.
    },

    adrenaline: {
        id: 'adrenaline',
        name: '아드레날린',
        type: EFFECT_TYPES.BUFF,
        description: '공격력이 25% 증가하고, 행동 순서가 더 빨리 돌아옵니다.',
        iconPath: null, // 아드레날린 주사
        modifiers: [
            { stat: 'physicalAttack', type: 'percentage', value: 0.25 },
            { stat: 'magicAttack', type: 'percentage', value: 0.25 },
            { stat: 'turnValue', type: 'percentage', value: -0.30 } // 턴 순서 값 30% 감소 (빨라짐)
        ]
    },
    // --- ▲ [신규] 추가 완료 ▲ ---

    // --- ▼ [신규] 3가지 신규 버프/디버프 효과 추가 ▼ ---
    overdrive: {
        id: 'overdrive',
        name: '오버드라이브',
        type: EFFECT_TYPES.BUFF,
        description: '[특수 스킬]의 최종 위력이 20% 증가합니다.',
        iconPath: null, // 오버드라이브
        // 'specialSkillPower'와 같은 커스텀 modifier는 나중에 CombatCalculationEngine에서 참조하여 계산합니다.
        modifiers: { stat: 'specialSkillPower', type: 'percentage', value: 0.20 }
    },

    nobleSacrifice: {
        id: 'nobleSacrifice',
        name: '고귀한 희생',
        type: EFFECT_TYPES.BUFF,
        description: '용맹 배리어를 회복받았습니다.',
        iconPath: null, // 고귀한 희생
    },

    virus: {
        id: 'virus',
        name: '바이러스',
        type: EFFECT_TYPES.DEBUFF,
        description: '이 유닛은 버프 효과를 받을 수 없습니다.',
        iconPath: null, // 무효화
        onApply: (unit) => { unit.isBuffImmune = true; },
        onRemove: (unit) => { unit.isBuffImmune = false; }
    },
    // --- ▼ [신규] '약점 노출' 디버프 효과 추가 ▼ ---
    focusFireMark: {
        id: 'focusFireMark',
        name: '약점 노출',
        type: EFFECT_TYPES.DEBUFF,
        description: '이 유닛은 모든 공격으로부터 추가 피해를 받습니다.',
        iconPath: null, // 나중에 전용 아이콘 추가
        // 'damageIncrease' modifier를 사용하여 CombatCalculationEngine에서 자동으로 처리되도록 합니다.
        modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 } // 기본 15% 추가 피해
    },
    // --- ▲ [신규] 추가 완료 ▲ ---

    // --- ▼ [신규] 나노봇 착용 버프 효과 추가 ▼ ---
    nanobotBuff: {
        id: 'nanobotBuff',
        name: '나노봇 착용',
        type: EFFECT_TYPES.BUFF,
        description: '액티브 스킬로 피해를 주면 나노봇이 추가 공격합니다.',
        iconPath: 'assets/images/skills/mechanical-enhancement.png', // 임시로 메카닉 아이콘 재사용
        // onApply, onRemove는 실제 효과가 CombatCalculationEngine에서 처리되므로 필요 없습니다.
    },
    // --- ▲ [신규] 나노봇 착용 버프 효과 추가 ▲ ---

    // --- ▼ [신규] 버서커 & 스펠브레이커 상태 효과 추가 ▼ ---
    bloodRageBuff: {
        id: 'bloodRageBuff',
        name: '피의 격노',
        type: EFFECT_TYPES.BUFF,
        description: '물리 공격력이 20% 증가하지만 물리 방어력이 10% 감소합니다.',
        iconPath: 'assets/images/skills/battle_cry.png',
        modifiers: [
            { stat: 'physicalAttack', type: 'percentage', value: 0.2 },
            { stat: 'physicalDefense', type: 'percentage', value: -0.1 }
        ]
    },
    frenzyDefenseDown: {
        id: 'frenzyDefenseDown',
        name: '방어 약화',
        type: EFFECT_TYPES.DEBUFF,
        description: '물리 방어력이 10% 감소합니다.',
        iconPath: 'assets/images/skills/shield-break.png',
        modifiers: { stat: 'physicalDefense', type: 'percentage', value: -0.1 }
    },
    manaSunderDebuff: {
        id: 'manaSunderDebuff',
        name: '마나 분쇄',
        type: EFFECT_TYPES.DEBUFF,
        description: '마법 공격력이 15% 감소합니다.',
        iconPath: 'assets/images/skills/confusion.png',
        modifiers: { stat: 'magicAttack', type: 'percentage', value: -0.15 }
    },
    nullFieldBuff: {
        id: 'nullFieldBuff',
        name: '마력 차단장',
        type: EFFECT_TYPES.BUFF,
        description: '마법 방어력이 25% 증가합니다.',
        iconPath: 'assets/images/skills/mighty-shield.png',
        modifiers: { stat: 'magicDefense', type: 'percentage', value: 0.25 }
    }
    // --- ▲ [신규] 버서커 & 스펠브레이커 상태 효과 추가 ▲ ---
};
