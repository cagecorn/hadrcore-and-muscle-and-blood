import { EFFECT_TYPES } from '../../utils/EffectTypes.js';

export const strategySkills = {
    chargeOrder: {
        yinYangValue: +3,
        NORMAL: {
            id: 'chargeOrder',
            name: '돌격 명령',
            type: 'STRATEGY',
            cost: 3,
            targetType: 'self',
            description: '모든 아군에게 3턴간 공격력 10% 증가 버프를 부여합니다. 전투 당 한 번만 사용할 수 있습니다.',
            illustrationPath: 'assets/images/skills/charge-order.png',
            cooldown: 100,
            range: 0,
            effect: {
                id: 'chargeOrderBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                isGlobal: true,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        }
    }
};
