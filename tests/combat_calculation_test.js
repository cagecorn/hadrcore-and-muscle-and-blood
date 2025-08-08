// tests/combat_calculation_test.js

import assert from 'assert';

// Node 환경에서 IndexedDB를 사용하지 않으므로 간단한 스텁을 제공합니다.
globalThis.indexedDB = { open: () => ({}) };

const { combatCalculationEngine } = await import('../src/game/utils/CombatCalculationEngine.js');
const { statusEffectManager } = await import('../src/game/utils/StatusEffectManager.js');

console.log('--- 전투 계산 엔진 통합 테스트 시작 ---');

// --- 테스트용 Mock 객체 및 데이터 ---

// Mock 공격자 (전사)
const mockWarrior = {
    uniqueId: 1,
    instanceName: 'Test Warrior',
    team: 'ally',
    finalStats: { physicalAttack: 20, magicAttack: 5, criticalChance: 10 },
    currentBarrier: 0,
    maxBarrier: 0
};

// Mock 마법 공격자 (나노맨서)
const mockNanomancer = {
    uniqueId: 2,
    instanceName: 'Test Nanomancer',
    team: 'ally',
    finalStats: { physicalAttack: 5, magicAttack: 25, criticalChance: 5 },
    currentBarrier: 0,
    maxBarrier: 0
};

// Mock 방어자 (좀비)
const mockZombie = {
    uniqueId: 3,
    instanceName: 'Test Zombie',
    team: 'enemy',
    finalStats: { physicalDefense: 10, magicDefense: 5 },
    currentHp: 100
};

// Mock 스킬 데이터
const physicalSkill = { name: 'Test Strike', tags: ['물리'], damageMultiplier: 1.0 };
const magicSkill = { name: 'Test Bolt', tags: ['마법'], damageMultiplier: 1.0 };

// --- 테스트 케이스 실행 ---

// 1. 기본 물리 데미지 테스트
statusEffectManager.activeEffects.clear(); // 테스트 전 상태 초기화
let result = combatCalculationEngine.calculateDamage(mockWarrior, mockZombie, physicalSkill);
// 예상 데미지: 20 * (100 / (100 + 10)) ≈ 18.18 → 반올림 18
assert.strictEqual(result.damage, 18, '테스트 1 실패: 기본 물리 데미지 계산이 올바르지 않습니다.');
console.log('✅ 테스트 1 통과: 기본 물리 데미지 계산이 정확합니다.');

// 2. 마법 데미지 테스트 (이전 버그 수정 검증)
result = combatCalculationEngine.calculateDamage(mockNanomancer, mockZombie, magicSkill);
// 예상 데미지: 25 * (100 / (100 + 5)) ≈ 23.81 → 반올림 24
assert.strictEqual(result.damage, 24, '테스트 2 실패: 마법 데미지가 마법 공격력/방어력으로 계산되지 않았습니다.');
console.log('✅ 테스트 2 통과: 마법 데미지 계산이 정확합니다.');

// 3. 공격자 버프 적용 테스트 (이전 버그 수정 검증)
// '숯돌 갈기'와 유사한 +50% 공격력 버프를 전사에게 적용
const attackBuff = {
    id: 'testAttackBuff',
    sourceSkillName: 'Test Buff',
    type: 'BUFF',
    duration: 1,
    modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.50 }
};
statusEffectManager.activeEffects.set(mockWarrior.uniqueId, [attackBuff]);

result = combatCalculationEngine.calculateDamage(mockWarrior, mockZombie, physicalSkill);
// 예상 데미지: (20 * 1.5) * (100 / (100 + 10)) ≈ 27.27 → 반올림 27
assert.strictEqual(result.damage, 27, '테스트 3 실패: 공격자 버프가 데미지 계산에 적용되지 않았습니다.');
console.log('✅ 테스트 3 통과: 공격력 버프가 정상적으로 적용됩니다.');

statusEffectManager.activeEffects.clear(); // 테스트 후 상태 초기화

console.log('--- 모든 전투 계산 테스트 완료 ---');
