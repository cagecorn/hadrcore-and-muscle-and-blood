import assert from 'assert';

globalThis.indexedDB = { open: () => ({}) };

const { combatCalculationEngine } = await import('../src/game/utils/CombatCalculationEngine.js');
const { activeSkills } = await import('../src/game/data/skills/active.js');
const { statusEffectManager } = await import('../src/game/utils/StatusEffectManager.js');
const { comboManager } = await import('../src/game/utils/ComboManager.js');

// 공격자: 약점 포착 패시브를 가진 고스트
const attacker = {
    uniqueId: 1,
    classPassive: { id: 'weaknessDetection' },
    finalStats: { physicalAttack: 100, hp: 100, criticalChance: 0, accuracy: 100 },
    currentHp: 100
};

const defenderBase = {
    uniqueId: 2,
    finalStats: { physicalDefense: 0, hp: 100, blockChance: 0, evasion: 0 },
    currentHp: 100
};

// 테스트 편의를 위해 데미지 배율을 1로 고정
const skill = { ...activeSkills.assassinate.NORMAL, damageMultiplier: 1 };

// 1. 체력 40%에서 약점 포착만 적용
const originalRandom = Math.random;
Math.random = () => 0.99;
statusEffectManager.activeEffects.clear();
comboManager.startTurn(attacker.uniqueId);


let defender = { ...defenderBase, currentHp: 40 };
const baseResult = combatCalculationEngine.calculateDamage(attacker, defender, skill);
assert.strictEqual(baseResult.damage, 125, 'Weakness Detection passive should boost damage by 25% at or below 40% HP.');

// 2. 체력 30%에서 처형과 약점 포착 모두 적용
defender = { ...defenderBase, currentHp: 30 };
const executeResult = combatCalculationEngine.calculateDamage(attacker, defender, skill);
assert(executeResult.damage > baseResult.damage * 1.5, 'Execute tag should significantly increase damage when target HP is low.');

Math.random = originalRandom;

console.log('Ghost skill integration test passed.');
