import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { classProficiencies } from '../../game/data/classProficiencies.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';

/**
 * [마법] 숙련도 태그를 가진 아군 클러스터의 중심점으로 이동 경로를 설정하는 노드.
 * 자신을 제외하고 마법 아군이 1명 이상일 때만 작동합니다.
 */
class FindAllyMagicClusterNode extends Node {
    constructor({ pathfinderEngine, formationEngine }) {
        super();
        this.pathfinderEngine = pathfinderEngine;
        this.formationEngine = formationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const allies = blackboard.get('allyUnits');

        // 1. 자신을 제외한 마법 숙련도 아군 필터링
        const magicAllies = allies.filter(ally => {
            if (ally.uniqueId === unit.uniqueId) return false;
            const proficiencies = classProficiencies[ally.id] || [];
            return proficiencies.includes(SKILL_TAGS.MAGIC);
        });

        if (magicAllies.length < 1) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '주변에 마법 아군이 부족함');
            return NodeState.FAILURE;
        }

        // 2. 마법 아군 클러스터의 평균 위치(중심점) 계산
        const totalPos = magicAllies.reduce((acc, ally) => {
            acc.col += ally.gridX;
            acc.row += ally.gridY;
            return acc;
        }, { col: 0, row: 0 });

        const centerPos = {
            col: Math.round(totalPos.col / magicAllies.length),
            row: Math.round(totalPos.row / magicAllies.length),
        };

        // 3. 중심점 주변의 가장 가까운 빈 셀 찾기
        const availableCells = this.formationEngine.grid.gridCells.filter(c => !c.isOccupied);
        if (availableCells.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '이동할 빈 셀이 없음');
            return NodeState.FAILURE;
        }

        availableCells.sort((a, b) => {
            const distA = Math.abs(a.col - centerPos.col) + Math.abs(a.row - centerPos.row);
            const distB = Math.abs(b.col - centerPos.col) + Math.abs(b.row - centerPos.row);
            return distA - distB;
        });
        const bestCell = availableCells[0];

        // 4. 해당 위치로의 경로 탐색 및 블랙보드에 저장
        const path = await this.pathfinderEngine.findPath(unit, { col: unit.gridX, row: unit.gridY }, { col: bestCell.col, row: bestCell.row });

        if (path && path.length > 0) {
            blackboard.set('movementPath', path);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `마법 아군 클러스터(${bestCell.col}, ${bestCell.row})로 경로 설정`);
            return NodeState.SUCCESS;
        }
        
        debugAIManager.logNodeResult(NodeState.FAILURE, '클러스터로의 경로 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default FindAllyMagicClusterNode;
