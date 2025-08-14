import { itemInventoryManager } from './ItemInventoryManager.js';
import { equipmentManager } from './EquipmentManager.js';
import { partyEngine } from './PartyEngine.js';
import { mercenaryEngine } from './MercenaryEngine.js';
import { EQUIPMENT_SLOTS } from '../data/items.js';

/**
 * 용병의 MBTI 성향과 현재 상황을 고려하여 최적의 장비를 자동으로 장착하는 엔진
 */
class MercenaryEquipmentSelector {
    constructor() {
        this.name = 'MercenaryEquipmentSelector';
    }

    /**
     * 현재 파티의 모든 용병에게 최적의 장비를 찾아 장착시킵니다.
     */
    autoEquipForParty() {
        const partyMemberIds = partyEngine.getPartyMembers().filter(id => id !== undefined);
        let availableItems = itemInventoryManager.getInventory();

        // 1. 모든 용병의 장비를 해제하여 인벤토리 풀에 통합합니다.
        partyMemberIds.forEach(id => {
            const unit = mercenaryEngine.getMercenaryById(id);
            if (!unit) return;

            const equipped = equipmentManager.getEquippedItems(unit.uniqueId);
            equipped.forEach((instanceId, index) => {
                if (instanceId) {
                    const slotTypes = ['WEAPON', 'ARMOR', 'ACCESSORY1', 'ACCESSORY2'];
                    equipmentManager.unequipItem(unit.uniqueId, slotTypes[index]);
                }
            });
        });
        availableItems = itemInventoryManager.getInventory(); // 최신 인벤토리 다시 로드

        // 2. 각 용병별로 최적의 장비를 찾아 장착합니다.
        partyMemberIds.forEach(id => {
            const mercenary = mercenaryEngine.getMercenaryById(id);
            if (!mercenary) return;

            availableItems = this._selectAndEquipBestItemsForMerc(mercenary, availableItems);
        });
    }

    /**
     * 한 명의 용병을 위해 사용 가능한 아이템 중에서 최적의 장비를 선택하고 장착합니다.
     * @param {object} mercenary - 장비를 장착할 용병
     * @param {Array<object>} availableItems - 사용 가능한 아이템 목록
     * @returns {Array<object>} - 장착하고 남은 아이템 목록
     * @private
     */
    _selectAndEquipBestItemsForMerc(mercenary, availableItems) {
        let remainingItems = [...availableItems];
        const slotTypes = ['WEAPON', 'ARMOR', 'ACCESSORY1', 'ACCESSORY2'];

        slotTypes.forEach(slotType => {
            const baseSlotType = slotType.replace(/\d+$/, ''); // 'ACCESSORY1' -> 'ACCESSORY'
            const requiredItemType = EQUIPMENT_SLOTS[baseSlotType];

            const candidates = remainingItems.filter(item => item.type === requiredItemType);
            if (candidates.length === 0) return;

            // 모든 후보 아이템에 대해 점수를 매깁니다.
            const scoredCandidates = candidates.map(item => ({
                item,
                score: this._calculateItemScore(mercenary, item)
            }));

            // 가장 높은 점수를 받은 아이템을 찾습니다.
            scoredCandidates.sort((a, b) => b.score - a.score);
            const bestChoice = scoredCandidates[0];

            // 장착하고 인벤토리 풀에서 제거합니다.
            equipmentManager.equipItem(mercenary.uniqueId, slotType, bestChoice.item.instanceId);
            remainingItems = remainingItems.filter(item => item.instanceId !== bestChoice.item.instanceId);
        });

        return remainingItems;
    }

    /**
     * 용병의 MBTI 성향과 아키타입에 따라 아이템의 점수를 계산합니다.
     * @param {object} mercenary
     * @param {object} item
     * @returns {number}
     * @private
     */
    _calculateItemScore(mercenary, item) {
        let score = 100; // 기본 점수
        const mbti = mercenary.mbti;
        const stats = item.stats;

        // --- ▼ [핵심 수정] 아키타입 보너스 점수 계산 ▼ ---
        if (mercenary.archetype === 'Dreadnought') {
            let archetypeScore = 0;
            const dreadnoughtStats = ['threat', 'retaliationDamage', 'allyDamageReduction', 'damageReduction', 'valor'];
            dreadnoughtStats.forEach(stat => {
                if (stats[stat]) archetypeScore += 50;
            });

            if (item.mbtiEffects) {
                item.mbtiEffects.forEach(effect => {
                    if (effect.trait.includes('_DREADNOUGHT')) {
                        archetypeScore += 100;
                    }
                });
            }
            score += archetypeScore;
        } else if (mercenary.archetype === 'Frostweaver') {
            let archetypeScore = 0;
            const frostweaverStats = ['frostDamage', 'statusEffectApplication', 'aspirationDecayReduction'];
            frostweaverStats.forEach(stat => {
                if (stats[stat]) archetypeScore += 50;
            });

            if (item.mbtiEffects) {
                item.mbtiEffects.forEach(effect => {
                    if (effect.trait.includes('_FROSTWEAVER')) {
                        archetypeScore += 100;
                    }
                });
            }
            score += archetypeScore;
        } else if (mercenary.archetype === 'Aquilifer') {
            let archetypeScore = 0;
            const aquiliferStats = ['auraRadius', 'effectDuration'];
            aquiliferStats.forEach(stat => {
                if (stats[stat]) archetypeScore += 50;
            });

            if (item.mbtiEffects) {
                item.mbtiEffects.forEach(effect => {
                    if (effect.trait.includes('_AQUILIFER')) {
                        archetypeScore += 100;
                    }
                });
            }
            score += archetypeScore;
        }
        // --- ▲ [핵심 수정] 아키타입 보너스 점수 계산 ▲ ---

        // E vs I: 공격/지속력 vs 방어/효율
        if (stats.physicalAttack || stats.valor || stats.strength) score += (mbti.E / 100) * 20;
        if (stats.physicalDefense || stats.endurance || stats.tokenCostReduction) score += (mbti.I / 100) * 20;

        // S vs N: 확실성 vs 변수 창출
        if (stats.accuracy || stats.criticalChance) score += (mbti.S / 100) * 15;
        if (item.synergy || stats.statusEffectApplication) score += (mbti.N / 100) * 25; // 시너지를 더 높게 평가

        // T vs F: 자기 강화 vs 팀 기여(생존)
        if (stats.criticalDamageMultiplier || stats.lifeSteal) score += (mbti.T / 100) * 20;
        if (stats.hp || stats.healingGivenPercentage) score += (mbti.F / 100) * 15;

        // J vs P: 계획(세트 완성) vs 즉흥(특수 효과)
        if (item.mbtiEffects && item.mbtiEffects.length > 0) {
             score += (mbti.P / 100) * 30; // P는 특이한 MBTI 효과를 선호
        }

        return score;
    }
}

export const mercenaryEquipmentSelector = new MercenaryEquipmentSelector();
