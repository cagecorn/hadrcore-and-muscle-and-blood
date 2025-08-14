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
import FindComboSkillNode from '../nodes/FindComboSkillNode.js'; // ✨ 새로 추가될 노드
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * INTP: 논리술사 아키타입 행동 트리
 * 우선순위:
 * 1. (콤보 연계) 이전 스킬이 콤보 스킬이었다면, 연계할 수 있는 다른 콤보 스킬을 최우선으로 사용.
 * 2. (일반 판단) 점수가 가장 높은 스킬을 사용 (SkillScoreEngine이 COMBO, PRODUCTION 태그에 높은 점수를 부여)
 * 3. (재배치) 할 수 있는 스킬이 없다면 안전한 위치로 이동
 */
function createINTP_AI(engines = {}) {
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
        // 1순위: 콤보 연계 시도
        new SequenceNode([
            new FindComboSkillNode(engines), // 이전 스킬이 콤보였는지, 연계할 콤보 스킬이 있는지 확인
            new FindTargetBySkillTypeNode(engines), // 찾은 콤보 스킬에 맞는 대상 탐색
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
        // 4순위: 전진도 불가능하면 안전한 위치로 이동
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

export { createINTP_AI };
