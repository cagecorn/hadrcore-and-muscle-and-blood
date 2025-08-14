
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 패시브 스킬 데이터 정의
export const passiveSkills = {
    ironWill: {
        // 등급과 관계없이 공통적으로 사용될 기본 정보
        id: 'ironWill',
        name: '아이언 윌',
        type: 'PASSIVE',
        tags: [SKILL_TAGS.PASSIVE, SKILL_TAGS.WILL],
        cost: 0,
        description: '체력이 감소할수록 받는 데미지가 감소합니다. 최대 {{maxReduction}}%. 등급이 높을수록 매 턴 체력을 회복합니다.',
        illustrationPath: 'assets/images/skills/iron_will.png',

        // 등급별 상세 효과 정의
        NORMAL: {
            maxReduction: 0.30,
            hpRegen: 0
        },
        RARE: {
            maxReduction: 0.30,
            hpRegen: 0.02 // 최대 체력의 2%
        },
        EPIC: {
            maxReduction: 0.30,
            hpRegen: 0.04 // 최대 체력의 4%
        },
        LEGENDARY: {
            maxReduction: 0.30,
            hpRegen: 0.06 // 최대 체력의 6%
        },

        // 순위별 최대 데미지 감소율
        rankModifiers: [0.39, 0.36, 0.33, 0.30]
    },
};
