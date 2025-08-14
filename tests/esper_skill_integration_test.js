import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const confusionBase = {
    NORMAL: {
        id: 'confusion',
        cost: 3,
        cooldown: 3,
        range: 3,
        effect: { id: 'confusion', duration: 2 }
    },
    RARE: {
        id: 'confusion',
        cost: 2,
        cooldown: 3,
        range: 3,
        effect: { id: 'confusion', duration: 2 }
    },
    EPIC: {
        id: 'confusion',
        cost: 2,
        cooldown: 2,
        range: 4,
        effect: { id: 'confusion', duration: 2 }
    },
    LEGENDARY: {
        id: 'confusion',
        cost: 2,
        cooldown: 2,
        range: 4,
        effect: {
            id: 'confusion',
            duration: 2,
            modifiers: { stat: 'physicalAttack', type: 'percentage', value: -0.15 }
        }
    }
};

const fireballBase = {
    NORMAL: { id: 'fireball', cost: 3, cooldown: 3, range: 4, effect: { id: 'burn', duration: 2 } },
    RARE: { id: 'fireball', cost: 3, cooldown: 2, range: 4, effect: { id: 'burn', duration: 2 } },
    EPIC: { id: 'fireball', cost: 3, cooldown: 2, range: 5, effect: { id: 'burn', duration: 3 } },
    LEGENDARY: {
        id: 'fireball',
        cost: 3,
        cooldown: 2,
        range: 5,
        effect: { id: 'burn', duration: 3 },
        centerTargetEffect: { id: 'stun', duration: 1 }
    }
};

const iceballBase = {
    NORMAL: { id: 'iceball', cost: 3, cooldown: 3, range: 4, effect: { id: 'frost', duration: 2 } },
    RARE: { id: 'iceball', cost: 3, cooldown: 2, range: 4, effect: { id: 'frost', duration: 2 } },
    EPIC: { id: 'iceball', cost: 3, cooldown: 2, range: 5, effect: { id: 'frost', duration: 3 } },
    LEGENDARY: {
        id: 'iceball',
        cost: 3,
        cooldown: 2,
        range: 5,
        effect: { id: 'frost', duration: 3 },
        centerTargetEffect: { id: 'bind', duration: 1 }
    }
};

// 신규 4대 원소 스킬 (NORMAL 등급만 존재)
const elementalBases = [
    { id: 'lightningStrike', cost: 3, cooldown: 3, range: 4, effect: { id: 'shock', duration: 2 } },
    { id: 'stoneBlast', cost: 3, cooldown: 3, range: 4, effect: { id: 'weaken', duration: 2 } },
    { id: 'holyLight', cost: 3, cooldown: 3, range: 4, effect: { id: 'vulnerable', duration: 2 } },
    { id: 'shadowBolt', cost: 3, cooldown: 3, range: 4, effect: { id: 'drain', duration: 2 } }
];

// 신규 프로스트위버 스킬 (NORMAL 등급만 존재)
const frostweaverBases = [
    {
        id: 'iceBolt',
        cost: 1,
        cooldown: 0,
        range: 3,
        effect: { id: 'slow', duration: 1, chance: 0.2 },
    },
    {
        id: 'frostNova',
        cost: 3,
        cooldown: 4,
        range: 3,
        aoe: { shape: 'SQUARE', radius: 1 },
        effect: { id: 'bind', duration: 1 },
    },
    {
        id: 'blizzard',
        cost: 0,
        cooldown: 5,
        range: 4,
        resourceCost: { type: 'WATER', amount: 3 },
        effect: { id: 'blizzardSlow', duration: 2 },
    },
];

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(confusionBase[grade], grade);
    const expected = confusionBase[grade];

    assert.strictEqual(skill.cost, expected.cost, `Confusion cost failed for ${grade}`);
    assert.strictEqual(skill.cooldown, expected.cooldown, `Confusion cooldown failed for ${grade}`);
    assert.strictEqual(skill.range, expected.range, `Confusion range failed for ${grade}`);
    assert.strictEqual(skill.effect.duration, expected.effect.duration, `Confusion duration failed for ${grade}`);

    if (grade === 'LEGENDARY') {
        const mod = skill.effect.modifiers;
        assert(mod && mod.stat === 'physicalAttack' && Math.abs(mod.value + 0.15) < 1e-6, 'Legendary attack reduction missing');
    }
}

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(fireballBase[grade], grade);
    const expected = fireballBase[grade];
    assert.strictEqual(skill.cost, expected.cost, `Fireball cost failed for ${grade}`);
    assert.strictEqual(skill.cooldown, expected.cooldown, `Fireball cooldown failed for ${grade}`);
    assert.strictEqual(skill.range, expected.range, `Fireball range failed for ${grade}`);
    assert.strictEqual(skill.effect.id, 'burn', 'Fireball effect id mismatch');
    assert.strictEqual(skill.effect.duration, expected.effect.duration, `Fireball duration failed for ${grade}`);
    if (grade === 'LEGENDARY') {
        assert(skill.centerTargetEffect && skill.centerTargetEffect.id === 'stun', 'Legendary center stun missing');
    } else {
        assert(!skill.centerTargetEffect, 'Center effect should only exist in Legendary');
    }
}

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(iceballBase[grade], grade);
    const expected = iceballBase[grade];
    assert.strictEqual(skill.cost, expected.cost, `Iceball cost failed for ${grade}`);
    assert.strictEqual(skill.cooldown, expected.cooldown, `Iceball cooldown failed for ${grade}`);
    assert.strictEqual(skill.range, expected.range, `Iceball range failed for ${grade}`);
    assert.strictEqual(skill.effect.id, 'frost', 'Iceball effect id mismatch');
    assert.strictEqual(skill.effect.duration, expected.effect.duration, `Iceball duration failed for ${grade}`);
    if (grade === 'LEGENDARY') {
        assert(skill.centerTargetEffect && skill.centerTargetEffect.id === 'bind', 'Legendary center bind missing');
    } else {
        assert(!skill.centerTargetEffect, 'Center effect should only exist in Legendary');
    }
}

// 신규 4대 원소 스킬 검증
for (const base of elementalBases) {
    const skill = skillModifierEngine.getModifiedSkill(base, 'NORMAL');
    assert.strictEqual(skill.cost, base.cost, `${base.id} cost failed`);
    assert.strictEqual(skill.cooldown, base.cooldown, `${base.id} cooldown failed`);
    assert.strictEqual(skill.range, base.range, `${base.id} range failed`);
    assert.strictEqual(skill.effect.id, base.effect.id, `${base.id} effect id mismatch`);
    assert.strictEqual(skill.effect.duration, base.effect.duration, `${base.id} duration failed`);
}

// 신규 프로스트위버 스킬 검증
for (const base of frostweaverBases) {
    const skill = skillModifierEngine.getModifiedSkill(base, 'NORMAL');
    assert.strictEqual(skill.cost, base.cost, `${base.id} cost failed`);
    assert.strictEqual(skill.cooldown, base.cooldown, `${base.id} cooldown failed`);
    assert.strictEqual(skill.range, base.range, `${base.id} range failed`);
    if (base.effect) {
        assert.strictEqual(skill.effect.id, base.effect.id, `${base.id} effect id mismatch`);
        assert.strictEqual(skill.effect.duration, base.effect.duration, `${base.id} duration failed`);
        if (base.effect.chance !== undefined) {
            assert.strictEqual(skill.effect.chance, base.effect.chance, `${base.id} chance failed`);
        }
    }
    if (base.resourceCost) {
        assert.strictEqual(skill.resourceCost.type, base.resourceCost.type, `${base.id} resource type mismatch`);
        assert.strictEqual(skill.resourceCost.amount, base.resourceCost.amount, `${base.id} resource amount mismatch`);
    }
    if (base.aoe) {
        assert.strictEqual(skill.aoe.shape, base.aoe.shape, `${base.id} aoe shape mismatch`);
        assert.strictEqual(skill.aoe.radius, base.aoe.radius, `${base.id} aoe radius mismatch`);
    }
}

console.log('Esper skills integration test passed.');
