export class TagManager {
    /**
     * TagManager를 초기화합니다.
     * @param {IdManager} idManager - 데이터 정의를 조회할 IdManager 인스턴스
     */
    constructor(idManager) {
        console.log("\ud83c\udff7\ufe0f TagManager initialized. Ready to enforce tag-based rules. \ud83c\udff7\ufe0f");
        this.idManager = idManager;
        // 유효한 태그 목록을 여기에 정의할 수 있습니다. (확장 가능성)
        // 예: this.validTags = new Set(['근접', '원거리', '마법', '방어', '경갑', '중갑', '언데드', '무기', '방어구', '검', '활', '지팡이']);
    }

    /**
     * 데이터 객체가 특정 태그를 가지고 있는지 확인합니다.
     * @param {object} dataObject - 태그를 확인할 데이터 객체 (예: 클래스, 아이템, 스킬 정의)
     * @param {string} tag - 확인할 단일 태그
     * @returns {boolean} 데이터 객체가 해당 태그를 가지고 있으면 true
     */
    hasTag(dataObject, tag) {
        if (!dataObject || !Array.isArray(dataObject.tags)) {
            return false;
        }
        return dataObject.tags.includes(tag);
    }

    /**
     * 데이터 객체가 필요한 모든 태그를 가지고 있는지 확인합니다.
     * @param {object} dataObject - 태그를 확인할 데이터 객체
     * @param {string[]} requiredTags - 필요한 모든 태그 배열
     * @returns {boolean} 데이터 객체가 모든 필요한 태그를 가지고 있으면 true
     */
    hasAllTags(dataObject, requiredTags) {
        if (!dataObject || !Array.isArray(dataObject.tags)) {
            return requiredTags.length === 0; // 필요한 태그가 없으면 true 반환 (방어적)
        }
        return requiredTags.every(tag => dataObject.tags.includes(tag));
    }

    /**
     * 데이터 객체가 필요한 태그 중 하나라도 가지고 있는지 확인합니다.
     * @param {object} dataObject - 태그를 확인할 데이터 객체
     * @param {string[]} anyTags - 필요한 태그 중 하나라도 있으면 되는 태그 배열
     * @returns {boolean} 데이터 객체가 필요한 태그 중 하나라도 가지고 있으면 true
     */
    hasAnyTag(dataObject, anyTags) {
        if (!dataObject || !Array.isArray(dataObject.tags)) {
            return false;
        }
        return anyTags.some(tag => dataObject.tags.includes(tag));
    }

    /**
     * 유닛(또는 클래스)이 특정 아이템을 장착할 수 있는지 태그를 기준으로 검사합니다.
     * 아이템의 `requiredUnitTags` 배열에 있는 태그 중 **하나라도** 유닛의 `tags`에 포함되어야 장착 가능하다고 가정합니다.
     * @param {object} unitOrClassData - 장착을 시도하는 유닛 또는 클래스 데이터 (tags 배열 포함)
     * @param {object} itemData - 장착할 아이템 데이터 (requiredUnitTags 배열 포함)
     * @returns {boolean} 유닛이 아이템을 장착할 수 있으면 true
     */
    canEquipItem(unitOrClassData, itemData) {
        if (!unitOrClassData || !Array.isArray(unitOrClassData.tags)) {
            console.warn(`[TagManager] Unit/Class data missing or invalid tags for equip check:`, unitOrClassData);
            return false;
        }
        if (!itemData || !Array.isArray(itemData.requiredUnitTags)) {
            console.warn(`[TagManager] Item data missing or invalid requiredUnitTags for equip check:`, itemData);
            return false; // 아이템에 필요한 태그 정보가 없으면 장착 불가
        }

        // 아이템이 요구하는 태그 중 유닛이 하나라도 가지고 있다면 true
        const canEquip = itemData.requiredUnitTags.some(requiredTag =>
            unitOrClassData.tags.includes(requiredTag)
        );

        if (!canEquip) {
            console.log(`[TagManager] Cannot equip '${itemData.id}'. Unit '${unitOrClassData.id}' tags [${unitOrClassData.tags.join(',')}] do not match required item tags [${itemData.requiredUnitTags.join(',')}]`);
        } else {
            console.log(`[TagManager] Unit '${unitOrClassData.id}' can equip '${itemData.id}'.`);
        }
        return canEquip;
    }

    /**
     * 유닛(또는 클래스)이 특정 스킬을 사용할 수 있는지 태그를 기준으로 검사합니다.
     * 스킬의 `requiredUserTags` 배열에 있는 태그 중 **모두** 유닛의 `tags`에 포함되어야 사용 가능하다고 가정합니다.
     * @param {object} unitOrClassData - 스킬을 사용하려는 유닛 또는 클래스 데이터 (tags 배열 포함)
     * @param {object} skillData - 사용할 스킬 데이터 (requiredUserTags 배열 포함)
     * @returns {boolean} 유닛이 스킬을 사용할 수 있으면 true
     */
    canUseSkill(unitOrClassData, skillData) {
        if (!unitOrClassData || !Array.isArray(unitOrClassData.tags)) {
            console.warn(`[TagManager] Unit/Class data missing or invalid tags for skill check:`, unitOrClassData);
            return false;
        }
        if (!skillData || !Array.isArray(skillData.requiredUserTags)) {
            // 스킬에 사용자 요구 태그 정보가 없으면 기본적으로 사용 가능
            return true;
        }

        // 스킬이 요구하는 모든 태그를 유닛이 가지고 있다면 true
        const canUse = skillData.requiredUserTags.every(requiredTag =>
            unitOrClassData.tags.includes(requiredTag)
        );

        if (!canUse) {
            console.log(`[TagManager] Cannot use skill '${skillData.id}'. Unit '${unitOrClassData.id}' tags [${unitOrClassData.tags.join(',')}] do not match required skill tags [${skillData.requiredUserTags.join(',')}]`);
        } else {
            console.log(`[TagManager] Unit '${unitOrClassData.id}' can use skill '${skillData.id}'.`);
        }
        return canUse;
    }

    /**
     * 특정 데이터 ID에 해당하는 객체의 태그가 예상 태그와 일치하는지 점검합니다.
     * 주로 단위 테스트나 데이터 유효성 검사 시 사용됩니다.
     * @param {string} dataId - 검사할 데이터의 ID (클래스, 스킬, 아이템 등)
     * @param {string[]} expectedTags - 예상되는 태그 배열
     * @returns {Promise<boolean>} 태그가 일치하면 true, 아니면 false
     */
    async validateDataTags(dataId, expectedTags) {
        const data = await this.idManager.get(dataId);
        if (!data) {
            console.error(`[TagManager] Validation failed: Data for ID '${dataId}' not found.`);
            return false;
        }
        if (!Array.isArray(data.tags)) {
            console.error(`[TagManager] Validation failed: Data for ID '${dataId}' has no 'tags' array.`);
            return false;
        }

        const missingExpected = expectedTags.filter(tag => !data.tags.includes(tag));
        const unexpectedExisting = data.tags.filter(tag => !expectedTags.includes(tag));

        if (missingExpected.length > 0) {
            console.error(`[TagManager] Validation failed for '${dataId}': Missing expected tags: [${missingExpected.join(', ')}]`);
            return false;
        }
        if (unexpectedExisting.length > 0) {
            console.warn(`[TagManager] Validation warning for '${dataId}': Unexpected tags found: [${unexpectedExisting.join(', ')}]`);
        }

        console.log(`[TagManager] Validation successful for '${dataId}'. All expected tags found.`);
        return true;
    }
}
