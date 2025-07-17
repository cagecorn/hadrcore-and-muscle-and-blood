// js/managers/StatusIconManager.js

import { GAME_DEBUG_MODE } from '../constants.js';
import { STATUS_EFFECT_TYPES } from '../../data/statusEffects.js';

export class StatusIconManager {
    /**
     * StatusIconManager를 초기화합니다.
     * @param {SkillIconManager} skillIconManager
     * @param {BattleSimulationManager} battleSimulationManager
     * @param {BindingManager} bindingManager
     * @param {MeasureManager} measureManager
     * @param {TurnCountManager} turnCountManager
     */
    constructor(skillIconManager, battleSimulationManager, bindingManager, measureManager, turnCountManager) {
        if (GAME_DEBUG_MODE) console.log("\u2728 StatusIconManager initialized. Displaying status effects visually. \u2728");
        if (!skillIconManager || !battleSimulationManager || !bindingManager || !measureManager || !turnCountManager) {
            throw new Error("[StatusIconManager] Missing one or more essential dependencies. Cannot initialize.");
        }

        this.skillIconManager = skillIconManager;
        this.battleSimulationManager = battleSimulationManager;
        this.bindingManager = bindingManager;
        this.measureManager = measureManager;
        this.turnCountManager = turnCountManager;

        this.iconSizeRatio = 0.2;
        this.iconOffsetYRatio = 0.6;
        this.iconSpacing = 5;
    }

    /**
     * 모든 활성 상태 효과 아이콘을 캔버스에 그립니다.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const { effectiveTileSize } = this.battleSimulationManager.getGridRenderParameters();

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue;

            const activeEffects = this.turnCountManager.getEffectsOfUnit(unit.id);
            if (!activeEffects || activeEffects.size === 0) continue;

            const bindings = this.bindingManager.getBindings(unit.id);
            if (!bindings) continue;
            const { renderX: drawX, renderY: drawY } = bindings;

            const baseIconSize = effectiveTileSize * this.iconSizeRatio;
            let currentIconDrawX = drawX + (effectiveTileSize - (activeEffects.size * baseIconSize + (activeEffects.size - 1) * this.iconSpacing)) / 2;
            const iconDrawY = drawY - (effectiveTileSize * this.iconOffsetYRatio);

            for (const [effectId, effectDataWrapper] of activeEffects.entries()) {
                const icon = this.skillIconManager.getSkillIcon(effectId);
                if (icon) {
                    ctx.save();
                    if (effectDataWrapper.effectData.type === STATUS_EFFECT_TYPES.DEBUFF) {
                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(currentIconDrawX, iconDrawY, baseIconSize, baseIconSize);
                    } else if (effectDataWrapper.effectData.type === STATUS_EFFECT_TYPES.BUFF) {
                        ctx.strokeStyle = 'green';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(currentIconDrawX, iconDrawY, baseIconSize, baseIconSize);
                    }
                    ctx.drawImage(icon, currentIconDrawX, iconDrawY, baseIconSize, baseIconSize);
                    ctx.restore();

                    if (effectDataWrapper.turnsRemaining !== -1) {
                        ctx.save();
                        ctx.fillStyle = 'white';
                        ctx.font = `${baseIconSize * 0.5}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.strokeStyle = 'black';
                        ctx.lineWidth = 2;
                        const textX = currentIconDrawX + baseIconSize / 2;
                        const textY = iconDrawY + baseIconSize;
                        ctx.strokeText(effectDataWrapper.turnsRemaining.toString(), textX, textY);
                        ctx.fillText(effectDataWrapper.turnsRemaining.toString(), textX, textY);
                        ctx.restore();
                    }

                    currentIconDrawX += baseIconSize + this.iconSpacing;
                }
            }
        }
    }
}
