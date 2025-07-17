import { ATTACK_TYPES } from '../constants.js';

export class CoordinateManager {
    /**
     * CoordinateManager를 초기화합니다.
     * @param {BattleSimulationManager} battleSimulationManager - 유닛 데이터를 가져오기 위한 BattleSimulationManager 인스턴스
     * @param {BattleGridManager} battleGridManager - 그리드 데이터를 가져오기 위한 BattleGridManager 인스턴스 (옵션)
     */
    constructor(battleSimulationManager, battleGridManager) {
        console.log("\ud83d\uddfe CoordinateManager initialized. Ready to pinpoint locations and analyze the battlefield. \ud83d\uddfe");
        this.battleSimulationManager = battleSimulationManager;
        this.battleGridManager = battleGridManager; // 그리드 크기나 타일 속성 확인을 위해 참조
    }

    /**
     * 특정 유닛의 현재 그리드 좌표를 가져옵니다.
     * @param {string} unitId - 유닛의 고유 ID
     * @returns {{x: number, y: number} | null} 유닛의 그리드 좌표 또는 유닛을 찾을 수 없는 경우 null
     */
    getUnitPosition(unitId) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (unit) {
            console.log(`[CoordinateManager] Found unit '${unitId}' at (${unit.gridX}, ${unit.gridY}).`);
            return { x: unit.gridX, y: unit.gridY };
        }
        console.warn(`[CoordinateManager] Unit '${unitId}' not found.`);
        return null;
    }

    /**
     * 주어진 그리드 타일이 다른 유닛에 의해 점유되어 있는지 확인합니다.
     * @param {number} gridX - 확인할 타일의 X 좌표
     * @param {number} gridY - 확인할 타일의 Y 좌표
     * @param {string | null} [ignoreUnitId=null] - 검사에서 제외할 유닛의 ID (예: 자기 자신의 타일 체크 시)
     * @returns {boolean} 타일이 점유되어 있으면 true, 아니면 false
     */
    isTileOccupied(gridX, gridY, ignoreUnitId = null) {
        // BattleSimulationManager의 isTileOccupied 메서드를 활용합니다.
        const occupied = this.battleSimulationManager.isTileOccupied(gridX, gridY, ignoreUnitId);
        if (occupied) {
            console.log(`[CoordinateManager] Tile (${gridX}, ${gridY}) is occupied (ignoring '${ignoreUnitId}').`);
        } else {
            console.log(`[CoordinateManager] Tile (${gridX}, ${gridY}) is not occupied (ignoring '${ignoreUnitId}').`);
        }
        return occupied;
    }

    /**
     * 특정 반경 내에 있는 모든 유닛을 찾습니다.
     * @param {number} centerX - 중심 타일의 X 좌표
     * @param {number} centerY - 중심 타일의 Y 좌표
     * @param {number} radius - 반경 (타일 단위)
     * @param {string | null} [typeFilter=null] - 필터링할 유닛 타입 (예: ATTACK_TYPES.ENEMY, ATTACK_TYPES.MERCENARY 등)
     * @returns {object[]} 반경 내에 있는 유닛들의 배열
     */
    getUnitsInRadius(centerX, centerY, radius, typeFilter = null) {
        const unitsInRange = [];
        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue; // 죽은 유닛은 제외

            // 맨해튼 거리 계산: |x1 - x2| + |y1 - y2|
            const distance = Math.abs(unit.gridX - centerX) + Math.abs(unit.gridY - centerY);

            if (distance <= radius) {
                if (typeFilter && unit.type !== typeFilter) {
                    continue; // 타입 필터가 있고 일치하지 않으면 건너뛰기
                }
                unitsInRange.push(unit);
            }
        }
        console.log(`[CoordinateManager] Found ${unitsInRange.length} units within radius ${radius} from (${centerX}, ${centerY}) with type filter '${typeFilter || 'none'}'.`);
        return unitsInRange;
    }

    /**
     * 특정 유닛으로부터 가장 가까운 특정 타입의 유닛을 찾습니다.
     * @param {string} sourceUnitId - 기준이 되는 유닛의 ID
     * @param {string | null} [targetType=null] - 찾을 대상 유닛의 타입 (예: ATTACK_TYPES.ENEMY, ATTACK_TYPES.MERCENARY)
     * @param {boolean} [includeDeadUnits=false] - 죽은 유닛도 포함할지 여부
     * @returns {object | null} 가장 가까운 대상 유닛 또는 찾을 수 없는 경우 null
     */
    findClosestUnit(sourceUnitId, targetType = null, includeDeadUnits = false) {
        const sourceUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === sourceUnitId);
        if (!sourceUnit) {
            console.warn(`[CoordinateManager] Source unit '${sourceUnitId}' not found.`);
            return null;
        }

        let closestUnit = null;
        let minDistance = Infinity;

        for (const targetUnit of this.battleSimulationManager.unitsOnGrid) {
            if (targetUnit.id === sourceUnitId) continue; // 자기 자신은 제외
            if (!includeDeadUnits && targetUnit.currentHp <= 0) continue; // 죽은 유닛 제외 (설정에 따름)
            if (targetType && targetUnit.type !== targetType) continue; // 타입 필터가 있고 일치하지 않으면 건너뛰기

            const distance = Math.abs(sourceUnit.gridX - targetUnit.gridX) + Math.abs(sourceUnit.gridY - targetUnit.gridY);

            if (distance < minDistance) {
                minDistance = distance;
                closestUnit = targetUnit;
            }
        }
        if (closestUnit) {
            console.log(`[CoordinateManager] Closest unit to '${sourceUnit.name}' is '${closestUnit.name}' (Distance: ${minDistance}).`);
        } else {
            console.log(`[CoordinateManager] No closest unit found for '${sourceUnit.name}' with type '${targetType || 'any'}'.`);
        }
        return closestUnit;
    }
}
