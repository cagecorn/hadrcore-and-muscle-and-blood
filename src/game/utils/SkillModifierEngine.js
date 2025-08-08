import { debugLogEngine } from './DebugLogEngine.js';
import { passiveSkills } from '../data/skills/passive.js';

/**
 * 스킬의 등급에 따라 최종 능력치를 계산하는 엔진 (순위 보정 제거됨)
 */
class SkillModifierEngine {
    constructor() {
        debugLogEngine.log('SkillModifierEngine', '스킬 보정 엔진이 초기화되었습니다.');
    }

    /**
     * 스킬 데이터와 등급을 받아 보정된 스킬 데이터를 반환합니다.
     * @param {object} baseSkillData - 원본 스킬 데이터
     * @param {string} grade - 스킬 등급
     * @returns {object} - 보정된 스킬 데이터
     */
    getModifiedSkill(baseSkillData, grade = 'NORMAL') {
        if (!baseSkillData) return null;
        const modifiedSkill = JSON.parse(JSON.stringify(baseSkillData));

        // 레전더리 차지 스킬은 스턴 턴이 2가 됩니다.
        if (baseSkillData.id === 'charge' && modifiedSkill.effect) {
            modifiedSkill.effect.duration = grade === 'LEGENDARY' ? 2 : 1;
        }

        // --- 설명 동적 치환 로직 ---
        if (modifiedSkill.description) {
            if (modifiedSkill.damageMultiplier) {
                if (typeof modifiedSkill.damageMultiplier === 'object') {
                    const minDamage = Math.round(modifiedSkill.damageMultiplier.min * 100);
                    const maxDamage = Math.round(modifiedSkill.damageMultiplier.max * 100);
                    modifiedSkill.description = modifiedSkill.description.replace('{{damage}}', `${minDamage}~${maxDamage}`);
                } else {
                    const damagePercent = Math.round(modifiedSkill.damageMultiplier * 100);
                    modifiedSkill.description = modifiedSkill.description.replace('{{damage}}', `${damagePercent}`);
                }
            }

            if (modifiedSkill.healMultiplier) {
                if (typeof modifiedSkill.healMultiplier === 'object') {
                    const minHeal = modifiedSkill.healMultiplier.min.toFixed(2);
                    const maxHeal = modifiedSkill.healMultiplier.max.toFixed(2);
                    modifiedSkill.description = modifiedSkill.description.replace('{{heal}}', `지혜 * ${minHeal} ~ ${maxHeal}`);
                } else {
                    const healAmount = `지혜 * ${modifiedSkill.healMultiplier.toFixed(2)}`;
                    modifiedSkill.description = modifiedSkill.description.replace('{{heal}}', healAmount);
                }
            }

            if (baseSkillData.id === 'stoneSkin' && modifiedSkill.effect) {
                const mod = Array.isArray(modifiedSkill.effect.modifiers)
                    ? modifiedSkill.effect.modifiers.find(m => m.stat === 'damageReduction')
                    : modifiedSkill.effect.modifiers;
                if (mod) {
                    const value = (mod.value || 0) * 100;
                    modifiedSkill.description = modifiedSkill.description.replace('{{reduction}}', `${value.toFixed(0)}`);
                }
            }

            if (baseSkillData.id === 'shieldBreak' && modifiedSkill.effect) {
                const mod = Array.isArray(modifiedSkill.effect.modifiers)
                    ? modifiedSkill.effect.modifiers.find(m => m.stat === 'damageIncrease')
                    : modifiedSkill.effect.modifiers;
                if (mod) {
                    const value = (mod.value || 0) * 100;
                    modifiedSkill.description = modifiedSkill.description.replace('{{increase}}', `${value.toFixed(0)}`);
                }
            }

            if (baseSkillData.id === 'ironWill') {
                const value = (passiveSkills.ironWill[grade]?.maxReduction || passiveSkills.ironWill.NORMAL.maxReduction) * 100;
                modifiedSkill.description = modifiedSkill.description.replace('{{maxReduction}}', `${value.toFixed(0)}`);
            }

            if (baseSkillData.id === 'grindstone' && modifiedSkill.effect) {
                const bonus = (modifiedSkill.effect.modifiers.value || 0) * 100;
                modifiedSkill.description = modifiedSkill.description.replace('{{attackBonus}}', `${bonus.toFixed(0)}`);
            }

            if (baseSkillData.id === 'battleCry' && modifiedSkill.effect) {
                const mod = Array.isArray(modifiedSkill.effect.modifiers)
                    ? modifiedSkill.effect.modifiers.find(m => m.stat === 'physicalAttack')
                    : modifiedSkill.effect.modifiers;
                if (mod) {
                    const value = (mod.value || 0) * 100;
                    modifiedSkill.description = modifiedSkill.description.replace('{{attackBonus}}', `${value.toFixed(0)}`);
                }
            }

            if (baseSkillData.id === 'huntSense' && modifiedSkill.effect) {
                const mod = Array.isArray(modifiedSkill.effect.modifiers)
                    ? modifiedSkill.effect.modifiers.find(m => m.stat === 'criticalChance')
                    : modifiedSkill.effect.modifiers;
                if (mod) {
                    const value = (mod.value || 0) * 100;
                    modifiedSkill.description = modifiedSkill.description.replace('{{critChance}}', `${value.toFixed(0)}`);
                }
            }
        }

        return modifiedSkill;
    }
}

export const skillModifierEngine = new SkillModifierEngine();
