// js/managers/TurnEngine.js

// ✨ 상수 파일 임포트
import { GAME_EVENTS, UI_STATES, ATTACK_TYPES } from '../constants.js';
import { StartTurnState } from '../states/StartTurnState.js';

export class TurnEngine {
    constructor(eventManager, battleSimulationManager, turnOrderManager, classAIManager, delayEngine, timingEngine, measureManager, animationManager, battleCalculationManager, statusEffectManager) {
        console.log("\uD83D\uDD01 TurnEngine initialized. Ready to manage game turns. \uD83D\uDD01");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.turnOrderManager = turnOrderManager;
        this.classAIManager = classAIManager;
        this.delayEngine = delayEngine;
        this.timingEngine = timingEngine;
        this.animationManager = animationManager;
        this.measureManager = measureManager;
        this.battleCalculationManager = battleCalculationManager;
        this.statusEffectManager = statusEffectManager;

        this.currentTurn = 0;
        this.activeUnitIndex = -1;
        this.turnOrder = [];

        this.currentState = null;

        this.turnPhaseCallbacks = {
            startOfTurn: [],
            unitActions: [],
            endOfTurn: []
        };

        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, (data) => { // ✨ 상수 사용
            this.turnOrderManager.removeUnitFromOrder(data.unitId);
        });
    }

    setState(newState) {
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }
        this.currentState = newState;
        console.log(`[TurnEngine] State changed to: ${this.currentState.constructor.name}`);
        if (this.currentState.enter) {
            this.currentState.enter();
        }
    }

    update() {
        if (this.currentState && this.currentState.update) {
            this.currentState.update();
        }
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
        this.setState(new StartTurnState(this));
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
