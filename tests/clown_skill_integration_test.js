import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const bindTrickBase = {
    NORMAL: { id: 'bindTrick', type: 'DEBUFF', cost: 1, cooldown: 1, effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 1 } },
    RARE: { id: 'bindTrick', type: 'DEBUFF', cost: 1, cooldown: 1, effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 1 } },
    EPIC: { id: 'bindTrick', type: 'DEBUFF', cost: 0, cooldown: 1, effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 1 } },
    LEGENDARY: { id: 'bindTrick', type: 'DEBUFF', cost: 0, cooldown: 1, effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 2 } },
};

const pullingBase = {
    NORMAL: { id: 'pulling', type: 'ACTIVE', cost: 3, cooldown: 5, pull: true },
    RARE: { id: 'pulling', type: 'ACTIVE', cost: 3, cooldown: 5, pull: true, effect: { id: 'slow', duration: 1 } },
    EPIC: { id: 'pulling', type: 'ACTIVE', cost: 2, cooldown: 4, pull: true, effect: { id: 'slow', duration: 1 } },
    LEGENDARY: { id: 'pulling', type: 'ACTIVE', cost: 2, cooldown: 4, pull: true, effect: { id: 'bind', duration: 2 } },
};

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(bindTrickBase[grade], grade);
    if (grade === 'NORMAL' || grade === 'RARE') {
        assert.strictEqual(skill.cost, 1);
    } else {
        assert.strictEqual(skill.cost, 0);
    }
    if (grade === 'LEGENDARY') {
        assert.strictEqual(skill.effect.duration, 2);
    } else {
        assert.strictEqual(skill.effect.duration, 1);
    }
}

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(pullingBase[grade], grade);
    if (grade === 'NORMAL' || grade === 'RARE') {
        assert.strictEqual(skill.cost, 3);
        assert.strictEqual(skill.cooldown, 5);
    } else {
        assert.strictEqual(skill.cost, 2);
        assert.strictEqual(skill.cooldown, 4);
    }
    if (grade === 'RARE' || grade === 'EPIC') {
        assert.strictEqual(skill.effect.id, 'slow');
        assert.strictEqual(skill.effect.duration, 1);
    }
    if (grade === 'LEGENDARY') {
        assert.strictEqual(skill.effect.id, 'bind');
        assert.strictEqual(skill.effect.duration, 2);
    }
}

console.log('Clown skills integration test passed.');
