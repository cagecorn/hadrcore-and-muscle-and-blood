import { AttackState } from './states/AttackState.js';

export class UnitAI {
    constructor(unit) {
        this.unit = unit;
        this.activeState = new AttackState();
    }

    update(allUnits) {
        const newState = this.activeState.execute(this.unit, allUnits);
        if (newState) {
            this.activeState.exit(this.unit);
            this.activeState = newState;
            this.activeState.enter(this.unit);
        }
    }
}
