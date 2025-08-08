import { debugLogEngine } from './DebugLogEngine.js';
// 디버그용 콤보 매니저를 초기화하여 로그 출력을 활성화합니다.
import { debugComboManager } from '../debug/DebugComboManager.js';
// ✨ SKILL_TAGS를 import하여 콤보 태그를 참조합니다.
import { SKILL_TAGS } from './SkillTagManager.js';

class ComboManager {
    constructor() {
        this.name = 'ComboManager';
        // ✨ key: attackerId, value: { targetId, count, lastSkillTags: [] }
        this.comboData = new Map();
        this.comboVFX = null;
        debugLogEngine.log(this.name, '콤보 매니저가 초기화되었습니다.');
    }

    startTurn(unitId) {
        // ✨ 턴 시작 시 마지막 스킬 태그 기록도 초기화합니다.
        this.comboData.set(unitId, { targetId: null, count: 0, lastSkillTags: [] });
        if (this.comboVFX) {
            this.comboVFX.destroy();
            this.comboVFX = null;
        }
    }

    recordAttack(attackerId, targetId) {
        const current = this.comboData.get(attackerId) || { targetId: null, count: 0, lastSkillTags: [] };
        if (current.targetId === targetId) {
            current.count++;
        } else {
            current.targetId = targetId;
            current.count = 1;
            // ✨ 대상이 바뀌면 콤보가 끊기므로 마지막 스킬 태그도 초기화합니다.
            current.lastSkillTags = [];
        }
        this.comboData.set(attackerId, current);
        debugLogEngine.log(this.name, `유닛 ${attackerId} -> ${targetId}, 콤보: ${current.count}`);
        return current.count;
    }

    getDamageMultiplier(attackerId, comboCount, currentSkillTags = []) {
        let multiplier = 1.0;
        if (comboCount > 1) {
            // 기존의 연속 공격 시 데미지 감소 로직
            multiplier = Math.max(0.7, 1.0 - (comboCount - 1) * 0.1);
        }

        // ✨ [신규] 콤보 연계 보너스 로직
        const comboData = this.comboData.get(attackerId);
        if (comboData && (comboData.lastSkillTags || []).includes(SKILL_TAGS.COMBO) && (currentSkillTags || []).includes(SKILL_TAGS.COMBO)) {
            multiplier += 0.10; // 10% 보너스 데미지
            debugLogEngine.log(this.name, `[콤보 보너스!] 10% 추가 데미지 적용!`);
        }

        return multiplier;
    }

    /**
     * ✨ [신규] 공격이 완전히 끝난 후, 다음 공격의 콤보 보너스 계산을 위해 현재 사용된 스킬의 태그를 기록합니다.
     * @param {number} attackerId
     * @param {Array<string>} skillTags
     */
    updateLastSkillTags(attackerId, skillTags = []) {
        const data = this.comboData.get(attackerId);
        if (data) {
            data.lastSkillTags = skillTags;
        }
    }
}

export const comboManager = new ComboManager();
