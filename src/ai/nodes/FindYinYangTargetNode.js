import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { yinYangEngine } from '../../game/utils/YinYangEngine.js';

/**
 * 음양 지수에서 '음' 값이 높은(음수가 큰) 적을 찾아 스킬 타겟으로 설정하는 노드.
 */
class FindYinYangTargetNode extends Node {
    constructor() {
        super();
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemies = blackboard.get('enemyUnits');
        if (!enemies || enemies.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '적 유닛 없음');
            return NodeState.FAILURE;
        }

        const candidates = enemies.filter(e => yinYangEngine.getBalance(e.uniqueId) < 0);
        if (candidates.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '음 지수가 높은 적 없음');
            return NodeState.FAILURE;
        }

        let best = candidates[0];
        let bestBalance = yinYangEngine.getBalance(best.uniqueId);
        for (const enemy of candidates.slice(1)) {
            const bal = yinYangEngine.getBalance(enemy.uniqueId);
            if (bal < bestBalance) {
                best = enemy;
                bestBalance = bal;
            }
        }

        blackboard.set('skillTarget', best);
        debugAIManager.logNodeResult(NodeState.SUCCESS, `음 지수 타겟 [${best.instanceName}] 설정`);
        return NodeState.SUCCESS;
    }
}

export default FindYinYangTargetNode;
