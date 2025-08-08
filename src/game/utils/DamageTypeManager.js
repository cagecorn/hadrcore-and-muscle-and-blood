import { debugLogEngine } from './DebugLogEngine.js';
import { SKILL_TAGS } from './SkillTagManager.js';
// 새로 만들 디버그 매니저를 미리 import 합니다.
import { debugDamageTypeManager } from '../debug/DebugDamageTypeManager.js';

/**
 * 게임 내 모든 데미지 유형을 정의하는 상수 객체입니다.
 * SKILL_TAGS와 연동하여 사용됩니다.
 */
export const DAMAGE_TYPES = {
    PHYSICAL: SKILL_TAGS.PHYSICAL,
    MAGIC: SKILL_TAGS.MAGIC,
    FIRE: SKILL_TAGS.FIRE,
    WATER: SKILL_TAGS.WATER,
    WIND: SKILL_TAGS.WIND,
    EARTH: SKILL_TAGS.EARTH,
    LIGHT: SKILL_TAGS.LIGHT,
    DARK: SKILL_TAGS.DARK,
    IRON: SKILL_TAGS.IRON,
    POISON: SKILL_TAGS.POISON,
    // 상태이상으로 인한 지속 데미지 등은 추후 확장 가능
};

class DamageTypeManager {
    constructor() {
        this.name = 'DamageTypeManager';
        debugLogEngine.register(this);

        // DAMAGE_TYPES의 값들을 Set으로 만들어 빠른 조회를 가능하게 합니다.
        this.damageTypeTags = new Set(Object.values(DAMAGE_TYPES));
    }

    /**
     * 스킬 데이터의 태그를 분석하여 포함된 모든 데미지 타입을 배열로 반환합니다.
     * @param {object} skillData - 분석할 스킬 데이터
     * @returns {Array<string>} - 데미지 타입 태그의 배열 (예: ['물리', '불'])
     */
    identifyDamageTypes(skillData) {
        if (!skillData || !skillData.tags) {
            return [];
        }

        const identifiedTypes = skillData.tags.filter(tag => this.damageTypeTags.has(tag));

        // 식별된 데미지 타입을 디버그 로그로 남깁니다.
        debugDamageTypeManager.logDamageTypes(skillData.name, identifiedTypes);

        return identifiedTypes;
    }
}

export const damageTypeManager = new DamageTypeManager();
