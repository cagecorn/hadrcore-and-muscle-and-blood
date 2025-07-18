// js/managers/MicrocosmHeroEngine.js

import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 각 영웅을 고유한 인스턴스(미시세계)로 관리하고,
 * 독립적인 AI 로직과 데이터 저장을 총괄하는 엔진입니다.
 */
export class MicrocosmHeroEngine {
    constructor(idManager) {
        if (GAME_DEBUG_MODE) console.log("\ud83c\udf20 MicrocosmHeroEngine initialized. Every hero is a universe. \ud83c\udf20");
        this.idManager = idManager; // IndexedDB 및 Cache API 접근
        this.heroInstances = new Map(); // key: heroId, value: { state, ... }
    }

    hasHeroMicrocosm(heroId) {
        return this.heroInstances.has(heroId);
    }

    /**
     * 새로운 영웅의 '미시세계'를 생성하고 초기화합니다.
     * HeroEngine에서 영웅 생성 시 호출됩니다.
     * @param {object} heroData - 생성된 영웅의 기본 데이터
     * @returns {Promise<void>}
     */
    async createHeroMicrocosm(heroData) {
        if (this.heroInstances.has(heroData.id)) {
            if (GAME_DEBUG_MODE) console.warn(`[MicrocosmHeroEngine] Microcosm for ${heroData.name} already exists.`);
            return;
        }

        // 1. 영웅의 고유한 상태와 데이터를 IndexedDB에 저장합니다.
        const { illustration, ...serializableData } = heroData;
        await this.idManager.addOrUpdateId(heroData.id, serializableData);

        const instance = {
            id: heroData.id,
            name: heroData.name,
            // Web Worker를 사용하지 않으므로 worker 프로퍼티는 제거되었습니다.
            state: serializableData
        };

        this.heroInstances.set(heroData.id, instance);
        if (GAME_DEBUG_MODE) console.log(`[MicrocosmHeroEngine] Created microcosm for ${heroData.name} (${heroData.id}). Web worker linkage removed.`);
    }

    /**
     * 특정 영웅의 다음 행동을 결정합니다.
     * TurnEngine에서 이 메서드를 호출하게 됩니다.
     * @param {string} heroId - 행동을 결정할 영웅의 ID
     * @param {object} battleState - 현재 전투 상황 데이터
     * @returns {Promise<object | null>} - 영웅이 결정한 행동
     */
    determineHeroAction(heroId, battleState) {
        // 웹 워커를 사용하지 않으므로, 이 함수는 현재 아무 행동도 결정하지 않습니다.
        // 향후 로컬 AI 로직이 추가될 수 있습니다.
        const instance = this.heroInstances.get(heroId);
        if (!instance) {
            if (GAME_DEBUG_MODE) console.warn(`[MicrocosmHeroEngine] No microcosm instance for hero ${heroId}.`);
        }
        return Promise.resolve(null);
    }
}
