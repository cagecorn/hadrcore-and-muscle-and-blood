import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { skillScoreEngine } from '../../game/utils/SkillScoreEngine.js';

/**
 * 사용 가능한 스킬 중 특정 태그를 가진 스킬을 점수 기반으로 찾는 노드
 */
class FindSkillByTagNode extends Node {
    constructor(tag, engines = {}) {
        super();
        this.tag = tag;
        this.skillEngine = engines.skillEngine || skillEngine;
        this.skillScoreEngine = engines.skillScoreEngine || skillScoreEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const target = blackboard.get('currentTargetUnit');
        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
        const allies = blackboard.get('allyUnits') || [];
        const enemies = blackboard.get('enemyUnits') || [];

        let bestSkill = null;
        let maxScore = -1;

        for (const instanceId of equippedSkillInstances) {
            if (!instanceId || usedSkills.has(instanceId)) continue;

            const instData = skillInventoryManager.getInstanceData(instanceId);
            const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);

            // 해당 태그를 가졌고, 사용 가능한 스킬만 대상으로 함
            if (skillData.tags?.includes(this.tag) && this.skillEngine.canUseSkill(unit, skillData)) {
                const currentScore = await this.skillScoreEngine.calculateScore(unit, skillData, target, allies, enemies);
                if (currentScore > maxScore) {
                    maxScore = currentScore;
                    bestSkill = { skillData, instanceId };
                }
            }
        }

        if (bestSkill) {
            blackboard.set('currentTargetSkill', bestSkill);
            blackboard.set('currentSkillData', bestSkill.skillData);
            blackboard.set('currentSkillInstanceId', bestSkill.instanceId);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `[${this.tag}] 태그 스킬 [${bestSkill.skillData.name}] 찾음`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `사용 가능한 [${this.tag}] 태그 스킬 없음`);
        return NodeState.FAILURE;
    }
}

export default FindSkillByTagNode;
