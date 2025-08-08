import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const healBase = {
    NORMAL: { id: 'heal', type: 'AID', cost: 1, cooldown: 0, healMultiplier: { min: 0.9, max: 1.1 } },
    RARE: { id: 'heal', type: 'AID', cost: 0, cooldown: 0, healMultiplier: { min: 0.9, max: 1.1 } },
    EPIC: { id: 'heal', type: 'AID', cost: 0, cooldown: 0, healMultiplier: { min: 0.9, max: 1.1 }, removesDebuff: { chance: 0.5 } },
    LEGENDARY: { id: 'heal', type: 'AID', cost: 0, cooldown: 0, healMultiplier: { min: 0.9, max: 1.1 }, removesDebuff: { chance: 1.0 } }
};

const expectedHeals = [1.3, 1.2, 1.1, 1.0];
const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(healBase[grade], grade);
    assert(skill.healMultiplier && typeof skill.healMultiplier === 'object');
    if (grade === 'NORMAL') {
        assert.strictEqual(skill.cost, 1);
    } else {
        assert.strictEqual(skill.cost, 0);
    }
}

// ---- Stigma skill tests ----
const stigmaBase = {
    NORMAL: { id: 'stigma', type: 'ACTIVE', cooldown: 5, effect: { id: 'stigma', type: 'DEBUFF', duration: 3 } },
    RARE: { id: 'stigma', type: 'ACTIVE', cooldown: 4, effect: { id: 'stigma', type: 'DEBUFF', duration: 3 } },
    EPIC: { id: 'stigma', type: 'ACTIVE', cooldown: 3, effect: { id: 'stigma', type: 'DEBUFF', duration: 3 } },
    LEGENDARY: { id: 'stigma', type: 'ACTIVE', cooldown: 3, numberOfTargets: 2, effect: { id: 'stigma', type: 'DEBUFF', duration: 3 } }
};

const expectedCooldowns = { NORMAL: 5, RARE: 4, EPIC: 3, LEGENDARY: 3 };

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(stigmaBase[grade], grade);
    assert.strictEqual(skill.cooldown, expectedCooldowns[grade]);
    if (grade === 'LEGENDARY') {
        assert.strictEqual(skill.numberOfTargets, 2);
    }
}

// --- ▼ [신규] 윌 가드 테스트 로직 추가 ▼ ---
const willGuardBase = {
    NORMAL: { id: 'willGuard', cost: 3, cooldown: 3, healMultiplier: { min: 0.45, max: 0.55 }, effect: { stack: { amount: 2 } } },
    RARE: { id: 'willGuard', cost: 2, cooldown: 3, healMultiplier: { min: 0.45, max: 0.55 }, effect: { stack: { amount: 2 } } },
    EPIC: { id: 'willGuard', cost: 2, cooldown: 2, healMultiplier: { min: 0.45, max: 0.55 }, effect: { stack: { amount: 3 } } },
    LEGENDARY: { id: 'willGuard', cost: 2, cooldown: 2, healMultiplier: { min: 0.45, max: 0.55 }, effect: { stack: { amount: 3 } } }
};

const expectedWillGuardHeals = [0.8, 0.7, 0.6, 0.5];

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(willGuardBase[grade], grade);
    assert(skill.healMultiplier && typeof skill.healMultiplier === 'object');

    assert.strictEqual(skill.cost, willGuardBase[grade].cost, `Will Guard cost failed for ${grade}`);
    assert.strictEqual(skill.cooldown, willGuardBase[grade].cooldown, `Will Guard cooldown failed for ${grade}`);
    assert.strictEqual(skill.effect.stack.amount, willGuardBase[grade].effect.stack.amount, `Will Guard stack amount failed for ${grade}`);
}
// --- ▲ [신규] 윌 가드 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 성역 스킬 테스트 추가 ▼ ---
const sanctuaryBase = {
    NORMAL: {
        id: 'sanctuary',
        type: 'BUFF',
        cost: 3,
        cooldown: 4,
        effect: {
            radius: 2,
            modifiers: [
                { stat: 'physicalDefense', type: 'percentage', value: 0.15 },
                { stat: 'magicDefense', type: 'percentage', value: 0.15 }
            ]
        }
    }
};

{
    const skill = skillModifierEngine.getModifiedSkill(sanctuaryBase.NORMAL, 'NORMAL');
    assert.strictEqual(skill.effect.radius, 2, 'Sanctuary aura radius mismatch');
    assert(Array.isArray(skill.effect.modifiers) && skill.effect.modifiers.length === 2, 'Sanctuary modifiers missing');
}
// --- ▲ [신규] 성역 스킬 테스트 추가 ▲ ---

console.log('Medic skill integration test passed.');
