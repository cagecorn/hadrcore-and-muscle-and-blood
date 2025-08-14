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
import FindLowestHealthEnemyNode from '../nodes/FindLowestHealthEnemyNode.js';
// 새로 만든 노드를 import 합니다.
import IsHealthAboveThresholdNode from '../nodes/IsHealthAboveThresholdNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * ESTP: 모험을 즐기는 사업가 아키타입 행동 트리 (플라잉맨)
 * 우선순위:
 * 1. (과감한 공격) 체력이 70% 이상일 때, 가장 공격적인 스킬(돌진, 콤보, 희생)을 우선적으로 사용합니다.
 * 2. (일반 공격) 체력이 낮을 때는 일반적인 최적의 공격을 수행합니다.
 * 3. (최후의 이동) 공격할 수 없을 때만 위치를 재조정합니다.
 */
function createESTP_AI(engines = {}) {
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
        // 1순위: 체력이 높을 때의 과감한 공격
        new SequenceNode([
            new IsHealthAboveThresholdNode(0.70),
            new FindBestSkillByScoreNode(engines), // SkillScoreEngine이 CHARGE, SACRIFICE 등에 높은 점수를 부여
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),

        // 2순위: 일반적인 상황에서의 공격 (체력이 낮을 때)
        new SequenceNode([
            new FindLowestHealthEnemyNode(engines), // 가장 약한 적부터 처리
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
        // 4순위: 최후의 수단으로 위치 재조정
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

export { createESTP_AI };
