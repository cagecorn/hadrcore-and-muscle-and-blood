
// ES 모듈 환경에서 Node의 `createRequire`를 사용할 필요가 없습니다.
// 브라우저에서도 동작하도록 직접 필요한 모듈을 import 합니다.
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';

export const summonData = {
    ancestorPeor: {
        name: '선조 페오르',
        className: '전사',
        battleSprite: 'ancestor-peor',
        uiImage: 'assets/images/summon/ancestor-peor.png',
        baseStats: {
            hp: 80, valor: 5, strength: 10, endurance: 8,
            agility: 6, intelligence: 3, wisdom: 3, luck: 5,
            movement: 3,
            attackRange: 1,
            weight: 12
        },
        onSpawn: (unit) => {
            const skillId = 'attack';
            const grade = 'NORMAL';
            const newInstance = skillInventoryManager.addSkillById(skillId, grade);
            ownedSkillsManager.equipSkill(unit.uniqueId, 3, newInstance.instanceId);
            skillInventoryManager.removeSkillFromInventoryList(newInstance.instanceId);
        }
    }
};

export const getSummonBase = (id) => summonData[id];
