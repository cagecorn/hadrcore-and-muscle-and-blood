import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { skillScoreEngine } from '../../game/utils/SkillScoreEngine.js';
import { activeSkills } from '../../game/data/skills/active.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

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

        const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const target = blackboard.get('skillTarget') || blackboard.get('currentTargetUnit');
        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
        const allies = blackboard.get('allyUnits') || [];
        const enemies = blackboard.get('enemyUnits') || [];

        let bestSkill = null;
        let maxScore = -Infinity;

        for (const instanceId of equippedSkillInstances) {
            if (!instanceId || usedSkills.has(instanceId)) continue;

            const instData = skillInventoryManager.getInstanceData(instanceId);
            const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);

            if (this.skillEngine.canUseSkill(unit, skillData)) {
                const currentScore = await this.skillScoreEngine.calculateScore(unit, skillData, target, allies, enemies);
                if (currentScore <= 0) {
                    continue;
                }
                if (currentScore > maxScore) {
                    maxScore = currentScore;
                    bestSkill = { skillData, instanceId };
                }
            }
        }

        if (maxScore <= 0) {
            const attackSkillData = activeSkills.attack?.NORMAL || skillInventoryManager.getSkillData('attack', 'NORMAL');
            if (attackSkillData && this.skillEngine.canUseSkill(unit, attackSkillData)) {
                const attackInstance = skillInventoryManager.getInventory().find(inst => inst.skillId === 'attack');
                if (attackInstance) {
                    bestSkill = { skillData: attackSkillData, instanceId: attackInstance.instanceId };
                    maxScore = 1;
                    debugLogEngine.log(this.name, `[${unit.instanceName}]이(가) 다른 스킬 대신 기본 '공격'을 선택합니다.`);
                }
            }
        }

        if (bestSkill) {
            blackboard.set('currentTargetSkill', bestSkill);
            blackboard.set('currentSkillData', bestSkill.skillData);
            blackboard.set('currentSkillInstanceId', bestSkill.instanceId);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `최고점 스킬 [${bestSkill.skillData.name}] 찾음 (점수: ${maxScore})`);
            return NodeState.SUCCESS;
        }

        blackboard.set('currentTargetSkill', null);
        debugAIManager.logNodeResult(NodeState.FAILURE, '사용 가능한 스킬 없음');
        return NodeState.FAILURE;
    }
}

export default FindBestSkillByScoreNode;
