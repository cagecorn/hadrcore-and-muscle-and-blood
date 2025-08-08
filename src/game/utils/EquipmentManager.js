import { debugLogEngine } from './DebugLogEngine.js';
import { itemInventoryManager } from './ItemInventoryManager.js';
import { EQUIPMENT_SLOTS } from '../data/items.js';
import { debugEquipmentManager } from '../debug/DebugEquipmentManager.js';
import { mercenaryEngine } from './MercenaryEngine.js';

class EquipmentManager {
    constructor() {
        this.name = 'EquipmentManager';
        this.equippedItems = new Map();
        this.itemInstanceCache = new Map();
        debugLogEngine.register(this);
        debugLogEngine.log(this.name, '장비 관리 매니저가 초기화되었습니다.');
    }

    initializeSlots(unitId) {
        if (!this.equippedItems.has(unitId)) {
            this.equippedItems.set(unitId, {
                WEAPON: null,
                ARMOR: null,
                ACCESSORY1: null,
                ACCESSORY2: null
            });
        }
    }

    equipItem(unitId, slotType, instanceId) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);

        const itemToEquip = itemInventoryManager.getItem(instanceId);
        if (!itemToEquip) return;

        const baseSlotType = slotType.replace(/\d+$/, '');
        const requiredItemType = EQUIPMENT_SLOTS[baseSlotType];

        if (itemToEquip.type !== requiredItemType) {
            alert(`[${itemToEquip.type}] 아이템은 [${requiredItemType}] 슬롯에 장착할 수 없습니다.`);
            return;
        }

        itemInventoryManager.removeItem(instanceId);
        this.itemInstanceCache.set(instanceId, itemToEquip);

        const prevItemInstanceId = slots[slotType];
        if (prevItemInstanceId) {
            const prevItem = this.itemInstanceCache.get(prevItemInstanceId);
            if (prevItem) {
                itemInventoryManager.addItem(prevItem);
                this.itemInstanceCache.delete(prevItemInstanceId);
            }
        }

        slots[slotType] = instanceId;
        debugLogEngine.log(this.name, `유닛 ${unitId}의 ${slotType} 슬롯에 아이템 ${instanceId} 장착.`);

        // 스탯 변경 로그 출력
        const unit = mercenaryEngine.getMercenaryById(unitId);
        debugEquipmentManager.logStatChange(unit, `아이템 '${itemToEquip.name}' 장착`);
    }

    swapItems(unitId, sourceSlotType, targetSlotType) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        const sourceId = slots[sourceSlotType];
        const targetId = slots[targetSlotType];
        if (!sourceId) return;

        const sourceItem = this.itemInstanceCache.get(sourceId);
        if (!sourceItem) return;
        const targetBase = targetSlotType.replace(/\d+$/, '');
        const requiredForTarget = EQUIPMENT_SLOTS[targetBase];
        if (sourceItem.type !== requiredForTarget) {
            alert(`[${sourceItem.type}] 아이템은 [${requiredForTarget}] 슬롯에 장착할 수 없습니다.`);
            return;
        }

        if (targetId) {
            const targetItem = this.itemInstanceCache.get(targetId);
            const sourceBase = sourceSlotType.replace(/\d+$/, '');
            const requiredForSource = EQUIPMENT_SLOTS[sourceBase];
            if (targetItem && targetItem.type !== requiredForSource) {
                alert(`[${targetItem.type}] 아이템은 [${requiredForSource}] 슬롯에 장착할 수 없습니다.`);
                return;
            }
        }

        slots[sourceSlotType] = targetId;
        slots[targetSlotType] = sourceId;
        debugLogEngine.log(this.name, `유닛 ${unitId}의 ${sourceSlotType}와 ${targetSlotType} 슬롯 아이템을 교체.`);

        // 스탯 변경 로그 출력
        const unit = mercenaryEngine.getMercenaryById(unitId);
        debugEquipmentManager.logStatChange(unit, '아이템 교체');
    }

    unequipItem(unitId, slotType) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        const itemInstanceId = slots[slotType];

        if (itemInstanceId) {
            const item = this.itemInstanceCache.get(itemInstanceId);
            if (item) {
                itemInventoryManager.addItem(item);
                this.itemInstanceCache.delete(itemInstanceId);
            }
            slots[slotType] = null;
            debugLogEngine.log(this.name, `유닛 ${unitId}의 ${slotType} 슬롯에서 아이템 ${itemInstanceId} 해제.`);

            // 스탯 변경 로그 출력
            const unit = mercenaryEngine.getMercenaryById(unitId);
            debugEquipmentManager.logStatChange(unit, `아이템 '${item.name}' 해제`);
        }
    }

    getEquippedItems(unitId) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        return [slots.WEAPON, slots.ARMOR, slots.ACCESSORY1, slots.ACCESSORY2];
    }
}

export const equipmentManager = new EquipmentManager();
