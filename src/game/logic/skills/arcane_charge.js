import { getEntity, moveTo, applyBuff, findValidTargets } from 'game-engine';

/**
 * '아케인 차지' 스킬 로직
 * @param {string} casterId - 시전자 ID
 * @param {string} targetId - 대상 ID
 */
export function executeArcaneCharge(casterId, targetId) {
  const caster = getEntity(casterId);
  const target = getEntity(targetId);

  if (!caster || !target) return;

  // 1. 타겟 유효성 검사 (3타일 이내)
  const validTargets = findValidTargets(casterId, { maxDistance: 3, type: 'enemy' });
  if (!validTargets.includes(targetId)) {
    console.error('대상이 너무 멀리 있습니다.');
    return;
  }

  // 2. 대상의 인접한 빈 타일로 이동
  moveTo(casterId, { adjacentTo: targetId });

  // 3. 시전자에게 보호막 버프 적용
  const shieldBuff = {
    name: 'Arcane Shield',
    duration: 1, // 1턴 지속
    effects: {
      shield: 10, // 10의 피해를 흡수하는 보호막
    }
  };
  applyBuff(casterId, shieldBuff);

  console.log(`${caster.name}이(가) ${target.name}에게 돌진하고, 10의 마법 보호막을 얻었습니다.`);
}
