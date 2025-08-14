import { archetypes } from '../data/archetypes/index.js';

/**
 * 용병의 MBTI 성향에 따라 아키타입(하위 클래스)을 **확률적으로** 결정하는 엔진
 */
class ArchetypeAssignmentEngine {
    constructor() {
        // 기본 아키타입 MBTI 프로필
        this.archetypeProfiles = {
            Dreadnought: { I: 3, S: 2, J: 2, F: 1 },
            Frostweaver: { I: 3, N: 3, T: 1 },
            Aquilifer: { E: 1, F: 3, J: 1 },
            Trapmaster: { N: 3, P: 2, T: 1 },
            Executioner: { I: 2, S: 1, P: 3 },
            Dreadbringer: { I: 2, N: 2, T: 2, F: 1 }
        };
        // 데이터 파일에서 제공되는 값으로 덮어쓰기
        for (const [key, data] of Object.entries(archetypes)) {
            this.archetypeProfiles[key] = data.mbtiProfile;
        }
    }

    /**
     * 용병의 MBTI 데이터를 분석하여 가장 적합한 아키타입을 결정하고 할당합니다.
     * @param {object} mercenary - 아키타입을 할당할 용병 객체
     */
    assignArchetype(mercenary) {
        const scoredArchetypes = [];
        let totalScore = 0;

        for (const [archetype, profile] of Object.entries(this.archetypeProfiles)) {
            let currentScore = 0;
            for (const [trait, weight] of Object.entries(profile)) {
                currentScore += (mercenary.mbti[trait] || 0) * weight;
            }

            if (currentScore > 0) {
                scoredArchetypes.push({ archetype, score: currentScore });
                totalScore += currentScore;
            }
        }

        // --- ▼ [핵심 로직] 가중치 기반 랜덤 선택 ▼ ---
        let random = Math.random() * totalScore;
        let finalArchetype =
            scoredArchetypes.length > 0
                ? scoredArchetypes[scoredArchetypes.length - 1].archetype
                : Object.keys(this.archetypeProfiles)[0];

        for (const scored of scoredArchetypes) {
            if (random < scored.score) {
                finalArchetype = scored.archetype;
                break;
            }
            random -= scored.score;
        }
        // --- ▲ [핵심 로직] 가중치 기반 랜덤 선택 ▲ ---

        // 용병 객체에 아키타입을 직접 기록합니다.
        mercenary.archetype = finalArchetype;
        console.log(`[ArchetypeEngine] ${mercenary.instanceName}(${mercenary.id})의 아키타입이 [${finalArchetype}]으로 결정되었습니다.`);
    }
}

export const archetypeAssignmentEngine = new ArchetypeAssignmentEngine();
