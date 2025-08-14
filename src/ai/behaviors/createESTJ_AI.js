import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindPriorityTargetNode from '../nodes/FindPriorityTargetNode.js';
import FindLowestHealthEnemyNode from '../nodes/FindLowestHealthEnemyNode.js';
import FindSkillByTagNode from '../nodes/FindSkillByTagNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * ESTJ: 엄격한 관리자 아키타입 행동 트리 (전사)
 * 우선순위:
 * 1. (점사 대상 선정) 위협적이거나 체력이 낮은 적을 이번 턴의 목표로 고정합니다.
 * 2. (약화 후 공격) 목표에게 [DEBUFF] 스킬을 먼저 사용한 뒤, 다른 공격 스킬을 연계합니다.
 * 3. (일반 공격) 사용할 디버프 스킬이 없다면, 바로 최적의 공격 스킬을 사용합니다.
 * 4. (이동) 위 행동을 위해 필요하다면 이동합니다.
 */
function createESTJ_AI(engines = {}) {
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

    // 최상위 노드를 SelectorNode로 구성하여
    // 공격 실패 시에도 다른 대안을 시도할 수 있도록 합니다.
    const rootNode = new SelectorNode([
        // 1순위: 타겟을 정하고 공격을 시도하는 전체 시퀀스
        new SequenceNode([
            // 1-1. 점사할 타겟을 먼저 결정
            new SelectorNode([
                new FindLowestHealthEnemyNode(engines),
                new FindPriorityTargetNode(engines)
            ]),
            // 1-2. 결정된 타겟을 대상으로 행동 개시
            new SelectorNode([
                // 디버프 스킬 사용 시도
                new SequenceNode([
                    new FindSkillByTagNode(SKILL_TAGS.DEBUFF, engines),
                    new FindTargetBySkillTypeNode(engines),
                    executeSkillBranch,
                ]),
                // 디버프가 없거나 실패하면 바로 공격
                new SequenceNode([
                    new FindBestSkillByScoreNode(engines),
                    new FindTargetBySkillTypeNode(engines),
                    executeSkillBranch
                ])
            ])
        ]),
        // 2순위: 공격에 실패했다면 적을 향해 전진
        new SequenceNode([
            new HasNotMovedNode(),
            new FindTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 3순위: 전진도 불가능할 때만 안전한 위치로 이동하여 턴을 낭비하지 않습니다.
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines)
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

export { createESTJ_AI };
