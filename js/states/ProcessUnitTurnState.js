import { TurnState } from './TurnState.js';
import { EndTurnState } from './EndTurnState.js';
import { GAME_DEBUG_MODE } from '../constants.js';

export class ProcessUnitTurnState extends TurnState {
    async enter() {
        const bsm = this.turnEngine.battleSimulationManager;
        const currentTurnUnits = this.turnEngine.turnOrderManager.getTurnOrder();
        for (let i = 0; i < currentTurnUnits.length; i++) {
            const unit = currentTurnUnits[i];
            if (unit.currentHp <= 0) {
                if (GAME_DEBUG_MODE) console.log(`%c[ProcessUnitTurnState] ${unit.name}의 턴을 건너뜁니다 (HP: 0).`, "color: gray;");
                continue;
            }

            this.turnEngine.activeUnitIndex = i;
            if (GAME_DEBUG_MODE) console.log(`%c[ProcessUnitTurnState] 현재 행동 유닛: ${unit.name} (ID: ${unit.id})`, "color: lightblue;");
            this.turnEngine.eventManager.emit('unitTurnStart', { unitId: unit.id, unitName: unit.name });

            const activeEffects = this.turnEngine.statusEffectManager.getUnitActiveEffects(unit.id);
            let canUnitAct = true;
            if (activeEffects) {
                for (const [, effect] of activeEffects.entries()) {
                    if (effect.effectData.effect.canAct === false) {
                        canUnitAct = false;
                        break;
                    }
                }
            }

            if (!canUnitAct) {
                await this.turnEngine.delayEngine.waitFor(500);
            } else {
                await this.turnEngine.aiEngine.runUnitAI(unit.id);
            }

            this.turnEngine.eventManager.emit('turnPhase', { phase: 'unitActions', unitId: unit.id, turn: this.turnEngine.currentTurn });
            for (const cb of this.turnEngine.turnPhaseCallbacks.unitActions) {
                await cb(unit);
            }
            this.turnEngine.eventManager.emit('unitTurnEnd', { unitId: unit.id, unitName: unit.name });

            await this.turnEngine.timingEngine.processActions();
            this.turnEngine.timingEngine.clearActions();
        }
        this.turnEngine.setState(new EndTurnState(this.turnEngine));
    }
}
