// data/unit.js

// 이 모듈은 게임 내 모든 유닛의 기본 정보를 정의합니다.
// IdManager와 연동하여 고유 ID를 사용합니다.

export const UNIT_TYPES = {
    MERCENARY: 'mercenary',
    NEUTRAL: 'neutral',
    ENEMY: 'enemy'
};

export const UNITS = {
    // 전사 유닛 ID (IdManager에 등록될 예정)
    WARRIOR: {
        id: 'unit_warrior_001',
        name: '용맹한 전사',
        classId: 'class_warrior',
        type: UNIT_TYPES.MERCENARY,
        baseStats: {
            hp: 100,
            attack: 20,
            defense: 10,
            speed: 5,
            valor: 50,
            strength: 25,
            endurance: 20,
            agility: 10,
            intelligence: 5,
            wisdom: 10,
            luck: 15,
            weight: 30
        },
        spriteId: 'sprite_warrior_default',
        tags: ['용병', '남자'] // ✨ 유닛 자체의 태그
    }
    // 다른 유닛들이 여기에 추가됩니다.
    // ARCHER: { id: 'unit_archer_001', ... }
};
