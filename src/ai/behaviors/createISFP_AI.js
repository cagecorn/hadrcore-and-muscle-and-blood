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
import FindSkillByTagNode from '../nodes/FindSkillByTagNode.js';
import FindLowestHealthEnemyNode from '../nodes/FindLowestHealthEnemyNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';
// 새로 만든 노드를 import 합니다.
import IsTargetHealthBelowThresholdNode from '../nodes/IsTargetHealthBelowThresholdNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * ISFP: 호기심 많은 예술가 아키타입 행동 트리 (고스트)
 * 우선순위:
 * 1. (생존) 자신의 체력이 40% 미만이면 안전한 곳으로 후퇴합니다.
 * 2. (처형) 체력이 35% 이하인 가장 약한 적에게 [EXECUTE] 스킬을 사용하여 마무리합니다.
 * 3. (안전한 공격) 마무리할 대상이 없으면, 적과 안전거리를 유지하며(카이팅) 공격합니다.
 * 4. (재배치) 공격할 수 없으면, 안전한 위치로 이동하며 기회를 엿봅니다.
 */
function createISFP_AI(engines = {}) {
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
        // 1순위: 생존 본능
        new SequenceNode([
            new IsHealthBelowThresholdNode(0.40),
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines)
        ]),

        // 2순위: 처형 로직 (체력이 낮은 적 마무리)
        new SequenceNode([
            new FindLowestHealthEnemyNode(engines),
            new IsTargetHealthBelowThresholdNode(0.35),
            new FindSkillByTagNode(SKILL_TAGS.EXECUTE, engines),
            executeSkillBranch
        ]),

        // 3순위: 안전한 공격 (카이팅)
        new SequenceNode([
            new FindLowestHealthEnemyNode(engines),
            new FindBestSkillByScoreNode(engines),
            new SelectorNode([
                executeSkillBranch,
                new SequenceNode([
                    new HasNotMovedNode(),
                    new IsTargetTooCloseNode({ ...engines, dangerZone: 3 }),
                    new FindKitingPositionNode(engines),
                    new MoveToTargetNode(engines)
                ]),
                executeSkillBranch
            ])
        ]),

        // 4순위: 공격에 실패했다면 적을 향해 전진
        new SequenceNode([
            new HasNotMovedNode(),
            new FindTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),
        // 5순위: 전진이 불가능하면 소극적인 위치 재선정
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

export { createISFP_AI };
