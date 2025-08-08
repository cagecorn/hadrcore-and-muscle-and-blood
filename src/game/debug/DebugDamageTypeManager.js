import { debugLogEngine } from '../utils/DebugLogEngine.js';

class DebugDamageTypeManager {
    constructor() {
        this.name = 'DebugDamageType';
        debugLogEngine.register(this);
    }

    /**
     * 특정 스킬에서 식별된 데미지 타입들을 로그로 남깁니다.
     * @param {string} skillName - 스킬의 이름
     * @param {Array<string>} types - 식별된 데미지 타입 배열
     */
    logDamageTypes(skillName, types) {
        if (types.length === 0) return;

        const typeString = types.join(', ');
        debugLogEngine.log(
            this.name,
            `스킬 [${skillName}]에서 다음 데미지 타입을 식별했습니다: %c${typeString}`,
            'color: #2dd4bf; font-weight: bold;'
        );
    }
}

export const debugDamageTypeManager = new DebugDamageTypeManager();
