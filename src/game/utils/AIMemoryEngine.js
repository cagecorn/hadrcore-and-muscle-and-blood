import { debugAIMemoryManager } from '../debug/DebugAIMemoryManager.js';

/**
 * IndexedDB를 사용하여 각 AI 유닛의 전투 경험을 저장하고 관리하는 '기억' 엔진
 */
class AIMemoryEngine {
    constructor() {
        this.db = null;
        this.dbName = 'AIMemoryDB';
        this.storeName = 'combatMemory';
        // [수정] 생성자에서 초기화 Promise를 생성하고 저장합니다.
        this.initPromise = this._initializeDB();
    }

    /**
     * IndexedDB를 초기화하고 객체 저장소를 생성합니다.
     */
    // [수정] initDB를 Promise를 반환하는 내부 메서드로 변경
    _initializeDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains(this.storeName)) {
                    this.db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('[AIMemoryEngine] IndexedDB가 성공적으로 초기화되었습니다.');
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('[AIMemoryEngine] IndexedDB 초기화 오류:', event.target.errorCode);
                reject(event.target.error);
            };
        });
    }

    /**
     * 특정 공격자와 대상에 대한 기억(가중치)을 가져옵니다.
     * @param {number} attackerId - 공격자 유닛의 고유 ID
     * @returns {Promise<object>} - 대상 ID를 키로 갖는 가중치 객체
     */
    async getMemory(attackerId) {
        // [신규] DB가 준비될 때까지 기다립니다.
        await this.initPromise;

        return new Promise((resolve, reject) => {
            if (!this.db) {
                return resolve(null);
            }
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(attackerId);

            request.onsuccess = (event) => {
                debugAIMemoryManager.logMemoryRead(attackerId, event.target.result?.memory || null);
                resolve(event.target.result?.memory || {});
            };

            request.onerror = (event) => {
                console.error('[AIMemoryEngine] 메모리 읽기 오류:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 전투 결과를 바탕으로 AI의 기억(가중치)을 갱신합니다.
     * @param {number} attackerId - 공격자 ID
     * @param {number} targetId - 대상 ID
     * @param {string} attackType - 공격 타입 ('melee', 'ranged', 'magic')
     * @param {string} hitType - 전투 결과 ('치명타', '약점', '완화', '막기')
     */
    async updateMemory(attackerId, targetId, attackType, hitType) {
        // [신규] DB가 준비될 때까지 기다립니다.
        await this.initPromise;
        if (!this.db || !attackType || !hitType) return;

        const memory = await this.getMemory(attackerId);
        const targetMemoryKey = `target_${targetId}`;
        const weightKey = `${attackType}_weight`;

        if (!memory[targetMemoryKey]) {
            memory[targetMemoryKey] = {};
        }

        if (memory[targetMemoryKey][weightKey] === undefined) {
            memory[targetMemoryKey][weightKey] = 1.0;
        }

        let adjustment = 0;
        if (hitType === '치명타' || hitType === '약점') {
            adjustment = 0.1;
        } else if (hitType === '완화' || hitType === '막기') {
            adjustment = -0.15;
        }

        if (adjustment !== 0) {
            const oldValue = memory[targetMemoryKey][weightKey];
            memory[targetMemoryKey][weightKey] = Math.max(0.1, Math.min(2.0, oldValue + adjustment));
            debugAIMemoryManager.logMemoryUpdate(attackerId, targetId, attackType, oldValue, memory[targetMemoryKey][weightKey]);
        }

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.put({ id: attackerId, memory: memory });
    }

    /**
     * 특정 유닛의 '위험 타일' 기억을 갱신합니다.
     * @param {number} unitId - 기억을 갱신할 유닛 ID
     * @param {number} col - 위험한 타일의 열
     * @param {number} row - 위험한 타일의 행
     * @param {number} dangerIncrease - 증가시킬 위험도
     */
    async updateTileMemory(unitId, col, row, dangerIncrease) {
        await this.initPromise;
        if (!this.db) return;

        const memory = await this.getMemory(unitId);
        if (!memory.dangerousTiles) {
            memory.dangerousTiles = {};
        }

        const tileKey = `${col},${row}`;
        const oldDanger = memory.dangerousTiles[tileKey] || 0;
        memory.dangerousTiles[tileKey] = oldDanger + dangerIncrease;

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.put({ id: unitId, memory: memory });

        console.log(
            `%c[AIMemoryEngine] 유닛 ${unitId}가 (${tileKey}) 타일을 위험 지역으로 기억합니다. (위험도: ${memory.dangerousTiles[tileKey]})`,
            'color: #8b5cf6;'
        );
    }
}

export const aiMemoryEngine = new AIMemoryEngine();
