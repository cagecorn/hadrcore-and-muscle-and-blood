import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

// 타겟이 너무 가까운지(위험 지역 내에 있는지) 확인하는 노드
class IsTargetTooCloseNode extends Node {
    constructor({ targetManager, dangerZone = 1 }) {
        super();
        this.targetManager = targetManager;
        this.dangerZone = dangerZone;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemyUnits = blackboard.get('enemyUnits');

        // 공격 대상이 아닌, "가장 가까운" 적을 기준으로 위험을 판단합니다.
        const nearestEnemy = this.targetManager.findNearestEnemy(unit, enemyUnits);

        if (!nearestEnemy) {
            // ✨ 주변에 적이 없으면 위협 상태가 아니므로 false로 설정합니다.
            blackboard.set('isThreatened', false);
            debugAIManager.logNodeResult(NodeState.FAILURE, "주변에 위협적인 적 없음");
            return NodeState.FAILURE; // 주변에 적이 없으면 안전
        }

        const distance = Math.abs(unit.gridX - nearestEnemy.gridX) + Math.abs(unit.gridY - nearestEnemy.gridY);

        if (distance <= this.dangerZone) {
            // ✨ [핵심 변경] 어떤 적이 위협적인지 블랙보드에 기록합니다.
            // FindKitingPositionNode가 이 정보를 사용하여 "누구로부터" 도망칠지 결정합니다.
            blackboard.set('threateningUnit', nearestEnemy);
            // ✨ [핵심 추가] 적이 너무 가까우므로 위협 상태임을 블랙보드에 기록합니다.
            blackboard.set('isThreatened', true);
            debugAIManager.logNodeResult(
                NodeState.SUCCESS,
                `가장 가까운 적 '${nearestEnemy.instanceName}'이 위험거리(${this.dangerZone}) 내에 있음!`
            );
            return NodeState.SUCCESS; // 너무 가까움!
        }

        // 위협적인 적이 없으므로 정보를 초기화합니다.
        blackboard.set('threateningUnit', null);
        // ✨ 적이 안전거리에 있으므로 위협 상태가 아님을 명시적으로 기록합니다.
        blackboard.set('isThreatened', false);
        debugAIManager.logNodeResult(NodeState.FAILURE, `가장 가까운 적 '${nearestEnemy.instanceName}'과의 거리가 안전함`);
        return NodeState.FAILURE; // 안전함
    }
}
export default IsTargetTooCloseNode;
