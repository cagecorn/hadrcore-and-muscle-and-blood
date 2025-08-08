import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * 콤보 시스템의 동작을 추적하고 로그로 남기는 디버그 매니저
 */
class DebugComboManager {
    constructor() {
        this.name = 'DebugCombo';
        debugLogEngine.register(this);
    }

    /**
     * 콤보로 인한 데미지 감산 과정을 로그로 남깁니다.
     * @param {number} comboCount - 현재 콤보 수
     * @param {number} multiplier - 적용된 데미지 배율
     * @param {number} originalDamage - 배율 적용 전 데미지
     * @param {number} finalDamage - 최종 데미지
     */
    logComboDamage(comboCount, multiplier, originalDamage, finalDamage) {
        if (comboCount < 2) return; // 1콤보일 때는 로그를 남기지 않습니다.

        console.groupCollapsed(
            `%c[${this.name}]`, `color: #ec4899; font-weight: bold;`,
            `${comboCount} 콤보 데미지 감산 적용`
        );
        debugLogEngine.log(this.name, `콤보 배율: ${multiplier.toFixed(2)}배`);
        debugLogEngine.log(this.name, `감산 전 데미지: ${originalDamage.toFixed(2)}`);
        debugLogEngine.log(this.name, `최종 데미지: %c${finalDamage.toFixed(2)}`, 'color: #facc15; font-weight: bold;');
        console.groupEnd();
    }
}

export const debugComboManager = new DebugComboManager();
