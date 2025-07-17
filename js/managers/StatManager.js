// js/managers/StatManager.js

export class StatManager {
    constructor(valorEngine, weightEngine) {
        console.log("\uD83D\uDCCA StatManager initialized. Ready to calculate unit statistics. \uD83D\uDCCA");
        this.valorEngine = valorEngine;
        this.weightEngine = weightEngine;
    }

    /**
     * \uC720\uB2DB\uC758 \uAE30\uBCF8 \uC2A4\uD0EF\uACFC \uCD94\uAC00 \uD6A8\uACFC\uB97C \uAE30\uBCF8\uC73C\uB85C \uCD5C\uC885 \uACC4\uC0B0\uB41C \uC2A4\uD0EF\uC744 \uBC18\uD558\uC5EC \uBC18\uD558\uC5EC \uBC30\uB9AC\uC5B4\uC640 \uBB34\uAC8C \uC601\uC5ED\uC744 \uD569\uC131\uD569\uB2C8\uB2E4.
     * @param {object} unitData - \uC720\uB2DB\uC758 \uC6D0\uBCF8 \uB370\uC774\uD130 (baseStats \uD3EC\uD568)
     * @param {object[]} [equippedItems=[]] - \uC720\uB2DB\uC774 \uC7A5\uCC29\uD55C \uC544\uC774\uD15C \uBAA9\uB85D
     * @returns {object} \uACC4\uC0B0\uB41C \uCD5C\uC885 \uC2A4\uD0EF \uAC1D\uCCB4
     */
    getCalculatedStats(unitData, equippedItems = []) {
        const base = unitData.baseStats;
        if (!base) {
            console.warn(`[StatManager] No baseStats found for unit ${unitData.id || unitData.name}. Returning empty stats.`);
            return {};
        }

        const calculatedStats = {
            hp: base.hp || 0,
            valor: base.valor || 0,
            strength: base.strength || 0,
            endurance: base.endurance || 0,
            agility: base.agility || 0,
            intelligence: base.intelligence || 0,
            wisdom: base.wisdom || 0,
            luck: base.luck || 0,

            barrier: this.valorEngine.calculateInitialBarrier(base.valor || 0),
            damageAmplification: 1.0,

            totalWeight: this.weightEngine.calculateTotalWeight(unitData, equippedItems),
            turnWeightPenalty: 0,

            physicalAttack: (base.strength || 0) * 1.5,
            physicalDefense: (base.endurance || 0) * 1.2,
            magicAttack: (base.intelligence || 0) * 1.5,
            magicDefense: (base.wisdom || 0) * 1.2,

            physicalEvadeChance: (base.agility || 0) * 0.2,
            accuracy: (base.agility || 0) * 0.15,
            magicEvadeChance: (base.luck || 0) * 0.1,

            criticalChance: (base.luck || 0) * 0.05,
            criticalDamageMultiplier: 1.5,

            statusEffectResistance: (base.endurance || 0) * 0.1,
            statusEffectApplication: (base.intelligence || 0) * 0.1
        };

        calculatedStats.turnWeightPenalty = this.weightEngine.getTurnWeightPenalty(calculatedStats.totalWeight);

        console.log(`[StatManager] Calculated stats for ${unitData.name || unitData.id}:`, calculatedStats);
        return calculatedStats;
    }

    /**
     * \uC720\uB2DB\uC758 \uD604\uC7AC \uBC30\uB9AC\uC5B4 \uC591\uC5D0 \uB530\uB77C \uB370\uBBF8\uC9C0 \uC99D\uD3ED\uB960\uC744 \uC5C5\uB370\uC774\uD2B8\uD569\uB2C8\uB2E4.
     * @param {number} currentBarrier - \uC720\uB2DB\uC758 \uD604\uC7AC \uBC30\uB9AC\uC5B4 \uC591
     * @param {number} maxBarrier - \uC720\uB2DB\uC758 \uCD5C\uB300 \uBC30\uB9AC\uC5B4 (\uCD5C\uB300 HP)
     * @returns {number} \uC5C5\uB370\uC774\uD2B8\uB41C \uB370\uBBF8\uC9C0 \uC99D\uD3ED\uB960
     */
    updateDamageAmplification(currentBarrier, maxBarrier) {
        return this.valorEngine.calculateDamageAmplification(currentBarrier, maxBarrier);
    }
}
