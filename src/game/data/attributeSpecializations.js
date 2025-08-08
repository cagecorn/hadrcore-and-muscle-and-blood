import { SKILL_TAGS } from '../utils/SkillTagManager.js';
import { EFFECT_TYPES } from '../utils/EffectTypes.js';

/**
 * 용병에게 무작위로 부여되는 '속성 특화' 목록입니다.
 * 각 속성은 고유한 태그와 중첩 가능한 보너스 효과를 가집니다.
 */
export const attributeSpecializations = [
    {
        tag: SKILL_TAGS.FIRE,
        description: "'불' 태그 스킬 사용 시, 1턴간 최종 데미지 3% 증가 (중첩 가능)",
        effect: {
            id: 'fireAttributeBonus',
            type: EFFECT_TYPES.BUFF,
            duration: 1,
            modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.03 }
        }
    },
    {
        tag: SKILL_TAGS.WATER,
        description: "'물' 태그 스킬 사용 시, 1턴간 최대 체력 4% 증가 (중첩 가능)",
        effect: {
            id: 'waterAttributeBonus',
            type: EFFECT_TYPES.BUFF,
            duration: 1,
            modifiers: { stat: 'hp', type: 'percentage', value: 0.04 }
        }
    },
    {
        tag: SKILL_TAGS.EARTH,
        description: "'대지' 태그 스킬 사용 시, 1턴간 받는 데미지 2% 감소 (중첩 가능)",
        effect: {
            id: 'earthAttributeBonus',
            type: EFFECT_TYPES.BUFF,
            duration: 1,
            modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.02 }
        }
    },
    {
        tag: SKILL_TAGS.WIND,
        description: "'바람' 태그 스킬 사용 시, 1턴간 회피율 3% 증가 (중첩 가능)",
        effect: {
            id: 'windAttributeBonus',
            type: EFFECT_TYPES.BUFF,
            duration: 1,
            modifiers: { stat: 'physicalEvadeChance', type: 'percentage', value: 0.03 }
        }
    },
    {
        tag: SKILL_TAGS.LIGHT,
        description: "'빛' 태그 스킬 사용 시, 1턴간 치유량 5% 증가 (중첩 가능)",
        effect: {
            id: 'lightAttributeBonus',
            type: EFFECT_TYPES.BUFF,
            duration: 1,
            modifiers: { stat: 'healMultiplier', type: 'percentage', value: 0.05 }
        }
    },
    {
        tag: SKILL_TAGS.DARK,
        description: "'어둠' 태그 스킬 사용 시, 1턴간 상태이상 적용 확률 5% 증가 (중첩 가능)",
        effect: {
            id: 'darkAttributeBonus',
            type: EFFECT_TYPES.BUFF,
            duration: 1,
            modifiers: { stat: 'statusEffectApplication', type: 'percentage', value: 0.05 }
        }
    }
];
