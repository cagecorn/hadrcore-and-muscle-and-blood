import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import FindSkillByTagNode from '../nodes/FindSkillByTagNode.js';
import FindLowestHealthEnemyNode from '../nodes/FindLowestHealthEnemyNode.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';
import WasAttackedRecentlyNode from '../nodes/WasAttackedRecentlyNode.js';
import FindAttackerNode from '../nodes/FindAttackerNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';

/**
 * ISTP: 만능 재주꾼 아키타입 행동 트리
 * 우선순위:
 * 1. (반격) 최근 자신을 공격한 적에게 [COUNTER] 스킬로 즉시 응수합니다.
 * 2. (기회 포착) 반격할 상황이 아니면, [FIXED]나 [KINETIC] 태그를 가진 유틸리티 스킬을 사용합니다.
 * 3. (소극적 대기) 사용할 스킬이 없으면, 안전한 위치로 이동하며 다음 기회를 기다립니다.
 */
function createISTP_AI(engines = {}) {
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([ new IsSkillInRangeNode(engines), new UseSkillNode(engines) ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // 1순위: 반격 로직
        new SequenceNode([
            new WasAttackedRecentlyNode(),
            new FindAttackerNode(engines),
            new FindSkillByTagNode(SKILL_TAGS.COUNTER, engines),
            executeSkillBranch
        ]),

        // 2순위: 기회 포착 (유틸리티 스킬 사용)
        new SequenceNode([
            new SelectorNode([
                new FindSkillByTagNode(SKILL_TAGS.FIXED, engines),
                new FindSkillByTagNode(SKILL_TAGS.KINETIC, engines)
            ]),
            new FindLowestHealthEnemyNode(engines),
            executeSkillBranch
        ]),

        // 3순위: 공격 기회가 없다면 적을 향해 전진
        new SequenceNode([
            new HasNotMovedNode(),
            new FindTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 4순위: 전진도 어렵다면 소극적인 위치 재선정
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 5순위: 모든 행동이 실패했다면 가까운 적에게 공격 시도
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetNode(engines),
            executeSkillBranch
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createISTP_AI };
