// js/managers/TargetingManager.js

import { ATTACK_TYPES } from '../constants.js'; // ATTACK_TYPES 상수를 활용

export class TargetingManager {
    /**
     * TargetingManager를 초기화합니다.
     * @param {BattleSimulationManager} battleSimulationManager - 유닛 데이터를 가져오기 위한 BattleSimulationManager 인스턴스
     */
    constructor(battleSimulationManager) {
        console.log("\uD83C\uDFC6 TargetingManager initialized. Ready to scout for specific units. \uD83C\uDFC6");
        this.battleSimulationManager = battleSimulationManager;
    }

    /**
     * 현재 전장에 있는 유닛들 중에서 특정 조건에 맞는 유닛들을 필터링합니다.
     * @param {function(object): boolean} conditionFn - 각 유닛에 대해 실행될 조건 함수. true를 반환하면 포함됩니다.
     * @param {string | null} [typeFilter=null] - 필터링할 유닛 타입 (예: ATTACK_TYPES.ENEMY, ATTACK_TYPES.MERCENARY). null이면 모든 타입을 포함합니다.
     * @returns {object[]} 조건에 맞는 유닛들의 배열
     */
    getUnitsByCondition(conditionFn, typeFilter = null) {
        const matchingUnits = [];
        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue; // 죽은 유닛은 제외

            if (typeFilter && unit.type !== typeFilter) {
                continue; // 타입 필터가 있고 일치하지 않으면 건너뛰기
            }

            if (conditionFn(unit)) {
                matchingUnits.push(unit);
            }
        }
        console.log(`[TargetingManager] Found ${matchingUnits.length} units matching condition (Type filter: ${typeFilter || 'none'}).`);
        return matchingUnits;
    }

    /**
     * 특정 타입의 유닛 중 현재 체력이 가장 낮은 유닛을 찾습니다.
     * @param {string | null} [typeFilter=null] - 필터링할 유닛 타입 (예: ATTACK_TYPES.ENEMY, ATTACK_TYPES.MERCENARY)
     * @returns {object | null} 체력이 가장 낮은 유닛 또는 찾을 수 없는 경우 null
     */
    getLowestHpUnit(typeFilter = null) {
        let lowestHpUnit = null;
        let minHp = Infinity;

        this.getUnitsByCondition(unit => {
            if (unit.currentHp < minHp) {
                minHp = unit.currentHp;
                lowestHpUnit = unit;
            }
            return false; // 모든 유닛을 순회하며 비교만 하므로 항상 false 반환
        }, typeFilter);

        if (lowestHpUnit) {
            console.log(`[TargetingManager] Lowest HP unit (${typeFilter || 'any'}): ${lowestHpUnit.name} (${lowestHpUnit.currentHp} HP).`);
        } else {
            console.log(`[TargetingManager] No lowest HP unit found for type '${typeFilter || 'any'}'.`);
        }
        return lowestHpUnit;
    }

    /**
     * 특정 타입의 유닛 중 기본 공격력이 가장 높은 유닛을 찾습니다.
     * (참고: 현재 '피해량'은 누적된 값이 없으므로, '기본 공격 스탯' 기준으로 색적합니다.)
     * @param {string | null} [typeFilter=null] - 필터링할 유닛 타입
     * @returns {object | null} 공격력이 가장 높은 유닛 또는 찾을 수 없는 경우 null
     */
    getHighestAttackUnit(typeFilter = null) {
        let highestAttackUnit = null;
        let maxAttack = -1;

        this.getUnitsByCondition(unit => {
            const attackStat = unit.baseStats ? unit.baseStats.attack || 0 : 0;
            if (attackStat > maxAttack) {
                maxAttack = attackStat;
                highestAttackUnit = unit;
            }
            return false;
        }, typeFilter);

        if (highestAttackUnit) {
            console.log(`[TargetingManager] Highest Attack unit (${typeFilter || 'any'}): ${highestAttackUnit.name} (${highestAttackUnit.baseStats.attack} Attack).`);
        } else {
            console.log(`[TargetingManager] No highest Attack unit found for type '${typeFilter || 'any'}'.`);
        }
        return highestAttackUnit;
    }

    /**
     * 특정 타입의 유닛 중 기본 마법 공격력이 가장 높은 유닛을 찾습니다.
     * @param {string | null} [typeFilter=null] - 필터링할 유닛 타입
     * @returns {object | null} 마법 공격력이 가장 높은 유닛 또는 찾을 수 없는 경우 null
     */
    getHighestMagicUnit(typeFilter = null) {
        let highestMagicUnit = null;
        let maxMagic = -1;

        this.getUnitsByCondition(unit => {
            const magicStat = unit.baseStats ? unit.baseStats.magic || 0 : 0;
            if (magicStat > maxMagic) {
                maxMagic = magicStat;
                highestMagicUnit = unit;
            }
            return false;
        }, typeFilter);

        if (highestMagicUnit) {
            console.log(`[TargetingManager] Highest Magic unit (${typeFilter || 'any'}): ${highestMagicUnit.name} (${highestMagicUnit.baseStats.magic} Magic).`);
        } else {
            console.log(`[TargetingManager] No highest Magic unit found for type '${typeFilter || 'any'}'.`);
        }
        return highestMagicUnit;
    }
}

