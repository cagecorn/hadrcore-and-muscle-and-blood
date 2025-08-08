import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 블랙보드에 기록된 'lastAttackerId'를 사용해 공격자를 찾아 타겟으로 설정합니다.
 */
class FindAttackerNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const attackerId = blackboard.get('lastAttackerId');
        const allUnits = blackboard.get('allUnits');

        if (attackerId && allUnits) {
            const attacker = allUnits.find(u => u.uniqueId === attackerId && u.currentHp > 0);
            if (attacker) {
                blackboard.set('skillTarget', attacker);
                blackboard.set('currentTargetUnit', attacker);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `반격 대상 [${attacker.instanceName}] 설정`);
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '반격 대상을 찾을 수 없음 (사망 등)');
        return NodeState.FAILURE;
    }
}

export default FindAttackerNode;
