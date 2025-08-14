import { debugAIMemoryManager } from '../debug/DebugAIMemoryManager.js';

/**
 * IndexedDB를 사용하여 각 MBTI 아키타입의 집단 전투 경험을 저장하고 관리하는 엔진
 */
class ArchetypeMemoryEngine {
    constructor() {
        this.db = null;
        this.dbName = 'ArchetypeMemoryDB'; // DB 이름 변경
        this.storeName = 'archetypeCombatMemory'; // 스토어 이름 변경
        // [수정] 생성자에서 초기화 Promise를 생성하고 저장합니다.
        this.initPromise = this._initializeDB();
    }

    // [수정] initDB를 Promise를 반환하는 내부 메서드로 변경
    _initializeDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains(this.storeName)) {
                    this.db.createObjectStore(this.storeName, { keyPath: 'id' }); // id는 mbtiString
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('[ArchetypeMemoryEngine] IndexedDB가 성공적으로 초기화되었습니다.');
                resolve(this.db); // 성공 시 Promise를 resolve 합니다.
            };

            request.onerror = (event) => {
                console.error('[ArchetypeMemoryEngine] IndexedDB 초기화 오류:', event.target.errorCode);
                reject(event.target.error); // 실패 시 Promise를 reject 합니다.
            };
        });
    }

    /**
     * 특정 아키타입의 집단 기억(가중치)을 가져옵니다.
     * @param {string} mbtiString - 'INTJ', 'ENFP' 등 MBTI 아키타입 문자열
     * @returns {Promise<object>} - 대상 ID를 키로 갖는 가중치 객체
     */
    async getMemory(mbtiString) {
        // [신규] DB가 준비될 때까지 기다립니다.
        await this.initPromise;

        return new Promise((resolve, reject) => {
            if (!this.db) return resolve({});
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(mbtiString);

            request.onsuccess = (event) => {
                // 아키타입 로그는 별도로 관리하므로 디버그 로그는 생략
                resolve(event.target.result?.memory || {});
            };

            request.onerror = (event) => {
                console.error('[ArchetypeMemoryEngine] 메모리 읽기 오류:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * (중요) 외부에서 분석된 학습 데이터를 DB에 업데이트합니다.
     * @param {string} mbtiString - 업데이트할 아키타입
     * @param {object} learnedMemory - 분석을 통해 새로 생성된 기억 데이터
     */
    async updateMemory(mbtiString, learnedMemory) {
        // [신규] DB가 준비될 때까지 기다립니다.
        await this.initPromise;

        return new Promise((resolve, reject) => {
            if (!this.db) return reject('DB not initialized');
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            store.put({ id: mbtiString, memory: learnedMemory });
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);
        });
    }
}

export const archetypeMemoryEngine = new ArchetypeMemoryEngine();
