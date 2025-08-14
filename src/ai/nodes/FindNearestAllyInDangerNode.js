import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 시야 내에서 체력이 낮은 아군을 찾아 블랙보드에 저장합니다.
 */
class FindNearestAllyInDangerNode extends Node {
    constructor(threshold = 0.35) {
        super();
        this.threshold = threshold;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const allUnits = blackboard.get('allUnits');
        if (!allUnits) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '유닛 목록 없음');
            return NodeState.FAILURE;
        }

        const allies = allUnits.filter(u => u.team === unit.team && u.uniqueId !== unit.uniqueId && u.currentHp > 0);
        const inDanger = allies.filter(a => (a.currentHp / a.finalStats.hp) <= this.threshold);
        if (inDanger.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '위험한 아군 없음');
            return NodeState.FAILURE;
        }

        let nearest = null;
        let minDist = Infinity;
        inDanger.forEach(ally => {
            const dist = Math.abs(unit.gridX - ally.gridX) + Math.abs(unit.gridY - ally.gridY);
            if (dist < minDist) {
                minDist = dist;
                nearest = ally;
            }
        });

        blackboard.set('allyInDanger', nearest);
        debugAIManager.logNodeResult(NodeState.SUCCESS, `아군 발견: ${nearest.instanceName}`);
        return NodeState.SUCCESS;
    }
}

export default FindNearestAllyInDangerNode;
