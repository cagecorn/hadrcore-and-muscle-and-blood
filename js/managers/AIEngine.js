// js/managers/AIEngine.js

import { UnitAI } from '../ai/UnitAI.js';

export class AIEngine {
    constructor() {
        console.log("\u2699\ufe0f AIEngine initialized. Ready to compute strategies. \u2699\ufe0f");
        this.unitAIs = new Map();
    }

    registerUnit(unit) {
        this.unitAIs.set(unit.id, new UnitAI(unit));
    }

    removeUnit(unitId) {
        this.unitAIs.delete(unitId);
    }

    update(allUnits) {
        for (const ai of this.unitAIs.values()) {
            ai.update(allUnits);
        }
    }
}
