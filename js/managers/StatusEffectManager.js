// js/managers/StatusEffectManager.js
import { STATUS_EFFECTS } from '../../data/statusEffects.js';
// ✨ 상수 파일 임포트
import { GAME_EVENTS, ATTACK_TYPES } from '../constants.js';

export class StatusEffectManager {
    constructor(eventManager, idManager, turnCountManager, battleCalculationManager) {
        console.log("\u2728 StatusEffectManager initialized. Managing unit status effects. \u2728");
        this.eventManager = eventManager;
        this.idManager = idManager;
        this.turnCountManager = turnCountManager;
        this.battleCalculationManager = battleCalculationManager;
        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.UNIT_TURN_END, ({ unitId }) => { // ✨ 상수 사용
            const expired = this.turnCountManager.updateTurns(unitId);
            if (expired.length > 0) {
                console.log(`[StatusEffectManager] Unit ${unitId} had expired effects: ${expired.join(', ')}`);
            }
        });

        this.eventManager.subscribe(GAME_EVENTS.UNIT_TURN_START, ({ unitId }) => { // ✨ 상수 사용
            const active = this.turnCountManager.getEffectsOfUnit(unitId);
            if (active) {
                for (const [effectId, effect] of active.entries()) {
                    if (effect.effectData.effect.damagePerTurn) {
                        const damage = effect.effectData.effect.damagePerTurn;
                        console.log(`[StatusEffectManager] Unit ${unitId} takes ${damage} poison damage from ${effect.effectData.name}.`);
                        this.battleCalculationManager.requestDamageCalculation('statusEffectSource', unitId, {
                            type: ATTACK_TYPES.STATUS_EFFECT, // ✨ 상수 사용
                            damageAmount: damage,
                            isFixedDamage: true
                        });
                        this.eventManager.emit(GAME_EVENTS.DISPLAY_DAMAGE, { unitId, damage, color: 'purple' }); // ✨ 상수 사용
                    }
                }
            }
        });
        console.log("[StatusEffectManager] Subscribed to unit turn events.");
    }

    applyStatusEffect(unitId, statusEffectId) {
        const effectData = STATUS_EFFECTS[statusEffectId.toUpperCase()];
        if (effectData) {
            this.turnCountManager.addEffect(unitId, effectData);
            this.eventManager.emit(GAME_EVENTS.STATUS_EFFECT_APPLIED, { unitId, statusEffectId, effectData }); // ✨ 상수 사용
            console.log(`[StatusEffectManager] Applied status effect '${effectData.name}' to unit '${unitId}'.`);
        } else {
            console.warn(`[StatusEffectManager] Status effect with ID '${statusEffectId}' not found.`);
        }
    }

    removeStatusEffect(unitId, statusEffectId) {
        if (this.turnCountManager.removeEffect(unitId, statusEffectId)) {
            this.eventManager.emit(GAME_EVENTS.STATUS_EFFECT_REMOVED, { unitId, statusEffectId }); // ✨ 상수 사용
            console.log(`[StatusEffectManager] Removed status effect '${statusEffectId}' from unit '${unitId}'.`);
        }
    }

    getUnitActiveEffects(unitId) {
        return this.turnCountManager.getEffectsOfUnit(unitId);
    }
}
