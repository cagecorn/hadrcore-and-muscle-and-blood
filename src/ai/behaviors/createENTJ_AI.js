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
import IsEarlyBattleNode from '../nodes/IsEarlyBattleNode.js';
import FindStrategySkillNode from '../nodes/FindStrategySkillNode.js';
import FindAllyClusterCenterNode from '../nodes/FindAllyClusterCenterNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';

/**
 * ENTJ: 통솔관 아키타입 행동 트리
 * 우선순위:
 * 1. (전략) 전투 초반에 강력한 전략 스킬 사용
 * 2. (위치) 아군 진형의 중심으로 이동
 * 3. (일반) 점수가 가장 높은 스킬 사용
 */
function createENTJ_AI(engines = {}) {
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
        // 1순위: 전투 초반에 전략 스킬 사용
        new SequenceNode([
            new IsEarlyBattleNode(2), // 1~2턴 동안만 시도
            new FindStrategySkillNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),

        // 2순위: 아군 클러스터 중심으로 이동
        new SequenceNode([
            new HasNotMovedNode(),
            new FindAllyClusterCenterNode(engines),
            new MoveToTargetNode(engines)
        ]),

        // 3순위: 일반적인 최적 스킬 사용
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
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

export { createENTJ_AI };
