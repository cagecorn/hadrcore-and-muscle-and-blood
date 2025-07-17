// data/monsterClass.js
import { CLASS_ROLES } from './class.js';

export const MONSTER_CLASSES = {
    SKELETON: {
        id: 'class_skeleton',
        name: '해골',
        role: CLASS_ROLES.MELEE_DPS,
        description: '다수로 몰려오는 기본적인 언데드 적.',
        skills: ['skill_melee_attack'],
        moveRange: 2,
        tags: ['근접', '언데드', '적_클래스'],
        baseStats: {
            hp: 60,
            attack: 10,
            defense: 4,
            speed: 25,
            valor: 0,
            strength: 8,
            endurance: 6,
            agility: 8,
            intelligence: 4,
            wisdom: 4,
            luck: 5,
            weight: 8,
            attackRange: 1
        }
    },
    ZOMBIE: {
        id: 'class_zombie',
        name: '좀비',
        role: CLASS_ROLES.MELEE_DPS,
        description: '느릿느릿 움직이는 언데드.',
        skills: ['skill_melee_attack'],
        moveRange: 2,
        tags: ['근접', '언데드', '적_클래스'],
        baseStats: {
            hp: 80,
            attack: 15,
            defense: 5,
            speed: 30,
            valor: 10,
            strength: 10,
            endurance: 8,
            agility: 12,
            intelligence: 5,
            wisdom: 5,
            luck: 15,
            weight: 10,
            attackRange: 1
        }
    }
};
