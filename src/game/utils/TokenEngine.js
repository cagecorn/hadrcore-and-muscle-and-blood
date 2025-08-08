import { debugLogEngine } from './DebugLogEngine.js';
import { debugTokenManager } from '../debug/DebugTokenManager.js';

/**
 * 전투 중 유닛의 토큰(자원)을 관리하는 엔진 (싱글턴)
 */
class TokenEngine {
    constructor() {
        this.tokenData = new Map();
        this.maxTokens = 9; // 최대 토큰 보유량
        debugLogEngine.log('TokenEngine', '토큰 엔진이 초기화되었습니다.');
    }

    /**
     * 전투 시작 시 모든 유닛의 토큰 정보를 등록하고 초기화합니다.
     * @param {Array<object>} units - 전투에 참여하는 모든 유닛
     */
    initializeUnits(units) {
        this.tokenData.clear();
        units.forEach(unit => {
            this.tokenData.set(unit.uniqueId, {
                currentTokens: 0,
                unitName: unit.instanceName
            });
        });
        debugTokenManager.logInitialization(units.length);
        debugLogEngine.log('TokenEngine', `${units.length}명의 유닛 토큰 정보 초기화 완료.`);
    }

    /**
     * 전투 중 새로 생성된 단일 유닛의 토큰 정보를 등록합니다.
     * 소환수 등 전투 도중에 등장한 유닛을 위한 용도입니다.
     * @param {object} unit - 등록할 유닛 인스턴스
     */
    registerUnit(unit) {
        if (!this.tokenData.has(unit.uniqueId)) {
            this.tokenData.set(unit.uniqueId, {
                currentTokens: 3,
                unitName: unit.instanceName
            });
            // 로그를 통해 토큰 지급 내역을 기록합니다.
            debugTokenManager.logTokenChange(unit.uniqueId, unit.instanceName, '소환됨', 3, 3);
        }
    }

    /**
     * 특정 유닛에게 토큰을 추가합니다.
     * @param {number} unitId - 토큰을 받을 유닛의 고유 ID
     * @param {number} amount - 추가할 토큰의 양
     * @param {string} reason - 토큰 추가 사유
     */
    addTokens(unitId, amount, reason = '스킬 효과') {
        const data = this.tokenData.get(unitId);
        if (data && amount > 0) {
            const newTotal = Math.min(this.maxTokens, data.currentTokens + amount);
            const actualAmount = newTotal - data.currentTokens;
            if (actualAmount > 0) {
                data.currentTokens = newTotal;
                debugTokenManager.logTokenChange(unitId, data.unitName, reason, actualAmount, data.currentTokens);
            }
        }
    }

    /**
     * 새로운 턴이 시작될 때 모든 유닛의 토큰을 3으로 재설정합니다.
     * 이전 턴에 남아 있던 토큰은 모두 사라집니다.
     */
    addTokensForNewTurn() {
        for (const [unitId, data] of this.tokenData.entries()) {
            const newTotal = 3;
            const changeAmount = newTotal - data.currentTokens;

            data.currentTokens = newTotal;

            if (changeAmount !== 0) {
                debugTokenManager.logTokenChange(unitId, data.unitName, '턴 시작', changeAmount, data.currentTokens);
            }
        }
    }

    /**
     * 특정 유닛의 토큰을 사용합니다.
     * @param {number} unitId - 토큰을 사용할 유닛의 고유 ID
     * @param {number} amount - 소모할 토큰의 양
     * @returns {boolean} - 토큰 소모 성공 여부
     */
    spendTokens(unitId, amount) {
        const data = this.tokenData.get(unitId);
        if (data && data.currentTokens >= amount) {
            data.currentTokens -= amount;
            debugTokenManager.logTokenChange(unitId, data.unitName, '스킬 사용', -amount, data.currentTokens);
            return true;
        }
        debugLogEngine.warn('TokenEngine', `유닛(ID:${unitId}) 토큰 부족으로 ${amount}개 사용 실패.`);
        return false;
    }

    /**
     * 특정 유닛의 현재 토큰 개수를 반환합니다.
     * @param {number} unitId - 조회할 유닛의 고유 ID
     * @returns {number} - 현재 토큰 개수
     */
    getTokens(unitId) {
        return this.tokenData.get(unitId)?.currentTokens || 0;
    }
}

export const tokenEngine = new TokenEngine();
