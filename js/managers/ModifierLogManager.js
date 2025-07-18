import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 게임 내 모든 수치 변동(모디파이어)을 콘솔에 기록하여
 * 계산 과정을 투명하게 추적하는 매니저입니다.
 */
export class ModifierLogManager {
    constructor() {
        if (GAME_DEBUG_MODE) console.log("\ud83d\udcca ModifierLogManager initialized. Ready to log all modifications.");
    }

    /**
     * 계산 과정을 상세히 로그로 남깁니다.
     * @param {string} title - 로그의 제목 (예: 'Attack Multiplier Calculation')
     * @param {object} details - 로그에 포함될 상세 정보
     * @param {number} details.baseValue - 계산의 기초가 되는 값
     * @param {Array<object>} details.modifiers - 적용된 모든 모디파이어 배열 { source, value, operation }
     * @param {string} details.formula - 최종 계산 과정을 나타내는 문자열
     * @param {number} details.finalValue - 모든 계산이 완료된 후의 최종 값
     */
    log(title, { baseValue, modifiers = [], formula, finalValue }) {
        if (!GAME_DEBUG_MODE) return;

        console.groupCollapsed(`[MODIFIER LOG] ${title}: ${finalValue}`);

        console.log(`Base Value: ${baseValue}`);

        if (modifiers.length > 0) {
            console.groupCollapsed(`Applied Modifiers (${modifiers.length})`);
            modifiers.forEach(mod => {
                console.log(`- [${mod.source}]: ${mod.operation}${mod.value}`);
            });
            console.groupEnd();
        }

        console.log(`Formula: ${formula}`);
        console.log(`Final Value: ${finalValue}`);

        console.groupEnd();
    }
}
