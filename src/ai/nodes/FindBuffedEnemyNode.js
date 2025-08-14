import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';

/**
 * 특정 버프를 보유한 적을 찾아 블랙보드에 저장합니다.
 */
class FindBuffedEnemyNode extends Node {
    constructor(buffId = 'battleCryBuff') {
        super();
        this.buffId = buffId;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemies = blackboard.get('enemyUnits');
        if (!enemies) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '적 유닛 없음');
            return NodeState.FAILURE;
        }

        const target = enemies.find(e => {
            const effects = statusEffectManager.activeEffects.get(e.uniqueId) || [];
            return effects.some(effect => effect.id === this.buffId);
        });

        if (target) {
            blackboard.set('buffedEnemy', target);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `위협 버프 적 발견: ${target.instanceName}`);
            return NodeState.SUCCESS;
        }

        blackboard.set('buffedEnemy', null);
        debugAIManager.logNodeResult(NodeState.FAILURE, '위협 버프 적 없음');
        return NodeState.FAILURE;
    }
}

export default FindBuffedEnemyNode;
