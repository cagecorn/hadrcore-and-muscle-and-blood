import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindLowestHealthAllyNode from '../nodes/FindLowestHealthAllyNode.js';
import FindAllyToBuffNode from '../nodes/FindAllyToBuffNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * ISFJ: 용감한 수호자 아키타입 행동 트리 (메딕)
 * 우선순위:
 * 1. (최우선 치유) 체력이 100%가 아닌 아군 중 가장 체력 비율이 낮은 아군을 치유합니다.
 * 2. (예방적 버프) 치유할 대상이 없으면, 아직 버프가 없는 아군에게 버프(의지 방패 등)를 겁니다.
 * 3. (위치 선정) 할 행동이 없으면, 아군 근처의 안전한 위치로 이동합니다.
 */
function createISFJ_AI(engines = {}) {
    // 스킬 하나를 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeHealingPositionNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // 1순위: 아군 치유
        new SequenceNode([
            new FindLowestHealthAllyNode(engines), // 체력이 100%가 아닌 가장 위급한 아군 탐색
            new FindBestSkillByScoreNode(engines), // SkillScoreEngine이 HEAL, AID 태그에 높은 점수 부여
            executeSkillBranch
        ]),

        // 2순위: 예방적 버프/보호막
        new SequenceNode([
            new FindAllyToBuffNode(engines), // 버프가 없는 아군 탐색
            new FindBestSkillByScoreNode(engines), // WILL_GUARD, BUFF 태그에 높은 점수 부여
            executeSkillBranch
        ]),

        // 3순위: 행동이 없다면 적을 향해 전진
        new SequenceNode([
            new HasNotMovedNode(),
            new FindTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 4순위: 전진도 불가능하면 안전한 위치로 재배치
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

export { createISFJ_AI };
