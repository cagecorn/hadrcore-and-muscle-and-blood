import { statEngine } from './StatEngine.js';
import { birthReportManager } from '../debug/BirthReportManager.js';
import { uniqueIDManager } from './UniqueIDManager.js';

/**
 * 몬스터의 생성과 관리를 담당하는 엔진
 */
class MonsterEngine {
    constructor() {
        this.alliedMonsters = new Map();
        this.enemyMonsters = new Map();
    }

    /**
     * 몬스터를 생성하여 등록합니다.
     * @param {object} baseData 기본 몬스터 데이터
     * @param {string} type 'ally' 또는 'enemy'
     * @returns {object} 생성된 몬스터 인스턴스
     */
    spawnMonster(baseData = {}, type = 'enemy') {
        // ✨ [수정] 원본 데이터가 변경되지 않도록 깊은 복사본을 생성합니다.
        const cleanBaseData = JSON.parse(JSON.stringify(baseData));

        const id = uniqueIDManager.getNextId();
        const instance = {
            ...cleanBaseData,
            uniqueId: id,
            instanceName: cleanBaseData.instanceName || cleanBaseData.name || `Monster${id}`,
            // 생성된 몬스터가 어느 진영 소속인지 명확히 남겨둔다.
            team: type,
            skillSlots: [null, null, null, null] // 몬스터를 위한 스킬 슬롯 초기화
        };

        instance.finalStats = statEngine.calculateStats(instance, cleanBaseData.baseStats || {}, []);

        // ✨ onSpawn 콜백이 있으면 실행
        if (typeof cleanBaseData.onSpawn === 'function') {
            cleanBaseData.onSpawn(instance);
        }

        if (type === 'ally') {
            this.alliedMonsters.set(id, instance);
            birthReportManager.logNewUnit(instance, '아군 몬스터');
        } else {
            this.enemyMonsters.set(id, instance);
            birthReportManager.logNewUnit(instance, '적군 몬스터');
        }
        return instance;
    }

    /**
     * 특정 진영의 모든 몬스터 배열을 반환합니다.
     */
    getAllMonsters(type = 'enemy') {
        return Array.from(type === 'ally' ? this.alliedMonsters.values() : this.enemyMonsters.values());
    }
}

export const monsterEngine = new MonsterEngine();
