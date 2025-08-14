import { getEntity, applyDamage, findEntitiesInRadius } from 'game-engine';

/**
 * '포스 언리쉬드' 스킬 로직
 * @param {string} casterId - 시전자 ID
 */
export function executeForceUnleashed(casterId) {
  const caster = getEntity(casterId);
  if (!caster) return;

  // 1. 시전자 주변 2타일 내의 모든 '적' 찾기
  const targets = findEntitiesInRadius(casterId, 2, 'enemy');

  console.log(`${caster.name}이(가) 포스 언리쉬드를 시전합니다!`);

  // 2. 찾은 모든 적에게 피해 적용
  targets.forEach(targetId => {
    const damage = 12 + Math.floor(caster.stats.intelligence * 0.7); // 지능 계수 추가
    console.log(`  - ${getEntity(targetId).name}에게 ${damage}의 마법 피해!`);
    applyDamage(targetId, damage, 'magic');
  });
}
