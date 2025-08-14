import { debugLogEngine } from '../utils/DebugLogEngine.js';
import { statEngine } from '../utils/StatEngine.js';

/**
 * 장비 장착/해제 시 스탯 변화를 추적하고 기록하는 디버그 매니저
 */
class DebugEquipmentManager {
    constructor() {
        this.name = 'DebugEquipment';
        debugLogEngine.register(this);
    }

    /**
     * 장비 변경 후 유닛의 최종 스탯을 로그로 출력합니다.
     * @param {object} unit - 스탯이 변경된 유닛
     * @param {string} action - 변경 원인 (예: '장착', '해제', '교체')
     */
    logStatChange(unit, action) {
        if (!unit) return;

        // 최신 스탯을 다시 계산합니다.
        const finalStats = statEngine.calculateStats(unit, unit.baseStats, []);

        console.groupCollapsed(
            `%c[${this.name}]`,
            `color: #f59e0b; font-weight: bold;`,
            `'${unit.instanceName}' (ID: ${unit.uniqueId}) 스탯 업데이트 (${action})`
        );

        console.table(finalStats);

        console.groupEnd();
    }
}

export const debugEquipmentManager = new DebugEquipmentManager();
