// js/managers/BasicAIManager.js

import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 다른 매니저(Targeting, Position)로부터 정보를 받아 기본적인 AI 행동을 결정합니다.
 */
export class BasicAIManager {
    constructor(targetingManager, positionManager) {
        if (GAME_DEBUG_MODE) console.log("🤖 BasicAIManager initialized. Ready to command. 🤖");
        this.targetingManager = targetingManager;
        this.positionManager = positionManager;
    }

    /**
     * 유닛의 이동 및 공격 행동을 결정합니다.
     * @param {object} unit - 행동할 유닛
     * @param {number} moveRange - 유닛의 이동 범위
     * @param {number} attackRange - 유닛의 공격 범위
     * @returns {{actionType: string, targetId?: string, moveTargetX?: number, moveTargetY?: number} | null}
     */
    determineMoveAndTarget(unit, moveRange, attackRange) {
        // 1. 색적: 가장 좋은 목표를 찾는다.
        const target = this.targetingManager.findBestTarget('enemy', 'lowestHp', unit);
        if (!target) {
            if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} found no targets.`);
            return null; // 공격할 대상이 없으면 행동 종료
        }
        if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} selected target: ${target.name}`);

        // 2. 좌표 계산: 목표를 공격할 수 있는 위치들을 찾는다.
        const attackPositions = this.positionManager.getAttackablePositions(target, attackRange);

        // 3. 경로 탐색: 현재 위치에서 공격 위치까지 갈 수 있는지 확인한다.
        // 가장 가까운 공격 위치를 찾는다.
        let bestPath = null;
        for (const pos of attackPositions) {
            const path = this.positionManager.findPath({ x: unit.gridX, y: unit.gridY }, pos, moveRange);
            if (path && (!bestPath || path.length < bestPath.length)) {
                bestPath = path;
            }
        }

        // 4. 행동 결정
        // 이미 공격 범위 내에 있는 경우
        if (this.positionManager.getAttackablePositions(unit, attackRange).some(p => p.x === target.gridX && p.y === target.gridY)) {
             if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} is already in attack range. Attacking ${target.name}.`);
             return { actionType: 'attack', targetId: target.id };
        }

        // 이동 후 공격할 경로를 찾은 경우
        if (bestPath) {
            const destination = bestPath[bestPath.length - 1];
            if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} will move to (${destination.x},${destination.y}) and attack ${target.name}.`);
            return {
                actionType: 'moveAndAttack',
                targetId: target.id,
                moveTargetX: destination.x,
                moveTargetY: destination.y
            };
        }

        // 공격 위치로 이동할 수 없을 때: 그냥 적에게 다가간다.
        const pathToTarget = this.positionManager.findPath(
            { x: unit.gridX, y: unit.gridY },
            { x: target.gridX, y: target.gridY }
        );
        if (pathToTarget && pathToTarget.length > 1) {
            // 경로의 마지막 지점은 적이므로, 그 바로 앞 칸으로 이동
            // ✨ 경로가 이동 범위보다 길 경우, 이동 가능한 최대 지점으로 이동하도록 수정
            const moveIndex = Math.min(pathToTarget.length - 1, moveRange);
            const moveDestination = pathToTarget[moveIndex];

            // ✨ 목적지가 비어있는지 마지막으로 확인
            if (moveDestination && !this.positionManager.battleSimulationManager.isTileOccupied(moveDestination.x, moveDestination.y, unit.id)) {
                if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} cannot reach attack position. Moving closer to ${target.name} at (${moveDestination.x},${moveDestination.y}).`);
                return { actionType: 'move', moveTargetX: moveDestination.x, moveTargetY: moveDestination.y };
            }
        }

        if (GAME_DEBUG_MODE) console.log(`[BasicAIManager] ${unit.name} has no possible action.`);
        return null; // 아무 행동도 할 수 없음
    }
}
