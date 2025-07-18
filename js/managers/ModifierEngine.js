import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 게임 내 모든 유닛의 스탯 및 수치 변동(증가, 감소)을 중앙에서 계산하는 엔진입니다.
 */
export class ModifierEngine {
    constructor(statusEffectManager, conditionalManager, modifierLogManager) {
        if (GAME_DEBUG_MODE) console.log("\u2699\uFE0F ModifierEngine initialized. Calculating all bonuses and penalties.");
        this.statusEffectManager = statusEffectManager;
        this.conditionalManager = conditionalManager;
        this.modifierLogManager = modifierLogManager;
    }

    /**
     * 특정 유닛의 최종 공격력 증폭 배율을 계산합니다. (예: 1.0 = 100%, 1.2 = 120%)
     * @param {string} unitId - 유닛의 ID
     * @returns {number} - 최종 공격력 배율
     */
    getAttackMultiplier(unitId) {
        let multiplier = 1.0;
        const modifiers = [];
        let formula = "1.0";
        const activeEffects = this.statusEffectManager?.getUnitActiveEffects(unitId);

        if (activeEffects) {
            for (const [effectId, effectWrapper] of activeEffects.entries()) {
                const modValue = effectWrapper.effectData.effect.attackModifier;
                if (modValue) {
                    multiplier *= modValue;
                    modifiers.push({ source: effectId, value: modValue, operation: '×' });
                    formula += ` * Status[${modValue}]`;
                }
            }
        }

        this.modifierLogManager.log(`'${unitId}' Attack Multiplier`, {
            baseValue: 1.0,
            modifiers,
            formula,
            finalValue: multiplier
        });

        return multiplier;
    }

    /**
     * 특정 유닛의 최종 방어력(피해 감소) 수치를 계산합니다. (예: 0.15 = 15% 피해 감소)
     * @param {string} unitId - 유닛의 ID
     * @returns {number} - 최종 피해 감소율
     */
    getDamageReduction(unitId) {
        let totalReduction = 0;
        const modifiers = [];
        let formula = "0";

        const conditionalReduction = this.conditionalManager.getDamageReduction(unitId);
        if (conditionalReduction > 0) {
            totalReduction += conditionalReduction;
            modifiers.push({ source: 'Iron Will', value: conditionalReduction, operation: '+' });
            formula += ` + Passive[${conditionalReduction.toFixed(2)}]`;
        }

        const activeEffects = this.statusEffectManager?.getUnitActiveEffects(unitId);
        if (activeEffects) {
            for (const [effectId, effectWrapper] of activeEffects.entries()) {
                const effectReduction = effectWrapper.effectData.effect?.statModifiers?.damageReduction;
                if (effectReduction) {
                    totalReduction += effectReduction;
                    modifiers.push({ source: effectId, value: effectReduction, operation: '+' });
                    formula += ` + Status[${effectReduction}]`;
                }
            }
        }

        this.modifierLogManager.log(`'${unitId}' Damage Reduction`, {
            baseValue: 0,
            modifiers,
            formula,
            finalValue: totalReduction
        });

        return totalReduction;
    }
}
