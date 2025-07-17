// js/ai/core/Sequence.js
import { CompositeNode } from './CompositeNode.js';
import { NodeState } from './Node.js';

/**
 * 자식 노드를 순서대로 실행하며, 하나라도 FAILURE 또는 RUNNING을 반환하면 그 즉시 멈춥니다.
 * 논리적 'AND' 연산과 같습니다.
 */
export class Sequence extends CompositeNode {
    /**
     * @param {Node[]} children
     */
    constructor(children) {
        super(children);
    }

    async evaluate(blackboard) {
        for (const node of this.children) {
            const result = await node.evaluate(blackboard);
            if (result !== NodeState.SUCCESS) {
                return result;
            }
        }
        return NodeState.SUCCESS;
    }
}
