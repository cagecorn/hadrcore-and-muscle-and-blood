import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 게임에서 사용될 공유 자원의 종류를 정의합니다.
 */
export const SHARED_RESOURCE_TYPES = {
    FIRE: '불',
    WATER: '물',
    WIND: '바람',
    EARTH: '대지',
    LIGHT: '빛',
    DARK: '어둠',
    IRON: '철',
    POISON: '독'
};

/**
 * 파티가 공유하는 자원을 관리하는 중앙 엔진 (싱글턴)
 */
class SharedResourceEngine {
    constructor() {
        // ✨ [수정] 자원 저장소를 ally와 enemy로 분리
        this.resources = {
            ally: new Map(),
            enemy: new Map()
        };
        this._initializeResourceMap('ally');
        this._initializeResourceMap('enemy');
        debugLogEngine.log('SharedResourceEngine', '공유 자원 엔진이 초기화되었습니다.');
    }

    _initializeResourceMap(team) {
        Object.keys(SHARED_RESOURCE_TYPES).forEach(key => {
            this.resources[team].set(key, 0);
        });
    }

    initialize(team) {
        this._initializeResourceMap(team);
        debugLogEngine.log('SharedResourceEngine', `[${team}] 팀의 모든 공유 자원을 초기화했습니다.`);
    }
    
    // ✨ [수정] 모든 메서드에 team 파라미터 추가
    addResource(team, type, amount) {
        if (this.resources[team] && this.resources[team].has(type) && amount > 0) {
            const currentAmount = this.resources[team].get(type);
            this.resources[team].set(type, currentAmount + amount);
        }
    }

    spendResource(team, cost) {
        // ✨ [수정] 여러 자원을 동시에 소모할 수 있도록 배열로 처리
        const costs = Array.isArray(cost) ? cost : [cost];
        if (!this.hasResources(team, costs)) {
            return false;
        }
        costs.forEach(c => {
            const currentAmount = this.resources[team].get(c.type);
            this.resources[team].set(c.type, currentAmount - c.amount);
        });
        return true;
    }

    // ✨ [신규] 자원이 충분한지 확인하는 메서드
    hasResources(team, cost) {
        const costs = Array.isArray(cost) ? cost : [cost];
        return costs.every(c => this.getResource(team, c.type) >= c.amount);
    }

    getResource(team, type) {
        return this.resources[team] ? (this.resources[team].get(type) || 0) : 0;
    }

    getAllResources(team) {
        return this.resources[team] ? Object.fromEntries(this.resources[team]) : {};
    }
}

export const sharedResourceEngine = new SharedResourceEngine();
