import assert from 'assert';

globalThis.indexedDB = { open: () => ({}) };

const { mercenaryData } = await import('../src/game/data/mercenaries.js');
const { statEngine } = await import('../src/game/utils/StatEngine.js');
const { statusEffectManager } = await import('../src/game/utils/StatusEffectManager.js');
const { combatCalculationEngine } = await import('../src/game/utils/CombatCalculationEngine.js');
const { activeSkills } = await import('../src/game/data/skills/active.js');

console.log('--- 센티넬 클래스 통합 테스트 시작 ---');

// 1. 기본 데이터 및 스탯 검증
const sentinelBase = mercenaryData.sentinel;
assert(sentinelBase, '센티넬 기본 데이터가 존재해야 합니다.');

const finalStats = statEngine.calculateStats(sentinelBase, sentinelBase.baseStats, []);
assert.strictEqual(finalStats.movement, 3, '이동 거리가 3이어야 합니다.');
assert.strictEqual(finalStats.attackRange, 1, '공격 사거리가 1이어야 합니다.');
assert(finalStats.physicalDefense > 18, '물리 방어력이 높아야 합니다.'); // 15 * 1.2 = 18

console.log('✅ 기본 스탯 테스트 통과');

// 2. 클래스 패시브("전방 주시") 로직 검증
const sentinel = {
    uniqueId: 1,
    ...sentinelBase
};
sentinel.team = 'ally';
sentinel.finalStats = finalStats;
sentinel.currentBarrier = 0;
sentinel.maxBarrier = 0;

const attacker = {
    uniqueId: 2,
    instanceName: 'Test Attacker',
    team: 'enemy',
    finalStats: { physicalAttack: 40 },
    currentBarrier: 0,
    maxBarrier: 0
};

// 가짜 공격 상황 시뮬레이션
const passiveEffect = sentinel.classPassive.effect;
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);

let attackerEffects = statusEffectManager.activeEffects.get(attacker.uniqueId) || [];
assert.strictEqual(attackerEffects.length, 1, '전방 주시 디버프가 적용되어야 합니다.');
assert.strictEqual(attackerEffects[0].id, 'sentryDutyDebuff', '디버프 ID가 올바해야 합니다.');

// 스택 중첩 테스트
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel); // 4번째, 최대 스택 유지

attackerEffects = statusEffectManager.activeEffects.get(attacker.uniqueId) || [];
assert.strictEqual(attackerEffects.length, 1, '디버프는 스택이 증가하더라도 하나만 존재해야 합니다.');
assert.strictEqual(attackerEffects[0].stack, 3, '디버프 스택이 3까지 누적되어야 합니다.');

// 데미지 감소 확인
const baseSkill = { name: 'Test Strike', tags: ['물리'], damageMultiplier: 1.0 };
statusEffectManager.activeEffects.clear();
let baseDamage = combatCalculationEngine.calculateDamage(attacker, sentinel, baseSkill).damage;
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);
const reducedDamage = combatCalculationEngine.calculateDamage(attacker, sentinel, baseSkill).damage;
assert.strictEqual(reducedDamage, Math.round(baseDamage * 0.85), '3스택 시 데미지가 15% 감소해야 합니다.');

console.log('✅ 클래스 패시브 테스트 통과');

// 3. 신규 스킬 데이터 검증
const tauntSkill = activeSkills.taunt.NORMAL;
assert(tauntSkill && tauntSkill.cooldown === 3, '도발 스킬의 기본 쿨타임이 3이어야 합니다.');
assert(tauntSkill.selfEffect && tauntSkill.selfEffect.modifiers.stat === 'physicalDefense', '도발 스킬은 방어력 증가 효과를 가져야 합니다.');

const shieldBashSkill = activeSkills.shieldBash.NORMAL;
assert(shieldBashSkill && shieldBashSkill.range === 1, '방패 치기 스킬의 사거리는 1이어야 합니다.');
assert(shieldBashSkill.effect && shieldBashSkill.effect.chance === 0.3, '방패 치기 스킬은 30% 확률로 기절시켜야 합니다.');

console.log('✅ 신규 센티넬 스킬 테스트 통과');
console.log('--- 모든 센티넬 테스트 완료 ---');
