import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

export const darkKnightSkills = {
    despairAura: {
        id: 'despairAura',
        name: '절망의 오라',
        type: 'PASSIVE',
        tags: [SKILL_TAGS.PASSIVE, SKILL_TAGS.AURA, SKILL_TAGS.DEBUFF, SKILL_TAGS.DARK],
        description: '다크나이트의 주위 3타일 내에 있는 모든 적의 공격력과 방어력을 5% 감소시킵니다.',
        illustrationPath: 'assets/images/skills/curse-of-darkness.png',
        iconPath: 'assets/images/skills/curse-of-darkness.png', // 패시브 상세 정보창 아이콘
        effect: {
            id: 'despairAuraDebuff',
            type: EFFECT_TYPES.DEBUFF,
            duration: 1,
            isAura: true,
            radius: 3,
            modifiers: [
                { stat: 'physicalAttackPercentage', type: 'percentage', value: -0.05 },
                { stat: 'magicAttackPercentage', type: 'percentage', value: -0.05 },
                { stat: 'physicalDefensePercentage', type: 'percentage', value: -0.05 },
                { stat: 'magicDefensePercentage', type: 'percentage', value: -0.05 }
            ]
        }
    }
};

