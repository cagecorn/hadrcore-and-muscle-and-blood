import Node, { NodeState } from './Node.js';

/**
 * 자식 노드 중 하나라도 성공할 때까지 왼쪽에서 오른쪽으로 실행합니다. (OR 논리)
 */
class SelectorNode extends Node {
    constructor(children) {
        super();
        this.children = children;
    }

    async evaluate(unit, blackboard) {
        for (const child of this.children) {
            const result = await child.evaluate(unit, blackboard);
            if (result !== NodeState.FAILURE) {
                return result; // 하나라도 실패하지 않았다면(성공 또는 실행 중) 즉시 반환
            }
        }
        return NodeState.FAILURE; // 모두 실패했을 경우에만 실패 반환
    }
}

export default SelectorNode;
