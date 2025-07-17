// js/managers/UnitStatManager.js

import { GAME_EVENTS } from '../constants.js';

/**
 * 유닛의 모든 핵심 스탯(HP, 배리어 등) 변경을 중앙에서 관리합니다.
 */
export class UnitStatManager {
    constructor(eventManager, battleSimulationManager) {
        console.log("\ud83d\udcca UnitStatManager initialized. Centralizing all stat modifications. \ud83d\udcca");
        this.eventManager = eventManager;
        this.battleSim = battleSimulationManager;

        this.eventManager.subscribe(GAME_EVENTS.DAMAGE_CALCULATED, this._onDamageCalculated.bind(this));
    }

    /**
     * 계산된 데미지 결과를 받아 실제 유닛의 스탯을 변경합니다.
     * @param {{unitId: string, hpDamageDealt: number, barrierDamageDealt: number, newHp: number, newBarrier: number}} data
     */
    _onDamageCalculated({ unitId, hpDamageDealt, barrierDamageDealt, newHp, newBarrier }) {
        const unit = this.battleSim.unitsOnGrid.find(u => u.id === unitId);
        if (!unit) return;

        unit.currentHp = newHp;
        unit.currentBarrier = newBarrier;

        console.log(`[UnitStatManager] Stats updated for ${unit.name}: HP=${newHp}, Barrier=${newBarrier}`);

        if (barrierDamageDealt > 0) {
            this.eventManager.emit(GAME_EVENTS.DISPLAY_DAMAGE, { unitId: unitId, damage: barrierDamageDealt, color: 'yellow' });
        }
        if (hpDamageDealt > 0) {
            this.eventManager.emit(GAME_EVENTS.DISPLAY_DAMAGE, { unitId: unitId, damage: hpDamageDealt, color: 'red' });
        }
    }
}
