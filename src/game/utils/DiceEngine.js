import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 게임 내 모든 무작위 요소를 관장하는 중앙 주사위 엔진 (싱글턴)
 */
class DiceEngine {
    constructor() {
        debugLogEngine.log('DiceEngine', '다이스 엔진이 초기화되었습니다.');
    }

    /**
     * 주어진 배열에서 무작위 요소를 하나 또는 여러 개 선택하여 반환합니다.
     * @param {Array<*>} array - 요소를 선택할 배열
     * @param {number} [count=1] - 선택할 요소의 개수
     * @returns {*|Array<*>|undefined} - 선택된 요소 또는 요소들의 배열
     */
    getRandomElement(array, count = 1) {
        if (!array || array.length === 0) {
            // count가 1이면 undefined, 아니면 빈 배열을 반환하여 일관성을 유지합니다.
            return count === 1 ? undefined : [];
        }

        // count가 1이면 기존 로직대로 단일 요소를 반환합니다.
        if (count === 1) {
            const index = Math.floor(Math.random() * array.length);
            return array[index];
        }

        // count가 1보다 크면, 배열을 섞은 뒤 원하는 개수만큼 잘라서 반환합니다.
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
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
