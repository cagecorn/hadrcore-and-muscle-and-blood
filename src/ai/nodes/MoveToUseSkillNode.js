import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import MoveToTargetNode from './MoveToTargetNode.js';

class MoveToUseSkillNode extends Node {
    constructor(engines = {}) {
        super();
        this.pathfinderEngine = engines.pathfinderEngine;
        this.moveNode = new MoveToTargetNode(engines);
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const skill = blackboard.get('currentSkillData');
        const target = blackboard.get('skillTarget');
        if (!skill || !target) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 또는 타겟 없음');
            return NodeState.FAILURE;
        }

        const path = await this.pathfinderEngine.findBestPathToAttack(unit, skill, target);
        if (!path) {
            debugAIManager.logNodeResult(NodeState.FAILURE, `스킬 [${skill.name}] 사용 위치 없음`);
            return NodeState.FAILURE;
        }

        blackboard.set('movementPath', path);
        const result = await this.moveNode.evaluate(unit, blackboard);
        if (result === NodeState.SUCCESS) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `스킬 [${skill.name}] 사용 위치로 이동`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '경로 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default MoveToUseSkillNode;
