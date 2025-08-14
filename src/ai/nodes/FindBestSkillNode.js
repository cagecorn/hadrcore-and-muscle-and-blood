import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';

class FindBestSkillNode extends Node {
    constructor(engines = {}) {
        super();
        this.skillEngine = engines.skillEngine || skillEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();

        for (const instanceId of equippedSkillInstances) {
            if (!instanceId || usedSkills.has(instanceId)) continue;

            const instData = skillInventoryManager.getInstanceData(instanceId);
            const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);

            if (this.skillEngine.canUseSkill(unit, skillData)) {
                blackboard.set('currentTargetSkill', { skillData, instanceId });
                debugAIManager.logNodeResult(NodeState.SUCCESS, `사용할 스킬 [${skillData.name}] 찾음`);
                return NodeState.SUCCESS;
            }
        }

        blackboard.set('currentTargetSkill', null);
        debugAIManager.logNodeResult(NodeState.FAILURE, '사용 가능한 스킬 없음');
        return NodeState.FAILURE;
    }
}
export default FindBestSkillNode;
