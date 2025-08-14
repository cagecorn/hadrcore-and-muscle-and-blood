import assert from 'assert';
import { archetypeAssignmentEngine } from '../src/game/utils/ArchetypeAssignmentEngine.js';
import { mercenaryEquipmentSelector } from '../src/game/utils/MercenaryEquipmentSelector.js';

console.log('--- 🏳️ 아퀼리퍼 아키타입 통합 테스트 시작 ---');

// 아키타입 할당을 결정론적으로 만들기 위해 Math.random 고정
const originalRandom = Math.random;
// 다른 아키타입의 추가로 확률 분포가 바뀌어 범위를 재조정함
Math.random = () => 0.2; // 아퀼리퍼 확률 구간에 해당하는 값

// 1. 아퀼리퍼에 어울리는 MBTI를 가진 가상 용병 생성
const mockAquiliferMerc = {
    id: 'paladin',
    instanceName: '빛의 전령',
    mbti: { E: 80, F: 80, J: 80, I: 0, S: 0, N: 0, T: 0, P: 0 }
};

// 2. 아키타입 할당 엔진 실행
archetypeAssignmentEngine.assignArchetype(mockAquiliferMerc);

// Math.random 복원
Math.random = originalRandom;

// 3. 아키타입 할당 검증
assert.strictEqual(
    mockAquiliferMerc.archetype,
    'Aquilifer',
    '테스트 1 실패: 아퀼리퍼 아키타입이 올바르게 할당되지 않았습니다.'
);
console.log('✅ 테스트 1 통과: MBTI 성향에 따라 아퀼리퍼 아키타입이 정확히 할당되었습니다.');

// 4. 장비 선호도 테스트
const genericArmor = { name: '일반 갑옷', stats: { physicalDefense: 5 } };
const aquiliferArmor = { name: '지휘관의 갑옷', stats: { auraRadius: 1 } };
const aquiliferMbtiArmor = {
    name: '지휘관의 신념 갑옷',
    stats: {},
    mbtiEffects: [{ trait: 'F_AQUILIFER' }]
};

const genericScore = mercenaryEquipmentSelector._calculateItemScore(mockAquiliferMerc, genericArmor);
const aquiliferScore = mercenaryEquipmentSelector._calculateItemScore(mockAquiliferMerc, aquiliferArmor);
const aquiliferMbtiScore = mercenaryEquipmentSelector._calculateItemScore(mockAquiliferMerc, aquiliferMbtiArmor);

console.log(`  - 일반 장비 점수: ${genericScore.toFixed(0)}`);
console.log(`  - 아퀼리퍼 전용 옵션 장비 점수: ${aquiliferScore.toFixed(0)}`);
console.log(`  - 아퀼리퍼 전용 MBTI 장비 점수: ${aquiliferMbtiScore.toFixed(0)}`);

assert(aquiliferScore > genericScore, '테스트 2 실패: 아퀼리퍼가 전용 옵션 장비를 더 선호해야 합니다.');
assert(aquiliferMbtiScore > aquiliferScore, '테스트 3 실패: 아퀼리퍼가 전용 MBTI 장비를 가장 선호해야 합니다.');

console.log('✅ 테스트 2 & 3 통과: 아퀼리퍼가 자신의 아키타입에 맞는 장비를 더 높게 평가합니다.');
console.log('--- ✅ 모든 아퀼리퍼 테스트 완료 ---');

