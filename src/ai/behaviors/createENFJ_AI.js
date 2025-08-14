import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindAllyClusterNode from '../nodes/FindAllyClusterNode.js';
import FindSkillByTagNode from '../nodes/FindSkillByTagNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindPriorityTargetNode from '../nodes/FindPriorityTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';

/**
 * ENFJ: 선도자 아키타입 행동 트리 (메카닉)
 * 우선순위:
 * 1. (버프) 아군이 뭉쳐있으면 AURA 스킬 사용
 * 2. (돌격) 버프 후 가장 위협적인 적에게 CHARGE 스킬 사용
 * 3. (일반 공격) 위 조건이 안되면 기본 근접 공격
 */
function createENFJ_AI(engines = {}) {
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
        // 1순위: 아군 클러스터에 AURA 스킬 사용
        new SequenceNode([
            new FindAllyClusterNode(),
            new FindSkillByTagNode(SKILL_TAGS.AURA, engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 2순위: 가장 위협적인 적에게 CHARGE 스킬 사용
        new SequenceNode([
            new FindPriorityTargetNode(engines),
            new FindSkillByTagNode(SKILL_TAGS.CHARGE, engines),
            executeSkillBranch
        ]),
        // 3순위: 일반 근접 공격
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 4순위: 모든 행동이 실패했다면 가까운 적에게 공격 시도
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetNode(engines),
            executeSkillBranch
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createENFJ_AI };
