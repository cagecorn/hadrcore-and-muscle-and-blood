// js/managers/BattleCalculationManager.js
import { DelayEngine } from './DelayEngine.js'; // ✨ DelayEngine 추가
import { GAME_EVENTS } from '../constants.js';

export class BattleCalculationManager {
    constructor(eventManager, battleSimulationManager, diceRollManager, delayEngine, conditionalManager) {
        console.log("\ud83d\udcca BattleCalculationManager initialized. Delegating heavy calculations to worker. \ud83d\udcca");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.diceRollManager = diceRollManager;
        this.delayEngine = delayEngine; // ✨ delayEngine 저장
        this.conditionalManager = conditionalManager; // ✨ 인스턴스 저장
        this.worker = new Worker('./js/workers/battleCalculationWorker.js');

        this.worker.onmessage = this._handleWorkerMessage.bind(this);
        this.worker.onerror = (e) => {
            console.error("[BattleCalculationManager] Worker Error:", e);
            // ✨ 심각한 에러 발생 시 게임 엔진에 알릴 이벤트 발행
            this.eventManager.emit(GAME_EVENTS.CRITICAL_ERROR, {
                source: 'BattleCalculationWorker',
                message: e.message || 'Unknown worker error',
                errorObject: e
            });
        };
    }

    async _handleWorkerMessage(event) {
        const { type, unitId } = event.data;

        if (type === GAME_EVENTS.DAMAGE_CALCULATED) {
            console.log(`[BattleCalculationManager] Received damage calculation result for ${unitId}.`);
            this.eventManager.emit(GAME_EVENTS.DAMAGE_CALCULATED, event.data);
        }
    }

    /**
     * 데미지 계산을 요청하고 결과를 이벤트로 전달합니다.
     * @param {string} attackerUnitId
     * @param {string} targetUnitId
     * @param {object} skillData - 스킬 정보 또는 일반 공격 정보
     */
    requestDamageCalculation(attackerUnitId, targetUnitId, skillData = null) {
        const attackerUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === attackerUnitId);
        const targetUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === targetUnitId);

        if (!attackerUnit || !targetUnit) {
            console.error("[BattleCalculationManager] Cannot request damage calculation: Attacker or target unit not found.");
            return;
        }

        // ✨ DiceRollManager를 사용하여 데미지 굴림 수행 (공격자의 현재 배리어 상태를 전달)
        const finalDamageRoll = this.diceRollManager.performDamageRoll(
            attackerUnit,
            skillData
        );
        console.log(`[BattleCalculationManager] Final damage roll from DiceRollManager: ${finalDamageRoll}`);

        // ✨ ConditionalManager에서 수비자의 현재 피해 감소율을 가져옴
        const damageReduction = this.conditionalManager.getDamageReduction(targetUnitId);

        const payload = {
            attackerStats: attackerUnit.fullUnitData ? attackerUnit.fullUnitData.baseStats : attackerUnit.baseStats,
            targetStats: targetUnit.fullUnitData ? targetUnit.fullUnitData.baseStats : targetUnit.baseStats,
            attackerStats: attackerUnit.fullUnitData ? attackerUnit.fullUnitData.baseStats : attackerUnit.baseStats,
            targetStats: targetUnit.fullUnitData ? targetUnit.fullUnitData.baseStats : targetUnit.baseStats,
            currentTargetHp: targetUnit.currentHp,
            currentTargetBarrier: targetUnit.currentBarrier,
            maxBarrier: targetUnit.maxBarrier,
            skillData: skillData,
            targetUnitId: targetUnitId,
            preCalculatedDamageRoll: finalDamageRoll,
            damageReduction: damageReduction // ✨ 피해 감소율 추가
        };

        this.worker.postMessage({ type: 'CALCULATE_DAMAGE', payload });
        console.log(`[BattleCalculationManager] Requested damage calculation: ${attackerUnitId} attacks ${targetUnitId}.`);
    }

    terminateWorker() {
        if (this.worker) {
            this.worker.terminate();
            console.log("[BattleCalculationManager] Worker terminated.");
        }
    }
}
