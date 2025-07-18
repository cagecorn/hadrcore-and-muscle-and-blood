// js/managers/OneTwoThreeManager.js

import { GAME_DEBUG_MODE, GAME_EVENTS } from '../constants.js';

/**
 * 유닛이 몇 번째 스킬 슬롯을 활성화했는지 감지하고 이벤트를 발생시키는 매니저입니다.
 */
export class OneTwoThreeManager {
    constructor(eventManager, battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("🥁 OneTwoThreeManager initialized. Ready to feel the rhythm.");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // ClassAIManager가 스킬을 실행하기 직전에 보내는 신호를 구독합니다.
        this.eventManager.subscribe(GAME_EVENTS.SKILL_EXECUTED, this._onSkillExecuted.bind(this));
    }

    /**
     * 스킬이 실행되었을 때 호출됩니다.
     * @param {object} data - { userId, skillId }
     */
    _onSkillExecuted({ userId, skillId }) {
        const unit = this.battleSimulationManager.getUnitById(userId);
        if (!unit || !unit.skillSlots) return;

        const slotIndex = unit.skillSlots.indexOf(skillId);

        // 스킬이 유닛의 슬롯 목록에 있는지, 그리고 1, 2, 3번 슬롯 중 하나인지 확인합니다.
        if (slotIndex !== -1) {
            if (GAME_DEBUG_MODE) console.log(`[OneTwoThreeManager] Detected: ${unit.name} used Slot ${slotIndex + 1} skill (${skillId}).`);
            
            // "N번째 스킬 슬롯이 활성화되었다!" 라고 새로운 이벤트를 외쳐줍니다.
            this.eventManager.emit(GAME_EVENTS.SKILL_SLOT_ACTIVATED, {
                unitId: userId,
                skillId: skillId,
                slotIndex: slotIndex // 0-based index (0, 1, 2)
            });
        }
    }
}
