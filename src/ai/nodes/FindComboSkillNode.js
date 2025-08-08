import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';
import { comboManager } from '../../game/utils/ComboManager.js';

/**
 * 마지막으로 사용한 스킬에 [콤보] 태그가 있었고, 현재 사용할 수 있는 또 다른 [콤보] 스킬이 있는지 확인하는 노드
 */
class FindComboSkillNode extends Node {
    constructor(engines = {}) {
        super();
        this.skillEngine = engines.skillEngine || skillEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const comboData = comboManager.comboData.get(unit.uniqueId);
        // 이전 스킬이 콤보 스킬이 아니었다면 즉시 실패
        if (!comboData || !(comboData.lastSkillTags || []).includes(SKILL_TAGS.COMBO)) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '이전 스킬이 콤보 스킬이 아님');
            return NodeState.FAILURE;
        }

        const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();

        for (const instanceId of equippedSkillInstances) {
            if (!instanceId || usedSkills.has(instanceId)) continue;

            const instData = skillInventoryManager.getInstanceData(instanceId);
            const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);

            // 사용 가능하고, [콤보] 태그를 가진 다른 스킬을 찾습니다.
            if ((skillData.tags || []).includes(SKILL_TAGS.COMBO) && this.skillEngine.canUseSkill(unit, skillData)) {
                blackboard.set('currentTargetSkill', { skillData, instanceId });
                debugAIManager.logNodeResult(NodeState.SUCCESS, `연계할 콤보 스킬 [${skillData.name}] 찾음`);
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '사용 가능한 연계 콤보 스킬 없음');
        return NodeState.FAILURE;
    }
}

export default FindComboSkillNode;
