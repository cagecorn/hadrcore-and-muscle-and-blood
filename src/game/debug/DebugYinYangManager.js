import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * AI의 음양(Yin-Yang) 시스템 관련 의사결정 과정을 추적하고 로그로 남기는 디버그 매니저
 */
class DebugYinYangManager {
    constructor() {
        this.name = 'DebugYinYang';
        debugLogEngine.register(this);
    }

    /**
     * 유닛의 음양 지수 변경을 로그로 남깁니다.
     * @param {number} unitId - 유닛 ID
     * @param {number} oldValue - 이전 값
     * @param {number} newValue - 새 값
     * @param {number} change - 변화량
     */
    logBalanceUpdate(unitId, oldValue, newValue, change) {
        const color = change > 0 ? '#22c55e' : '#ef4444';
        console.groupCollapsed(
            `%c[${this.name}]`, `color: #a855f7; font-weight: bold;`,
            `☯️ 유닛 ${unitId} 음양 지수 변경`
        );
        debugLogEngine.log(this.name, `지수 변경: ${oldValue.toFixed(2)} -> %c${newValue.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)})`, `color: ${color}; font-weight: bold;`);
        console.groupEnd();
    }

    /**
     * 음양 지수가 스킬 점수에 어떻게 영향을 미치는지 로그로 남깁니다.
     * @param {string} skillName - 스킬 이름
     * @param {number} baseScore - 기본 점수
     * @param {number} yinYangBonus - 음양 보너스 점수
     * @param {number} finalScore - 최종 점수
     */
    logScoreModification(skillName, baseScore, yinYangBonus, finalScore) {
        if (yinYangBonus === 0) return;
        debugLogEngine.log(
            'SkillScoreEngine',
            `[음양 활용] 스킬 [${skillName}] 점수 보정: 기본(${baseScore.toFixed(2)}) + 음양 보너스(${yinYangBonus.toFixed(2)}) = 최종 ${finalScore.toFixed(2)}`
        );
    }
}

export const debugYinYangManager = new DebugYinYangManager();
