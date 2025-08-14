import assert from 'assert';
import { archetypeAssignmentEngine } from '../src/game/utils/ArchetypeAssignmentEngine.js';
import { mercenaryEquipmentSelector } from '../src/game/utils/MercenaryEquipmentSelector.js';

console.log('--- 🗡️ 버서커 아키타입 통합 테스트 시작 ---');

const originalRandom = Math.random;
Math.random = () => 0.5;
archetypeAssignmentEngine.archetypeProfiles = {
    Berserker: archetypeAssignmentEngine.archetypeProfiles.Berserker,
};

const mockBerserker = {
    id: 'warrior',
    instanceName: '광전사 로그',
    mbti: { E: 90, P: 90, T: 0, I: 0, S: 0, N: 0, F: 0, J: 0 }
};

archetypeAssignmentEngine.assignArchetype(mockBerserker);
Math.random = originalRandom;

assert.strictEqual(
    mockBerserker.archetype,
    'Berserker',
    '버서커 아키타입이 올바르게 할당되지 않았습니다.'
);
console.log('✅ 테스트 1 통과: MBTI 성향에 따라 버서커 아키타입이 정확히 할당되었습니다.');

const genericWeapon = { name: '일반 도끼', stats: { physicalAttack: 5 } };
const berserkerWeapon = {
    name: '광폭의 도끼',
    stats: { physicalAttack: 8, lifeSteal: 3 }
};
const berserkerMbtiWeapon = {
    name: '격노의 도끼',
    stats: { physicalAttack: 8 },
    mbtiEffects: [{ trait: 'E_BERSERKER' }]
};

const genericScore = mercenaryEquipmentSelector._calculateItemScore(mockBerserker, genericWeapon);
const berserkerScore = mercenaryEquipmentSelector._calculateItemScore(mockBerserker, berserkerWeapon);
const berserkerMbtiScore = mercenaryEquipmentSelector._calculateItemScore(mockBerserker, berserkerMbtiWeapon);

console.log(`  - 일반 장비 점수: ${genericScore.toFixed(0)}`);
console.log(`  - 버서커 전용 옵션 장비 점수: ${berserkerScore.toFixed(0)}`);
console.log(`  - 버서커 전용 MBTI 장비 점수: ${berserkerMbtiScore.toFixed(0)}`);

assert(berserkerScore >= genericScore, '버서커가 전용 옵션 장비를 더 선호해야 합니다.');
assert(berserkerMbtiScore > berserkerScore, '버서커가 전용 MBTI 장비를 가장 선호해야 합니다.');

console.log('--- ✅ 모든 버서커 테스트 완료 ---');
