// js/managers/UnitActionManager.js

import { GAME_EVENTS, GAME_DEBUG_MODE } from '../constants.js';
import { STATUS_EFFECTS } from '../../data/statusEffects.js';

export class UnitActionManager {
    /**
     * UnitActionManager를 초기화합니다.
     * @param {EventManager} eventManager - 게임 이벤트를 구독하기 위한 인스턴스
     * @param {UnitSpriteEngine} unitSpriteEngine - 스프라이트 변경을 요청할 엔진 인스턴스
     * @param {DelayEngine} delayEngine - 행동 후 기본 상태로 돌아오기 위한 지연 처리 인스턴스
     */
    constructor(eventManager, unitSpriteEngine, delayEngine, battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDD75\uFE0F UnitActionManager initialized. Detecting unit actions. \uD83D\uDD75\uFE0F");
        this.eventManager = eventManager;
        this.unitSpriteEngine = unitSpriteEngine;
        this.delayEngine = delayEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 상태 확인용

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // 유닛 공격 시도 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, this._onUnitAttack.bind(this));
        // 유닛 피해 표시 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, this._onUnitHitted.bind(this));
        // 유닛 사망 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, this._onUnitDeath.bind(this));
        // ✨ 상태이상 적용 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.STATUS_EFFECT_APPLIED, this._onStatusEffectApplied.bind(this));

        if (GAME_DEBUG_MODE) console.log("[UnitActionManager] Subscribed to unit action and status effect events.");
    }

    _onUnitAttack({ attackerId }) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === attackerId);
        if (!unit || unit.currentHp <= 0) return;

        if (GAME_DEBUG_MODE) console.log(`[UnitActionManager] Attack detected from ${attackerId}.`);
        this.unitSpriteEngine.setUnitSprite(attackerId, 'attack');

        // 공격 애니메이션 시간만큼 기다린 후 기본 상태로 복귀
        this.delayEngine.waitFor(800).then(() => {
            this.unitSpriteEngine.setUnitSprite(attackerId, 'idle');
            const currentUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === attackerId);
            // ✨ 유닛이 살아있을 때만 기본 상태로 복귀
            if (currentUnit && currentUnit.currentHp > 0) {
                this.unitSpriteEngine.setUnitSprite(attackerId, 'idle');
            }
        });
    }

    _onUnitHitted({ unitId, damage }) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!unit || unit.currentHp <= 0) return;

        if (damage > 0) {
            if (GAME_DEBUG_MODE) console.log(`[UnitActionManager] Unit ${unitId} was hitted.`);
            this.unitSpriteEngine.setUnitSprite(unitId, 'hitted');

            // 피격 애니메이션 시간만큼 기다린 후 기본 상태로 복귀
            this.delayEngine.waitFor(800).then(() => {
                this.unitSpriteEngine.setUnitSprite(unitId, 'idle');
                const currentUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
                 // ✨ 유닛이 살아있을 때만 기본 상태로 복귀
                if (currentUnit && currentUnit.currentHp > 0) {
                    this.unitSpriteEngine.setUnitSprite(unitId, 'idle');
                }
            });
        }
    }

    _onUnitDeath({ unitId }) {
        if (GAME_DEBUG_MODE) console.log(`[UnitActionManager] Death detected for ${unitId}.`);
        this.unitSpriteEngine.setUnitSprite(unitId, 'finish');
        // 죽은 후에는 기본 상태로 돌아가지 않습니다.
    }

    /**
     * 상태이상이 적용되었을 때 호출됩니다.
     * @param {{ unitId: string, statusEffectId: string }} data 
     */
    _onStatusEffectApplied({ unitId, statusEffectId }) {
        // ✨ '광폭화' 상태이상은 제외
        if (statusEffectId === STATUS_EFFECTS.BERSERK.id) {
            if (GAME_DEBUG_MODE) console.log(`[UnitActionManager] Berserk status applied to ${unitId}, skipping sprite change.`);
            return;
        }

        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!unit || unit.currentHp <= 0) return;

        if (GAME_DEBUG_MODE) console.log(`[UnitActionManager] Status effect ${statusEffectId} detected on ${unitId}.`);
        this.unitSpriteEngine.setUnitSprite(unitId, 'status'); // 'status' 상태 스프라이트로 변경

        // 상태이상 효과는 일정 시간 지속될 수 있으므로, 여기서는 1초 후 기본 상태로 되돌립니다.
        // 실제 게임에서는 상태이상이 끝나는 시점에 맞춰 복귀시키는 것이 더 좋습니다.
        this.delayEngine.waitFor(1000).then(() => {
            const currentUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
            if (currentUnit && currentUnit.currentHp > 0) {
                this.unitSpriteEngine.setUnitSprite(unitId, 'idle');
            }
        });
    }
}

