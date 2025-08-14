import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { skillScoreEngine } from '../../game/utils/SkillScoreEngine.js';
import { formationEngine } from '../../game/utils/FormationEngine.js';
import { pathfinderEngine } from '../../game/utils/PathfinderEngine.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

/**
 * 이동과 스킬 사용을 세트로 평가하여 최적의 행동을 찾습니다.
 * @param {object} unit - 평가할 유닛
 * @param {Array<object>} allies - 아군 목록
 * @param {Array<object>} enemies - 적군 목록
 * @param {Set<string>} usedSkills - 이미 사용한 스킬 인스턴스 ID 집합
 * @returns {Promise<object|null>} - { move:{col,row}, skill:{skillData,instanceId}, target, score }
 */
export async function findBestActionForUnit(unit, allies = [], enemies = [], usedSkills = new Set()) {
    let bestAction = { move: null, skill: null, target: null, score: -Infinity };

    let possibleMoves = pathfinderEngine.findAllReachableTiles(unit);
    if (!Array.isArray(possibleMoves)) {
        debugLogEngine.warn('findBestActionForUnit', 'findAllReachableTiles가 배열을 반환하지 않았습니다.', possibleMoves);
        possibleMoves = [];
    }
    // 현재 위치도 포함
    if (!possibleMoves.some(p => p.col === unit.gridX && p.row === unit.gridY)) {
        possibleMoves.push({ col: unit.gridX, row: unit.gridY });
    }

    const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId) || [];

    for (const movePos of possibleMoves) {
        const virtualUnit = { ...unit, gridX: movePos.col, gridY: movePos.row };
        const moveCost = Math.abs(unit.gridX - movePos.col) + Math.abs(unit.gridY - movePos.row);

        // 먼저 사용 가능한 스킬만 선별합니다.
        const availableSkills = [];
        for (const instanceId of equippedSkillInstances) {
            if (!instanceId || usedSkills.has(instanceId)) continue;
            const instData = skillInventoryManager.getInstanceData(instanceId);
            const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);
            if (skillEngine.canUseSkill(virtualUnit, skillData)) {
                availableSkills.push({ skillData, instanceId });
            }
        }
        if (availableSkills.length === 0) continue;

        for (const { skillData, instanceId } of availableSkills) {
            const isSelfTarget = skillData.targetType === 'self';
            const candidates = isSelfTarget
                ? [virtualUnit]
                : skillData.targetType === 'ally'
                    ? allies
                    : enemies;
            const targets = candidates.filter(t => {
                if (isSelfTarget) return t.uniqueId === virtualUnit.uniqueId;
                if (t.uniqueId === virtualUnit.uniqueId) return false;
                const dist = Math.abs(t.gridX - virtualUnit.gridX) + Math.abs(t.gridY - virtualUnit.gridY);
                return dist <= (skillData.range || 1);
            });

            for (const target of targets) {
                const score = await skillScoreEngine.calculateScore(virtualUnit, skillData, target, allies, enemies) - moveCost;
                if (score > bestAction.score) {
                    bestAction = {
                        move: movePos,
                        skill: { skillData, instanceId },
                        target,
                        score
                    };
                }
            }
        }
    }

    return bestAction.score > -Infinity ? bestAction : null;
}
