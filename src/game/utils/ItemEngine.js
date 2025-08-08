import { equipmentManager } from './EquipmentManager.js';
import { synergySets } from '../data/items.js';
// 기존에는 아이템을 항상 새로 생성했지만, 실제 인벤토리 정보를 참조하도록 수정
import { itemInventoryManager } from './ItemInventoryManager.js';

/**
 * 장비로 인한 스탯 보너스를 계산하는 엔진
 */
class ItemEngine {
    getBonusStatsFromEquipment(unitData) {
        const bonusStats = {};
        const equippedItemIds = equipmentManager.getEquippedItems(unitData.uniqueId);
        // 캐시된 인스턴스나 인벤토리에서 실제 장착된 아이템 정보를 가져옵니다.
        const equippedItems = equippedItemIds.map(id => {
            if (!id) return null;
            return equipmentManager.itemInstanceCache.get(id) || itemInventoryManager.getItem(id);
        });

        // 1. 아이템 자체 스탯 합산
        equippedItems.forEach(item => {
            if (!item) return;
            // 아이템 스탯 합산
            for (const [stat, value] of Object.entries(item.stats)) {
                bonusStats[stat] = (bonusStats[stat] || 0) + value;
            }
            // 무게 합산 (StatEngine의 WeightEngine에서 활용)
            bonusStats.weight = (bonusStats.weight || 0) + (item.weight || 0);
        });

        // 3. 시너지 세트 효과 적용
        const synergyCounts = {};
        equippedItems.forEach(item => {
            if (item && item.synergy) {
                synergyCounts[item.synergy] = (synergyCounts[item.synergy] || 0) + 1;
            }
        });
        for (const [name, count] of Object.entries(synergyCounts)) {
            if (count >= 4) {
                const effect = synergySets[name].effect;
                if (effect.stat) {
                    bonusStats[effect.stat] = (bonusStats[effect.stat] || 0) + effect.value;
                }
            }
        }

        // 4. 보석 소켓 효과 (추후 구현 예정)

        return bonusStats;
    }
}

export const itemEngine = new ItemEngine();
