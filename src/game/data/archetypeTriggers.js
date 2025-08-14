/**
 * MBTI 조합에 따라 특정 아키타입을 선택하도록 유도하는 트리거 데이터.
 * 클래스별로 조건을 명시하며, 순서가 앞일수록 우선 적용됩니다.
 */
export const archetypeTriggers = {
    NANOMANCER: [
        // 기존 프로스트위버는 첫 번째 순서(기본값)로 유지
        { archetype: 'FROSTWEAVER', mbti: ['I', 'T'] },
        // 신규 아키타입 추가
        { archetype: 'ARCANE_BLADE', mbti: ['E', 'S'] },
        { archetype: 'FORCE_MAJOR', mbti: ['N', 'J'] },
    ],
    WARRIOR: [
        { archetype: 'DREADNOUGHT', mbti: ['I', 'S'] },
        { archetype: 'BERSERKER', mbti: ['E', 'P'] },
        { archetype: 'SPELLBREAKER', mbti: ['N', 'T'] },
    ],
    // ... 추가 클래스
};

