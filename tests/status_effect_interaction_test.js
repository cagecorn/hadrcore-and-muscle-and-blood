// tests/status_effect_interaction_test.js

import assert from 'assert';
import { EFFECT_TYPES } from '../src/game/utils/EffectTypes.js';

// IndexedDB를 사용하지 않는 Node 테스트 환경을 위한 스텁
globalThis.indexedDB = { open: () => ({}) };

const { statusEffectManager } = await import('../src/game/utils/StatusEffectManager.js');

console.log('--- 상태 효과 상호작용 테스트 시작 ---');

// --- 테스트용 Mock 객체 ---
const mockUnit = {
    uniqueId: 10,
    instanceName: 'Test Unit',
    isStunned: false,
    justRecoveredFromStun: false
};

// statusEffectManager가 유닛을 찾을 수 있도록 Mock Simulator 환경 설정
statusEffectManager.setBattleSimulator({
    turnQueue: [mockUnit],
    findUnitById(id) {
        return this.turnQueue.find(u => u.uniqueId === id);
    }
});

// --- 테스트 케이스 실행 ---

// 1. 기절 중첩 테스트
statusEffectManager.activeEffects.clear();
mockUnit.isStunned = false;

// 기절 효과 2개를 추가 (하나는 1턴, 다른 하나는 2턴 지속)
const stunSkill1 = { name: 'Stun 1', effect: { id: 'stun', duration: 1 } };
const stunSkill2 = { name: 'Stun 2', effect: { id: 'stun', duration: 2 } };
statusEffectManager.addEffect(mockUnit, stunSkill1);
statusEffectManager.addEffect(mockUnit, stunSkill2);

assert.strictEqual(mockUnit.isStunned, true, '테스트 1-1 실패: 기절 효과가 적용되지 않았습니다.');

// 1턴 경과
statusEffectManager.onTurnEnd([mockUnit]);
assert.strictEqual(mockUnit.isStunned, true, '테스트 1-2 실패: 기절 중첩 시 조기에 효과가 해제되었습니다.');
console.log('✅ 테스트 1 통과: 기절 효과가 올바르게 중첩됩니다.');

// 2턴 경과 (모든 기절 해제)
statusEffectManager.onTurnEnd([mockUnit]);
assert.strictEqual(mockUnit.isStunned, false, '테스트 1-3 실패: 모든 기절 효과 만료 후에도 상태가 해제되지 않았습니다.');
assert.strictEqual(mockUnit.justRecoveredFromStun, true, '테스트 1-4 실패: 기절에서 막 회복한 상태 플래그가 설정되지 않았습니다.');

// 2. 지속시간 없는 버프 테스트 (Will Guard)
statusEffectManager.activeEffects.clear();
const willGuardSkill = { name: 'Will Guard', effect: { id: 'willGuard' } }; // duration 없음
statusEffectManager.addEffect(mockUnit, willGuardSkill);

// 1턴 경과
statusEffectManager.onTurnEnd([mockUnit]);
const effects = statusEffectManager.activeEffects.get(mockUnit.uniqueId) || [];
assert.strictEqual(effects.length, 1, '테스트 2-1 실패: 지속시간 없는 버프가 조기에 만료되었습니다.');
assert.strictEqual(effects[0].id, 'willGuard', '테스트 2-2 실패: 남아있는 버프가 올바르지 않습니다.');
console.log('✅ 테스트 2 통과: 지속시간 없는 버프가 턴이 지나도 유지됩니다.');


// 3. removeAllBuffs 메서드 테스트
statusEffectManager.activeEffects.clear();
const buffSkill = { name: 'Adrenaline', effect: { id: 'adrenaline', type: EFFECT_TYPES.BUFF, duration: 2 } };
const debuffSkill = { name: 'Poison', effect: { id: 'poison', type: EFFECT_TYPES.DEBUFF, duration: 2 } };
statusEffectManager.addEffect(mockUnit, buffSkill);
statusEffectManager.addEffect(mockUnit, debuffSkill);
const removedCount = statusEffectManager.removeAllBuffs(mockUnit);
assert.strictEqual(removedCount, 1, '테스트 3-1 실패: 버프 제거 개수가 올바르지 않습니다.');
const remaining = statusEffectManager.activeEffects.get(mockUnit.uniqueId) || [];
assert.strictEqual(remaining.length, 1, '테스트 3-2 실패: 디버프가 남아있어야 합니다.');
assert.strictEqual(remaining[0].id, 'poison', '테스트 3-3 실패: 남은 효과가 디버프가 아닙니다.');
console.log('✅ 테스트 3 통과: removeAllBuffs가 버프만 제거합니다.');

statusEffectManager.activeEffects.clear(); // 테스트 후 상태 초기화

console.log('--- 모든 상태 효과 상호작용 테스트 완료 ---');
