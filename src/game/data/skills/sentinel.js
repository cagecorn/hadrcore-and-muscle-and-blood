import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

export const sentinelSkills = {
    sentryDuty: {
        id: 'sentryDuty',
        name: '전방 주시',
        type: 'PASSIVE',
        tags: [SKILL_TAGS.PASSIVE, SKILL_TAGS.GUARDIAN],
        description: '센티넬에게 공격받은 적은 전투가 끝날 때까지 [전방 주시] 디버프를 받습니다. 이 디버프는 센티넬에게 가하는 피해량을 5% 감소시키며, 최대 3번까지 중첩됩니다.',
        illustrationPath: 'assets/images/skills/eye-of-guard.png',
        iconPath: 'assets/images/skills/eye-of-guard.png', // 패시브 상세 정보창 아이콘
        effect: {
            id: 'sentryDutyDebuff',
            type: EFFECT_TYPES.DEBUFF,
            duration: 99, // 전투 내내 지속
            maxStacks: 3,
            modifiers: [
                {
                    stat: 'damageToSentinel', // 센티넬에게 가하는 데미지
                    type: 'percentage',
                    value: -0.05
                }
            ]
        }
    }
};
