import { debugLogEngine } from '../utils/DebugLogEngine.js';

class DebugValorManager {
    constructor() {
        this.name = 'DebugValor';
        debugLogEngine.register(this);
    }

    /**
     * 공격 시 배리어에 의한 데미지 증폭률을 로그로 남깁니다.
     * @param {object} attacker - 공격자 정보
     * @param {number} amplification - 적용된 증폭률 (예: 1.3)
     */
    logDamageAmplification(attacker, amplification) {
        const boostPercent = ((amplification - 1) * 100).toFixed(1);
        debugLogEngine.log(
            this.name,
            `${attacker.instanceName}의 배리어 효과로 데미지 ${boostPercent}% 증폭됨 (최종 배율: ${amplification.toFixed(2)})`
        );
    }
}

export const debugValorManager = new DebugValorManager();
