// js/managers/WeightEngine.js

export class WeightEngine {
    constructor() {
        console.log("\u2696\uFE0F WeightEngine initialized. Ready to calculate weight and turn order impact. \u2696\uFE0F");
        // \uBB34\uAC8C \uAC00\uC911\uCE58 \uACC4\uC0B0 \uB85C\uC9D1\uC744 \uAD6C\uD604\uD569\uB2C8\uB2E4.
    }

    /**
     * \uC720\uB2DB\uC758 \uAE30\uBCF8 \uC2A4\uD0EF\uACFC \uC7A5\uCC29 \uC544\uC774\uD15C\uC758 \uBB34\uAC8C\uB97C \uD569\uC0B0\uD558\uC5EC \uCD1D \uBB34\uAC8C\uB97C \uACC4\uC0B0\uD569\uB2C8\uB2E4.
     * \uD604\uC7AC\uB294 \uC544\uC774\uD15C \uC2DC\uC2A4\uD15C\uC774 \uC5C6\uC73C\uBbc0\uB85C, \uC720\uB2DB\uC758 'baseStats.weight'\uB97C \uC0AC\uC6A9\uD558\uAC70\uB098 \uAE30\uBCF8\uAC12\uC744 \uC801\uC6A9\uD569\uB2C8\uB2E4.
     * \uD798(strength) \uC2A4\uD0EF\uC774 \uB192\uC744\uC218\uB85D \uBB34\uAC8C \uAC00\uC911\uCE58\uAC00 \uC62C\uB77C\uAC00\uB294 \uADDC\uCE59\uC744 \uC801\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
     * @param {object} unitStats - \uC720\uB2DB\uC758 \uAE30\uBCF8 \uC2A4\uD0EF (baseStats \uD3EC\uD568)
     * @param {object[]} [equippedItems=[]] - \uC720\uB2DB\uC774 \uC7A5\uCC29\uD55C \uC544\uC774\uD15C \uC5F4\uAC04 (\uAC01 \uC544\uC774\uD15C\uC5D0 weight \uC18D\uC131\uC774 \uC788\uB2E4\uACE0 \uAC00\uC815)
     * @returns {number} \uC720\uB2DB\uC758 \uCD1D \uBB34\uAC8C
     */
    calculateTotalWeight(unitStats, equippedItems = []) {
        let baseWeight = unitStats.baseStats && unitStats.baseStats.weight ? unitStats.baseStats.weight : 0;
        let strength = unitStats.baseStats && unitStats.baseStats.strength ? unitStats.baseStats.strength : 0;

        // \uC608\uC2DC: \uD798 \uC2A4\uD0EF\uC774 \uB192\uC744\uC218\uB85D \uBB34\uAC8C \uAC00\uC911\uCE58\uAC00 '\uC62C\uB77C\uAC00\uB294\uB2E4' (\uB354 \uBB34\uAC8C\uC6B4 \uC0C1\uD0DC\uB85C \uACF5\uC815)
        // \uD798 10\uB2F9 \uBB34\uAC8C 1 \uC99D\uAC00 (\uCD94\uD6C4 \uBC30\uB780\uC2DD \uD544\uC694)
        baseWeight += Math.floor(strength / 10);

        let itemWeight = 0;
        for (const item of equippedItems) {
            itemWeight += item.weight || 0;
        }

        const totalWeight = baseWeight + itemWeight;
        console.log(`[WeightEngine] Unit's total weight calculated: ${totalWeight} (Base: ${baseWeight}, Items: ${itemWeight}).`);
        return totalWeight;
    }

    /**
     * \uC720\uB2DB\uC758 \uCD1D \uBB34\uAC8C\uC5D0 \uAE30\uBCF8\uD574 \uD130\uC758 \uC21C\uC11C \uACB0\uC815\uC5D0 \uC0AC\uC6A9\uB420 \uD398\uB110\uD2F0 \uAC12\uC744 \uBC18\uD658\uD569\uB2C8\uB2E4.
     * \uBB34\uAC8C\uAC00 \uD070 \uC218\uB85D \uD398\uB110\uD2F0\uAC00 \uCEE4\uC838 \uD130\uC758 \uC21C\uC11C\uAC00 \uB290\uB9AC\uC9C0\uB9CC \uB354 \uB290\uB9AC\uBA74 \uC548\uB429\uB2C8\uB2E4.
     * (\uC774 \uAC12\uC740 TurnOrderManager\uC5D0\uC11C \uC720\uB2DB\uC758 \uC18D\uB3C4\uC640 \uD568\uAED8 \uC0AC\uC6A9\uB429\uB2C8\uB2E4.)
     * @param {number} totalWeight - \uC720\uB2DB\uC758 \uCD1D \uBB34\uAC8C
     * @returns {number} \uD130\uC704 \uC9C0\uC218 \uD398\uB110\uD2F0 (\uB192\uC744\uC218\uB85D \uD130\uC758 \uC21C\uC11C\uAC00 \uB290\uB9AC\uC9C0\uB9CC)
     */
    getTurnWeightPenalty(totalWeight) {
        const penalty = totalWeight * 0.5;
        console.log(`[WeightEngine] Total weight ${totalWeight} results in turn penalty of ${penalty}.`);
        return penalty;
    }
}
