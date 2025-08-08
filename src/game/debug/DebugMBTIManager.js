import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * AI의 MBTI 기반 의사결정 과정을 추적하고 로그로 남기는 디버그 매니저
 */
class DebugMBTIManager {
    constructor() {
        this.name = 'DebugMBTI';
        debugLogEngine.register(this);
    }

    /**
     * 특정 의사결정 과정의 시작을 알리는 로그 그룹을 시작합니다.
     * @param {string} decisionName - 결정의 이름 (예: "생존 본능", "이동 방식 결정")
     * @param {object} unit - 해당 유닛
     */
    logDecisionStart(decisionName, unit) {
        let mbtiString = 'N/A';
        if (unit && unit.mbti) {
            const m = unit.mbti;
            mbtiString = `E:${m.E}/I:${m.I} S:${m.S}/N:${m.N} T:${m.T}/F:${m.F} J:${m.J}/P:${m.P}`;
        }
        console.groupCollapsed(
            `%c[${this.name}]`, `color: #ea580c; font-weight: bold;`,
            `${unit.instanceName} - ${decisionName} (MBTI: ${mbtiString})`
        );
    }

    /**
     * MBTI 성향 체크 결과를 로그로 남깁니다.
     * @param {string} trait - 체크한 성향 (예: 'E')
     * @param {number} score - 해당 성향의 점수
     * @param {number} roll - 주사위 굴림 값
     * @param {boolean} success - 성공 여부
     */
    logTraitCheck(trait, score, roll, success) {
        const resultText = success ? '성공' : '실패';
        const color = success ? '#22c55e' : '#ef4444';
        debugLogEngine.log(
            this.name,
            `'${trait}' 성향 체크: %c${resultText}`, `color: ${color}; font-weight: bold;`,
            `(점수: ${score}, 주사위: ${roll.toFixed(2)})`
        );
    }

    /**
     * 최종적으로 선택된 행동을 로그로 남깁니다.
     * @param {string} actionDescription - 선택된 행동에 대한 설명
     */
    logAction(actionDescription) {
        debugLogEngine.log(this.name, `선택된 행동: %c${actionDescription}`, 'color: #3b82f6; font-weight: bold;');
    }

    /**
     * 의사결정 로그 그룹을 닫습니다.
     */
    logDecisionEnd() {
        console.groupEnd();
    }
}

export const debugMBTIManager = new DebugMBTIManager();
