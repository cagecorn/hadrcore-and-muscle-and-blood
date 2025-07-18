// js/managers/StackEngine.js

import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * \uAC8C\uC784 \uB0B4\uC5D0\uC11C 'stack'\uC744 \uC791\uC131\uD558\uACE0 \uAD00\uB9AC\uD558\uB294 \uC5D4\uC9C4\uC785\uB2C8\uB2E4.
 * \uC608: \uc911\ucc28\ub418\ub294 \ucd08\ub85d \ud6a8\uacfc, \uac15\ud654\ub418\ub294 \ubc84\ud504 \ub4f1.
 */
export class StackEngine {
    constructor(eventManager) {
        if (GAME_DEBUG_MODE) console.log("\ud83d\udcda StackEngine initialized. Ready to count up stacks. \ud83d\udcda");
        this.eventManager = eventManager;
        // { unitId: Map<effectId, currentStacks> }
        this.activeStacks = new Map();
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\ud2b8\uc758 \ud2b9\uc815 \ud6a8\uacfc\uc5d0 \uc2a4\ud0dd\uc744 \ucd94\uac00\ud569\ub2c8\ub2e4.
     * @param {string} unitId - \uc2a4\ud0dd\uc744 \ucd94\uac00\ud560 \uc720\ub2c8\ud2b8 ID
     * @param {object} effectData - \uc801\uc6a9\ud560 \ud6a8\uacfc\uc758 \uc804\uccb4 \ub370\uc774\ud130 (maxStacks \ud3ec\ud568)
     * @param {number} [amount=1] - \ucd94\uac00\ud560 \uc2a4\ud0dd \uc591
     * @returns {number} \uc801\uc6a9 \ud6c4 \ud604\uc7ac \uc2a4\ud0dd \uc218
     */
    addStack(unitId, effectData, amount = 1) {
        if (!this.activeStacks.has(unitId)) {
            this.activeStacks.set(unitId, new Map());
        }

        const unitStacks = this.activeStacks.get(unitId);
        const effectId = effectData.id;
        const maxStacks = effectData.maxStacks || Infinity;

        let currentStacks = unitStacks.get(effectId) || 0;
        currentStacks = Math.min(currentStacks + amount, maxStacks);

        unitStacks.set(effectId, currentStacks);

        if (GAME_DEBUG_MODE) console.log(`[StackEngine] Added ${amount} stack(s) of '${effectId}' to ${unitId}. Total stacks: ${currentStacks}`);

        // \uc2a4\ud0dd \ubcc0\uac1c \uc774\ubca4\ud2b8 \ubc1c\ud589
        this.eventManager.emit('stackCountChanged', {
            unitId,
            effectId,
            currentStacks
        });

        return currentStacks;
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\ud2b8\uc758 \ud2b9\uc815 \ud6a8\uacfc \uc2a4\ud0dd\uc744 \uc81c\uac70\ud569\ub2c8\ub2e4.
     * @param {string} unitId - \uc2a4\ud0dd\uc744 \uc81c\uac70\ud560 \uc720\ub2c8\ud2b8 ID
     * @param {string} effectId - \uc81c\uac70\ud560 \ud6a8\uacfc ID
     * @param {number} [amount=1] - \uc81c\uac70\ud560 \uc2a4\ud0dd \uc591
     * @returns {number} \uc801\uc6a9 \ud6c4 \ud604\uc7ac \uc2a4\ud0dd \uc218
     */
    removeStack(unitId, effectId, amount = 1) {
        const unitStacks = this.activeStacks.get(unitId);
        if (!unitStacks || !unitStacks.has(effectId)) {
            return 0;
        }

        let currentStacks = unitStacks.get(effectId);
        currentStacks -= amount;

        if (currentStacks <= 0) {
            unitStacks.delete(effectId);
            if (unitStacks.size === 0) {
                this.activeStacks.delete(unitId);
            }
            if (GAME_DEBUG_MODE) console.log(`[StackEngine] All stacks of '${effectId}' removed from ${unitId}.`);
            currentStacks = 0;
        } else {
            unitStacks.set(effectId, currentStacks);
            if (GAME_DEBUG_MODE) console.log(`[StackEngine] Removed ${amount} stack(s) of '${effectId}' from ${unitId}. Total stacks: ${currentStacks}`);
        }

        this.eventManager.emit('stackCountChanged', {
            unitId,
            effectId,
            currentStacks
        });

        return currentStacks;
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\ud2b8\uc758 \ud2b9\uc815 \ud6a8\uacfc\uc5d0 \ub300\ud55c \ud604\uc7ac \uc2a4\ud0dd \uc218\ub97c \uac00\uc838\uc628\ub2e4.
     * @param {string} unitId - \uc720\ub2c8\ud2b8 ID
     * @param {string} effectId - \ud6a8\uacfc ID
     * @returns {number} \ud604\uc7ac \uc2a4\ud0dd \uc218 (\uc5c6\uc73c\uba74 0)
     */
    getStackCount(unitId, effectId) {
        const unitStacks = this.activeStacks.get(unitId);
        if (!unitStacks) {
            return 0;
        }
        return unitStacks.get(effectId) || 0;
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\ud2b8\uc758 \ubaa8\ub4e0 \uc2a4\ud0dd \uc815\ubcf4\ub97c \uc81c\uac70\ud569\ub2c8\ub2e4. (\uc720\ub2c8\ud2b8 \uc0ac\ub9dd \ub610\ub294 \uc804\ud22c \uc885\ub8cc \uc2dc)
     * @param {string} unitId
     */
    clearStacksForUnit(unitId) {
        if (this.activeStacks.has(unitId)) {
            this.activeStacks.delete(unitId);
            if (GAME_DEBUG_MODE) console.log(`[StackEngine] Cleared all stacks for unit ${unitId}.`);
        }
    }
}
