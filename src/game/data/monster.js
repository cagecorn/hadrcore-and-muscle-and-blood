import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';

export const monsterData = {
    zombie: {
        name: '좀비',
        // ✨ 클래스를 '전사(임시)'로 설정
        className: '전사(임시)',
        battleSprite: 'zombie',
        baseStats: { 
            hp: 50, valor: 0, strength: 5, endurance: 3, 
            agility: 1, intelligence: 0, wisdom: 0, luck: 0,
            weight: 15 // ✨ 좀비 무게 추가
        },
        // ✨ 좀비 생성 시 실행될 초기화 함수 수정
        onSpawn: (unit) => {
            // 좀비를 위한 고유 'attack' 스킬 인스턴스를 생성하고 장착합니다.
            // 이 방식은 플레이어의 인벤토리 수량에 영향을 주지 않습니다.
            const skillId = 'attack';
            const grade = 'NORMAL';

            // 1. 새 인스턴스를 생성하고 ID를 받습니다.
            const newInstance = skillInventoryManager.addSkillById(skillId, grade);

            // 2. 생성된 스킬을 좀비에게 장착합니다. (워리어와 일관성을 위해 4번 슬롯에)
            ownedSkillsManager.equipSkill(unit.uniqueId, 3, newInstance.instanceId);

            // 3. 이 스킬은 몬스터 전용이므로, 플레이어의 인벤토리 목록에서는 제거합니다.
            // (하지만 다른 시스템이 참조할 수 있도록 instanceMap에는 남겨둡니다.)
            skillInventoryManager.removeSkillFromInventoryList(newInstance.instanceId);
            // 4. 소환 스킬 전용 슬롯을 추가합니다.
            unit.skillSlots.push('SUMMON');
        }
    }
};

export const getMonsterBase = (id) => monsterData[id];
