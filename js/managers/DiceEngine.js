// js/managers/DiceEngine.js

export class DiceEngine {
    constructor() {
        console.log("\uD83C\uDFB2 DiceEngine initialized. Ready to roll all random elements. \uD83C\uDFB2");
        // 이 엔진은 순수하게 무작위성을 제공하는 메서드를 포함합니다.
    }

    /**
     * 지정된 면을 가진 주사위를 굴려 1에서 sides 사이의 무작위 정수를 반환합니다.
     * @param {number} sides - 주사위의 면 수 (예: 6면체 주사위는 6)
     * @returns {number} 주사위 굴림 결과
     */
    rollD(sides) {
        if (sides <= 0) {
            console.warn("[DiceEngine] Cannot roll a dice with 0 or negative sides. Returning 1.");
            return 1;
        }
        const result = Math.floor(Math.random() * sides) + 1;
        console.log(`[DiceEngine] Rolled d${sides}: ${result}`);
        return result;
    }

    /**
     * 0(포함)과 1(제외) 사이의 무작위 부동 소수점 숫자를 반환합니다.
     * @returns {number} 무작위 부동 소수점 숫자
     */
    getRandomFloat() {
        return Math.random();
    }

    /**
     * min(포함)과 max(포함) 사이의 무작위 정수를 반환합니다.
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
