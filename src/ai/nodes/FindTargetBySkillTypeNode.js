import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class FindTargetBySkillTypeNode extends Node {
    constructor({ targetManager }) {
        super();
        this.targetManager = targetManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const skillData = blackboard.get('currentSkillData');
        const enemyUnits = blackboard.get('enemyUnits')?.filter(e => e.currentHp > 0);
        const allUnits = blackboard.get('allUnits');
        const alliedUnits = allUnits?.filter(u => u.team === unit.team && u.currentHp > 0);

        if (!skillData) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "스킬 데이터 없음");
            return NodeState.FAILURE;
        }

        let target = null;
        const targetType = skillData.targetType;

        // 1. targetType을 최우선으로 확인하여 대상 그룹을 명확히 설정합니다.
        if (targetType === 'self' || skillData.type === 'STRATEGY') {
            target = unit;
        } else if (targetType === 'ally') {
            if (!alliedUnits || alliedUnits.length === 0) {
                debugAIManager.logNodeResult(NodeState.FAILURE, "지원할 아군 유닛 없음");
                return NodeState.FAILURE;
            }
            // 지원 스킬은 체력이 가장 낮은 아군을 우선 대상으로 합니다.
            target = [...alliedUnits].sort((a, b) => {
                const healthRatioA = a.currentHp / a.finalStats.hp;
                const healthRatioB = b.currentHp / b.finalStats.hp;
                return healthRatioA - healthRatioB;
            })[0];
        } else if (targetType === 'enemy' || skillData.type === 'DEBUFF' || skillData.type === 'ACTIVE') {
            if (!enemyUnits || enemyUnits.length === 0) {
                debugAIManager.logNodeResult(NodeState.FAILURE, "공격할 적 유닛 없음");
                return NodeState.FAILURE;
            }
            // '낙인' 스킬을 위한 특별 타겟팅 로직
            if (skillData.id === 'stigma') {
                let farthestEnemies = [];
                let maxDist = -1;
                enemyUnits.forEach(enemy => {
                    const dist = Math.abs(unit.gridX - enemy.gridX) + Math.abs(unit.gridY - enemy.gridY);
                    if (dist > maxDist) {
                        maxDist = dist;
                        farthestEnemies = [enemy];
                    } else if (dist === maxDist) {
                        farthestEnemies.push(enemy);
                    }
                });
                if (farthestEnemies.length > 0) {
                    target = farthestEnemies.sort((a, b) => a.currentHp - b.currentHp)[0];
                }
            } else {
                // 기본 적 대상 스킬은 체력이 가장 높은 적을 우선합니다.
                target = this.targetManager.findHighestHealthEnemy(enemyUnits);
            }
        } else {
            // targetType이 명시되지 않은 경우, 스킬 타입에 따라 대상을 추론합니다.
            if (skillData.type === 'BUFF' || skillData.type === 'AID') {
                if (!alliedUnits || alliedUnits.length === 0) {
                    // 지원할 아군이 없으면 자기 자신을 대상으로 할 수 있는지 확인
                    target = unit;
                } else {
                    // 지원 스킬은 체력이 가장 낮은 아군을 우선 대상으로 합니다.
                    target = [...alliedUnits].sort((a, b) => {
                        const healthRatioA = a.currentHp / a.finalStats.hp;
                        const healthRatioB = b.currentHp / b.finalStats.hp;
                        return healthRatioA - healthRatioB;
                    })[0];
                }
            } else {
                // 그 외 스킬은 기존 로직대로 가장 가까운 적을 공격합니다.
                if (!enemyUnits || enemyUnits.length === 0) {
                    debugAIManager.logNodeResult(NodeState.FAILURE, "공격할 적 유닛 없음");
                    return NodeState.FAILURE;
                }
                target = this.targetManager.findNearestEnemy(unit, enemyUnits);
            }
        }

        if (target) {
            blackboard.set('skillTarget', target);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `스킬 [${skillData.name}]의 대상 (${target.instanceName}) 설정`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, "스킬 대상을 찾지 못함");
        return NodeState.FAILURE;
    }
}
export default FindTargetBySkillTypeNode;
