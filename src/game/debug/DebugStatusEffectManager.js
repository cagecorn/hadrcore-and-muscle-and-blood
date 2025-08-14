import { debugLogEngine } from '../utils/DebugLogEngine.js';
import { EFFECT_TYPES } from '../utils/EffectTypes.js';

class DebugStatusEffectManager {
    constructor() {
        this.name = 'DebugStatusEffect';
        debugLogEngine.register(this);
    }

    logEffectApplied(unit, effect) {
        const color = effect.type === EFFECT_TYPES.BUFF ? '#22c55e' : '#ef4444';
        console.groupCollapsed(
            `%c[${this.name}]`, `color: #a78bfa; font-weight: bold;`,
            `%c[${effect.type}]`, `color: ${color}; font-weight: bold;`,
            `${unit.instanceName}에게 [${effect.sourceSkillName}] 효과 적용 (${effect.duration}턴)`
        );
        console.table(effect.modifiers);
        console.groupEnd();
    }

    logEffectExpired(unitId, effect) {
        debugLogEngine.log(this.name, `유닛(ID:${unitId})의 [${effect.sourceSkillName}] 효과 만료됨.`);
    }

    /**
     * 데미지 계산 과정에서 상태 효과가 어떻게 영향을 미쳤는지 로그로 남깁니다.
     * @param {object} unit - 효과를 받는 유닛
     * @param {number} originalDamage - 원래 데미지
     * @param {number} modifiedDamage - 효과 적용 후 데미지
     * @param {Array<object>} effects - 적용된 효과 목록
     */
    logDamageModification(unit, originalDamage, modifiedDamage, effects) {
         const effectNames = effects.map(e => e.sourceSkillName).join(', ');
         console.groupCollapsed(
            `%c[${this.name}]`, `color: #a78bfa; font-weight: bold;`,
            `${unit.instanceName}의 [${effectNames}] 효과로 피해량 변경`
        );
        debugLogEngine.log(this.name, `원래 피해량: ${originalDamage.toFixed(2)}`);
        debugLogEngine.log(this.name, `최종 피해량: %c${modifiedDamage.toFixed(2)}`, `color: #ef4444; font-weight:bold;`);
        console.groupEnd();
    }
}

export const debugStatusEffectManager = new DebugStatusEffectManager();
