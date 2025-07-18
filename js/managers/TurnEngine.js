// js/managers/TurnEngine.js

// ✨ 상수 파일 임포트
import { GAME_EVENTS, UI_STATES, ATTACK_TYPES, GAME_DEBUG_MODE } from '../constants.js';

export class TurnEngine {
    constructor(eventManager, battleSimulationManager, turnOrderManager, microcosmHeroEngine, classAIManager, delayEngine, timingEngine, animationManager, battleCalculationManager, statusEffectManager, rangeManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDD01 TurnEngine initialized. Ready to manage game turns. \uD83D\uDD01");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.turnOrderManager = turnOrderManager;
        this.microcosmHeroEngine = microcosmHeroEngine;
        this.classAIManager = classAIManager;
        this.delayEngine = delayEngine;
        this.timingEngine = timingEngine;
        this.animationManager = animationManager;
        this.battleCalculationManager = battleCalculationManager;
        this.statusEffectManager = statusEffectManager;
        this.rangeManager = rangeManager;

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

    async _executeAction(unit, action) {
        if (!action) return;

        if (
            action.actionType === 'move' ||
            action.actionType === 'moveAndAttack' ||
            action.actionType === 'moveAndSkill'
        ) {
            const startGridX = unit.gridX;
            const startGridY = unit.gridY;
            if (GAME_DEBUG_MODE) console.log(`[TurnEngine] Unit ${unit.name} attempts to move from (${startGridX},${startGridY}) to (${action.moveTargetX}, ${action.moveTargetY}).`);

            const moved = this.battleSimulationManager.moveUnit(unit.id, action.moveTargetX, action.moveTargetY);
            if (moved) {
                this.eventManager.emit(GAME_EVENTS.UNIT_MOVED, { unitId: unit.id, from: { x: startGridX, y: startGridY }, to: { x: action.moveTargetX, y: action.moveTargetY } });
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
                if (targetUnit && targetUnit.currentHp > 0 && this.rangeManager.isTargetInRange(unit, targetUnit)) {
                    if (GAME_DEBUG_MODE) console.log(`[TurnEngine] Unit ${unit.name} attacks ${targetUnit.name}!`);
                    this.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                        attackerId: unit.id,
                        targetId: targetUnit.id,
                        attackType: ATTACK_TYPES.MELEE
                    });
                    const defaultAttackSkillData = { type: ATTACK_TYPES.PHYSICAL, dice: { num: 1, sides: 6 } };
                    this.battleCalculationManager.requestDamageCalculation(unit.id, targetUnit.id, defaultAttackSkillData);
                    await this.delayEngine.waitFor(500);
                } else if (GAME_DEBUG_MODE) {
                    console.log(`[TurnEngine] Target ${action.targetId} is no longer valid or out of range.`);
                }
            }
        } else if (action.actionType === 'skill' || action.actionType === 'moveAndSkill') {
            if (GAME_DEBUG_MODE) console.log(`[TurnEngine] Unit ${unit.name} attempts to use skill.`);
            if (typeof action.execute === 'function') {
                await action.execute();
            } else if (GAME_DEBUG_MODE) {
                console.error(`[TurnEngine] Skill action for ${unit.name} is missing the 'execute' function.`);
            }
            await this.delayEngine.waitFor(800);
        }

        if (action.followUp) {
            await this._executeAction(unit, action.followUp);
        }
    }

    /**
     * 턴 순서를 초기화하거나 재계산합니다.
     */
    initializeTurnOrder() {
        this.turnOrder = this.turnOrderManager.calculateTurnOrder();
        if (GAME_DEBUG_MODE) console.log("[TurnEngine] Turn order initialized:", this.turnOrder.map(unit => unit.name));
    }

    /**
     * 턴 진행을 시작합니다.
     */
    async startBattleTurns() {
        if (GAME_DEBUG_MODE) console.log("[TurnEngine] Battle turns are starting!");
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
        if (GAME_DEBUG_MODE) console.log("[TurnEngine] All mercenaries defeated! Battle Over.");
            this.eventManager.emit(GAME_EVENTS.BATTLE_END, { reason: 'allMercenariesDefeated' }); // ✨ 상수 사용
            this.eventManager.setGameRunningState(false);
            return;
        }
        if (livingEnemies.length === 0) {
        if (GAME_DEBUG_MODE) console.log("[TurnEngine] All enemies defeated! Battle Over.");
            this.eventManager.emit(GAME_EVENTS.BATTLE_END, { reason: 'allEnemiesDefeated' }); // ✨ 상수 사용
            this.eventManager.setGameRunningState(false);
            return;
        }

        this.currentTurn++;
        if (GAME_DEBUG_MODE) console.log(`\n--- Turn ${this.currentTurn} Starts ---`);
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
                if (GAME_DEBUG_MODE) console.log(`[TurnEngine] Unit ${unit.name} is already dead. Skipping turn.`);
                continue;
            }

            this.activeUnitIndex = i;
            if (GAME_DEBUG_MODE) console.log(`[TurnEngine] Processing turn for unit: ${unit.name} (ID: ${unit.id})`);
            this.eventManager.emit(GAME_EVENTS.UNIT_TURN_START, { unitId: unit.id, unitName: unit.name }); // ✨ 상수 사용
            // ✨ 상태 효과 확인: 유닛의 행동 가능 여부 검사
            const activeEffects = this.statusEffectManager.getUnitActiveEffects(unit.id);
            let canUnitAct = true;

            if (activeEffects) {
                for (const [effectId, effect] of activeEffects.entries()) {
                    if (effect.effectData.effect.canAct === false) {
                        canUnitAct = false;
                        if (GAME_DEBUG_MODE) console.log(`[TurnEngine] Unit ${unit.name} is ${effect.effectData.name} (${effectId}) and cannot act this turn.`);
                        break;
                    }
                }
            }

            let action = null;
            if (!canUnitAct) {
                await this.delayEngine.waitFor(500);
            } else {
                const battleState = {
                    enemies: this.battleSimulationManager.unitsOnGrid.filter(u => u.type !== unit.type),
                    allies: this.battleSimulationManager.unitsOnGrid.filter(u => u.type === unit.type)
                };
                if (this.microcosmHeroEngine.hasHeroMicrocosm(unit.id)) {
                    try {
                        action = await this.microcosmHeroEngine.determineHeroAction(unit.id, battleState);
                    } catch (e) {
                        if (GAME_DEBUG_MODE) console.warn(`[TurnEngine] Microcosm action failed for ${unit.name}:`, e);
                    }
                }
                if (!action) {
                    action = await this.classAIManager.getBasicClassAction(unit, this.battleSimulationManager.unitsOnGrid);
                }
            }

            // JudgementManager가 AI 결정을 감시할 수 있도록 알림
            // Web Worker에 전달되는 데이터는 직렬화 가능해야 하므로
            // 실행 함수를 포함한 원본 액션 객체를 복사한 뒤 함수는 제거한다.
            let sanitizedAction = null;
            if (action) {
                sanitizedAction = { ...action };
                if (typeof sanitizedAction.execute === 'function') {
                    delete sanitizedAction.execute;
                }
            }
            this.eventManager.emit(GAME_EVENTS.AI_ACTION_DECIDED, {
                unitId: unit.id,
                decidedAction: sanitizedAction
            });

            if (action) {
                this.timingEngine.addTimedAction(async () => {
                    await this._executeAction(unit, action);
                }, 10, `${unit.name}'s Primary Action`);
            } else {
                if (GAME_DEBUG_MODE) console.log(`[TurnEngine] Unit ${unit.name} has no determined action for this turn.`);
            }

            this.eventManager.emit(GAME_EVENTS.TURN_PHASE, { phase: 'unitActions', unitId: unit.id, turn: this.currentTurn });
            for (const callback of this.turnPhaseCallbacks.unitActions) {
                await callback(unit);
            }
            await this.timingEngine.processActions();
            this.timingEngine.clearActions();

            this.eventManager.emit(GAME_EVENTS.UNIT_TURN_END, { unitId: unit.id, unitName: unit.name }); // ✨ 상수 사용
        }

        this.eventManager.emit(GAME_EVENTS.TURN_PHASE, { phase: 'endOfTurn', turn: this.currentTurn });
        for (const callback of this.turnPhaseCallbacks.endOfTurn) {
            await callback();
        }

        if (GAME_DEBUG_MODE) console.log(`--- Turn ${this.currentTurn} Ends ---\n`);

        await this.delayEngine.waitFor(1000);

        if (this.eventManager.getGameRunningState()) {
            this.nextTurn();
        } else {
            if (GAME_DEBUG_MODE) console.log("[TurnEngine] Game is paused or ended, not proceeding to next turn.");
        }
    }

    addTurnPhaseCallback(phase, callback) {
        if (this.turnPhaseCallbacks[phase]) {
            this.turnPhaseCallbacks[phase].push(callback);
            if (GAME_DEBUG_MODE) console.log(`[TurnEngine] Registered callback for '${phase}' phase.`);
        } else {
            if (GAME_DEBUG_MODE) console.warn(`[TurnEngine] Invalid turn phase: ${phase}`);
        }
    }
}
