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
        this.heroInstances = new Map(); // key: heroId, value: { worker, state, ... }
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

        // 1. Web Worker를 생성하여 영웅의 '뇌(AI)'를 만듭니다.
        const heroAIWorker = new Worker('./js/workers/heroWorker.js');

        // 2. 영웅의 고유한 상태와 데이터를 IndexedDB에 저장합니다.
        const { illustration, ...serializableData } = heroData;
        await this.idManager.addOrUpdateId(heroData.id, serializableData);

        const instance = {
            id: heroData.id,
            name: heroData.name,
            worker: heroAIWorker,
            // Worker로 전달될 상태는 직렬화 가능한 데이터만 포함해야 합니다.
            // illustration과 같이 클론 불가능한 객체는 제외한 버전을 사용합니다.
            state: serializableData
        };

        this.heroInstances.set(heroData.id, instance);
        if (GAME_DEBUG_MODE) console.log(`[MicrocosmHeroEngine] Created microcosm for ${heroData.name} (${heroData.id}).`);
    }

    /**
     * 특정 영웅의 다음 행동을 결정하도록 AI Worker에 요청합니다.
     * TurnEngine에서 이 메서드를 호출하게 됩니다.
     * @param {string} heroId - 행동을 결정할 영웅의 ID
     * @param {object} battleState - 현재 전투 상황 데이터
     * @returns {Promise<object>} - 영웅이 결정한 행동
     */
    determineHeroAction(heroId, battleState) {
        return new Promise((resolve, reject) => {
            const instance = this.heroInstances.get(heroId);
            if (!instance) {
                if (GAME_DEBUG_MODE) console.warn(`[MicrocosmHeroEngine] No microcosm instance for hero ${heroId}.`);
                resolve(null);
                return;
            }

            instance.worker.postMessage({
                type: 'DETERMINE_ACTION',
                heroState: instance.state,
                battleState: battleState
            });

            instance.worker.onmessage = (event) => {
                if (event.data.type === 'ACTION_DECIDED') {
                    if (GAME_DEBUG_MODE) console.log(`[MicrocosmHeroEngine] ${instance.name} decided to:`, event.data.action);
                    resolve(event.data.action);
                }
            };

            instance.worker.onerror = (err) => {
                reject(err);
            };
        });
    }
}
