// js/managers/BattleCalculationManager.js
import { DelayEngine } from './DelayEngine.js'; // ✨ DelayEngine 추가
import { GAME_EVENTS } from '../constants.js';

export class BattleCalculationManager {
    constructor(eventManager, battleSimulationManager, diceRollManager, delayEngine, conditionalManager, unitStatManager, statusEffectManager = null, modifierEngine) {
        console.log("\ud83d\udcca BattleCalculationManager initialized. Delegating heavy calculations to worker. \ud83d\udcca");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.diceRollManager = diceRollManager;
        this.delayEngine = delayEngine; // ✨ delayEngine 저장
        this.conditionalManager = conditionalManager; // ✨ 인스턴스 저장
        this.unitStatManager = unitStatManager;
        this.statusEffectManager = statusEffectManager;
        this.modifierEngine = modifierEngine;
        this.modifierLogManager = null; // GameEngine에서 주입됨
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
        const { type, unitId, attackerId, hpDamageDealt, barrierDamageDealt, preMitigationDamage, defense, reduction, finalDamage } = event.data;

        if (type === GAME_EVENTS.DAMAGE_CALCULATED) {
            this.modifierLogManager.log(`'${unitId}' Final Damage Calculation`, {
                baseValue: preMitigationDamage,
                modifiers: [
                    { source: 'Defense', value: defense, operation: '-' },
                    { source: 'Damage Reduction', value: `${(reduction * 100).toFixed(1)}%`, operation: '×' }
                ],
                formula: `(Damage[${preMitigationDamage}] - Defense[${defense}]) * (1 - Reduction[${reduction.toFixed(2)}])`,
                finalValue: finalDamage
            });
            console.log(`[BattleCalculationManager] Damage result for ${unitId}: HP Damage = ${hpDamageDealt}, Barrier Damage = ${barrierDamageDealt}`);

            const unitToUpdate = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
            if (unitToUpdate) {
                this.unitStatManager.dealDamage(unitId, hpDamageDealt + barrierDamageDealt);

                if (barrierDamageDealt > 0) {
                    this.eventManager.emit(GAME_EVENTS.DISPLAY_DAMAGE, { unitId: unitId, attackerId: attackerId, damage: barrierDamageDealt, color: 'yellow' }); // 공격자 ID 포함
                    if (hpDamageDealt > 0) {
                        await this.delayEngine.waitFor(100);
                    }
                }
                if (hpDamageDealt > 0) {
                    this.eventManager.emit(GAME_EVENTS.DISPLAY_DAMAGE, { unitId: unitId, attackerId: attackerId, damage: hpDamageDealt, color: 'red' }); // 공격자 ID 포함
                }

                this.eventManager.emit(GAME_EVENTS.DAMAGE_CALCULATED, {
                    attackerId: attackerId,
                    targetId: unitId,
                    hpDamageDealt,
                    barrierDamageDealt,
                    newHp: unitToUpdate.currentHp
                });

                if (unitToUpdate.currentHp <= 0) {
                    this.eventManager.emit(GAME_EVENTS.UNIT_DEATH, { unitId: unitId, unitName: unitToUpdate.name, unitType: unitToUpdate.type });
                    console.log(`[BattleCalculationManager] Unit '${unitId}' has died.`);
                }
            } else {
                console.warn(`[BattleCalculationManager] Could not find unit '${unitId}' to update HP.`);
            }
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

        const damageReduction = this.modifierEngine.getDamageReduction(targetUnitId);

        const payload = {
            attackerUnitId: attackerUnitId, // 워커에 공격자 ID 전달
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
