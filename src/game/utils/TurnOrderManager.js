import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 유닛의 스탯에 따라 전투의 턴 순서를 결정하고 관리하는 매니저
 */
class TurnOrderManager {
    constructor() {
        debugLogEngine.log('TurnOrderManager', '턴 순서 매니저가 초기화되었습니다.');
    }

    /**
     * 유닛 목록을 받아 무게(weight)가 낮은 순서대로 정렬하여 턴 큐를 생성합니다.
     * @param {Array<object>} allUnits - 전투에 참여하는 모든 유닛 목록
     * @returns {Array<object>} - 턴 순서에 따라 정렬된 유닛 배열
     */
    createTurnQueue(allUnits) {
        // ✨ StatEngine이 계산한 turnValue를 기준으로 정렬합니다.
        const turnQueue = [...allUnits].sort((a, b) => (a.finalStats.turnValue ?? 0) - (b.finalStats.turnValue ?? 0));

        // ✨ 로그에 turnValue를 표시합니다.
        const turnOrderNames = turnQueue.map(u => `${u.instanceName}(w:${u.finalStats.turnValue})`).join(' -> ');
        debugLogEngine.log('TurnOrderManager', `턴 순서 결정: ${turnOrderNames}`);

        return turnQueue;
    }

    /**
     * 특정 유닛을 턴 큐의 가장 마지막으로 이동시킵니다.
     * @param {Array<object>} turnQueue - 현재 턴 큐
     * @param {object} targetUnit - 순서를 변경할 대상 유닛
     * @returns {Array<object>} - 변경된 턴 큐
     */
    pushToBack(turnQueue, targetUnit) {
        const index = turnQueue.findIndex(u => u.uniqueId === targetUnit.uniqueId);
        if (index > -1) {
            const [unit] = turnQueue.splice(index, 1);
            turnQueue.push(unit);
            debugLogEngine.log('TurnOrderManager', `'${targetUnit.instanceName}'의 턴 순서가 마지막으로 변경되었습니다.`);
        }
        return turnQueue;
    }
}

export const turnOrderManager = new TurnOrderManager();
