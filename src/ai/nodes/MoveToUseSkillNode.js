import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';
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

        let path = blackboard.get('movementPath');
        if (!path) {
            path = await this.pathfinderEngine.findBestPathToAttack(unit, skill, target);
            if (path && !Array.isArray(path)) {
                debugLogEngine.warn('MoveToUseSkillNode', 'findBestPathToAttack가 배열이 아닌 값을 반환했습니다.', {
                    skill: skill.name,
                    target: target.instanceName,
                });
                return NodeState.FAILURE;
            }
            if (!path) {
                debugAIManager.logNodeResult(
                    NodeState.FAILURE,
                    `스킬 [${skill.name}] 사용 위치 없음`
                );
                return NodeState.FAILURE;
            }
        }

        if (path.length === 0) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, '이동 필요 없음');
            return NodeState.SUCCESS;
        }

        blackboard.set('movementPath', path);
        const result = await this.moveNode.evaluate(unit, blackboard);
        if (result === NodeState.SUCCESS) {
            debugAIManager.logNodeResult(
                NodeState.SUCCESS,
                `스킬 [${skill.name}] 사용 위치로 이동 완료`
            );
        } else {
            debugAIManager.logNodeResult(NodeState.FAILURE, '경로 이동 실패');
        }

        return result;
    }
}

export default MoveToUseSkillNode;
