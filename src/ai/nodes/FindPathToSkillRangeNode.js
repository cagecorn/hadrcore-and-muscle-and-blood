import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
// FindPathToTargetNode의 경로 탐색 로직을 재사용합니다.
import FindPathToTargetNode from './FindPathToTargetNode.js';

class FindPathToSkillRangeNode extends Node {
    constructor(engines = {}) {
        super();
        // 내부적으로 FindPathToTargetNode 인스턴스를 생성하여 로직을 위임합니다.
        this.pathfinderNode = new FindPathToTargetNode(engines);
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('skillTarget');
        const skillData = blackboard.get('currentSkillData');

        if (!target || !skillData) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '타겟 또는 스킬 정보 없음');
            return NodeState.FAILURE;
        }

        // 스킬 range가 없으면 유닛의 기본 attackRange 사용, 기본값은 1
        const skillRange = skillData.range ?? unit.finalStats.attackRange ?? 1;

        // FindPathToTargetNode의 로직을 활용하기 위해 임시로 attackRange를 조정합니다.
        const originalAttackRange = unit.finalStats.attackRange;
        unit.finalStats.attackRange = skillRange;
        const path = this.pathfinderNode._findPathToUnit(unit, target);
        unit.finalStats.attackRange = originalAttackRange;

        if (path) {
            blackboard.set('movementPath', path);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `스킬 [${skillData.name}] 사용 위치로 경로 설정`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 사용 위치로의 경로 탐색 실패');
        return NodeState.FAILURE;
    }
}
export default FindPathToSkillRangeNode;

