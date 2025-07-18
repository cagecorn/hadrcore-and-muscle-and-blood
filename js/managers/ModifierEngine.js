import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 게임 내 모든 유닛의 스탯 및 수치 변동(증가, 감소)을 중앙에서 계산하는 엔진입니다.
 */
export class ModifierEngine {
    constructor(statusEffectManager, conditionalManager) {
        if (GAME_DEBUG_MODE) console.log("\u2699\uFE0F ModifierEngine initialized. Calculating all bonuses and penalties.");
        this.statusEffectManager = statusEffectManager;
        this.conditionalManager = conditionalManager;
    }

    /**
     * 특정 유닛의 최종 공격력 증폭 배율을 계산합니다. (예: 1.0 = 100%, 1.2 = 120%)
     * @param {string} unitId - 유닛의 ID
     * @returns {number} - 최종 공격력 배율
     */
    getAttackMultiplier(unitId) {
        let multiplier = 1.0;
        const activeEffects = this.statusEffectManager?.getUnitActiveEffects(unitId);

        if (activeEffects) {
            for (const [effectId, effectWrapper] of activeEffects.entries()) {
                if (effectWrapper.effectData.effect.attackModifier) {
                    multiplier *= effectWrapper.effectData.effect.attackModifier;
                    if (GAME_DEBUG_MODE) console.log(`[ModifierEngine] Applying '${effectId}' attack modifier: ${effectWrapper.effectData.effect.attackModifier}. New multiplier: ${multiplier.toFixed(2)}`);
                }
            }
        }
        // 향후 장비나 퍽으로 인한 증폭 로직도 여기에 추가할 수 있습니다.
        return multiplier;
    }

    /**
     * 특정 유닛의 최종 방어력(피해 감소) 수치를 계산합니다. (예: 0.15 = 15% 피해 감소)
     * @param {string} unitId - 유닛의 ID
     * @returns {number} - 최종 피해 감소율
     */
    getDamageReduction(unitId) {
        let totalReduction = 0;

        // 1. '아이언 윌' 같은 조건부 패시브로 인한 피해 감소
        const conditionalReduction = this.conditionalManager.getDamageReduction(unitId);
        if (conditionalReduction > 0) {
            totalReduction += conditionalReduction;
            if (GAME_DEBUG_MODE) console.log(`[ModifierEngine] Applying conditional reduction (Iron Will): ${conditionalReduction.toFixed(2)}. Total: ${totalReduction.toFixed(2)}`);
        }

        // 2. '스톤 스킨' 같은 상태 효과로 인한 피해 감소
        const activeEffects = this.statusEffectManager?.getUnitActiveEffects(unitId);
        if (activeEffects) {
            for (const [effectId, effectWrapper] of activeEffects.entries()) {
                const effectReduction = effectWrapper.effectData.effect?.statModifiers?.damageReduction;
                if (effectReduction) {
                    totalReduction += effectReduction;
                    if (GAME_DEBUG_MODE) console.log(`[ModifierEngine] Applying '${effectId}' reduction: ${effectReduction}. Total: ${totalReduction.toFixed(2)}`);
                }
            }
        }
        
        // 향후 장비나 퍽으로 인한 감소 로직도 여기에 추가할 수 있습니다.
        return totalReduction;
    }
}
