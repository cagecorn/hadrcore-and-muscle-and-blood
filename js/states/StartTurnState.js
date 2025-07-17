import { TurnState } from './TurnState.js';
import { ProcessUnitTurnState } from './ProcessUnitTurnState.js';
import { GAME_EVENTS, ATTACK_TYPES } from '../constants.js';

export class StartTurnState extends TurnState {
    async enter() {
        const livingMercenaries = this.turnEngine.battleSimulationManager.unitsOnGrid.filter(u => u.type === ATTACK_TYPES.MERCENARY && u.currentHp > 0);
        const livingEnemies = this.turnEngine.battleSimulationManager.unitsOnGrid.filter(u => u.type === ATTACK_TYPES.ENEMY && u.currentHp > 0);
        if (livingMercenaries.length === 0 || livingEnemies.length === 0) {
            const reason = livingMercenaries.length === 0 ? 'allMercenariesDefeated' : 'allEnemiesDefeated';
            this.turnEngine.eventManager.emit(GAME_EVENTS.BATTLE_END, { reason });
            this.turnEngine.eventManager.setGameRunningState(false);
            return;
        }
        this.turnEngine.currentTurn++;
        console.log(`\n--- Turn ${this.turnEngine.currentTurn} Starts ---`);
        this.turnEngine.eventManager.emit(GAME_EVENTS.TURN_START, { turn: this.turnEngine.currentTurn });
        this.turnEngine.timingEngine.clearActions();
        this.turnEngine.eventManager.emit(GAME_EVENTS.TURN_PHASE, { phase: 'startOfTurn', turn: this.turnEngine.currentTurn });
        for (const cb of this.turnEngine.turnPhaseCallbacks.startOfTurn) {
            await cb();
        }
        this.turnEngine.setState(new ProcessUnitTurnState(this.turnEngine));
    }
}
