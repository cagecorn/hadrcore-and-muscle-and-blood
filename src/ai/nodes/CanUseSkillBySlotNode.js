import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';

class CanUseSkillBySlotNode extends Node {
    constructor(slotIndex) {
        super();
        this.slotIndex = slotIndex;
    }

    async evaluate(unit, blackboard) {
        const nodeName = `CanUseSkillBySlotNode (Slot ${this.slotIndex + 1})`;
        debugAIManager.logNodeEvaluation({ constructor: { name: nodeName } }, unit);

        const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const instanceId = equippedSkillInstances[this.slotIndex];

        if (!instanceId) {
            debugAIManager.logNodeResult(NodeState.FAILURE, `${this.slotIndex + 1}번 슬롯에 스킬이 없음`);
            return NodeState.FAILURE;
        }

        const instData = skillInventoryManager.getInstanceData(instanceId);
        const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);

        if (skillEngine.canUseSkill(unit, skillData)) {
            blackboard.set('currentSkillData', skillData);
            blackboard.set('currentSkillInstanceId', instanceId);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `${this.slotIndex + 1}번 스킬 [${skillData.name}] 사용 가능`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `${this.slotIndex + 1}번 스킬 [${skillData.name}] 사용 불가`);
        return NodeState.FAILURE;
    }
}
export default CanUseSkillBySlotNode;
