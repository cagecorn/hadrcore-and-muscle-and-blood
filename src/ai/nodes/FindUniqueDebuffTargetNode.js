import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';

/**
 * 현재 선택된 스킬의 디버프 효과가 없는 적을 우선적으로 찾아 타겟으로 설정하는 노드.
 * 적합한 대상이 없으면 실패를 반환합니다.
 */
class FindUniqueDebuffTargetNode extends Node {
    constructor({ targetManager }) {
        super();
        this.targetManager = targetManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const skillData = blackboard.get('currentSkillData');
        const enemies = blackboard.get('enemyUnits');

        if (!skillData || !skillData.effect || !enemies || enemies.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '디버프 스킬, 효과 또는 적 유닛 없음');
            return NodeState.FAILURE;
        }

        const debuffId = skillData.effect.id;

        // 1. 해당 디버프가 아직 없는 적들을 필터링합니다.
        const potentialTargets = enemies.filter(enemy => {
            const activeEffects = statusEffectManager.activeEffects.get(enemy.uniqueId) || [];
            return !activeEffects.some(effect => effect.id === debuffId);
        });

        if (potentialTargets.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, `모든 적이 이미 [${debuffId}] 효과를 가지고 있음`);
            return NodeState.FAILURE;
        }

        // 2. 필터링된 대상 중에서 가장 가까운 적을 최종 타겟으로 선정합니다.
        const target = this.targetManager.findNearestEnemy(unit, potentialTargets);
        if (target) {
            blackboard.set('skillTarget', target);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `중복되지 않는 디버프 대상 [${target.instanceName}] 설정`);
            return NodeState.SUCCESS;
        }

        return NodeState.FAILURE;
    }
}

export default FindUniqueDebuffTargetNode;
