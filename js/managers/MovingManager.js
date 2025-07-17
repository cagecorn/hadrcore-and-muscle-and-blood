// js/managers/MovingManager.js

import { GAME_DEBUG_MODE } from '../constants.js'; // 디버그 모드 상수 임포트

export class MovingManager {
    /**
     * MovingManager를 초기화합니다.
     * @param {BattleSimulationManager} battleSimulationManager - 유닛 데이터 및 그리드 업데이트를 위한 인스턴스
     * @param {AnimationManager} animationManager - 이동 애니메이션 처리를 위한 인스턴스
     * @param {DelayEngine} delayEngine - 애니메이션 지연을 위한 인스턴스
     * @param {CoordinateManager} coordinateManager - 좌표 유효성 검사를 위한 인스턴스
     */
    constructor(battleSimulationManager, animationManager, delayEngine, coordinateManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDE80 MovingManager initialized. Ready for special unit movements. \uD83D\uDE80");
        if (!battleSimulationManager || !animationManager || !delayEngine || !coordinateManager) {
            throw new Error("[MovingManager] Missing essential dependencies. Cannot initialize.");
        }
        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        this.delayEngine = delayEngine;
        this.coordinateManager = coordinateManager;
    }

    /**
     * 유닛을 지정된 목표 그리드 타일로 '돌진'시킵니다.
     * 이동 범위 내에서 대상에게 가장 가까운 비어있는 타일로 즉시 이동하는 것을 시뮬레이션합니다.
     * @param {object} unit - 이동할 유닛 객체
     * @param {number} targetGridX - 목표 유닛/지점의 X 좌표
     * @param {number} targetGridY - 목표 유닛/지점의 Y 좌표
     * @param {number} moveRange - 유닛의 이동 가능 범위
     * @returns {Promise<boolean>} 이동 성공 여부 Promise
     */
    async chargeMove(unit, targetGridX, targetGridY, moveRange) {
        if (!unit) {
            if (GAME_DEBUG_MODE) console.warn("[MovingManager] Charge move failed: Unit is null.");
            return false;
        }

        const currentX = unit.gridX;
        const currentY = unit.gridY;

        const potentialDestinations = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                const potentialX = targetGridX + dx;
                const potentialY = targetGridY + dy;

                if (potentialX >= 0 && potentialX < this.battleSimulationManager.gridCols &&
                    potentialY >= 0 && potentialY < this.battleSimulationManager.gridRows) {

                    const distToTarget = Math.abs(targetGridX - potentialX) + Math.abs(targetGridY - potentialY);
                    if (distToTarget > 1) continue;

                    const distFromSource = Math.abs(currentX - potentialX) + Math.abs(currentY - potentialY);
                    if (distFromSource > moveRange) continue;

                    if (!this.coordinateManager.isTileOccupied(potentialX, potentialY, unit.id)) {
                        potentialDestinations.push({ x: potentialX, y: potentialY, dist: distFromSource });
                    }
                }
            }
        }

        if (potentialDestinations.length === 0) {
            if (GAME_DEBUG_MODE) console.log(`[MovingManager] Unit ${unit.name}: No available clear tile near target (${targetGridX},${targetGridY}) within move range ${moveRange}.`);
            return false;
        }

        potentialDestinations.sort((a, b) => a.dist - b.dist);
        const finalDest = potentialDestinations[0];

        if (finalDest.x === currentX && finalDest.y === currentY) {
            if (GAME_DEBUG_MODE) console.log(`[MovingManager] Unit ${unit.name}: Already at optimal position for charge.`);
            return false;
        }

        const movedSuccessfully = this.battleSimulationManager.moveUnit(unit.id, finalDest.x, finalDest.y);

        if (movedSuccessfully) {
            await this.animationManager.queueDashAnimation(unit.id, currentX, currentY, finalDest.x, finalDest.y);
            await this.delayEngine.waitFor(this.animationManager.getAnimationDuration(currentX, currentY, finalDest.x, finalDest.y) / 3);
            if (GAME_DEBUG_MODE) console.log(`[MovingManager] Unit ${unit.name} charged from (${currentX},${currentY}) to (${finalDest.x},${finalDest.y}).`);
            return true;
        } else {
            if (GAME_DEBUG_MODE) console.warn(`[MovingManager] Unit ${unit.name} failed to move to (${finalDest.x},${finalDest.y}) during charge.`);
            return false;
        }
    }
}

