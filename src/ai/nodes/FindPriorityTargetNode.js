import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 우선순위 클래스(메딕, 거너, 나노맨서)를 먼저 탐색하고, 없으면 가장 가까운 적을 찾는 노드
 */
class FindPriorityTargetNode extends Node {
    constructor({ targetManager, narrationEngine }) {
        super();
        this.targetManager = targetManager;
        this.narrationEngine = narrationEngine;
        this.priorityClasses = ['medic', 'gunner', 'nanomancer'];
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemyUnits = blackboard.get('enemyUnits')?.filter(e => e.currentHp > 0);

        if (!enemyUnits || enemyUnits.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "적이 없음");
            return NodeState.FAILURE;
        }

        // 1. 우선순위 클래스 필터링
        const priorityTargets = enemyUnits.filter(enemy => this.priorityClasses.includes(enemy.id));

        let target = null;
        if (priorityTargets.length > 0) {
            // 2. 우선순위 대상 중 가장 가까운 적 선택
            target = this.targetManager.findNearestEnemy(unit, priorityTargets);
            if (this.narrationEngine && target) {
                this.narrationEngine.show(`${unit.instanceName}이(가) 위협적인 적 [${target.name}]을(를) 먼저 제압하려 합니다.`);
            }
            debugAIManager.logNodeResult(NodeState.SUCCESS, `우선순위 타겟 [${target.instanceName}] 설정`);
        } else {
            // 3. 우선순위 대상이 없으면, 모든 적 중 가장 가까운 적 선택
            target = this.targetManager.findNearestEnemy(unit, enemyUnits);
            if (target) {
                debugAIManager.logNodeResult(NodeState.SUCCESS, `일반 타겟 [${target.instanceName}] 설정`);
            }
        }

        if (target) {
            blackboard.set('movementTarget', target);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, "이동할 타겟을 찾지 못함");
        return NodeState.FAILURE;
    }
}

export default FindPriorityTargetNode;
