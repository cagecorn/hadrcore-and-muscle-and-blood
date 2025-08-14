import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { formationEngine } from '../../game/utils/FormationEngine.js';
// --- ▼ [신규] 상태 효과 적용을 위한 모듈 import ▼ ---
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';
import { EFFECT_TYPES } from '../../game/utils/EffectTypes.js';
// --- ▲ [신규] 상태 효과 적용을 위한 모듈 import ▲ ---
import { trapManager } from '../../game/utils/TrapManager.js';
import { aiMemoryEngine } from '../../game/utils/AIMemoryEngine.js';

class MoveToTargetNode extends Node {
    constructor({ animationEngine, cameraControl, vfxManager }) { // vfxManager 추가
        super();
        this.animationEngine = animationEngine;
        this.cameraControl = cameraControl;
        this.vfxManager = vfxManager; // vfxManager 저장
        this.skillEffectProcessor = this.vfxManager?.battleSimulator?.skillEffectProcessor;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const path = blackboard.get('movementPath');
        const movementRange = unit.finalStats.movement || 3;

        // ✨ [버그 수정] 경로가 배열이 아닌 경우에 대한 방어 코드를 추가하여 안정성을 높입니다.
        if (!Array.isArray(path)) {
            debugAIManager.logNodeResult(NodeState.FAILURE, `경로가 유효하지 않습니다 (배열이 아님): ${JSON.stringify(path)}`);
            return NodeState.FAILURE;
        }

        if (path.length === 0) { // 이미 목표 위치에 도달함
            debugAIManager.logNodeResult(NodeState.SUCCESS, '이미 목표 위치에 있음');
            return NodeState.SUCCESS;
        }

        // 이동력만큼만 경로를 잘라냅니다.
        const movePath = path.slice(0, movementRange);
        if (movePath.length === 0) {
            return NodeState.SUCCESS;
        }

        // 현재 위치의 점유 상태를 해제합니다.
        const originalCell = formationEngine.grid.getCell(unit.gridX, unit.gridY);
        if (originalCell) {
            originalCell.isOccupied = false;
            originalCell.sprite = null;
        }

        // 경로를 따라 한 칸씩 이동합니다.
        for (const step of movePath) {
            const targetCell = formationEngine.grid.getCell(step.col, step.row);
            if (targetCell) {
                await this.animationEngine.moveTo(
                    unit.sprite,
                    targetCell.x,
                    targetCell.y,
                    200,
                    () => {
                        if (this.cameraControl && unit.sprite.active) {
                            this.cameraControl.panTo(unit.sprite.x, unit.sprite.y, 0);
                        }
                    }
                );
                unit.gridX = step.col;
                unit.gridY = step.row;

                const trap = trapManager.getTrapAt(step.col, step.row);
                if (trap && trap.owner.team !== unit.team) {
                    await trapManager.triggerTrap(unit, this.skillEffectProcessor);
                    aiMemoryEngine.updateTileMemory(unit.uniqueId, step.col, step.row, 1);
                    const cell = formationEngine.grid.getCell(step.col, step.row);
                    if (cell) {
                        cell.isOccupied = true;
                        cell.sprite = unit.sprite;
                    }
                    return NodeState.SUCCESS;
                }
            }
        }

        // 최종 위치의 점유 상태를 갱신합니다.
        const destination = movePath[movePath.length - 1];
        const finalCell = formationEngine.grid.getCell(destination.col, destination.row);
        if (finalCell) {
            finalCell.isOccupied = true;
            finalCell.sprite = unit.sprite;
        }

        // --- ▼ [핵심 추가] 저거너트 패시브 발동 로직 ▼ ---
        if (unit.classPassive?.id === 'juggernaut' && movePath.length > 0) {
            const defenseBonus = movePath.length * 0.03;
            const effects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
            let existingBuff = effects.find(e => e.id === 'juggernautBuff');

            if (existingBuff) {
                existingBuff.modifiers.forEach(mod => mod.value += defenseBonus);
                existingBuff.duration = 1;
            } else {
                const buffEffect = {
                    id: 'juggernautBuff',
                    type: EFFECT_TYPES.BUFF,
                    duration: 1,
                    modifiers: [
                        { stat: 'physicalDefense', type: 'percentage', value: defenseBonus },
                        { stat: 'magicDefense', type: 'percentage', value: defenseBonus }
                    ]
                };
                statusEffectManager.addEffect(unit, { name: '저거너트', effect: buffEffect }, unit);
            }
            this.vfxManager.showEffectName(unit.sprite, '저거너트!', '#22c55e');
        }
        // --- ▲ [핵심 추가] 저거너트 패시브 발동 로직 ▲ ---

        // 이동 완료 플래그 설정
        blackboard.set('hasMovedThisTurn', true);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default MoveToTargetNode;
