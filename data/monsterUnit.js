// data/monsterUnit.js
import { UNIT_TYPES } from './unit.js';
import { MONSTER_CLASSES } from './monsterClass.js';

export const MONSTER_UNITS = {
    ZOMBIE_DEFAULT: {
        id: 'unit_zombie_default',
        name: '좀비',
        classId: MONSTER_CLASSES.ZOMBIE.id,
        type: UNIT_TYPES.ENEMY,
        spriteId: 'sprite_zombie_default'
        // baseStats pulled from class data
    }
};
