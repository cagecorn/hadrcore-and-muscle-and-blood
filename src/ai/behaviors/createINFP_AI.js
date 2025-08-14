import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import FindEnemyMedicNode from '../nodes/FindEnemyMedicNode.js';
import FindBuffedEnemyNode from '../nodes/FindBuffedEnemyNode.js';
import FindNearestAllyInDangerNode from '../nodes/FindNearestAllyInDangerNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * INFP: 중재자 아키타입 행동 트리
 * 우선순위:
 * 1. (생존) 체력이 40% 미만이면 가장 안전한 위치로 후퇴합니다.
 * 2. (전략적 방해) 적 메딕에게 '낙인'을 걸거나, 위협적인 버프를 가진 적에게 디버프를 겁니다.
 * 3. (아군 지원) 위험에 처한 아군을 치유합니다.
 * 4. (안전한 공격) 적과 안전거리를 유지하며(카이팅) 공격합니다.
 */
function createINFP_AI(engines = {}) {
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
        // 1순위: 생존 본능
        new SequenceNode([
            new IsHealthBelowThresholdNode(0.4), // 체력 40% 미만일 때
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines), // 가장 안전한 위치 탐색
            new MoveToTargetNode(engines)
        ]),

        // 2순위: 전략적 방해
        new SelectorNode([
            // 2-1: 적 메딕에게 '낙인' 시도
            new SequenceNode([
                new FindEnemyMedicNode(engines),
                new FindBestSkillByScoreNode(engines), // SkillScoreEngine이 PROHIBITION 태그에 높은 점수를 주도록 설정
                executeSkillBranch
            ]),
            // 2-2: 위협적인 버프를 가진 적에게 디버프
            new SequenceNode([
                new FindBuffedEnemyNode(engines), // 예: 전투의 함성 버프를 가진 적
                new FindBestSkillByScoreNode(engines), // DEBUFF 스킬 선호
                executeSkillBranch
            ]),
        ]),

        // 3순위: 아군 지원
        new SequenceNode([
            new FindNearestAllyInDangerNode(0.6), // 체력 60% 이하 아군 탐색
            new FindBestSkillByScoreNode(engines), // HEAL, AID 스킬 선호
            executeSkillBranch
        ]),

        // 4순위: 안전한 기본 공격 (카이팅)
        new SequenceNode([
            new FindTargetBySkillTypeNode(engines),
            new SelectorNode([
                executeSkillBranch,
                new SequenceNode([
                    new HasNotMovedNode(),
                    new FindKitingPositionNode(engines),
                    new MoveToTargetNode(engines)
                ])
            ])
        ]),
        // 5순위: 공격도 카이팅도 불가능하면 적을 향해 전진
        new SequenceNode([
            new HasNotMovedNode(),
            new FindTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 6순위: 전진마저 불가능하면 안전한 위치로 후퇴
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 7순위: 모든 행동이 실패했다면 가까운 적에게 공격 시도
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetNode(engines),
            executeSkillBranch
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createINFP_AI };
