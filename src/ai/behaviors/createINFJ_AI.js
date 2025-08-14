import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import FindNearestAllyInDangerNode from '../nodes/FindNearestAllyInDangerNode.js';
import FindPriorityTargetNode from '../nodes/FindPriorityTargetNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * INFJ: 옹호자 아키타입 행동 트리
 * 우선순위:
 * 1. (아군 보호) 체력이 35% 미만인 가장 가까운 아군에게 지원 스킬(AID, BUFF) 사용
 * 2. (위협 제거) 아군을 위협하는 우선순위 높은 적(원거리/힐러) 공격
 * 3. (기본 행동) 그 외 상황에서는 점수가 가장 높은 스킬 사용
 * 4. (위치 선정) 할 행동이 없으면 아군 근처의 안전한 위치로 이동
 */
function createINFJ_AI(engines = {}) {
    // 스킬 하나를 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        // 사거리 내에 있으면 즉시 사용
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        // 사거리 밖이면 안전한 위치를 찾아 이동 후 사용
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeHealingPositionNode(engines), // 아군 지원에 최적화된 위치 탐색
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // 1순위: 위험에 처한 아군 보호
        new SequenceNode([
            new FindNearestAllyInDangerNode(0.35), // 체력 35% 이하 아군 탐색
            new FindBestSkillByScoreNode(engines), // AID, BUFF, WILL_GUARD 스킬에 높은 점수 부여
            executeSkillBranch
        ]),

        // 2순위: 위협적인 적 제거 (MeleeAI와 유사)
        new SequenceNode([
            new FindPriorityTargetNode(engines), // 원거리/힐러 우선 타겟팅
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        
        // 3순위: 일반적인 최적 스킬 사용
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
        // 5순위: 전진도 불가능하면 안전한 위치로 재배치
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

export { createINFJ_AI };
