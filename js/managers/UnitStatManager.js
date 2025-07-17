// js/managers/UnitStatManager.js

export class UnitStatManager {
    constructor(battleSimulationManager) {
        console.log("\ud83d\udcca UnitStatManager initialized. Centralizing all stat modifications. \ud83d\udcca");
        this.battleSim = battleSimulationManager;
    }

    _getUnit(unitId) {
        return this.battleSim.unitsOnGrid.find(u => u.id === unitId);
    }

    dealDamage(unitId, damageAmount) {
        const unit = this._getUnit(unitId);
        if (!unit) return;

        const barrier = unit.currentBarrier || 0;
        const damageAfterBarrier = Math.max(0, damageAmount - barrier);
        unit.currentBarrier = Math.max(0, barrier - damageAmount);
        unit.currentHp = Math.max(0, unit.currentHp - damageAfterBarrier);
        console.log(`[UnitStatManager] ${unit.name} takes ${damageAmount} damage. HP: ${unit.currentHp}, Barrier: ${unit.currentBarrier}`);
    }

    heal(unitId, healAmount) {
        const unit = this._getUnit(unitId);
        if (!unit) return;

        unit.currentHp = Math.min(unit.baseStats.hp, unit.currentHp + healAmount);
        console.log(`[UnitStatManager] ${unit.name} heals for ${healAmount}. HP: ${unit.currentHp}`);
    }

    applyBarrier(unitId, barrierAmount) {
        const unit = this._getUnit(unitId);
        if (!unit) return;
        unit.currentBarrier = (unit.currentBarrier || 0) + barrierAmount;
        console.log(`[UnitStatManager] ${unit.name} gains ${barrierAmount} barrier. Barrier: ${unit.currentBarrier}`);
    }
}
