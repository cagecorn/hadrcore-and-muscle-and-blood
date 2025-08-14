import assert from 'assert';
import { archetypeAssignmentEngine } from '../src/game/utils/ArchetypeAssignmentEngine.js';
import { mercenaryEquipmentSelector } from '../src/game/utils/MercenaryEquipmentSelector.js';

console.log('--- 🛡️ 스펠브레이커 아키타입 통합 테스트 시작 ---');

const originalRandom = Math.random;
Math.random = () => 0.9;
archetypeAssignmentEngine.archetypeProfiles = {
    Spellbreaker: archetypeAssignmentEngine.archetypeProfiles.Spellbreaker,
};

const mockSpellbreaker = {
    id: 'warrior',
    instanceName: '침묵의 가렌',
    mbti: { N: 90, T: 90, J: 0, I: 0, E: 0, S: 0, F: 0, P: 0 }
};

archetypeAssignmentEngine.assignArchetype(mockSpellbreaker);
Math.random = originalRandom;

assert.strictEqual(
    mockSpellbreaker.archetype,
    'Spellbreaker',
    '스펠브레이커 아키타입이 올바르게 할당되지 않았습니다.'
);
console.log('✅ 테스트 1 통과: MBTI 성향에 따라 스펠브레이커 아키타입이 정확히 할당되었습니다.');

const genericArmor = { name: '일반 방패', stats: { magicDefense: 5 } };
const spellbreakerArmor = {
    name: '침묵의 방패',
    stats: { magicDefense: 4, cooldownReduction: 1 }
};
const spellbreakerMbtiArmor = {
    name: '결계의 방패',
    stats: { magicDefense: 4 },
    mbtiEffects: [{ trait: 'N_SPELLBREAKER' }]
};

const genericScore = mercenaryEquipmentSelector._calculateItemScore(mockSpellbreaker, genericArmor);
const spellbreakerScore = mercenaryEquipmentSelector._calculateItemScore(mockSpellbreaker, spellbreakerArmor);
const spellbreakerMbtiScore = mercenaryEquipmentSelector._calculateItemScore(mockSpellbreaker, spellbreakerMbtiArmor);

console.log(`  - 일반 장비 점수: ${genericScore.toFixed(0)}`);
console.log(`  - 스펠브레이커 전용 옵션 장비 점수: ${spellbreakerScore.toFixed(0)}`);
console.log(`  - 스펠브레이커 전용 MBTI 장비 점수: ${spellbreakerMbtiScore.toFixed(0)}`);

assert(spellbreakerScore >= genericScore, '스펠브레이커가 전용 옵션 장비를 더 선호해야 합니다.');
assert(spellbreakerMbtiScore >= spellbreakerScore, '스펠브레이커가 전용 MBTI 장비를 가장 선호해야 합니다.');

console.log('--- ✅ 모든 스펠브레이커 테스트 완료 ---');
