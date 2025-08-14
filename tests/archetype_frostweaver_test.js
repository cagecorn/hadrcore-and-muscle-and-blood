import assert from 'assert';
import { archetypeAssignmentEngine } from '../src/game/utils/ArchetypeAssignmentEngine.js';
import { mercenaryEquipmentSelector } from '../src/game/utils/MercenaryEquipmentSelector.js';

console.log('--- ❄️ 프로스트위버 아키타입 통합 테스트 시작 ---');

// Math.random을 고정하여 아키타입 할당을 결정론적으로 만듭니다.
const originalRandom = Math.random;
// 아키타입이 늘어나며 확률 분포가 변경되어 값 재조정
Math.random = () => 0.2; // 프로스트위버 확률 구간에 해당하는 값

// 1. 프로스트위버에 어울리는 MBTI를 가진 가상 용병 생성
const mockFrostweaverMerc = {
    id: 'nanomancer',
    instanceName: '냉혹의 엘사',
    mbti: { I: 85, N: 75, T: 60, P: 55, E: 15, S: 25, F: 40, J: 45 }
};

// 2. 아키타입 할당 엔진 실행
archetypeAssignmentEngine.assignArchetype(mockFrostweaverMerc);

// Math.random 복원
Math.random = originalRandom;

// 3. 아키타입 할당 검증
assert.strictEqual(
    mockFrostweaverMerc.archetype,
    'Frostweaver',
    '테스트 1 실패: 프로스트위버 아키타입이 올바르게 할당되지 않았습니다.'
);
console.log('✅ 테스트 1 통과: MBTI 성향에 따라 프로스트위버 아키타입이 정확히 할당되었습니다.');

// 4. 장비 선호도 테스트
const genericStaff = { name: '마력의 지팡이', stats: { magicAttack: 20 } };
const frostweaverStaff = {
    name: '빙결의 지팡이',
    stats: { magicAttack: 15, frostDamage: 12 }
};
const frostweaverMbtiStaff = {
    name: '서리 고문서',
    stats: { magicAttack: 15 },
    mbtiEffects: [{ trait: 'N_FROSTWEAVER' }]
};

const genericScore = mercenaryEquipmentSelector._calculateItemScore(mockFrostweaverMerc, genericStaff);
const frostweaverScore = mercenaryEquipmentSelector._calculateItemScore(mockFrostweaverMerc, frostweaverStaff);
const frostweaverMbtiScore = mercenaryEquipmentSelector._calculateItemScore(mockFrostweaverMerc, frostweaverMbtiStaff);

console.log(`  - 일반 장비 점수: ${genericScore.toFixed(0)}`);
console.log(`  - 프로스트위버 전용 옵션 장비 점수: ${frostweaverScore.toFixed(0)}`);
console.log(`  - 프로스트위버 전용 MBTI 장비 점수: ${frostweaverMbtiScore.toFixed(0)}`);

assert(frostweaverScore > genericScore, '테스트 2 실패: 프로스트위버가 전용 옵션 장비를 더 선호해야 합니다.');
assert(frostweaverMbtiScore > frostweaverScore, '테스트 3 실패: 프로스트위버가 전용 MBTI 장비를 가장 선호해야 합니다.');

console.log('✅ 테스트 2 & 3 통과: 프로스트위버가 자신의 아키타입에 맞는 장비를 더 높게 평가합니다.');
console.log('--- ✅ 모든 프로스트위버 테스트 완료 ---');
