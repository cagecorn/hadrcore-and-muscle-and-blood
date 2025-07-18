// js/managers/StatusEffectManager.js
import { STATUS_EFFECTS } from '../../data/statusEffects.js';
// ✨ 상수 파일 임포트
import { GAME_EVENTS, ATTACK_TYPES, GAME_DEBUG_MODE } from '../constants.js';

export class StatusEffectManager {
    // 생성자에 stackEngine 추가
    constructor(eventManager, idManager, turnCountManager, battleCalculationManager, stackEngine) {
        console.log("\u2728 StatusEffectManager initialized. Managing unit status effects. \u2728");
        this.eventManager = eventManager;
        this.idManager = idManager;
        this.turnCountManager = turnCountManager;
        this.battleCalculationManager = battleCalculationManager;
        this.stackEngine = stackEngine; // ✨ StackEngine 주입
        // timed status effects stored per unitId
        this.activeTimedEffects = {}; // { unitId: [{ effectId, duration, startTime }] }
        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.UNIT_TURN_END, ({ unitId }) => { // ✨ 상수 사용
            const expired = this.turnCountManager.updateTurns(unitId);
            if (expired.length > 0) {
                console.log(`[StatusEffectManager] Unit ${unitId} had expired effects: ${expired.join(', ')}`);
            }
        });

        // subscribe to time-based status effect application
        this.eventManager.subscribe(
            GAME_EVENTS.APPLY_STATUS_EFFECT,
            this.applyEffect.bind(this)
        );

        // \uC0AC\uB9DD \uC2DC \uBAA8\uB4E0 \uC0C1\uD604\uC544\uC2DC \uC81C\uAC70
        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, ({ unitId }) => {
            this.clearAllEffectsOfUnit(unitId);
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
        const effectData = Object.values(STATUS_EFFECTS).find(effect => effect.id === statusEffectId);
        if (effectData) {
            // ✨ 스택 가능 효과 처리 로직 추가
            if (effectData.stackable) {
                this.stackEngine.addStack(unitId, effectData);
                // 스택 가능 효과도 TurnCountManager에 등록하여 지속시간을 관리합니다.
                // 이미 효과가 있다면 지속시간만 초기화됩니다.
                this.turnCountManager.addEffect(unitId, effectData);
            } else {
                // 기존 로직 (스택 불가능한 효과)
                this.turnCountManager.addEffect(unitId, effectData);
            }
            this.eventManager.emit(GAME_EVENTS.STATUS_EFFECT_APPLIED, { unitId, statusEffectId, effectData });
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

    // ------------------------------------------------------------------
    // Timed effect management (millisecond-based duration)
    // ------------------------------------------------------------------
    applyEffect({ targetId, effectId, duration }) {
        if (!targetId || !effectId || !duration) return;
        if (!this.activeTimedEffects[targetId]) {
            this.activeTimedEffects[targetId] = [];
        }
        this.activeTimedEffects[targetId].push({ effectId, duration, startTime: performance.now() });
        if (GAME_DEBUG_MODE) console.log(`[StatusEffectManager] Applied effect '${effectId}' to unit ${targetId} for ${duration}ms.`);
    }

    getUnitActiveTimedEffects(unitId) {
        return this.activeTimedEffects[unitId] || [];
    }

    hasStatusEffect(unitId, effectId) {
        const turnEffects = this.turnCountManager.getEffectsOfUnit(unitId);
        const hasTurn = turnEffects ? turnEffects.has(effectId) : false;
        const timed = this.getUnitActiveTimedEffects(unitId).some(e => e.effectId === effectId);
        return hasTurn || timed;
    }

    update(deltaTime) {
        const now = performance.now();
        for (const unitId in this.activeTimedEffects) {
            const arr = this.activeTimedEffects[unitId];
            let i = arr.length;
            while (i--) {
                const effect = arr[i];
                if (now - effect.startTime > effect.duration) {
                    if (GAME_DEBUG_MODE) console.log(`[StatusEffectManager] Effect '${effect.effectId}' expired on unit ${unitId}.`);
                    arr.splice(i, 1);
                }
            }
            if (arr.length === 0) {
                delete this.activeTimedEffects[unitId];
            }
        }
    }

    /**
     * 특정 유닛의 모든 상태 이상을 즉시 제거합니다.
     * @param {string} unitId
     */
    clearAllEffectsOfUnit(unitId) {
        this.turnCountManager.clearEffectsOfUnit(unitId);
        delete this.activeTimedEffects[unitId];
        if (GAME_DEBUG_MODE) console.log(`[StatusEffectManager] Cleared all status effects from unit ${unitId}.`);
    }
}
