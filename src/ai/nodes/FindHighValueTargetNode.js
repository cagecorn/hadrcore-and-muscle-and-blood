import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { tokenEngine } from '../../game/utils/TokenEngine.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';

/**
 * 체력, 토큰, 버프 수를 종합하여 가장 '가치 있는' 적을 찾는 노드.
 * ENTP 아키타입을 위해 설계되었습니다.
 */
class FindHighValueTargetNode extends Node {
    constructor(engines = {}) {
        super();
        this.tokenEngine = engines.tokenEngine || tokenEngine;
        this.statusEffectManager = engines.statusEffectManager || statusEffectManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemies = blackboard.get('enemyUnits')?.filter(e => e.currentHp > 0);

        if (!enemies || enemies.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '대상이 될 적이 없음');
            return NodeState.FAILURE;
        }

        let bestTarget = null;
        let maxScore = -Infinity;

        enemies.forEach(enemy => {
            const tokenCount = this.tokenEngine.getTokens(enemy.uniqueId);
            const effects = this.statusEffectManager.activeEffects.get(enemy.uniqueId) || [];
            const buffCount = effects.filter(e => e.type === 'BUFF').length;
            const healthRatio = enemy.currentHp / enemy.finalStats.hp;

            // 토큰 1개당 10점, 버프 1개당 15점, 체력 비율 1%당 0.5점 등으로 가치 계산
            const score = (tokenCount * 10) + (buffCount * 15) + (healthRatio * 50);

            if (score > maxScore) {
                maxScore = score;
                bestTarget = enemy;
            }
        });

        if (bestTarget) {
            blackboard.set('currentTargetUnit', bestTarget);
            // 다른 노드들이 이 타겟을 사용하도록 skillTarget도 설정
            blackboard.set('skillTarget', bestTarget);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `가치 높은 타겟 [${bestTarget.instanceName}] 설정 (점수: ${maxScore.toFixed(0)})`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '가치 있는 타겟을 찾지 못함');
        return NodeState.FAILURE;
    }
}

export default FindHighValueTargetNode;
