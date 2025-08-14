import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import FindYinYangTargetNode from '../nodes/FindYinYangTargetNode.js';
import FindUniqueDebuffTargetNode from '../nodes/FindUniqueDebuffTargetNode.js';
import FindAllyMagicClusterNode from '../nodes/FindAllyMagicClusterNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * INTJ: 전략가 아키타입 행동 트리
 * 우선순위:
 * 1. (이동) 아군 마법사 근처의 안전한 위치로 자리 잡기
 * 2. (공격) '음' 지수가 높은 적 중, 아직 내 디버프에 걸리지 않은 대상에게 스킬 사용
 * 3. (생존) 적이 너무 가까우면 카이팅
 * 4. (기본) 일반적인 원거리 공격 또는 안전한 위치로 재배치
 */
function createINTJ_AI(engines = {}) {
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([new IsSkillInRangeNode(engines), new UseSkillNode(engines)]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // 1순위: 아군 마법사 클러스터로 이동 (패시브 극대화)
        new SequenceNode([
            new HasNotMovedNode(),
            new FindAllyMagicClusterNode(engines),
            new MoveToTargetNode(engines)
        ]),

        // 2순위: 핵심 타겟에게 중복되지 않는 디버프 시도
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindYinYangTargetNode(engines),
            new FindUniqueDebuffTargetNode(engines),
            executeSkillBranch
        ]),

        // 3순위: 생존을 위한 카이팅
        new SequenceNode([
            new HasNotMovedNode(),
            new IsTargetTooCloseNode({ ...engines, dangerZone: 3 }),
            new FindKitingPositionNode(engines),
            new MoveToTargetNode(engines)
        ]),
        
        // 4순위: 기본 원거리 공격 → 전진 → 재배치
        new SelectorNode([
            new SequenceNode([
                new FindBestSkillByScoreNode(engines),
                new FindYinYangTargetNode(engines),
                executeSkillBranch
            ]),
            new SequenceNode([
                new HasNotMovedNode(),
                new FindTargetNode(engines),
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SequenceNode([
                new HasNotMovedNode(),
                new FindSafeRepositionNode(engines),
                new MoveToTargetNode(engines)
            ])
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

export { createINTJ_AI };
