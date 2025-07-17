// js/managers/TurnEngine.js

// ✨ 상수 파일 임포트
import { GAME_EVENTS, UI_STATES, ATTACK_TYPES, GAME_DEBUG_MODE } from '../constants.js';
import { StartTurnState } from '../states/StartTurnState.js';
import { AIEngine } from './AIEngine.js';

export class TurnEngine {
    constructor(eventManager, battleSimulationManager, turnOrderManager, classAIManager, delayEngine, timingEngine, measureManager, animationManager, battleCalculationManager, statusEffectManager) {
        if (GAME_DEBUG_MODE) {
            console.log("🌀 TurnEngine initialized. Ready to manage game turns. 🌀");
        }
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.turnOrderManager = turnOrderManager;
        // this.classAIManager = classAIManager; // AIEngine 사용으로 대체
        this.delayEngine = delayEngine;
        this.timingEngine = timingEngine;
        this.animationManager = animationManager;
        this.measureManager = measureManager;
        this.battleCalculationManager = battleCalculationManager;
        this.statusEffectManager = statusEffectManager;

        const allManagers = {
            eventManager, battleSimulationManager, turnOrderManager,
            delayEngine, timingEngine, measureManager, animationManager,
            battleCalculationManager, statusEffectManager,
            // 아래 매니저들은 setInjector 이후에 채워집니다.
            idManager: null,
            basicAIManager: null,
            warriorSkillsAI: null,
            diceEngine: null,
            targetingManager: null,
            coordinateManager: null
        };
        this.aiEngine = new AIEngine(allManagers);

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
            this.aiEngine.removeUnit(data.unitId);
        });
    }

    // BattleEngine에서 injector를 전달받아 필요한 매니저를 채웁니다.
    setInjector(injector) {
        this.injector = injector;
        const assetEngine = injector.get('AssetEngine');
        const battleEngine = injector.get('BattleEngine');
        if (assetEngine) {
            this.aiEngine.managers.idManager = assetEngine.getIdManager();
        }
        if (battleEngine) {
            this.aiEngine.managers.basicAIManager = battleEngine.basicAIManager;
            this.aiEngine.managers.warriorSkillsAI = battleEngine.warriorSkillsAI;
            this.aiEngine.managers.diceEngine = battleEngine.diceEngine;
            this.aiEngine.managers.targetingManager = battleEngine.targetingManager;
            this.aiEngine.managers.coordinateManager = battleEngine.coordinateManager;
        }
    }

    setState(newState) {
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }
        this.currentState = newState;
        if (GAME_DEBUG_MODE) {
            console.log(`%c[TurnEngine] State changed to: ${this.currentState.constructor.name}`, "color: #2E8B57; font-weight: bold;");
        }
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
        if (GAME_DEBUG_MODE) {
            console.log("[TurnEngine] Turn order initialized:", this.turnOrder.map(unit => unit.name));
        }
    }

    /**
     * 턴 진행을 시작합니다.
     */
    async startBattleTurns() {
        if (GAME_DEBUG_MODE) {
            console.log("[TurnEngine] Battle turns are starting!");
        }
        this.currentTurn = 0;
        this.initializeTurnOrder();
        // 전투 시작 시 모든 유닛을 AIEngine에 등록
        const allUnits = this.battleSimulationManager.unitsOnGrid;
        this.aiEngine.cleanup();
        allUnits.forEach(unit => {
            if (unit.type === ATTACK_TYPES.ENEMY) {
                this.aiEngine.registerUnit(unit, allUnits);
            }
        });

        this.statusEffectManager.turnCountManager.clearAllEffects();
        this.setState(new StartTurnState(this));
    }


    addTurnPhaseCallback(phase, callback) {
        if (this.turnPhaseCallbacks[phase]) {
            this.turnPhaseCallbacks[phase].push(callback);
            if (GAME_DEBUG_MODE) {
                console.log(`[TurnEngine] Registered callback for '${phase}' phase.`);
            }
        } else {
            console.warn(`[TurnEngine] Invalid turn phase: ${phase}`);
        }
    }
}
