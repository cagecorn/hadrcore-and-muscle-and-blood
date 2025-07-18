// js/managers/PassiveIconManager.js

import { GAME_DEBUG_MODE } from '../constants.js';
import { WARRIOR_SKILLS } from './warriormanager.js';

export class PassiveIconManager {
    constructor(battleSimulationManager, idManager, skillIconManager, statusEffectManager) {
        if (GAME_DEBUG_MODE) console.log("\ud83d\udee1\ufe0f PassiveIconManager initialized. Displaying permanent skill icons. \ud83d\udee1\ufe0f");
        this.battleSimulationManager = battleSimulationManager;
        this.idManager = idManager;
        this.skillIconManager = skillIconManager;
        this.statusEffectManager = statusEffectManager;
        this.iconSizeRatio = 0.2;
        this.iconOffsetYRatio = 0.9;
    }

    async draw(ctx) {
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue;

            const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            const icons = [];

            if (unit.skillSlots && unit.skillSlots.includes(WARRIOR_SKILLS.IRON_WILL.id)) {
                const icon = this.skillIconManager.getSkillIcon(WARRIOR_SKILLS.IRON_WILL.id);
                if (icon) icons.push(icon);
            }

            if (this.statusEffectManager) {
                const effects = this.statusEffectManager.getUnitActiveEffects(unit.id);
                if (effects) {
                    for (const [effectId] of effects.entries()) {
                        const icon = this.skillIconManager.getSkillIcon(effectId);
                        if (icon && icon.width > 1) icons.push(icon);
                    }
                }
            }

            icons.forEach((icon, idx) => {
                const baseIconSize = effectiveTileSize * this.iconSizeRatio;
                const iconX = drawX + idx * (baseIconSize + 2);
                const iconY = drawY - baseIconSize * 0.5;
                ctx.drawImage(icon, iconX, iconY, baseIconSize, baseIconSize);
            });
        }
    }
}
