import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';

/**
 * 사용 가능한 [전략] 태그 스킬을 찾아 블랙보드에 설정합니다.
 */
class FindStrategySkillNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();

        for (const instanceId of equippedSkillInstances) {
            if (!instanceId || usedSkills.has(instanceId)) continue;

            const instData = skillInventoryManager.getInstanceData(instanceId);
            const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);

            if ((skillData.tags || []).includes(SKILL_TAGS.STRATEGY) && skillEngine.canUseSkill(unit, skillData)) {
                blackboard.set('currentTargetSkill', { skillData, instanceId });
                blackboard.set('currentSkillData', skillData);
                blackboard.set('currentSkillInstanceId', instanceId);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `전략 스킬 [${skillData.name}] 찾음`);
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '사용 가능한 전략 스킬 없음');
        return NodeState.FAILURE;
    }
}

export default FindStrategySkillNode;
