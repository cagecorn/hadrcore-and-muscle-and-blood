// js/managers/ValorEngine.js

export class ValorEngine {
    constructor() {
        console.log("\uD83D\uDEE1\uFE0F ValorEngine initialized. Ready to calculate barriers and damage amplification. \uD83D\uDEE1\uFE0F");
        // \uC6A9\uBA85\uC5D0 \uB530\uB978 \uBC30\uB9AC\uC5B4 \uBC0F \uB370\uBBF8\uC9C0 \uC99D\uD3ED \uB85C\uC9D1\uC744 \uAD6C\uD604\uD569\uB2C8\uB2E4.
        // \uD604\uC7AC\uB294 \uCF58\uC194 \uBA54\uC2DC\uC9C0\uB9CC \uCD9C\uB825\uD558\uBA70, \uB098\uC911\uC5D0 RuleManager \uB610\uB294 MeasureManager\uC640 \uC5F0\uB3D9\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
    }

    /**
     * \uC720\uB2DB\uC758 \uC6A9\uBA85 \uC2A4\uD0EF\uC5D0 \uAE30\uBCF8\uD574 \uCD08\uAE30 \uBC30\uB9AC\uC5B4(\uBCF4\uD638\uB9C8\uD06C) \uC591\uC744 \uACC4\uC0B0\uD569\uB2C8\uB2E4.
     * @param {number} valorStat - \uC720\uB2DB\uC758 \uC6A9\uBA85 \uC2A4\uD0EF
     * @returns {number} \uACC4\uC0B0\uB41C \uCD08\uAE30 \uBC30\uB9AC\uC5B4 \uC591
     */
    calculateInitialBarrier(valorStat) {
        // \uC608\uC2DC: \uC6A9\uBA85 1\uB2F9 2\uC758 \uBC30\uB9AC\uC5B4 (\uCD94\uD6C4 \uBC30\uB780\uC2DD \uD544\uC694)
        const barrierAmount = valorStat * 2;
        console.log(`[ValorEngine] Valor ${valorStat} results in initial barrier of ${barrierAmount}.`);
        return barrierAmount;
    }

    /**
     * \uD604\uC7AC \uBC30\uB9AC\uC5B4 \uC591\uACFC \uCD5C\uB300 \uBC30\uB9AC\uC5B4(\uCD5C\uB300 \uCCB4\uB825)\uC5D0 \uAE30\uBCF8\uD574 \uB370\uBBF8\uC9C0 \uC99D\uD3ED\uC728\uC744 \uACC4\uC0B0\uD569\uB2C8\uB2E4.
     * \uBC30\uB9AC\uC5B4\uAC00 \uB192\uC744\uC218\uB85D \uB370\uBBF8\uC9C0 \uC99D\uD3ED\uC728\uC774 \uB192\uC544\uC9D1\uB2C8\uB2E4.
     * @param {number} currentBarrier - \uC720\uB2DB\uC758 \uD604\uC7AC \uBC30\uB9AC\uC5B4 \uC591
     * @param {number} maxBarrier - \uC720\uB2DB\uC758 \uCD5C\uB300 \uBC30\uB9AC\uC5B4 (\uBCF4\uD1B5 \uC720\uB2DB\uC758 \uCD5C\uB300 HP\uC640 \uC5F0\uB3D9)
     * @returns {number} \uB370\uBBF8\uC9C0 \uC99D\uD3ED\uC728 (\uC608: 1.0 = 100% \uB370\uBBF8\uC9C0, 1.2 = 120% \uB370\uBBF8\uC9C0)
     */
    calculateDamageAmplification(currentBarrier, maxBarrier) {
        if (maxBarrier <= 0) return 1.0; // 0\uC73C\uB85C \uB098\uB9AC\uB294 \uAC83 \uBC29\uC9C0

        // \uC608\uC2DC: \uBC30\uB9AC\uC5B4 \uBE44\uC728\uC5D0 \uB530\uB77C 1.0 ~ 1.5 \uC0AC\uC774\uB85C \uC99D\uD3ED (\uCD94\uD6C4 \uBC30\uB780\uC2DD \uD544\uC694)
        // \uBC30\uB9AC\uC5B4 \uBE44\uC728\uC774 0\uC77C \uB54C 1.0, 1\uC77C \uB54C 1.5\uAC00 \uB418\uB3C4\uB85D \uC120\uD615 \uBCF4\uAC78
        const barrierRatio = currentBarrier / maxBarrier;
        const amplification = 1.0 + (0.5 * barrierRatio); // 0.5\uB294 \uCD5C\uB300 \uC99D\uD3ED\uB7C9
        console.log(`[ValorEngine] Barrier ratio ${barrierRatio.toFixed(2)} results in damage amplification of ${amplification.toFixed(2)}.`);
        return amplification;
    }
}
