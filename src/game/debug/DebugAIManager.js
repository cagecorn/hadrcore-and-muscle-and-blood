import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * AI의 의사결정 과정을 추적하고 로그로 남기는 디버그 매니저
 */
class DebugAIManager {
    constructor() {
        this.name = 'DebugAI';
        debugLogEngine.register(this);
    }

    /**
     * 특정 노드의 평가 시작을 로그로 남깁니다.
     * @param {object} node - 평가를 시작하는 노드
     * @param {object} unit - 해당 AI 유닛
     */
    logNodeEvaluation(node, unit) {
        const nodeName = node.constructor?.name || 'Unknown';
        console.groupCollapsed(`%c[${this.name}]`, `color: #f59e0b; font-weight: bold;`, `${unit.instanceName} - 노드 평가: ${nodeName}`);
    }

    /**
     * 노드 평가 결과를 로그로 남깁니다.
     * @param {string} result - 노드의 평가 결과 (SUCCESS, FAILURE, RUNNING)
     * @param {string} [message] - 추가적인 디버그 메시지
     */
    logNodeResult(result, message = '') {
        const color = result === 'SUCCESS' ? '#22c55e' : (result === 'FAILURE' ? '#ef4444' : '#3b82f6');
        const logMessage = message ? `결과: ${result} (${message})` : `결과: ${result}`;
        debugLogEngine.log(this.name, `%c${logMessage}`, `color: ${color}; font-weight: bold;`);
        console.groupEnd();
    }

    /**
     * 블랙보드에 저장된 주요 정보를 로그로 남깁니다.
     * @param {object} blackboard
     */
    logBlackboardState(blackboard) {
        const target = blackboard.get('currentTargetUnit');
        const targetName = target ? target.instanceName : '없음';
        debugLogEngine.log(this.name, `현재 타겟: ${targetName}, 사거리 내 존재: ${blackboard.get('isTargetInAttackRange')}`);
    }
}

export const debugAIManager = new DebugAIManager();
