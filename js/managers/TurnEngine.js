// js/managers/TurnEngine.js

// ✨ 상수 파일 임포트
import { GAME_EVENTS, UI_STATES, ATTACK_TYPES } from '../constants.js';

export class TurnEngine {
    constructor(eventManager, battleSimulationManager, turnOrderManager, classAIManager, delayEngine, timingEngine, animationManager, battleCalculationManager, statusEffectManager) {
        console.log("\uD83D\uDD01 TurnEngine initialized. Ready to manage game turns. \uD83D\uDD01");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.turnOrderManager = turnOrderManager;
        this.classAIManager = classAIManager;
        this.delayEngine = delayEngine;
        this.timingEngine = timingEngine;
        this.animationManager = animationManager;
        this.battleCalculationManager = battleCalculationManager;
        this.statusEffectManager = statusEffectManager;

        this.currentTurn = 0;
        this.activeUnitIndex = -1;
        this.turnOrder = [];

        this.turnPhaseCallbacks = {
            startOfTurn: [],
            unitActions: [],
            endOfTurn: []
        };

        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, (data) => { // ✨ 상수 사용
            this.turnOrderManager.removeUnitFromOrder(data.unitId);
        });
    }

    /**
     * 턴 순서를 초기화하거나 재계산합니다.
     */
    initializeTurnOrder() {
        this.turnOrder = this.turnOrderManager.calculateTurnOrder();
        console.log("[TurnEngine] Turn order initialized:", this.turnOrder.map(unit => unit.name));
    }

    /**
     * 턴 진행을 시작합니다.
     */
    async startBattleTurns() {
        console.log("[TurnEngine] Battle turns are starting!");
        this.currentTurn = 0;
        this.initializeTurnOrder();
        // 전투 시작 시 모든 상태 효과 초기화
        this.statusEffectManager.turnCountManager.clearAllEffects();
        this.nextTurn();
    }

    async nextTurn() {
        const livingMercenaries = this.battleSimulationManager.unitsOnGrid.filter(u => u.type === ATTACK_TYPES.MERCENARY && u.currentHp > 0); // ✨ 상수 사용
        const livingEnemies = this.battleSimulationManager.unitsOnGrid.filter(u => u.type === ATTACK_TYPES.ENEMY && u.currentHp > 0); // ✨ 상수 사용

        if (livingMercenaries.length === 0) {
            console.log("[TurnEngine] All mercenaries defeated! Battle Over.");
            this.eventManager.emit(GAME_EVENTS.BATTLE_END, { reason: 'allMercenariesDefeated' }); // ✨ 상수 사용
            this.eventManager.setGameRunningState(false);
            return;
        }
        if (livingEnemies.length === 0) {
            console.log("[TurnEngine] All enemies defeated! Battle Over.");
            this.eventManager.emit(GAME_EVENTS.BATTLE_END, { reason: 'allEnemiesDefeated' }); // ✨ 상수 사용
            this.eventManager.setGameRunningState(false);
            return;
        }

        this.currentTurn++;
        console.log(`\n--- Turn ${this.currentTurn} Starts ---`);
        this.eventManager.emit(GAME_EVENTS.TURN_START, { turn: this.currentTurn }); // ✨ 상수 사용
        this.timingEngine.clearActions();

        this.eventManager.emit(GAME_EVENTS.TURN_PHASE, { phase: 'startOfTurn', turn: this.currentTurn });
        for (const callback of this.turnPhaseCallbacks.startOfTurn) {
            await callback();
        }

        const currentTurnUnits = this.turnOrderManager.getTurnOrder();
        for (let i = 0; i < currentTurnUnits.length; i++) {
            const unit = currentTurnUnits[i];
            if (unit.currentHp <= 0) {
                console.log(`[TurnEngine] Unit ${unit.name} is already dead. Skipping turn.`);
                continue;
            }

            this.activeUnitIndex = i;
            console.log(`[TurnEngine] Processing turn for unit: ${unit.name} (ID: ${unit.id})`);
            this.eventManager.emit(GAME_EVENTS.UNIT_TURN_START, { unitId: unit.id, unitName: unit.name }); // ✨ 상수 사용
            // ✨ 상태 효과 확인: 유닛의 행동 가능 여부 검사
            const activeEffects = this.statusEffectManager.getUnitActiveEffects(unit.id);
            let canUnitAct = true;

            if (activeEffects) {
                for (const [effectId, effect] of activeEffects.entries()) {
                    if (effect.effectData.effect.canAct === false) {
                        canUnitAct = false;
                        console.log(`[TurnEngine] Unit ${unit.name} is ${effect.effectData.name} (${effectId}) and cannot act this turn.`);
                        break;
                    }
                }
            }

            let action = null;
            if (!canUnitAct) {
                await this.delayEngine.waitFor(500);
            } else {
                action = await this.classAIManager.getBasicClassAction(unit, this.battleSimulationManager.unitsOnGrid);
            }

            if (action) {
                this.timingEngine.addTimedAction(async () => {
                    if (action.actionType === 'move' || action.actionType === 'moveAndAttack') {
                        const startGridX = unit.gridX;
                        const startGridY = unit.gridY;
                        console.log(`[TurnEngine] Unit ${unit.name} attempts to move from (${startGridX},${startGridY}) to (${action.moveTargetX}, ${action.moveTargetY}).`);

                        const moved = this.battleSimulationManager.moveUnit(unit.id, action.moveTargetX, action.moveTargetY);
                        if (moved) {
                            await this.animationManager.queueMoveAnimation(
                                unit.id,
                                startGridX,
                                startGridY,
                                action.moveTargetX,
                                action.moveTargetY
                            );
                        }
                    }

                    if (action.actionType === 'attack' || action.actionType === 'moveAndAttack') {
                        if (action.targetId) {
                            const targetUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === action.targetId);
                            if (targetUnit && targetUnit.currentHp > 0) {
                                console.log(`[TurnEngine] Unit ${unit.name} attacks ${targetUnit.name}!`);
                                this.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, { // ✨ 상수 사용
                                    attackerId: unit.id,
                                    targetId: targetUnit.id,
                                    attackType: ATTACK_TYPES.MELEE // ✨ 상수 사용
                                });
                                const defaultAttackSkillData = { type: ATTACK_TYPES.PHYSICAL, dice: { num: 1, sides: 6 } }; // ✨ 상수 사용
                                this.battleCalculationManager.requestDamageCalculation(unit.id, targetUnit.id, defaultAttackSkillData);
                                await this.delayEngine.waitFor(500);
                            } else {
                                console.log(`[TurnEngine] Target ${action.targetId} is no longer valid for attack.`);
                            }
                        }
                    } else if (action.actionType === 'skill') {
                        console.log(`[TurnEngine] Unit ${unit.name} attempts to use skill.`);
                        await this.delayEngine.waitFor(800);
                    }
                }, 10, `${unit.name}'s Primary Action`);
            } else {
                console.log(`[TurnEngine] Unit ${unit.name} has no determined action for this turn.`);
            }

            this.eventManager.emit(GAME_EVENTS.TURN_PHASE, { phase: 'unitActions', unitId: unit.id, turn: this.currentTurn });
            for (const callback of this.turnPhaseCallbacks.unitActions) {
                await callback(unit);
            }
            this.eventManager.emit(GAME_EVENTS.UNIT_TURN_END, { unitId: unit.id, unitName: unit.name }); // ✨ 상수 사용

            await this.timingEngine.processActions();
            this.timingEngine.clearActions();
        }

        this.eventManager.emit(GAME_EVENTS.TURN_PHASE, { phase: 'endOfTurn', turn: this.currentTurn });
        for (const callback of this.turnPhaseCallbacks.endOfTurn) {
            await callback();
        }

        console.log(`--- Turn ${this.currentTurn} Ends ---\n`);

        await this.delayEngine.waitFor(1000);

        if (this.eventManager.getGameRunningState()) {
            this.nextTurn();
        } else {
            console.log("[TurnEngine] Game is paused or ended, not proceeding to next turn.");
        }
    }

    addTurnPhaseCallback(phase, callback) {
        if (this.turnPhaseCallbacks[phase]) {
            this.turnPhaseCallbacks[phase].push(callback);
            console.log(`[TurnEngine] Registered callback for '${phase}' phase.`);
        } else {
            console.warn(`[TurnEngine] Invalid turn phase: ${phase}`);
        }
    }
}
