// js/managers/PassiveIconManager.js

import { GAME_DEBUG_MODE } from '../constants.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class PassiveIconManager {
    constructor(battleSimulationManager, idManager, skillIconManager) {
        if (GAME_DEBUG_MODE) console.log("\ud83d\udee1\ufe0f PassiveIconManager initialized. Displaying permanent skill icons. \ud83d\udee1\ufe0f");
        this.battleSimulationManager = battleSimulationManager;
        this.idManager = idManager;
        this.skillIconManager = skillIconManager;
        this.iconSizeRatio = 0.2;
        this.iconOffsetYRatio = 0.9;
    }

    async draw(ctx) {
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue;

            // ✨ 수정된 부분: classData를 조회하는 대신 unit의 skillSlots을 직접 확인
            if (unit.skillSlots && unit.skillSlots.includes(WARRIOR_SKILLS.IRON_WILL.id)) {
                const icon = this.skillIconManager.getSkillIcon(WARRIOR_SKILLS.IRON_WILL.id);
                if (icon) {
                    const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
                        unit.id,
                        unit.gridX,
                        unit.gridY,
                        effectiveTileSize,
                        gridOffsetX,
                        gridOffsetY
                    );

                    const baseIconSize = effectiveTileSize * this.iconSizeRatio;
                    const iconDrawX = drawX + effectiveTileSize - baseIconSize - 5;
                    const iconDrawY = drawY - (effectiveTileSize * this.iconOffsetYRatio);
                    ctx.drawImage(icon, iconDrawX, iconDrawY, baseIconSize, baseIconSize);
                }
            }
        }
    }
}
