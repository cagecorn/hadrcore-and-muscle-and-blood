import { debugLogEngine } from '../utils/DebugLogEngine.js';
import { ASPIRATION_STATE } from '../utils/AspirationEngine.js';

/**
 * AI의 열망(Aspiration) 시스템 관련 변화를 추적하고 로그로 남기는 디버그 매니저
 */
class DebugAspirationManager {
    constructor() {
        this.name = 'DebugAspiration';
        debugLogEngine.register(this);
    }

    /**
     * 유닛의 열망 수치 변경을 로그로 남깁니다.
     * @param {number} unitId - 유닛 ID
     * @param {string} unitName - 유닛 이름
     * @param {number} oldValue - 이전 값
     * @param {number} newValue - 새 값
     * @param {number} amount - 변화량
     * @param {string} reason - 변경 사유
     */
    logAspirationChange(unitId, unitName, oldValue, newValue, amount, reason) {
        const change = newValue - oldValue;
        const color = change > 0 ? '#22c55e' : '#ef4444';

        console.groupCollapsed(
            `%c[${this.name}]`, `color: #d946ef; font-weight: bold;`,
            `\uD83D\uDD25 ${unitName}(ID:${unitId}) \uC5D8\uB791 \uBCC0\uACBD: ${reason}`
        );
        debugLogEngine.log(
            this.name,
            `\uC218\uCE58 \uBCC0\uACBD: ${oldValue} -> %c${newValue}`,
            `color: ${color}; font-weight: bold;`,
            `(${amount > 0 ? '+' : ''}${amount})`
        );
        console.groupEnd();
    }

    /**
     * 유닛의 열망 상태 변경(붕괴, 각성)을 로그로 남깁니다.
     * @param {string} unitName - 유닛 이름
     * @param {string} newState - 새로운 상태 (ASPIRATION_STATE)
     */
    logStateChange(unitName, newState) {
        if (newState === ASPIRATION_STATE.COLLAPSED) {
            debugLogEngine.log(
                this.name,
                `%c\uD83D\uDD25 ${unitName}\uC758 \uC5D8\uB791\uC774 \uBD09\uD0C8\uB418\uC5C8\uC2B5\uB2C8\uB2E4! MBTI \uAE30\uBC18 \uD589\uB3D9\uC744 \uC2DC\uC791\uD569\uB2C8\uB2E4.`,
                'color: #ef4444; font-size: 1.1em; font-weight: bold;'
            );
        } else if (newState === ASPIRATION_STATE.EXALTED) {
            debugLogEngine.log(
                this.name,
                `%c\u2728 ${unitName}\uC774(\uAC00) \uAC01\uC131\uD588\uC2B5\uB2C8\uB2E4! MBTI \uAE30\uBC18 \uC601\uAD6C \uBC84\uD504\uAC00 \uC801\uC6A9\uB429\uB2C8\uB2E4.`,
                'color: #f59e0b; font-size: 1.1em; font-weight: bold;'
            );
        }
    }
}

export const debugAspirationManager = new DebugAspirationManager();
