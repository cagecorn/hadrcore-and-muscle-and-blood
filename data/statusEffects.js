// data/statusEffects.js

export const STATUS_EFFECT_TYPES = {
    DEBUFF: 'debuff',
    BUFF: 'buff',
    CONTROL: 'control',
    DISABLED: 'disabled' // 행동 불가 상태를 나타내는 타입 추가
};

export const STATUS_EFFECTS = {
    POISON: {
        id: 'status_poison',
        name: '독',
        type: STATUS_EFFECT_TYPES.DEBUFF,
        description: '매 턴 시작 시 일정량의 고정 피해를 입습니다.',
        duration: 3,
        effect: {
            damagePerTurn: 10
        }
    },
    STUN: {
        id: 'status_stun',
        name: '기절',
        type: STATUS_EFFECT_TYPES.CONTROL,
        description: '다음 턴에 행동할 수 없습니다.',
        duration: 1,
        effect: {
            canAct: false
        }
    },
    BLEED: {
        id: 'status_bleed',
        name: '출혈',
        type: STATUS_EFFECT_TYPES.DEBUFF,
        description: '이동하거나 공격할 때 추가 피해를 입습니다.',
        duration: 2,
        effect: {
            damageOnAction: 5
        }
    },
    BERSERK: {
        id: 'status_berserk',
        name: '광폭화',
        type: STATUS_EFFECT_TYPES.BUFF,
        description: '공격력이 증가하지만 방어력이 감소합니다.',
        duration: 2,
        effect: {
            attackModifier: 1.2,
            defenseModifier: 0.8
        }
    },

    BATTLE_CRY: {
        id: 'status_battle_cry',
        name: '전투의 외침',
        type: STATUS_EFFECT_TYPES.BUFF,
        description: '공격력이 3턴간 10% 증가합니다.',
        duration: 3,
        effect: {
            attackModifier: 1.1 // 공격력 1.1배 (10% 증가)
        }
    },

    // ✨ 새롭게 추가된 '무장해제' 상태 이상
    DISARMED: {
        id: 'status_disarmed',
        name: '무장해제',
        type: STATUS_EFFECT_TYPES.DISABLED,
        description: '무기를 잃어 아무런 행동도 할 수 없습니다.',
        duration: -1, // -1은 영구 지속
        effect: {
            canAct: false,
            canAttack: false,
            canMove: false
        }
    }
};
