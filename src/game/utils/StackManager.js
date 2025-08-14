import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 전투 중 발생하는 모든 스택 효과를 관리하는 엔진 (싱글턴)
 * 예: 확정 막기 2스택, 피해 완화 3스택 등
 */
class StackManager {
    constructor() {
        this.name = 'StackManager';
        this.stacks = new Map(); // key: unitId -> Map<stackType, count>
        debugLogEngine.log(this.name, '스택 매니저가 초기화되었습니다.');
    }

    /** 전투 시작 시 모든 스택을 초기화합니다. */
    reset() {
        this.stacks.clear();
        debugLogEngine.log(this.name, '모든 스택 데이터를 초기화했습니다.');
    }

    /**
     * 특정 유닛에게 스택을 추가합니다.
     * 존재하지 않으면 새로 생성합니다.
     * @param {number} unitId - 대상 유닛 ID
     * @param {string} stackType - 스택 종류
     * @param {number} amount - 추가할 스택 양
     */
    addStack(unitId, stackType, amount) {
        if (!this.stacks.has(unitId)) {
            this.stacks.set(unitId, new Map());
        }
        const unitStacks = this.stacks.get(unitId);
        const current = unitStacks.get(stackType) || 0;
        unitStacks.set(stackType, current + amount);
        debugLogEngine.log(this.name, `${unitId}에게 [${stackType}] 스택 ${amount}개 추가. 현재: ${current + amount}개`);
    }

    /**
     * 특정 스택을 1개 소모합니다.
     * @param {number} unitId
     * @param {string} stackType
     * @returns {boolean} 성공 여부
     */
    consumeStack(unitId, stackType) {
        const unitStacks = this.stacks.get(unitId);
        if (unitStacks && unitStacks.has(stackType)) {
            const current = unitStacks.get(stackType);
            if (current > 0) {
                unitStacks.set(stackType, current - 1);
                debugLogEngine.log(this.name, `${unitId}의 [${stackType}] 스택 1개 소모. 남은 스택: ${current - 1}개`);
                return true;
            }
        }
        return false;
    }

    /** 해당 스택이 1개 이상 존재하는지 확인 */
    hasStack(unitId, stackType) {
        const unitStacks = this.stacks.get(unitId);
        return (unitStacks && (unitStacks.get(stackType) || 0) > 0);
    }

    /** 스택 개수 조회 */
    getStackCount(unitId, stackType) {
        const unitStacks = this.stacks.get(unitId);
        return unitStacks ? (unitStacks.get(stackType) || 0) : 0;
    }
}

export const stackManager = new StackManager();
