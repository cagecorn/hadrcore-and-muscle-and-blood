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
        // 개별 영웅 생성 시 WarriorSkills 전체 목록에서 무작위로 부여됩니다.
        skills: [],
        moveRange: 3, // 전사의 이동 거리
        tags: ['근접', '방어', '용병_클래스'] // ✨ 태그 추가
    },
    // ✨ 전사 상위 클래스 추가
    WARRIOR_VALIANT: {
        id: 'class_warrior_valiant',
        name: '용맹 기사',
        role: CLASS_ROLES.TANK,
        description: '전사의 전투 경험을 극대화한 고급 병종으로, 방어와 리더십이 뛰어납니다.',
        // 상위 클래스 또한 스킬은 무작위로 결정됩니다.
        skills: [],
        moveRange: 3,
        tags: ['근접', '방어', '용병_클래스', '고급']
    },
    // 다른 클래스들이 여기에 추가됩니다.
    // MAGE: { id: 'class_mage', ... }
    // ARCHER: { id: 'class_archer', ... }
};
