import { getEntity, applyDamage } from 'game-engine';

/**
 * '마나 스트라이크' 스킬 로직
 * @param {string} casterId - 시전자 ID
 * @param {string} targetId - 대상 ID
 */
export function executeManaStrike(casterId, targetId) {
  const caster = getEntity(casterId);
  const target = getEntity(targetId);

  if (!caster || !target) return;

  // 하이브리드 피해 계산 (힘의 50% + 지능의 50%)
  const hybridDamage = Math.floor(caster.stats.strength * 0.5) +
    Math.floor(caster.stats.intelligence * 0.5) + 8; // 기본 피해 8 추가

  console.log(`${caster.name}이(가) ${target.name}에게 마나 스트라이크로 ${hybridDamage}의 하이브리드 피해를 입혔습니다.`);
  applyDamage(targetId, hybridDamage, 'hybrid');
}
