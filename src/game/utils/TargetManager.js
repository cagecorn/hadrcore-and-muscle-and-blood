import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 다양한 전략에 따라 적을 탐색하고 선정하는 것을 전담하는 매니저
 */
class TargetManager {
    constructor() {
        debugLogEngine.log('TargetManager', '타겟 매니저가 초기화되었습니다.');
    }

    /**
     * 유닛과 가장 가까운 거리에 있는 적을 찾습니다.
     * @param {object} unit - 기준이 되는 유닛
     * @param {Array<object>} enemyList - 탐색 대상이 되는 적 유닛 목록
     * @returns {object|null} - 찾은 적 유닛 또는 null
     */
    findNearestEnemy(unit, enemyList) {
        if (!unit || !enemyList || enemyList.length === 0) return null;

        let nearestEnemy = null;
        let minDistance = Infinity;

        const unitPos = { x: unit.gridX, y: unit.gridY };

        enemyList.forEach(enemy => {
            if (enemy.currentHp <= 0) return; // 이미 쓰러진 적은 제외
            const enemyPos = { x: enemy.gridX, y: enemy.gridY };
            const distance = Math.abs(unitPos.x - enemyPos.x) + Math.abs(unitPos.y - enemyPos.y);

            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });

        return nearestEnemy;
    }

    /**
     * 현재 체력이 가장 낮은 적을 찾습니다.
     * @param {Array<object>} enemyList - 탐색 대상이 되는 적 유닛 목록
     * @returns {object|null} - 찾은 적 유닛 또는 null
     */
    findLowestHealthEnemy(enemyList) {
        if (!enemyList || enemyList.length === 0) return null;

        return enemyList
            .filter(enemy => enemy.currentHp > 0)
            .sort((a, b) => a.currentHp - b.currentHp)[0] || null;
    }

    /**
     * 현재 체력이 가장 높은 적을 찾습니다.
     * @param {Array<object>} enemyList - 탐색 대상이 되는 적 유닛 목록
     * @returns {object|null} - 찾은 적 유닛 또는 null
     */
    findHighestHealthEnemy(enemyList) {
        if (!enemyList || enemyList.length === 0) return null;

        return enemyList
            .filter(enemy => enemy.currentHp > 0)
            .sort((a, b) => b.currentHp - a.currentHp)[0] || null;
    }
}

// 싱글턴으로 관리
export const targetManager = new TargetManager();
