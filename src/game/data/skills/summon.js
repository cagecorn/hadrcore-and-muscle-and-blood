// ✨ SKILL_TAGS를 import 합니다.
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

export const summonSkills = {
    summonAncestorPeor: {
        yinYangValue: +4,
        NORMAL: {
            id: 'summonAncestorPeor',
            name: '소환: 선조 페오르',
            type: 'SUMMON',
            // ✨ [수정] tags 배열 추가
            tags: [SKILL_TAGS.SUMMON, SKILL_TAGS.SPECIAL],
            // ✨ [수정] cost(토큰) 제거
            description: '용맹한 전사 선조 페오르를 소환합니다. (소모: 철 3, 대지 3)',
            illustrationPath: 'assets/images/summon/ancestor-peor.png',
            cooldown: 100,
            creatureId: 'ancestorPeor',
            healthCostPercent: 0.1,
            // ✨ [신규] resourceCost 추가 (배열 형태로 여러 자원 소모)
            resourceCost: [
                { type: 'IRON', amount: 3 },
                { type: 'EARTH', amount: 3 }
            ]
        }
    }
};
