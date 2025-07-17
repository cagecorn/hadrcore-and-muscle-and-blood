// js/managers/TargetingManager.js

import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 전투에서 목표물을 찾고 우선순위를 정하는 '색적' 역할을 담당합니다.
 */
export class TargetingManager {
    constructor(battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("🎯 TargetingManager initialized. Ready to find targets. 🎯");
        this.battleSimulationManager = battleSimulationManager;
    }

    /**
     * 지정된 기준에 따라 최적의 목표 유닛을 찾습니다.
     * @param {string} unitType - 찾을 유닛의 타입 ('enemy' 또는 'ally')
     * @param {string} criteria - 목표 선정 기준 ('lowestHp', 'closest', 등)
     * @param {object} userUnit - 행동의 주체인 유닛 (기준이 'closest'일 때 필요)
     * @returns {object | null} 찾아낸 목표 유닛 또는 null
     */
    findBestTarget(unitType, criteria, userUnit) {
        const allUnits = this.battleSimulationManager.unitsOnGrid;
        const potentialTargets = allUnits.filter(u => u.type !== userUnit.type && u.currentHp > 0);

        if (potentialTargets.length === 0) {
            return null;
        }

        switch (criteria) {
            case 'lowestHp':
                return this.getLowestHpUnit(potentialTargets);
            case 'closest':
                return this.getClosestUnit(userUnit, potentialTargets);
            // 향후 'highestThreat', 'mostVulnerable' 등 다양한 기준 추가 가능
            default:
                // 기본적으로는 체력이 가장 낮은 유닛을 반환
                return this.getLowestHpUnit(potentialTargets);
        }
    }

    /**
     * 주어진 유닛 목록에서 현재 체력이 가장 낮은 유닛을 반환합니다.
     * @param {Array<object>} unitList - 대상 유닛 목록
     * @returns {object | null}
     */
    getLowestHpUnit(unitList) {
        return unitList.reduce((lowest, unit) => {
            if (!lowest || unit.currentHp < lowest.currentHp) {
                return unit;
            }
            return lowest;
        }, null);
    }

    /**
     * 사용자 유닛으로부터 가장 가까운 유닛을 반환합니다.
     * @param {object} userUnit - 기준점 유닛
     * @param {Array<object>} unitList - 대상 유닛 목록
     * @returns {object | null}
     */
    getClosestUnit(userUnit, unitList) {
        return unitList.reduce((closest, unit) => {
            const dist = Math.abs(userUnit.gridX - unit.gridX) + Math.abs(userUnit.gridY - unit.gridY);
            if (!closest || dist < closest.distance) {
                return { unit: unit, distance: dist };
            }
            return closest;
        }, null)?.unit; // 결과 객체에서 unit만 추출
    }
}
