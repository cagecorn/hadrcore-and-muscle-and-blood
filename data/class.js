// data/class.js

// 이 모듈은 게임 내 모든 클래스의 기본 정보를 정의합니다.
// IdManager와 연동하여 고유 ID를 사용합니다.

import { WARRIOR_SKILLS } from './warriorSkills.js';

export const CLASS_ROLES = {
    MELEE_DPS: 'melee_dps',
    RANGED_DPS: 'ranged_dps',
    TANK: 'tank',
    HEALER: 'healer',
    MAGIC_DPS: 'magic_dps'
};

export const CLASSES = {
    WARRIOR: {
        id: 'class_warrior',
        name: '전사',
        role: CLASS_ROLES.MELEE_DPS,
        description: '강력한 근접 공격과 방어력을 겸비한 병종.',
        skills: [
            WARRIOR_SKILLS.CHARGE.id,
            WARRIOR_SKILLS.BATTLE_CRY.id,
            WARRIOR_SKILLS.IRON_WILL.id
        ],
        moveRange: 3, // 전사의 이동 거리
        tags: ['근접', '방어', '용병_클래스'] // ✨ 태그 추가
    },
    // ✨ 새롭게 추가된 해골 클래스
    SKELETON: {
        id: 'class_skeleton',
        name: '해골',
        role: CLASS_ROLES.MELEE_DPS,
        description: '다수로 몰려오는 기본적인 언데드 적.',
        skills: ['skill_melee_attack'],
        moveRange: 2, // 해골의 이동 거리(예시)
        tags: ['근접', '언데드', '적_클래스'], // ✨ 태그 추가
        // 기본 능력치. 몬스터 스폰 시 참조됩니다.
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
            weight: 8
        }
    },
    // ✨ 좀비 클래스 추가
    ZOMBIE: {
        id: 'class_zombie',
        name: '좀비',
        role: CLASS_ROLES.MELEE_DPS,
        description: '느릿느릿 움직이는 언데드.',
        skills: ['skill_melee_attack'],
        moveRange: 2,
        tags: ['근접', '언데드', '적_클래스'],
        // 기본 능력치 정의
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
            weight: 10
        }
    },
    // ✨ 전사 상위 클래스 추가
    WARRIOR_VALIANT: {
        id: 'class_warrior_valiant',
        name: '용맹 기사',
        role: CLASS_ROLES.TANK,
        description: '전사의 전투 경험을 극대화한 고급 병종으로, 방어와 리더십이 뛰어납니다.',
        skills: [
            WARRIOR_SKILLS.CHARGE.id,
            WARRIOR_SKILLS.BATTLE_CRY.id,
            WARRIOR_SKILLS.IRON_WILL.id
        ],
        moveRange: 3,
        tags: ['근접', '방어', '용병_클래스', '고급']
    },
    // 다른 클래스들이 여기에 추가됩니다.
    // MAGE: { id: 'class_mage', ... }
    // ARCHER: { id: 'class_archer', ... }
};
