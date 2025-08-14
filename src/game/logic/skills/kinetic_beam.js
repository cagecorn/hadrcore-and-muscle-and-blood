import { getEntity, applyDamage, pushEntity, findEntitiesInLine } from 'game-engine';

/**
 * '키네틱 빔' 스킬 로직
 * @param {string} casterId - 시전자 ID
 * @param {object} direction - 빔 방향 (예: {x: 1, y: 0})
 */
export function executeKineticBeam(casterId, direction) {
  const caster = getEntity(casterId);
  if (!caster) return;

  // 1. 지정한 방향으로 일직선상의 모든 '적' 찾기
  const targets = findEntitiesInLine(casterId, direction);

  console.log(`${caster.name}이(가) 키네틱 빔을 발사합니다!`);

  // 2. 찾은 모든 적에게 순차적으로 피해 및 넉백 적용
  targets.forEach(targetId => {
    const target = getEntity(targetId);
    const damage = 10 + Math.floor(caster.stats.intelligence * 0.6); // 지능 계수 추가

    console.log(`  - ${target.name}이(가) ${damage}의 피해를 받고 밀려납니다.`);
    applyDamage(targetId, damage, 'magic');
    pushEntity(targetId, direction, 1); // 지정된 방향으로 1타일 밀기
  });
}
