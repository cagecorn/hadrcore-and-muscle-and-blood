import { GAME_EVENTS, ATTACK_TYPES } from '../constants.js';

export class AttackCommand {
    constructor(attackerId, targetId) {
        this.attackerId = attackerId;
        this.targetId = targetId;
    }

    async execute({ battleCalculationManager, eventManager, delayEngine }) {
        console.log(`[Command] Executing Attack: ${this.attackerId} -> ${this.targetId}`);
        if (eventManager) {
            eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                attackerId: this.attackerId,
                targetId: this.targetId,
                attackType: ATTACK_TYPES.MELEE
            });
        }
        const attackSkillData = { type: ATTACK_TYPES.PHYSICAL, dice: { num: 1, sides: 6 } };
        battleCalculationManager.requestDamageCalculation(this.attackerId, this.targetId, attackSkillData);
        if (delayEngine) {
            await delayEngine.waitFor(500);
        }
    }
}
