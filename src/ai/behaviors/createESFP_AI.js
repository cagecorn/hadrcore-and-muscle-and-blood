import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import FindEnemyClusterCenterNode from '../nodes/FindEnemyClusterCenterNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';

/**
 * ESFP: 자유로운 영혼의 연예인 아키타입 행동 트리 (다크나이트)
 * 우선순위:
 * 1. (위치 선정) 적 진영의 한가운데로 이동합니다.
 * 2. (광역 교란) 자신을 중심으로 발동하는 오라, 디버프 스킬을 우선적으로 사용합니다.
 * 3. (일반 공격) 위 행동이 불가능할 경우, 일반적인 최적 스킬을 사용합니다.
 */
function createESFP_AI(engines = {}) {
    // 스킬 하나를 실행하는 공통 로직 (현재 위치에서만)
    const useSkillImmediately = new SequenceNode([
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines)
    ]);

    const executeSkillBranch = new SelectorNode([
        useSkillImmediately,
        new SequenceNode([
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // 1순위: 적 클러스터 중심으로 이동
        new SequenceNode([
            new HasNotMovedNode(),
            new FindEnemyClusterCenterNode(engines),
            new MoveToTargetNode(engines)
        ]),

        // 2순위: 자신 중심의 광역 스킬 사용 (이동 없이 현재 위치에서)
        new SequenceNode([
            new FindBestSkillByScoreNode(engines), // SkillScoreEngine이 AURA, DEBUFF(광역)에 높은 점수 부여
            new FindTargetBySkillTypeNode(engines),
            useSkillImmediately
        ]),

        // 3순위: 일반 공격 (최후의 수단, 이동 포함)
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

export { createESFP_AI };
