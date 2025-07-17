import { TurnState } from './TurnState.js';
import { StartTurnState } from './StartTurnState.js';
import { GAME_EVENTS } from '../constants.js';

export class EndTurnState extends TurnState {
    async enter() {
        this.turnEngine.eventManager.emit(GAME_EVENTS.TURN_PHASE, { phase: 'endOfTurn', turn: this.turnEngine.currentTurn });
        for (const cb of this.turnEngine.turnPhaseCallbacks.endOfTurn) {
            await cb();
        }
        console.log(`--- Turn ${this.turnEngine.currentTurn} Ends ---\n`);
        await this.turnEngine.delayEngine.waitFor(this.turnEngine.measureManager.get('timing.turnEndDelay'));
        if (this.turnEngine.eventManager.getGameRunningState()) {
            this.turnEngine.setState(new StartTurnState(this.turnEngine));
        } else {
            console.log('[TurnEngine] Game is paused or ended, not proceeding to next turn.');
        }
    }
}
