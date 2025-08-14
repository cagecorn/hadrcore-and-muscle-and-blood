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
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * ISTJ: 청렴한 논리주의자 아키타입 행동 트리 (센티넬)
 * 우선순위:
 * 1. (자기 강화) 자신에게 사용할 수 있는 버프 스킬(방어력 증가 등)이 있다면 최우선으로 사용합니다.
 * 2. (위치 고수 공격) 현재 위치에서 공격 가능한 적이 있다면 공격합니다. (이동 X)
 * 3. (초기 위치 선정) 아직 이동하지 않았고, 공격할 대상이 없다면 안전한 위치로 이동합니다.
 * 4. (일반 공격) 위 모든 행동이 불가능할 경우, 가장 가까운 적을 향해 이동 및 공격을 시도합니다.
 */
function createISTJ_AI(engines = {}) {
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
        // 1순위: 자기 자신에게 버프 사용
        new SequenceNode([
            // SkillScoreEngine에서 BUFF, WILL_GUARD 태그에 높은 점수를 받도록 설정
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines), // BUFF, AID 타입은 자신 또는 아군을 찾음
            // 자신에게 버프를 거는 경우는 이동이 필요 없으므로 executeSkillBranch 사용
            executeSkillBranch
        ]),

        // 2순위: 이동 없이 현재 위치에서 공격
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),

        // 3순위: 일반적인 근접 공격 (이동 포함)
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),

        // 4순위: 공격에 실패했다면 적을 향해 전진
        new SequenceNode([
            new HasNotMovedNode(),
            new FindTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),

        // 5순위: 전진도 불가능하면 안전한 위치로 이동
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 6순위: 모든 행동이 실패했다면 가까운 적에게 공격 시도
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetNode(engines),
            executeSkillBranch
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createISTJ_AI };
