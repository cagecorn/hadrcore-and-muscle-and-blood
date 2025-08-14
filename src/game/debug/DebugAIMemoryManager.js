import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * AI의 기억(Memory) 및 학습 과정을 추적하고 로그로 남기는 디버그 매니저
 */
class DebugAIMemoryManager {
    constructor() {
        this.name = 'DebugAIMemory';
        debugLogEngine.register(this);
    }

    /**
     * AI가 전투 결과를 바탕으로 기억(가중치)을 갱신할 때 로그를 남깁니다.
     * @param {number} attackerId - 공격자 ID
     * @param {number} targetId - 대상 ID
     * @param {string} attackType - 공격 타입
     * @param {number} oldValue - 이전 가중치
     * @param {number} newValue - 새 가중치
     */
    logMemoryUpdate(attackerId, targetId, attackType, oldValue, newValue) {
        const change = newValue - oldValue;
        const color = change > 0 ? '#22c55e' : '#ef4444';
        console.groupCollapsed(
            `%c[${this.name}]`, `color: #8b5cf6; font-weight: bold;`,
            `🧠 유닛 ${attackerId}의 기억 업데이트 (대상: ${targetId})`
        );
        debugLogEngine.log(this.name, `공격 타입: ${attackType}`);
        debugLogEngine.log(this.name, `가중치 변경: ${oldValue.toFixed(2)} -> %c${newValue.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)})`, `color: ${color}; font-weight: bold;`);
        console.groupEnd();
    }

    /**
     * AI가 스킬을 선택하기 위해 기억을 조회할 때 로그를 남깁니다.
     * @param {number} attackerId
     * @param {object} memory
     */
    logMemoryRead(attackerId, memory) {
        if (!memory || Object.keys(memory).length === 0) return;
        console.groupCollapsed(
            `%c[${this.name}]`, `color: #8b5cf6; font-weight: bold;`,
            `🤔 유닛 ${attackerId}의 기억 조회`
        );
        console.table(memory);
        console.groupEnd();
    }

    /**
     * 학습된 가중치가 스킬 점수에 어떻게 영향을 미치는지 로그로 남깁니다.
     * @param {string} skillName
     * @param {number} baseScore
     * @param {number} weight
     * @param {number} finalScore
     */
    logScoreModification(skillName, baseScore, weight, finalScore) {
        debugLogEngine.log(
            'SkillScoreEngine',
            `[기억 활용] 스킬 [${skillName}] 점수 보정: 기본(${baseScore.toFixed(2)}) * 가중치(${weight.toFixed(2)}) = 최종 ${finalScore.toFixed(2)}`
        );
    }
}

export const debugAIMemoryManager = new DebugAIMemoryManager();
