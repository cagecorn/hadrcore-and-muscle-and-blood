import assert from 'assert';
import { archetypeAssignmentEngine } from '../src/game/utils/ArchetypeAssignmentEngine.js';
import { mercenaryEquipmentSelector } from '../src/game/utils/MercenaryEquipmentSelector.js';

console.log('--- 🛡️ 드레드노트 아키타입 통합 테스트 시작 ---');

// Math.random을 고정하여 아키타입 할당을 결정론적으로 만듭니다.
const originalRandom = Math.random;
Math.random = () => 0; // 가장 높은 점수를 가진 첫 아키타입 선택

// 1. 드레드노트에 어울리는 MBTI를 가진 가상 용병 생성
const mockDreadnoughtMerc = {
    id: 'warrior',
    instanceName: '철벽의 이반',
    mbti: { I: 80, S: 70, J: 75, F: 60, E: 20, N: 30, T: 25, P: 40 }
};

// 2. 아키타입 할당 엔진 실행
archetypeAssignmentEngine.assignArchetype(mockDreadnoughtMerc);

// 원래 Math.random 복원
Math.random = originalRandom;

// 3. 아키타입 할당 검증
assert.strictEqual(
    mockDreadnoughtMerc.archetype,
    'Dreadnought',
    '테스트 1 실패: 드레드노트 아키타입이 올바르게 할당되지 않았습니다.'
);
console.log('✅ 테스트 1 통과: MBTI 성향에 따라 드레드노트 아키타입이 정확히 할당되었습니다.');

// 4. 장비 선호도 테스트
const genericArmor = { name: '일반 판금 갑옷', stats: { physicalDefense: 20 } };
const dreadnoughtArmor = {
    name: '수호의 판금 갑옷',
    stats: { physicalDefense: 15, allyDamageReduction: 5 }
};
const dreadnoughtMbtiArmor = {
    name: '철옹성의 판금 갑옷',
    stats: { physicalDefense: 15 },
    mbtiEffects: [{ trait: 'I_DREADNOUGHT' }]
};

const genericScore = mercenaryEquipmentSelector._calculateItemScore(mockDreadnoughtMerc, genericArmor);
const dreadnoughtScore = mercenaryEquipmentSelector._calculateItemScore(mockDreadnoughtMerc, dreadnoughtArmor);
const dreadnoughtMbtiScore = mercenaryEquipmentSelector._calculateItemScore(mockDreadnoughtMerc, dreadnoughtMbtiArmor);

console.log(`  - 일반 장비 점수: ${genericScore.toFixed(0)}`);
console.log(`  - 드레드노트 전용 옵션 장비 점수: ${dreadnoughtScore.toFixed(0)}`);
console.log(`  - 드레드노트 전용 MBTI 장비 점수: ${dreadnoughtMbtiScore.toFixed(0)}`);

assert(dreadnoughtScore > genericScore, '테스트 2 실패: 드레드노트가 전용 옵션 장비를 더 선호해야 합니다.');
assert(dreadnoughtMbtiScore > dreadnoughtScore, '테스트 3 실패: 드레드노트가 전용 MBTI 장비를 가장 선호해야 합니다.');

console.log('✅ 테스트 2 & 3 통과: 드레드노트가 자신의 아키타입에 맞는 장비를 더 높게 평가합니다.');
console.log('--- ✅ 모든 드레드노트 테스트 완료 ---');
