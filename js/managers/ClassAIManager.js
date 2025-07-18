// js/managers/ClassAIManager.js

import { ATTACK_TYPES, GAME_DEBUG_MODE } from '../constants.js';

/**
 * \uC720\uB2C8\uD2B8\uC758 \ud0c0\uc785(\uc544\uad70/\uc801\uad70)\uc5d0 \ub530\ub77c \uc801\uc808\ud55c AI \uba54\ub2c8\uc800\ub97c \ud638\ucd9c\ud558\ub294 \ucd1d\uAD00 AI \uba54\ub2c8\uc800\uc785\uB2C8\uB2E4.
 */
export class ClassAIManager {
    constructor(heroAIManager, monsterAI, warriorSkillsAI) {
        console.log("\u2694\ufe0f ClassAIManager initialized. Ready to delegate commands.");
        this.heroAIManager = heroAIManager;
        this.monsterAI = monsterAI;
        this.warriorSkillsAI = warriorSkillsAI; // \uc2a4\ud0ac \uc2e4\ud589 \ub85c\uc9c1\uc740 \uc5c4\ucd0c\ud788 \ud544\uc694\ud569\ub2c8\ub2e4.
    }

    /**
     * \uC720\uB2C8\uD2B8\uc758 \ud0c0\uc785\uc5d0 \ub530\ub77c \ud589\ub3d9 \uACB0\uc815\uc744 \uc704\uc784\ud569\ub2c8\ub2e4.
     * @param {object} unit - \ud589\ub3d9\ud560 \uc720\ub2c8\ud2b8
     * @param {object[]} allUnits - \uc804\uc7c1\uc758 \ubaa8\ub4e0 \uc720\ub2c8\ud2b8 \ubc30\uc5f4
     * @returns {Promise<object|null>} \uACB0\uc815\ub41c \ud589\ub3d9 \uac1d\uccb4
     */
    async getBasicClassAction(unit, allUnits) {
        if (unit.type === ATTACK_TYPES.ENEMY) {
            // \uc801 \uc720\ub2c8\ud2b8\ub294 MonsterAI\ub97c \uc0ac\uc6a9\ud569\ub2c8\ub2e4.
            return this.monsterAI.getMeleeAIAction(unit, allUnits);
        } else {
            // \uc544\uAD70 \uc601\uC6C5 \uC720\uB2C8\uD2B8\ub294 \uc0c8\ub85c\uc6b4 HeroAIManager\ub97c \uc0ac\uc6a9\ud569\ub2c8\ub2e4.
            return this.heroAIManager.determineAction(unit, allUnits);
        }
    }

    /**
     * \uC2A4\ud0ac AI \uc2e4\ud589 \ud568\uc218\ub294 \uacc4\uc18d \uc720\uc9c0\ud569\ub2c8\ub2e4.
     * HeroAIManager\uc640 \uac19\uc740 \uACF3\uc5D0\uc11c \uc774 \ud568\uc218\ub97c \ud638\ucd9c\ud574 \uc2A4\ud0ac\uc744 \uc2e4\ud589\ud569\ub2c8\ub2e4.
     * @param {object} userUnit - \uc2A4\ud0ac \uc0ac\uc6A9\uc790
     * @param {object} skillData - \uc2A4\ud0ac \ub370\uc774\ud130
     * @param {object} targetUnit - \uc2A4\ud0ac \ub300\uc0c1
     */
    async executeSkillAI(userUnit, skillData, targetUnit) {
        const aiFunction = this.warriorSkillsAI[skillData.aiFunction];
        if (typeof aiFunction === 'function') {
            await aiFunction.call(this.warriorSkillsAI, userUnit, targetUnit, skillData);
        } else {
            if (GAME_DEBUG_MODE) console.warn(`[ClassAIManager] AI function '${skillData.aiFunction}' not found for skill '${skillData.name}'.`);
        }
    }
}
