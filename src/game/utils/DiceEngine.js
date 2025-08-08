import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 게임 내 모든 무작위 요소를 관장하는 중앙 주사위 엔진 (싱글턴)
 */
class DiceEngine {
    constructor() {
        debugLogEngine.log('DiceEngine', '다이스 엔진이 초기화되었습니다.');
    }

    /**
     * 주어진 배열에서 무작위 요소를 하나 선택하여 반환합니다.
     * @param {Array<*>} array - 요소를 선택할 배열
     * @returns {*|undefined} - 무작위로 선택된 요소
     */
    getRandomElement(array) {
        if (!array || array.length === 0) {
            return undefined;
        }
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    /**
     * 지정된 범위에서 주사위를 여러 번 굴려 가장 높은 값을 반환합니다.
     * @param {number} min - 최소값
     * @param {number} max - 최대값
     * @param {number} rolls - 주사위를 굴릴 횟수
     * @returns {number} - 굴림 중 가장 높은 값
     */
    rollWithAdvantage(min, max, rolls = 1) {
        let best = -Infinity;
        for (let i = 0; i < rolls; i++) {
            const roll = Math.random() * (max - min) + min;
            if (roll > best) {
                best = roll;
            }
        }
        return best;
    }
}

export const diceEngine = new DiceEngine();
