import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 유닛의 시야와 관련된 계산을 전담하는 매니저
 */
class VisionManager {
    constructor() {
        debugLogEngine.log('VisionManager', '시야 매니저가 초기화되었습니다.');
    }

    /**
     * 특정 유닛의 시야 범위 내에 있는 모든 적 유닛을 찾습니다.
     * @param {object} unit - 기준이 되는 유닛
     * @param {Array<object>} allEnemies - 탐색 대상이 되는 모든 적 유닛 목록
     * @param {number} sightRange - 유닛의 시야 범위 (그리드 칸 수)
     * @returns {Array<object>} - 시야 내에 있는 적 유닛들의 배열
     */
    findEnemiesInSight(unit, allEnemies, sightRange) {
        if (!unit || !allEnemies || !sightRange) return [];

        const unitPos = { x: unit.gridX, y: unit.gridY };
        const enemiesInSight = [];

        allEnemies.forEach(enemy => {
            if (enemy.currentHp <= 0) return; // 이미 쓰러진 적은 제외

            const enemyPos = { x: enemy.gridX, y: enemy.gridY };
            const distance = Math.abs(unitPos.x - enemyPos.x) + Math.abs(unitPos.y - enemyPos.y);

            if (distance <= sightRange) {
                enemiesInSight.push(enemy);
            }
        });

        if (enemiesInSight.length > 0) {
            const enemyNames = enemiesInSight.map(e => e.instanceName).join(', ');
            debugLogEngine.log('VisionManager', `${unit.instanceName}의 시야(${sightRange}) 내에 적 발견: ${enemyNames}`);
        }

        return enemiesInSight;
    }
}

// 싱글턴으로 관리
export const visionManager = new VisionManager();
