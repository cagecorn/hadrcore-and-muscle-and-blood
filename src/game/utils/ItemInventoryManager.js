import { debugLogEngine } from './DebugLogEngine.js';
import { itemFactory } from './ItemFactory.js';

/**
 * 플레이어가 획득한 모든 아이템 인스턴스를 관리하는 엔진
 */
class ItemInventoryManager {
    constructor() {
        this.inventory = []; // { instanceId, baseId, grade, ... } 형태의 아이템 객체 배열
        debugLogEngine.log('ItemInventoryManager', '아이템 인벤토리 매니저가 초기화되었습니다.');
        this.initializeDefaultItems();
    }

    /**
     * 게임 시작 시 기본 테스트용 아이템을 지급합니다.
     */
    initializeDefaultItems() {
        // 등급별로 도끼와 판금 갑옷을 2개씩 생성하여 인벤토리에 추가
        const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
        grades.forEach(grade => {
            for (let i = 0; i < 2; i++) {
                this.addItem(itemFactory.createItem('axe', grade));
                this.addItem(itemFactory.createItem('plateArmor', grade));
            }
        });
        debugLogEngine.log('ItemInventoryManager', `초기 아이템 ${this.inventory.length}개 생성 완료.`);
    }

    /**
     * 인벤토리에 아이템을 추가합니다.
     * @param {object} itemInstance - 추가할 아이템 인스턴스
     */
    addItem(itemInstance) {
        if (itemInstance) {
            this.inventory.push(itemInstance);
        }
    }

    /**
     * 인스턴스 ID로 인벤토리에서 아이템을 찾아 제거합니다.
     * @param {number} instanceId - 제거할 아이템의 고유 ID
     * @returns {object|null} - 제거된 아이템 또는 null
     */
    removeItem(instanceId) {
        const index = this.inventory.findIndex(item => item.instanceId === instanceId);
        if (index !== -1) {
            return this.inventory.splice(index, 1)[0];
        }
        return null;
    }
    
    /**
     * 인스턴스 ID로 아이템 정보를 조회합니다.
     * @param {number} instanceId 
     * @returns {object|null}
     */
    getItem(instanceId) {
        return this.inventory.find(item => item.instanceId === instanceId);
    }

    /**
     * 현재 인벤토리의 모든 아이템을 반환합니다.
     * @returns {Array<object>}
     */
    getInventory() {
        return [...this.inventory];
    }
}

export const itemInventoryManager = new ItemInventoryManager();
