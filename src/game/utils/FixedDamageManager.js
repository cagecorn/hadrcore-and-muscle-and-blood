import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 스킬 효과 등으로 발생하는 '확정' 판정을 관리하고,
 * 최종 전투 결과를 계산하는 매니저입니다.
 * (예: 확정 치명타, 확정 막기)
 */

// 확정 판정의 종류를 상수로 정의합니다.
export const FIXED_DAMAGE_TYPES = {
    CRITICAL: 'CRITICAL',       // 확정 치명타
    WEAKNESS: 'WEAKNESS',       // 확정 약점 공격
    BLOCK: 'BLOCK',             // 확정 막기
    MITIGATION: 'MITIGATION',   // 확정 완화
    DAMAGE_IMMUNITY: 'DAMAGE_IMMUNITY', // ✨ [신규] 피해 무효화
};

// 최종 판정 결과를 상수로 정의합니다. (CombatCalculationEngine과 호환)
export const FINAL_HIT_TYPES = {
    CRITICAL: { hitType: '치명타', multiplier: 2.0 },
    WEAKNESS: { hitType: '약점', multiplier: 1.5 },
    NORMAL:   { hitType: null, multiplier: 1.0 },
    MITIGATION: { hitType: '완화', multiplier: 0.75 },
    BLOCK:    { hitType: '막기', multiplier: 0.5 },
};

class FixedDamageManager {
    constructor() {
        this.name = 'FixedDamageManager';
        debugLogEngine.log(this.name, '확정 데미지 매니저가 초기화되었습니다.');
    }

    /**
     * 공격자와 방어자의 확정 효과를 조합하여 최종 전투 판정을 결정합니다.
     * @param {string|null} attackerEffect - 공격자의 확정 효과 (FIXED_DAMAGE_TYPES 참조)
     * @param {string|null} defenderEffect - 방어자의 확정 효과 (FIXED_DAMAGE_TYPES 참조)
     * @returns {object|null} - 최종 판정 결과 { hitType, multiplier } 또는 확정 판정이 없는 경우 null
     */
    calculateFixedDamage(attackerEffect, defenderEffect) {
        if (!attackerEffect && !defenderEffect) {
            return null; // 확정 판정이 없으면 null을 반환하여 일반 등급 계산을 따르도록 함
        }

        let resultTier = 0;

        // 1. 공격자 효과에 따른 기본 티어 설정
        if (attackerEffect === FIXED_DAMAGE_TYPES.CRITICAL) resultTier = 2;
        if (attackerEffect === FIXED_DAMAGE_TYPES.WEAKNESS) resultTier = 1;

        // 2. 방어자 효과에 따른 티어 감소
        if (defenderEffect === FIXED_DAMAGE_TYPES.BLOCK) resultTier -= 2;
        if (defenderEffect === FIXED_DAMAGE_TYPES.MITIGATION) resultTier -= 1;

        debugLogEngine.log(this.name, `확정 판정 계산: [공격자: ${attackerEffect || '없음'}] vs [방어자: ${defenderEffect || '없음'}] -> 최종 티어: ${resultTier}`);

        // 3. 최종 티어에 따른 결과 반환
        switch (resultTier) {
            case 2:
                return FINAL_HIT_TYPES.CRITICAL;
            case 1:
                return FINAL_HIT_TYPES.WEAKNESS;
            case 0:
                return FINAL_HIT_TYPES.NORMAL;
            case -1:
                return FINAL_HIT_TYPES.MITIGATION;
            case -2:
            default: // -2 이하의 모든 경우
                return FINAL_HIT_TYPES.BLOCK;
        }
    }
}

export const fixedDamageManager = new FixedDamageManager();
