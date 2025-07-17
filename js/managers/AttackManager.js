import { GAME_EVENTS, GAME_DEBUG_MODE } from '../constants.js';

/**
 * 게임 내에서 발생하는 '일반 공격(평타)' 판정을 가진 모든 공격을 감지하고,
 * 관련 이벤트를 발생시키는 중앙 관리자입니다.
 */
export class AttackManager {
    /**
     * @param {EventManager} eventManager - 이벤트 시스템
     * @param {IdManager} idManager - 스킬 데이터 조회를 위한 ID 시스템
     */
    constructor(eventManager, idManager) {
        if (GAME_DEBUG_MODE) console.log("⚔️ AttackManager initialized. Detecting all basic attacks. ⚔️");
        this.eventManager = eventManager;
        this.idManager = idManager;

        this._setupEventListeners();
    }

    /**
     * 필요한 이벤트를 구독합니다.
     * @private
     */
    _setupEventListeners() {
        // 모든 공격 시도 이벤트를 감지합니다.
        this.eventManager.subscribe(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, this._handleAttackAttempt.bind(this));
        if (GAME_DEBUG_MODE) console.log("[AttackManager] Subscribed to UNIT_ATTACK_ATTEMPT event.");
    }

    /**
     * 공격 시도 이벤트를 받아 '평타'인지 판정합니다.
     * @param {object} data - 공격 이벤트 데이터 ({ attackerId, targetId, skillId })
     * @private
     */
    async _handleAttackAttempt(data) {
        const { attackerId, targetId, skillId } = data;
        let isBasicAttack = false;

        if (!skillId) {
            // skillId가 없으면 순수한 일반 공격으로 간주합니다.
            isBasicAttack = true;
            if (GAME_DEBUG_MODE) console.log(`[AttackManager] Detected a pure basic attack from ${attackerId}.`);
        } else {
            // skillId가 있다면, 해당 스킬이 '평타 판정' 태그를 가졌는지 확인합니다.
            const skillData = await this.idManager.get(skillId);
            if (skillData && skillData.effect && skillData.effect.tags && skillData.effect.tags.includes('일반공격')) {
                isBasicAttack = true;
                if (GAME_DEBUG_MODE) console.log(`[AttackManager] Detected skill-based basic attack '${skillData.name}' from ${attackerId}.`);
            }
        }

        // 평타로 판정될 경우, 새로운 이벤트를 발생시켜 다른 시스템에 알립니다.
        if (isBasicAttack) {
            this.eventManager.emit(GAME_EVENTS.BASIC_ATTACK_LANDED, {
                attackerId: attackerId,
                targetId: targetId,
                skillId: skillId || null // 어떤 스킬로 발동된 평타인지 정보 전달
            });
        }
    }
}
