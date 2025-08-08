import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 치유가 필요한(체력이 100%가 아닌) 가장 체력 비율이 낮은 아군을 찾습니다.
 * 옵션에 따라 사거리 내 아군만 고려할 수 있습니다.
 */
class FindLowestHealthAllyNode extends Node {
    constructor({ inRangeOnly = false } = {}) {
        super();
        this.inRangeOnly = inRangeOnly;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const allUnits = blackboard.get('allUnits');
        if (!allUnits) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '유닛 목록 없음');
            return NodeState.FAILURE;
        }

        const allies = allUnits.filter(u =>
            u.team === unit.team && u.currentHp > 0 && u.currentHp < u.finalStats.hp
        );
        if (allies.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '치유가 필요한 아군 없음');
            return NodeState.FAILURE;
        }

        let potentialTargets = allies;
        if (this.inRangeOnly) {
            const healRange = blackboard.get('currentSkillData')?.range || 2;
            potentialTargets = allies.filter(a => {
                const dist = Math.abs(unit.gridX - a.gridX) + Math.abs(unit.gridY - a.gridY);
                return dist <= healRange;
            });
            if (potentialTargets.length === 0) {
                debugAIManager.logNodeResult(NodeState.FAILURE, '사거리 내 아군 없음');
                return NodeState.FAILURE;
            }
        }

        potentialTargets.sort(
            (a, b) => a.currentHp / a.finalStats.hp - b.currentHp / b.finalStats.hp
        );
        const target = potentialTargets[0];
        blackboard.set('skillTarget', target);
        debugAIManager.logNodeResult(NodeState.SUCCESS, `치유 대상 [${target.instanceName}] 설정`);
        return NodeState.SUCCESS;
    }
}

export default FindLowestHealthAllyNode;
