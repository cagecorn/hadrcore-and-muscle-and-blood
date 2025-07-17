// js/ai/nodes/UnitConditionNodes.js
import { Node, NodeState } from '../core/Node.js';

/**
 * 블랙보드에 저장된 타겟이 공격 범위 내에 있는지 확인합니다.
 */
export class IsTargetInRangeNode extends Node {
    constructor(range) {
        super();
        this.range = range;
    }

    async evaluate(blackboard) {
        if (!blackboard.hasData('target')) {
            return NodeState.FAILURE;
        }

        const self = blackboard.getData('self');
        const target = blackboard.getData('target');
        const distance = Math.abs(self.gridX - target.gridX) + Math.abs(self.gridY - target.gridY);

        const result = distance <= this.range;
        if (result) {
            console.log(`[BT-Cond] ${self.name}은(는) ${target.name}의 공격 범위 안에 있습니다.`);
        } else {
            console.log(`[BT-Cond] ${self.name}은(는) ${target.name}의 공격 범위 밖에 있습니다.`);
        }
        return result ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
