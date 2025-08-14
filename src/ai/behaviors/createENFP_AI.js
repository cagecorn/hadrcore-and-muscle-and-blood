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
import FindPriorityTargetNode from '../nodes/FindPriorityTargetNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * ENFP: 활동가 아키타입 행동 트리 (거너)
 * 우선순위:
 * 1. (핵심 저격) 우선순위가 높은 적(원거리/힐러)에게 가장 강력한 단일 대상 스킬(확정/콤보)을 사용합니다.
 * 2. (위치 변경) 공격 후에는 다른 안전한 위치로 이동하여 다음 기회를 노립니다.
 * 3. (일반 공격) 저격할 상황이 아니라면, 일반적인 최적 스킬을 사용합니다.
 * 4. (재배치) 할 행동이 없다면, 끊임없이 위치를 바꾸며 적을 교란합니다.
 */
function createENFP_AI(engines = {}) {
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
        // 1순위: 우선순위 타겟에게 '확정' 또는 '콤보' 스킬 저격
        new SequenceNode([
            new FindPriorityTargetNode(engines), // 힐러, 원거리 딜러 등 위협적인 적을 먼저 찾음
            // SkillScoreEngine이 CHARGE, KINETIC, FIXED, COMBO 태그에 매우 높은 점수를 주도록 설정해야 함
            new FindBestSkillByScoreNode(engines),
            executeSkillBranch
        ]),

        // 2순위: 일반적인 최적 스킬 사용
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),

        // 3순위: 공격에 실패했다면 적을 향해 전진
        new SequenceNode([
            new HasNotMovedNode(),
            new FindTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 4순위: 전진도 불가능하면 끊임없이 위치 변경 (재배치)
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

export { createENFP_AI };
