import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
// ✨ ENTP 전용으로 만든 신규 노드들을 import 합니다.
import FindHighValueTargetNode from '../nodes/FindHighValueTargetNode.js';
import FindPullPositionNode from '../nodes/FindPullPositionNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * ENTP: 변론가 아키타입 행동 트리
 * 우선순위:
 * 1. (교란) 가치 있는 목표(토큰/버프 많은 적)에게 최적의 스킬(디버프/관성/지연) 사용
 * 2. (위치 선정) '끌어당기기'를 위해 아군과 거리를 벌리는 위치로 이동
 * 3. (기본 공격) 위치 선정이 필요 없다면, 가치 있는 목표를 공격
 * 4. (재배치) 위 모든 행동이 불가능하면 안전한 위치로 이동
 */
function createENTP_AI(engines = {}) {
    // 스킬 하나를 실행하는 공통 로직 (이동 포함)
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
        // 1순위: 가치 있는 목표를 찾아 교란 스킬 사용
        new SequenceNode([
            new FindHighValueTargetNode(engines),
            new FindBestSkillByScoreNode(engines), // SkillScoreEngine이 교란 스킬에 높은 점수를 주도록 설정 필요
            executeSkillBranch
        ]),

        // 2순위: 다음 턴의 '끌어당기기'를 위한 위치 선정
        new SequenceNode([
            new HasNotMovedNode(),
            new FindHighValueTargetNode(engines), // 끌어당길 대상을 먼저 정하고
            new FindPullPositionNode(engines),   // 그 대상 기준으로 위치 탐색
            new MoveToTargetNode(engines)
        ]),

        // 3순위: 기본 공격 (이미 위치가 좋거나 위치 선정이 실패했을 때)
        new SequenceNode([
            new FindHighValueTargetNode(engines),
            new FindBestSkillByScoreNode(engines),
            executeSkillBranch
        ]),

        // 4순위: 모든 행동이 불가능했다면 적을 향해 전진
        new SequenceNode([
            new HasNotMovedNode(),
            new FindTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 5순위: 전진도 실패했다면 안전한 재배치
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

export { createENTP_AI };
