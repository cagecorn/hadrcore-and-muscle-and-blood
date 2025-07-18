import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * \uC544\uAD70 \uC601\uC6C5 \uC720\uB2C8\uD2B8\uC758 \uD589\uB3D9 \uACB0\uC815\uC744 \uC804\uB2EC\uD558\uB294 AI \uBAA8\uB2C8\uC815\uC785\uB2C8\uB2E4.
 */
export class HeroAIManager {
    constructor(slotMachineManager, basicAIManager, targetingManager, classAIManager) {
        if (GAME_DEBUG_MODE) console.log("\ud83e\udd35 HeroAIManager initialized. Ready to lead heroes.");
        this.slotMachineManager = slotMachineManager;
        this.basicAIManager = basicAIManager;
        this.targetingManager = targetingManager;
        // executeSkillAI \ud568\uc218\ub97c \uc0ac\uc6a9\ud558\uae30 \uc704\ud574 ClassAIManager \ucc38\uc870\ub97c \uc800\uc7a5\ud569\ub2c8\ub2e4.
        this.classAIManager = classAIManager;
    }

    /**
     * \uc601\uc6c5\uc758 \ub2e4\uc74c \ud589\ub3d9\uc744 \uacb0\uc815\ud569\ub2c8\ub2e4.
     * 1. \uc2ac\ub86f \uba38\uc2e0\uc744 \ub3cc\ub824 \uc2a4\ud0ac \uc0ac\uc6a9\uc744 \uc2dc\ub3c4\ud569\ub2c8\ub2e4.
     * 2. \uc2a4\ud0ac\uc774 \uacb0\uc815\ub418\uc9c0 \uc54a\uc73c\uba74, \uae30\ubcf8 AI\ub97c \ud1b5\ud574 \uc774\ub3d9 \ubc0f \uacf5\uaca9\uc744 \uacb0\uc815\ud569\ub2c8\ub2e4.
     * @param {object} unit - \ud589\ub3d9\ud560 \uc601\uc6c5 \uc720\ub2c8\ud2b8
     * @param {object[]} allUnits - \uc804\uc7c1\uc758 \ubaa8\ub4e0 \uc720\ub2c8\ud2b8 \ubc30\uc5f4
     * @returns {Promise<object|null>} \uacb0\uc815\ub41c \ud589\ub3d9 \uac1d\uccb4 \ub610\ub294 null
     */
    async determineAction(unit, allUnits) {
        // 1. \uc2ac\ub86f \uba38\uc2e0\uc744 \ub3cc\ub824 \uc2a4\ud0ac\uc744 \uacb0\uc815\ud569\ub2c8\ub2e4.
        const skillToUse = await this.slotMachineManager.spin(unit);

        if (skillToUse) {
            let targetUnit = null;
            // \ubc84\ud504 \uc2a4\ud0ac\uc774\ub098 \uc0ac\uac70\ub9ac\uac00 0\uc778 \uc2a4\ud0ac\uc740 \uc790\uc2e0\uc744 \ub300\uc0c1\uc73c\ub85c \ud569\ub2c8\ub2e4.
            if (skillToUse.type === 'buff' || skillToUse.range === 0) {
                targetUnit = unit;
            } else {
                // \uadf8 \uc678\uc5d0\ub294 \uac00\uc7a5 \uac70\ub9ac\uac00 \uac00\uae4c\uc6b4 \uc801\uc744 \ub300\uc0c1\uc73c\ub85c \ud569\ub2c8\ub2e4.
                targetUnit = this.targetingManager.findBestTarget('enemy', 'closest', unit);
            }

            if (targetUnit) {
                return {
                    actionType: 'skill',
                    skillId: skillToUse.id,
                    targetId: targetUnit.id,
                    // \u2728 \ud574\uc0c1: \uC2A4\ud0AC\uc744 \uc2e4\ud589\ud560 \uc218 \uc788\ub294 execute \ud568\uc218\ub97c \ud3ec\ud568\uc2dc\ud569\ub2c8\ub2e4.
                    execute: () => this.classAIManager.executeSkillAI(unit, skillToUse, targetUnit)
                };
            }
        }

        // 2. \uc2a4\ud0ac\uc744 \uc0ac\uc6a9\ud558\uc9c0 \uc54a\uc73c\uba74 \uae30\ubcf8 AI(\uc774\ub3d9 \ubc0f \uacf5\uaca9)\ub97c \uc2e4\ud589\ud569\ub2c8\ub2e4.
        if (GAME_DEBUG_MODE) console.log(`[HeroAIManager] No skill chosen for ${unit.name}, proceeding with basic AI.`);
        const moveRange = unit.baseStats.moveRange || 1;
        const attackRange = unit.baseStats.attackRange || 1;
        return this.basicAIManager.determineMoveAndTarget(unit, allUnits, moveRange, attackRange);
    }
}
