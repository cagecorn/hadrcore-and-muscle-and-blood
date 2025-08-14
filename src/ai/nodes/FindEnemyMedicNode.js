import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 적 진영의 메딕 유닛을 찾아 블랙보드에 저장합니다.
 */
class FindEnemyMedicNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemies = blackboard.get('enemyUnits');
        if (!enemies) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '적 유닛 없음');
            return NodeState.FAILURE;
        }

        const medic = enemies.find(e => e.id === 'medic' && e.currentHp > 0);
        if (medic) {
            blackboard.set('enemyMedic', medic);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `적 메딕 발견: ${medic.instanceName}`);
            return NodeState.SUCCESS;
        }

        blackboard.set('enemyMedic', null);
        debugAIManager.logNodeResult(NodeState.FAILURE, '적 메딕 없음');
        return NodeState.FAILURE;
    }
}

export default FindEnemyMedicNode;
