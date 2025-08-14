import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';

// 신규 및 기존 노드 import
import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import FindPriorityTargetNode from '../nodes/FindPriorityTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';

/**
 * 플라잉맨을 위한 행동 트리 (암살자 역할)
 * 1. 스킬 사용: 우선순위 타겟(딜러/힐러)에게 사용 가능한 스킬이 있다면 이동해서라도 사용합니다.
 * 2. 이동만 하기: 사용할 스킬이 없다면, 우선순위 타겟을 향해 이동하고 턴을 마칩니다.
 */
function createFlyingmanAI(engines = {}) {

    // 스킬 하나를 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),

        // 이동만 실행
        new SequenceNode([
            new HasNotMovedNode(),
            new FindPriorityTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createFlyingmanAI };
