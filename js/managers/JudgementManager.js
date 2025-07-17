import { GAME_EVENTS, GAME_DEBUG_MODE } from '../constants.js';

/**
 * 전투의 규칙과 흐름을 감시하고, 룰 위반 시 경고를 출력하는 심판 매니저입니다.
 */
export class JudgementManager {
    constructor(eventManager) {
        if (!GAME_DEBUG_MODE) return; // 디버그 모드가 아니면 동작하지 않음

        console.log("⚖️ JudgementManager initialized. The court is now in session. ⚖️");
        this.eventManager = eventManager;

        this.currentTurn = 0;
        this.activeUnit = null;
        this.expectedAction = null;
        this.actualActionTaken = false;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.TURN_START, data => {
            this.currentTurn = data.turn;
        });

        this.eventManager.subscribe(GAME_EVENTS.UNIT_TURN_START, data => {
            this.activeUnit = { id: data.unitId, name: data.unitName };
            this.expectedAction = null;
            this.actualActionTaken = false;
            if (GAME_DEBUG_MODE) console.log(`[JudgementManager] Watching turn for: ${this.activeUnit.name}`);
        });

        this.eventManager.subscribe(GAME_EVENTS.AI_ACTION_DECIDED, data => {
            if (this.activeUnit && this.activeUnit.id === data.unitId) {
                this.expectedAction = data.decidedAction;
                if (GAME_DEBUG_MODE) console.log(`[JudgementManager] Expected action for ${this.activeUnit.name}:`, this.expectedAction);
            }
        });
        
        // 유닛의 실제 행동을 감지
        this.eventManager.subscribe(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, data => {
            if (this.activeUnit && this.activeUnit.id === data.attackerId) {
                this.actualActionTaken = true;
            }
        });
        this.eventManager.subscribe(GAME_EVENTS.SKILL_EXECUTED, data => {
             if (this.activeUnit && this.activeUnit.id === data.userId) {
                this.actualActionTaken = true;
            }
        });

        this.eventManager.subscribe(GAME_EVENTS.UNIT_TURN_END, this._judgeTurnAction.bind(this));
    }

    _judgeTurnAction(data) {
        if (!this.activeUnit || this.activeUnit.id !== data.unitId) return;

        // 시나리오 1: AI는 행동을 결정했지만, 실제로는 아무 행동도 하지 않았을 때
        if (this.expectedAction && !this.actualActionTaken) {
            console.warn(
                `%c⚖️ JUDGEMENT ⚖️: Rule Violation Detected!`,
                'color: yellow; font-size: 14px; font-weight: bold;'
            );
            console.warn(`- Unit: ${this.activeUnit.name} (ID: ${this.activeUnit.id})`);
            console.warn(`- Turn: ${this.currentTurn}`);
            console.warn(`- Violation: 'Inaction'. The AI decided on an action but no corresponding action was executed.`);
            console.warn(`- Expected Action:`, this.expectedAction);
            console.warn(`- Reason: This often happens if the AI's chosen target becomes invalid (e.g., dies) before the action executes, or if there's a logic bug in the skill's execution flow that prevents it from completing.`);
        }

        // 앞으로 더 많은 규칙을 여기에 추가할 수 있습니다.
    }
}
