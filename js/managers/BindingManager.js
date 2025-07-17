// js/managers/BindingManager.js

export class BindingManager {
    constructor() {
        console.log("\ud83d\udd17 BindingManager initialized. Ready to bind visual components to units. \ud83d\udd17");
        this.unitBindings = new Map();
    }

    /**
     * 유닛과 해당 유닛에 연결된 시각적/애니메이션 컴포넌트들을 바인딩합니다.
     * @param {string} unitId
     * @param {object} components
     */
    bindUnit(unitId, components) {
        if (this.unitBindings.has(unitId)) {
            console.warn(`[BindingManager] Unit '${unitId}' already has existing bindings. Overwriting.`);
        }
        this.unitBindings.set(unitId, components);
        console.log(`[BindingManager] Bound components to unit '${unitId}'.`);
    }

    /**
     * 특정 유닛의 바인딩된 컴포넌트를 가져옵니다.
     * @param {string} unitId
     * @returns {object | undefined}
     */
    getBindings(unitId) {
        return this.unitBindings.get(unitId);
    }

    /**
     * 특정 유닛의 바인딩을 해제합니다.
     * @param {string} unitId
     * @returns {boolean}
     */
    unbindUnit(unitId) {
        if (this.unitBindings.has(unitId)) {
            this.unitBindings.delete(unitId);
            console.log(`[BindingManager] Unbound components from unit '${unitId}'.`);
            return true;
        }
        console.warn(`[BindingManager] No bindings found for unit '${unitId}'.`);
        return false;
    }

    /**
     * 모든 유닛의 바인딩을 해제합니다.
     */
    clearAllBindings() {
        this.unitBindings.clear();
        console.log("[BindingManager] All unit bindings cleared.");
    }
}
