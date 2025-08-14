import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 블랙보드에 저장된 'allyInDanger'에게 이동하는 경로를 찾습니다.
 */
class FindPathToAllyNode extends Node {
    constructor({ pathfinderEngine }) {
        super();
        this.pathfinderEngine = pathfinderEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('allyInDanger');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '대상이 지정되지 않음');
            return NodeState.FAILURE;
        }

        const path = await this.pathfinderEngine.findPath(unit, { col: unit.gridX, row: unit.gridY }, { col: target.gridX, row: target.gridY });
        if (path && path.length > 0) {
            const finalPath = path.slice(0, path.length - 1);
            blackboard.set('movementPath', finalPath);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `경로 설정 -> ${target.instanceName}`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '경로 찾기 실패');
        return NodeState.FAILURE;
    }
}

export default FindPathToAllyNode;
