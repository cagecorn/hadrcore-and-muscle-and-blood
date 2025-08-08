import { debugLogEngine } from './DebugLogEngine.js';
import { debugYinYangManager } from '../debug/DebugYinYangManager.js';

/**
 * 전투 중 모든 유닛의 음양(Yin-Yang) 지수를 관리하는 엔진입니다.
 * AI는 이 지수를 참고하여 전술적 균형을 맞추는 방향으로 행동을 결정하게 됩니다.
 */
class YinYangEngine {
    constructor() {
        this.name = 'YinYangEngine';
        // key: unitId, value: yinYangValue (음수는 음, 양수는 양)
        this.unitBalances = new Map();
        debugLogEngine.register(this);
    }

    /**
     * 전투 시작 시 모든 유닛의 음양 지수를 0으로 초기화합니다.
     * @param {Array<object>} units - 전투에 참여하는 모든 유닛
     */
    initializeUnits(units) {
        this.unitBalances.clear();
        units.forEach(unit => {
            this.unitBalances.set(unit.uniqueId, 0);
        });
        debugLogEngine.log(this.name, `${units.length}명 유닛의 음양 지수를 초기화했습니다.`);
    }

    /**
     * 스킬 사용 결과로 특정 유닛의 음양 지수를 업데이트합니다.
     * @param {number} unitId - 지수가 변경될 유닛의 고유 ID
     * @param {number} skillYinYangValue - 사용된 스킬의 음양 값 (예: -15, 20)
     */
    updateBalance(unitId, skillYinYangValue) {
        if (!this.unitBalances.has(unitId) || !skillYinYangValue) return;

        const oldValue = this.unitBalances.get(unitId);
        const newValue = oldValue + skillYinYangValue;
        this.unitBalances.set(unitId, newValue);

        debugYinYangManager.logBalanceUpdate(unitId, oldValue, newValue, skillYinYangValue);
    }

    /**
     * 특정 유닛의 현재 음양 지수를 가져옵니다.
     * @param {number} unitId - 조회할 유닛의 고유 ID
     * @returns {number} - 현재 음양 지수
     */
    getBalance(unitId) {
        return this.unitBalances.get(unitId) || 0;
    }
    
    /**
     * 모든 유닛의 음양 지수를 0에 가깝게 조금씩 이동시킵니다.
     * 이는 시간이 지남에 따라 균형이 자연스럽게 회복되는 것을 표현합니다.
     * (매 턴 종료 시 호출)
     */
    applyTurnDecay() {
        for (const [unitId, balance] of this.unitBalances.entries()) {
            if (balance !== 0) {
                // 현재 값의 10%만큼 0에 가까워지도록 설정 (값을 조절하여 균형 회복 속도 변경 가능)
                const decayAmount = balance * 0.1;
                this.unitBalances.set(unitId, balance - decayAmount);
            }
        }
        debugLogEngine.log(this.name, '모든 유닛의 음양 지수가 턴 종료에 따라 자연 감소되었습니다.');
    }

    /**
     * 전투 종료 시 모든 데이터를 초기화합니다.
     */
    reset() {
        this.unitBalances.clear();
        debugLogEngine.log(this.name, '음양 엔진 데이터를 초기화했습니다.');
    }
}

export const yinYangEngine = new YinYangEngine();
