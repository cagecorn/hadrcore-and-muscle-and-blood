// js/managers/PassiveIsAlsoASkillManager.js

import { GAME_DEBUG_MODE, GAME_EVENTS } from '../constants.js';

/**
 * 유닛의 패시브 스킬이 몇 턴 동안 유지되고 있는지 추적하는 매니저입니다.
 */
export class PassiveIsAlsoASkillManager {
    constructor(eventManager, battleSimulationManager, idManager) {
        if (GAME_DEBUG_MODE) console.log("\ud83e\udd08 PassiveIsAlsoASkillManager initialized. Patience is a virtue.");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.idManager = idManager;

        // { unitId: { skillId: turnCount } } 형태로 데이터를 저장합니다.
        this.passiveCounters = {};

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // 각 유닛의 턴이 시작될 때마다 카운트를 세기 위해 구독합니다.
        this.eventManager.subscribe(GAME_EVENTS.TURN_START, this._onTurnStart.bind(this));
        // 유닛이 전투에서 제거되면 카운터도 정리합니다.
        this.eventManager.subscribe(GAME_EVENTS.UNIT_REMOVED_FROM_GRID, this._onUnitRemoved.bind(this));
    }

    /**
     * 유닛의 턴이 시작될 때 호출됩니다.
     * @param {object} data - { unitId }
     */
    async _onTurnStart({ unitId }) {
        const unit = this.battleSimulationManager.getUnitById(unitId);
        if (!unit) return;

        if (!this.passiveCounters[unitId]) {
            this.passiveCounters[unitId] = {};
        }

        // 현재 유닛에게 적용된 모든 상태 효과를 확인합니다.
        for (const effect of unit.statusEffects) {
            const sourceSkill = await this.idManager.get(effect.sourceSkillId);
            
            // 이 효과의 근원 스킬이 'passive' 타입인지 확인합니다.
            if (sourceSkill && sourceSkill.type === 'passive') {
                const skillId = sourceSkill.id;

                // 카운터를 1 증가시킵니다. (없었으면 1로 시작)
                const currentCount = (this.passiveCounters[unitId][skillId] || 0) + 1;
                this.passiveCounters[unitId][skillId] = currentCount;

                if (GAME_DEBUG_MODE) console.log(`[PassiveManager] ${unit.name}'s passive '${skillId}' is now at ${currentCount} turn(s).`);

                // "패시브 스킬이 N턴째 유지 중이다!" 라고 이벤트를 외쳐줍니다.
                this.eventManager.emit(GAME_EVENTS.PASSIVE_SKILL_MAINTAINED, {
                    unitId: unitId,
                    skillId: skillId,
                    maintainedTurns: currentCount
                });
            }
        }
    }
    
    /**
     * 유닛이 전투에서 제거될 때 카운터를 정리합니다.
     */
    _onUnitRemoved({ unitId }) {
        if (this.passiveCounters[unitId]) {
            delete this.passiveCounters[unitId];
            if (GAME_DEBUG_MODE) console.log(`[PassiveManager] Cleared passive counters for removed unit ${unitId}.`);
        }
    }
}
