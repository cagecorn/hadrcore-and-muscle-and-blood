import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const axeStrikeBase = {
    NORMAL: { id: 'axeStrike', type: 'ACTIVE', cost: 1, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, restoresBarrierPercent: 0.05 },
    RARE: { id: 'axeStrike', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, restoresBarrierPercent: 0.05 },
    EPIC: { id: 'axeStrike', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, restoresBarrierPercent: 0.07 },
    LEGENDARY: { id: 'axeStrike', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, restoresBarrierPercent: 0.10 }
};

const expectedDamage = [1.3, 1.2, 1.1, 1.0];
const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(axeStrikeBase[grade], grade);
    assert(skill.damageMultiplier && typeof skill.damageMultiplier === 'object');
    if (grade === 'NORMAL') {
        assert.strictEqual(skill.cost, 1);
    } else {
        assert.strictEqual(skill.cost, 0);
    }
    if (grade === 'NORMAL' || grade === 'RARE') {
        assert.strictEqual(skill.restoresBarrierPercent, 0.05);
    } else if (grade === 'EPIC') {
        assert.strictEqual(skill.restoresBarrierPercent, 0.07);
    } else {
        assert.strictEqual(skill.restoresBarrierPercent, 0.10);
    }
}

console.log('Flyingmen skills integration test passed.');
