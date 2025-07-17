// js/managers/WorkflowManager.js

// ✨ 상수 파일 임포트
import { GAME_EVENTS } from '../constants.js';

export class WorkflowManager {
    constructor(eventManager, statusEffectManager, battleSimulationManager) {
        console.log("\uD83D\uDCCA WorkflowManager initialized. Streamlining complex processes. \uD83D\uDCCA");
        this.eventManager = eventManager;
        this.statusEffectManager = statusEffectManager;
        this.battleSimulationManager = battleSimulationManager;
        this.eventManager.subscribe(GAME_EVENTS.REQUEST_STATUS_EFFECT_APPLICATION, this._processStatusEffectApplication.bind(this)); // ✨ 상수 사용
        console.log("[WorkflowManager] Subscribed to 'requestStatusEffectApplication' event.");
    }

    _processStatusEffectApplication(data) {
        const { unitId, statusEffectId } = data;
        if (!unitId || !statusEffectId) {
            console.warn("[WorkflowManager] Missing unitId or statusEffectId for application workflow.");
            return;
        }
        const targetUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!targetUnit) {
            console.warn(`[WorkflowManager] Target unit '${unitId}' not found for status effect application.`);
            return;
        }
        console.log(`[WorkflowManager] Processing application of status effect '${statusEffectId}' to unit '${unitId}'.`);
        this.statusEffectManager.applyStatusEffect(unitId, statusEffectId);
        this.eventManager.emit(GAME_EVENTS.LOG_MESSAGE, { message: `${targetUnit.name}에게 '${statusEffectId}' 상태 효과가 적용되었습니다!` }); // ✨ 상수 사용
        console.log(`[WorkflowManager] Workflow for status effect '${statusEffectId}' on unit '${unitId}' completed.`);
    }

    triggerStatusEffectApplication(unitId, statusEffectId) {
        this.eventManager.emit(GAME_EVENTS.REQUEST_STATUS_EFFECT_APPLICATION, { unitId, statusEffectId }); // ✨ 상수 사용
        console.log(`[WorkflowManager] Triggered status effect application for unit '${unitId}' with effect '${statusEffectId}'.`);
    }
}
