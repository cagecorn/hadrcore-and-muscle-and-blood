import { GAME_EVENTS } from '../constants.js'; // 이벤트 상수를 사용

export class SynergyEngine {
    /**
     * SynergyEngine을 초기화합니다.
     * @param {IdManager} idManager - 시너지 정의 데이터를 가져올 IdManager 인스턴스
     * @param {EventManager} eventManager - 시너지 활성화/비활성화 이벤트를 발행할 EventManager 인스턴스
     */
    constructor(idManager, eventManager) {
        console.log("\ud83d\udd17 SynergyEngine initialized. Ready to weave powerful team effects. \ud83d\udd17");
        this.idManager = idManager;
        this.eventManager = eventManager;
        this.synergyDefinitions = new Map(); // key: synergyId, value: synergyDefinition

        this._loadSynergyDefinitions(); // 초기 시너지 정의 로드
    }

    /**
     * 시너지 정의 데이터를 로드합니다.
     * 실제 게임에서는 데이터 파일에서 로드하게 될 것입니다.
     * @private
     */
    _loadSynergyDefinitions() {
        // 임시 시너지 정의 (나중에 data/synergies.js 등으로 분리)
        const tempSynergies = [
            {
                id: 'synergy_warrior',
                name: '전사',
                tiers: [
                    { count: 2, effect: { attackBonus: 10 } },
                    { count: 4, effect: { attackBonus: 25 } },
                    { count: 6, effect: { attackBonus: 50 } }
                ],
                description: '전사 영웅들의 강인함이 팀의 공격력을 증폭시킵니다.'
            },
            {
                id: 'synergy_mage',
                name: '마법사',
                tiers: [
                    { count: 2, effect: { magicPowerBonus: 15 } },
                    { count: 4, effect: { magicPowerBonus: 40 } }
                ],
                description: '마법사 영웅들이 모여 강력한 마법 에너지를 방출합니다.'
            },
            {
                id: 'synergy_healer',
                name: '치유사',
                tiers: [
                    { count: 1, effect: { hpRegenPerTurn: 5 } },
                    { count: 2, effect: { hpRegenPerTurn: 15 } }
                ],
                description: '치유사 영웅들이 아군을 보호하고 생명력을 회복시킵니다.'
            },
            {
                id: 'synergy_archer',
                name: '궁수',
                tiers: [
                    { count: 2, effect: { criticalChanceBonus: 0.10 } }
                ],
                description: '궁수 영웅들이 적의 약점을 노려 치명적인 일격을 가합니다.'
            }
        ];

        tempSynergies.forEach(synergy => this.registerSynergyDefinition(synergy.id, synergy));
        console.log(`[SynergyEngine] Loaded ${this.synergyDefinitions.size} synergy definitions.`);
    }

    /**
     * 새로운 시너지 정의를 등록합니다.
     * @param {string} synergyId - 시너지의 고유 ID
     * @param {object} definition - 시너지 정의 객체 (id, name, tiers, description 포함)
     */
    registerSynergyDefinition(synergyId, definition) {
        if (this.synergyDefinitions.has(synergyId)) {
            console.warn(`[SynergyEngine] Synergy '${synergyId}' already registered. Overwriting.`);
        }
        this.synergyDefinitions.set(synergyId, definition);
        console.log(`[SynergyEngine] Registered synergy: ${synergyId}`);
    }

    /**
     * 주어진 영웅들의 목록에서 활성화된 시너지를 계산합니다.
     * @param {object[]} heroesOnTeam - 현재 팀에 있는 영웅 객체들의 배열 (각 영웅은 .synergies 배열을 가져야 함)
     * @returns {{synergyId: string, tier: number, effect: object}[]} 활성화된 시너지와 그 효과의 배열
     */
    calculateActiveSynergies(heroesOnTeam) {
        const synergyCounts = new Map();

        for (const hero of heroesOnTeam) {
            // ✨ hero.synergies가 유효한 배열인지 확인
            if (hero.synergies && Array.isArray(hero.synergies)) {
                for (const synergyId of hero.synergies) {
                    synergyCounts.set(synergyId, (synergyCounts.get(synergyId) || 0) + 1);
                }
            } else {
                console.warn(`[SynergyEngine] Hero '${hero.id}' has invalid or missing 'synergies' property. Skipping.`);
            }
        }

        const activeSynergies = [];
        for (const [synergyId, count] of synergyCounts.entries()) {
            const definition = this.synergyDefinitions.get(synergyId);
            if (!definition) {
                console.warn(`[SynergyEngine] Unknown synergy ID encountered: ${synergyId}`);
                continue;
            }

            let activatedTier = null;
            const sortedTiers = [...definition.tiers].sort((a, b) => b.count - a.count);

            for (const tier of sortedTiers) {
                if (count >= tier.count) {
                    activatedTier = tier;
                    break;
                }
            }

            if (activatedTier) {
                activeSynergies.push({
                    synergyId: synergyId,
                    name: definition.name,
                    tier: activatedTier.count,
                    effect: activatedTier.effect,
                    description: definition.description
                });
            }
        }

        console.log(`[SynergyEngine] Calculated Active Synergies:`, activeSynergies.map(s => `${s.name} (${s.tier}\uBA85)`));
        return activeSynergies;
    }

    /**
     * 활성화된 시너지 정보를 이벤트로 발행하여 다른 매니저들이 효과를 적용하도록 합니다.
     * @param {{synergyId: string, tier: number, effect: object}[]} activeSynergies - 활성화된 시너지 배열
     */
    emitActiveSynergyEvents(activeSynergies) {
        if (activeSynergies.length === 0) {
            this.eventManager.emit(GAME_EVENTS.SYNERGY_DEACTIVATED, { reason: 'noSynergiesActive' });
            console.log("[SynergyEngine] No synergies active. Emitted SYNERGY_DEACTIVATED event.");
            return;
        }

        for (const synergy of activeSynergies) {
            this.eventManager.emit(GAME_EVENTS.SYNERGY_ACTIVATED, {
                synergyId: synergy.synergyId,
                name: synergy.name,
                tier: synergy.tier,
                effect: synergy.effect,
                description: synergy.description
            });
            console.log(`[SynergyEngine] Emitted SYNERGY_ACTIVATED event for ${synergy.name} (Tier ${synergy.tier}).`);
        }
    }
}
