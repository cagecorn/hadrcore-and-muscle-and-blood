import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';

/**
 * 버프가 적용되지 않았거나 버프가 필요한 아군을 찾습니다.
 */
class FindAllyToBuffNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const allUnits = blackboard.get('allUnits');
        const skillData = blackboard.get('currentSkillData');
        if (!allUnits || !skillData) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '유닛 또는 스킬 데이터 없음');
            return NodeState.FAILURE;
        }

        const allies = allUnits.filter(u => u.team === unit.team && u.currentHp > 0);
        if (allies.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '버프 대상 아군 없음');
            return NodeState.FAILURE;
        }

        const buffId = skillData.effect?.id;
        let target = null;
        if (buffId) {
            const candidates = allies.filter(a => {
                const effects = statusEffectManager.activeEffects.get(a.uniqueId) || [];
                return !effects.some(e => e.id === buffId);
            });
            target = candidates[0] || allies[0];
        } else {
            target = allies[0];
        }

        blackboard.set('skillTarget', target);
        debugAIManager.logNodeResult(NodeState.SUCCESS, `버프 대상 [${target.instanceName}] 설정`);
        return NodeState.SUCCESS;
    }
}

export default FindAllyToBuffNode;
