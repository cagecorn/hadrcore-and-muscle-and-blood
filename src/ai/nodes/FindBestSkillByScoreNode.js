import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { skillScoreEngine } from '../../game/utils/SkillScoreEngine.js';
import { activeSkills } from '../../game/data/skills/active.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';
import { findBestActionForUnit } from '../utils/findBestActionForUnit.js';

/**
 * 사용 가능한 스킬 중 SkillScoreEngine으로 계산된 점수가 가장 높은 스킬을 찾는 노드
 */
class FindBestSkillByScoreNode extends Node {
    constructor(engines = {}) {
        super();
        this.name = 'FindBestSkillByScoreNode';
        this.skillEngine = engines.skillEngine || skillEngine;
        this.skillScoreEngine = engines.skillScoreEngine || skillScoreEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
        const allies = blackboard.get('allyUnits') || [];
        const enemies = blackboard.get('enemyUnits') || [];

        const bestAction = await findBestActionForUnit(unit, allies, enemies, usedSkills);

        if (bestAction && bestAction.skill) {
            blackboard.set('currentTargetSkill', bestAction.skill);
            blackboard.set('currentSkillData', bestAction.skill.skillData);
            blackboard.set('currentSkillInstanceId', bestAction.skill.instanceId);
            blackboard.set('skillTarget', bestAction.target);
            blackboard.set('plannedMovePosition', bestAction.move);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `최고점 행동 [${bestAction.skill.skillData.name}] 찾음 (점수: ${bestAction.score})`);
            return NodeState.SUCCESS;
        }

        // 기본 공격으로도 대체 불가할 때
        const attackSkillData = activeSkills.attack?.NORMAL || skillInventoryManager.getSkillData('attack', 'NORMAL');
        if (attackSkillData && this.skillEngine.canUseSkill(unit, attackSkillData)) {
            const attackInstance = skillInventoryManager.getInventory().find(inst => inst.skillId === 'attack');
            if (attackInstance) {
                blackboard.set('currentTargetSkill', { skillData: attackSkillData, instanceId: attackInstance.instanceId });
                blackboard.set('currentSkillData', attackSkillData);
                blackboard.set('currentSkillInstanceId', attackInstance.instanceId);
                debugLogEngine.log(this.name, `[${unit.instanceName}]이(가) 다른 스킬 대신 기본 '공격'을 선택합니다.`);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `기본 공격 선택`);
                return NodeState.SUCCESS;
            }
        }

        blackboard.set('currentTargetSkill', null);
        debugAIManager.logNodeResult(NodeState.FAILURE, '사용 가능한 스킬 없음');
        return NodeState.FAILURE;
    }
}

export default FindBestSkillByScoreNode;
