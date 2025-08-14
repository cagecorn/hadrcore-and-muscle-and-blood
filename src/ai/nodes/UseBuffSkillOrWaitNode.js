import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';
import UseSkillNode from './UseSkillNode.js';

/**
 * 경로 탐색 실패 시 사용할 버프 스킬을 찾거나,
 * 사용할 버프 스킬이 없다면 대기합니다.
 */
class UseBuffSkillOrWaitNode extends Node {
    constructor(engines = {}) {
        super();
        this.useSkillNode = new UseSkillNode(engines);
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId) || [];
        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();

        for (const instanceId of equipped) {
            if (!instanceId || usedSkills.has(instanceId)) continue;

            const instData = skillInventoryManager.getInstanceData(instanceId);
            const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);

            if (skillData.tags?.includes(SKILL_TAGS.BUFF) && skillEngine.canUseSkill(unit, skillData)) {
                blackboard.set('currentSkillData', skillData);
                blackboard.set('currentSkillInstanceId', instanceId);
                blackboard.set('skillTarget', unit);
                const result = await this.useSkillNode.evaluate(unit, blackboard);
                debugAIManager.logNodeResult(result, `버프 스킬 [${skillData.name}] 사용 시도`);
                return result;
            }
        }

        // 사용할 수 있는 버프 스킬이 없다면 대기
        debugAIManager.logNodeResult(NodeState.SUCCESS, '버프 스킬 없음 - 대기');
        return NodeState.SUCCESS;
    }
}

export default UseBuffSkillOrWaitNode;
