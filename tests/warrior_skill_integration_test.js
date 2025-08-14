import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';
import { skillEngine } from '../src/game/utils/SkillEngine.js';
import { tokenEngine } from '../src/game/utils/TokenEngine.js';
import { cooldownManager } from '../src/game/utils/CooldownManager.js';

// ------- Base Skill Data -------
const attackBase = {
    NORMAL: { id: 'attack', type: 'ACTIVE', cost: 1, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 } },
    RARE: { id: 'attack', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 } },
    EPIC: { id: 'attack', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, generatesToken: { chance: 0.5, amount: 1 } },
    LEGENDARY: { id: 'attack', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, generatesToken: { chance: 1.0, amount: 1 } }
};

const chargeBase = {
    NORMAL: { id: 'charge', type: 'ACTIVE', cost: 2, cooldown: 3, damageMultiplier: { min: 0.7, max: 0.9 }, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    RARE: { id: 'charge', type: 'ACTIVE', cost: 2, cooldown: 2, damageMultiplier: { min: 0.7, max: 0.9 }, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    EPIC: { id: 'charge', type: 'ACTIVE', cost: 1, cooldown: 2, damageMultiplier: { min: 0.7, max: 0.9 }, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    LEGENDARY: { id: 'charge', type: 'ACTIVE', cost: 1, cooldown: 2, damageMultiplier: { min: 0.7, max: 0.9 }, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 2 } }
};

const stoneSkinBase = {
    NORMAL: {
        id: 'stoneSkin',
        type: 'BUFF',
        cost: 2,
        cooldown: 3,
        generatesResource: { type: 'EARTH', amount: 1 },
        effect: {
            id: 'stoneSkin',
            type: 'BUFF',
            duration: 4,
            modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.15 }
        }
    },
    RARE: {
        id: 'stoneSkin',
        type: 'BUFF',
        cost: 1,
        cooldown: 3,
        generatesResource: { type: 'EARTH', amount: 1 },
        effect: {
            id: 'stoneSkin',
            type: 'BUFF',
            duration: 4,
            modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.15 }
        }
    },
    EPIC: {
        id: 'stoneSkin',
        type: 'BUFF',
        cost: 1,
        cooldown: 3,
        generatesResource: { type: 'EARTH', amount: 1 },
        effect: {
            id: 'stoneSkin',
            type: 'BUFF',
            duration: 4,
            modifiers: [
                { stat: 'damageReduction', type: 'percentage', value: 0.15 },
                { stat: 'physicalDefense', type: 'percentage', value: 0.10 }
            ]
        }
    },
    LEGENDARY: {
        id: 'stoneSkin',
        type: 'BUFF',
        cost: 1,
        cooldown: 3,
        generatesResource: { type: 'EARTH', amount: 1 },
        effect: {
            id: 'stoneSkin',
            type: 'BUFF',
            duration: 4,
            modifiers: [
                { stat: 'damageReduction', type: 'percentage', value: 0.15 },
                { stat: 'physicalDefense', type: 'percentage', value: 0.15 }
            ]
        }
    }
};

const shieldBreakBase = {
    NORMAL: { id: 'shieldBreak', type: 'DEBUFF', cost: 2, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 } } },
    RARE: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 } } },
    EPIC: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: [ { stat: 'damageIncrease', type: 'percentage', value: 0.15 }, { stat: 'physicalDefense', type: 'percentage', value: -0.05 } ] } },
    LEGENDARY: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: [ { stat: 'damageIncrease', type: 'percentage', value: 0.15 }, { stat: 'physicalDefense', type: 'percentage', value: -0.10 } ] } }
};

const grindstoneBase = {
    NORMAL: {
        id: 'grindstone', type: 'BUFF', cost: 1, cooldown: 2, effect: { id: 'grindstoneBuff', type: 'BUFF', duration: 1, modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 } }, generatesResource: { type: 'IRON', amount: 1 }
    },
    RARE: {
        id: 'grindstone', type: 'BUFF', cost: 1, cooldown: 1, effect: { id: 'grindstoneBuff', type: 'BUFF', duration: 1, modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 } }, generatesResource: { type: 'IRON', amount: 1 }
    },
    EPIC: {
        id: 'grindstone', type: 'BUFF', cost: 0, cooldown: 1, effect: { id: 'grindstoneBuff', type: 'BUFF', duration: 1, modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 } }, generatesResource: { type: 'IRON', amount: 1 }
    },
    LEGENDARY: {
        id: 'grindstone', type: 'BUFF', cost: 0, cooldown: 1, effect: { id: 'grindstoneBuff', type: 'BUFF', duration: 1, modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 } }, generatesResource: { type: 'IRON', amount: 2 }
    }
};

const throwingAxeBase = {
    NORMAL: {
        id: 'throwingAxe', type: 'ACTIVE', cost: 0, cooldown: 1, damageMultiplier: { min: 1.1, max: 1.3 }, resourceCost: { type: 'IRON', amount: 1 }
    },
    RARE: {
        id: 'throwingAxe', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 1.1, max: 1.3 }, resourceCost: { type: 'IRON', amount: 1 }
    },
    EPIC: {
        id: 'throwingAxe', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 1.1, max: 1.3 }, resourceCost: { type: 'IRON', amount: 1 }, effect: { type: 'STATUS_EFFECT', id: 'stun', duration: 1, chance: 0.2 }
    },
    LEGENDARY: {
        id: 'throwingAxe', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: { min: 1.1, max: 1.3 }, resourceCost: { type: 'IRON', amount: 1 }, effect: { type: 'STATUS_EFFECT', id: 'stun', duration: 1, chance: 0.4 }
    }
};

// --- ▼ [신규] 더블 스트라이크 테스트 데이터 추가 ▼ ---
const doubleStrikeBase = {
    NORMAL: {
        id: 'doubleStrike',
        type: 'ACTIVE',
        cost: 2,
        cooldown: 0,
        damageMultiplier: { min: 0.75, max: 0.85 },
        hitCount: 2
    },
    RARE: {
        id: 'doubleStrike',
        type: 'ACTIVE',
        cost: 1,
        cooldown: 0,
        damageMultiplier: { min: 0.75, max: 0.85 },
        hitCount: 2
    },
    EPIC: {
        id: 'doubleStrike',
        type: 'ACTIVE',
        cost: 1,
        cooldown: 0,
        damageMultiplier: { min: 0.75, max: 0.85 },
        hitCount: 2,
        effect: {
            id: 'armorBreak',
            type: 'DEBUFF',
            duration: 2,
            stackable: true,
            modifiers: { stat: 'physicalDefense', type: 'percentage', value: -0.05 }
        }
    },
    LEGENDARY: {
        id: 'doubleStrike',
        type: 'ACTIVE',
        cost: 1,
        cooldown: 0,
        damageMultiplier: { min: 0.75, max: 0.85 },
        hitCount: 2,
        effect: {
            id: 'armorBreak',
            type: 'DEBUFF',
            duration: 2,
            stackable: true,
            modifiers: { stat: 'physicalDefense', type: 'percentage', value: -0.05 }
        },
        generatesResource: { type: 'IRON', amount: 1 }
    }
};
// --- ▲ [신규] 더블 스트라이크 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 회전 베기 테스트 데이터 추가 ▼ ---
const spinningSlashBase = {
    NORMAL: {
        id: 'spinningSlash',
        type: 'ACTIVE',
        cost: 3,
        cooldown: 3,
        damageMultiplier: { min: 0.65, max: 0.75 },
        range: 0,
        aoe: { shape: 'CROSS', radius: 1 },
        generatesResource: { type: 'WIND', amount: 1 }
    }
};
// --- ▲ [신규] 회전 베기 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 대지 가르기 테스트 데이터 추가 ▼ ---
const earthSplitterBase = {
    NORMAL: {
        id: 'earthSplitter',
        type: 'ACTIVE',
        cost: 3,
        cooldown: 3,
        damageMultiplier: { min: 0.65, max: 0.75 },
        range: 3,
        aoe: { shape: 'LINE', length: 3 },
        generatesResource: { type: 'EARTH', amount: 1 }
    }
};
// --- ▲ [신규] 대지 가르기 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 도발 & 방패 치기 테스트 데이터 추가 ▼ ---
const tauntBase = {
    NORMAL: {
        id: 'taunt',
        type: 'ACTIVE',
        cost: 2,
        cooldown: 3,
        range: 0,
        aoe: { shape: 'SQUARE', radius: 3 },
        effect: { id: 'tauntDebuff', type: 'DEBUFF', duration: 2 },
        selfEffect: {
            id: 'tauntBuff',
            type: 'BUFF',
            duration: 2,
            modifiers: { stat: 'physicalDefense', type: 'percentage', value: 0.2 }
        }
    }
};

const shieldBashBase = {
    NORMAL: {
        id: 'shieldBash',
        type: 'ACTIVE',
        cost: 2,
        cooldown: 1,
        range: 1,
        damageBasedOn: { stat: 'hp', percentage: 0.15 },
        effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1, chance: 0.3 }
    }
};
// --- ▲ [신규] 도발 & 방패 치기 테스트 데이터 추가 ▲ ---

const ironWillBase = {
    rankModifiers: [0.39, 0.36, 0.33, 0.30],
    NORMAL: { maxReduction: 0.30, hpRegen: 0 },
    RARE: { maxReduction: 0.30, hpRegen: 0.02 },
    EPIC: { maxReduction: 0.30, hpRegen: 0.04 },
    LEGENDARY: { maxReduction: 0.30, hpRegen: 0.06 }
};

// --- ▼ [신규] 전투의 함성 테스트 데이터 추가 ▼ ---
const battleCryBase = {
    NORMAL: {
        id: 'battleCry',
        cost: 2,
        effect: {
            duration: 2,
            modifiers: [
                { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                { stat: 'meleeAttack', type: 'flat', value: 1 }
            ]
        }
    },
    RARE: {
        id: 'battleCry',
        cost: 1,
        effect: {
            duration: 2,
            modifiers: [
                { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                { stat: 'meleeAttack', type: 'flat', value: 1 }
            ]
        }
    },
    EPIC: {
        id: 'battleCry',
        cost: 1,
        effect: {
            duration: 3,
            modifiers: [
                { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                { stat: 'meleeAttack', type: 'flat', value: 1 }
            ]
        }
    },
    LEGENDARY: {
        id: 'battleCry',
        cost: 1,
        effect: {
            duration: 3,
            modifiers: [
                { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                { stat: 'meleeAttack', type: 'flat', value: 1 }
            ]
        }
    }
};
// --- ▲ [신규] 전투의 함성 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 버서커 & 스펠브레이커 스킬 테스트 데이터 추가 ▼ ---
const frenziedBlowBase = {
    NORMAL: {
        id: 'frenziedBlow',
        type: 'ACTIVE',
        cost: 2,
        cooldown: 1,
        range: 1,
        damageMultiplier: { min: 1.2, max: 1.4 },
        selfEffect: {
            id: 'frenzyDefenseDown',
            type: 'DEBUFF',
            duration: 1,
            modifiers: { stat: 'physicalDefense', type: 'percentage', value: -0.1 }
        }
    }
};

const bloodRageBase = {
    NORMAL: {
        id: 'bloodRage',
        type: 'BUFF',
        cost: 2,
        cooldown: 3,
        effect: {
            id: 'bloodRageBuff',
            type: 'BUFF',
            duration: 2,
            modifiers: [
                { stat: 'physicalAttack', type: 'percentage', value: 0.2 },
                { stat: 'physicalDefense', type: 'percentage', value: -0.1 }
            ]
        }
    }
};

const manaSunderBase = {
    NORMAL: {
        id: 'manaSunder',
        type: 'ACTIVE',
        cost: 2,
        cooldown: 2,
        range: 1,
        damageMultiplier: { min: 0.8, max: 1.0 },
        effect: {
            id: 'manaSunderDebuff',
            type: 'DEBUFF',
            duration: 2,
            modifiers: { stat: 'magicAttack', type: 'percentage', value: -0.15 }
        }
    }
};

const nullFieldBase = {
    NORMAL: {
        id: 'nullField',
        type: 'BUFF',
        cost: 2,
        cooldown: 4,
        effect: {
            id: 'nullFieldBuff',
            type: 'BUFF',
            duration: 2,
            modifiers: { stat: 'magicDefense', type: 'percentage', value: 0.25 }
        }
    }
};
// --- ▲ [신규] 버서커 & 스펠브레이커 스킬 테스트 데이터 추가 ▲ ---

// ------- Grade/Rank Tests -------
const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

// Attack
const attackExpectedDamage = [1.3, 1.2, 1.1, 1.0];
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(attackBase[grade], grade);
    assert(skill.damageMultiplier && typeof skill.damageMultiplier === 'object');
    if (grade === 'NORMAL') {
        assert.strictEqual(skill.cost, 1);
    } else {
        assert.strictEqual(skill.cost, 0);
    }
    if (grade === 'EPIC') {
        assert(skill.generatesToken && skill.generatesToken.chance === 0.5);
    } else if (grade === 'LEGENDARY') {
        assert(skill.generatesToken && skill.generatesToken.chance === 1.0);
    } else {
        assert(!skill.generatesToken);
    }
}

// Charge
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(chargeBase[grade], grade);
    assert(skill.damageMultiplier && typeof skill.damageMultiplier === 'object');
    const expectedDuration = grade === 'LEGENDARY' ? 2 : 1;
    assert.strictEqual(skill.effect.duration, expectedDuration);
}

// Stone Skin
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(stoneSkinBase[grade], grade);
    const mods = skill.effect.modifiers;
    const reduction = Array.isArray(mods) ? mods.find(m => m.stat === 'damageReduction').value : mods.value;
    if (grade === 'NORMAL') {
        assert(Math.abs(reduction - 0.15) < 1e-6);
    } else if (grade === 'RARE') {
        assert(Math.abs(reduction - 0.15) < 1e-6);
    } else if (grade === 'EPIC') {
        assert(Math.abs(reduction - 0.15) < 1e-6);
    } else {
        assert(Math.abs(reduction - 0.15) < 1e-6);
    }
    if (grade === 'EPIC') {
        const pd = mods.find(m => m.stat === 'physicalDefense');
        assert(pd && Math.abs(pd.value - 0.10) < 1e-6);
    } else if (grade === 'LEGENDARY') {
        const pd = mods.find(m => m.stat === 'physicalDefense');
        assert(pd && Math.abs(pd.value - 0.15) < 1e-6);
    } else if (Array.isArray(mods)) {
        assert(!mods.some(m => m.stat === 'physicalDefense'));
    }
}

// Shield Break
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(shieldBreakBase[grade], grade);
    const mods = skill.effect.modifiers;
    const increase = Array.isArray(mods) ? mods.find(m => m.stat === 'damageIncrease').value : mods.value;
    assert(Math.abs(increase - 0.15) < 1e-6);
    if (grade === 'EPIC') {
        const pd = mods.find(m => m.stat === 'physicalDefense');
        assert(pd && Math.abs(pd.value + 0.05) < 1e-6);
    } else if (grade === 'LEGENDARY') {
        const pd = mods.find(m => m.stat === 'physicalDefense');
        assert(pd && Math.abs(pd.value + 0.10) < 1e-6);
    } else if (Array.isArray(mods)) {
        assert(!mods.some(m => m.stat === 'physicalDefense'));
    }
}

// Iron Will
function computeIronWillReduction(unit, grade) {
    const maxReduction = ironWillBase[grade].maxReduction;
    const lostRatio = 1 - (unit.currentHp / unit.finalStats.hp);
    return maxReduction * lostRatio;
}

for (const grade of grades) {
    const testUnit = { finalStats: { hp: 100 }, currentHp: 50 };
    const reduction = computeIronWillReduction(testUnit, grade);
    assert(Math.abs(reduction - ironWillBase[grade].maxReduction * 0.5) < 1e-6);
}

for (const grade of grades) {
    assert.strictEqual(typeof ironWillBase[grade].hpRegen, 'number');
}

// Grindstone
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(grindstoneBase[grade], grade);
    const value = skill.effect.modifiers.value;
    assert(Math.abs(value - 0.10) < 1e-6);
}

// --- ▼ [신규] 전투의 함성 테스트 로직 추가 ▼ ---
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(battleCryBase[grade], grade);
    const mods = skill.effect.modifiers;
    const attackMod = Array.isArray(mods) ? mods.find(m => m.stat === 'physicalAttack') : mods;

    assert.strictEqual(skill.cost, battleCryBase[grade].cost, `Battle Cry cost failed for grade ${grade}`);
    assert.strictEqual(skill.effect.duration, battleCryBase[grade].effect.duration, `Battle Cry duration failed for grade ${grade}`);
    assert(Math.abs(attackMod.value - 0.15) < 1e-6, `Battle Cry modifier value failed for grade ${grade}`);

    const meleeMod = Array.isArray(mods) ? mods.find(m => m.stat === 'meleeAttack') : null;
    assert(meleeMod && meleeMod.value === 1, `meleeAttack modifier missing or incorrect for grade ${grade}`);
}
// --- ▲ [신규] 전투의 함성 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 더블 스트라이크 테스트 로직 추가 ▼ ---
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(doubleStrikeBase[grade], grade);

    assert.strictEqual(skill.hitCount, 2, `Double Strike hit count failed for grade ${grade}`);
    assert.strictEqual(skill.cost, doubleStrikeBase[grade].cost, `Double Strike cost failed for grade ${grade}`);

    if (grade === 'EPIC' || grade === 'LEGENDARY') {
        const mod = skill.effect.modifiers;
        const value = Array.isArray(mod) ? mod.find(m => m.stat === 'physicalDefense')?.value : mod?.value;
        assert(value && Math.abs(value + 0.05) < 1e-6, `Double Strike effect failed for grade ${grade}`);
    } else {
        assert(!skill.effect, `Double Strike should have no effect for grade ${grade}`);
    }

    if (grade === 'LEGENDARY') {
        assert(
            skill.generatesResource &&
            skill.generatesResource.type === 'IRON' &&
            skill.generatesResource.amount === 1,
            'Double Strike resource generation failed'
        );
    } else {
        assert(!skill.generatesResource, `Double Strike should not generate resources for grade ${grade}`);
    }
}
// --- ▲ [신규] 더블 스트라이크 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 회전 베기 테스트 로직 추가 ▼ ---
{
    const skill = skillModifierEngine.getModifiedSkill(spinningSlashBase.NORMAL, 'NORMAL');
    assert.strictEqual(skill.cost, 3, 'Spinning Slash cost failed');
    assert.strictEqual(skill.cooldown, 3, 'Spinning Slash cooldown failed');
    assert.strictEqual(skill.range, 0, 'Spinning Slash range failed');
    assert(skill.aoe && skill.aoe.shape === 'CROSS' && skill.aoe.radius === 1, 'Spinning Slash AOE failed');
    assert(
        skill.generatesResource &&
            skill.generatesResource.type === 'WIND' &&
            skill.generatesResource.amount === 1,
        'Spinning Slash resource generation failed'
    );
}
// --- ▲ [신규] 회전 베기 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 대지 가르기 테스트 로직 추가 ▼ ---
{
    const skill = skillModifierEngine.getModifiedSkill(earthSplitterBase.NORMAL, 'NORMAL');
    assert.strictEqual(skill.cost, 3, 'Earth Splitter cost failed');
    assert.strictEqual(skill.cooldown, 3, 'Earth Splitter cooldown failed');
    assert.strictEqual(skill.range, 3, 'Earth Splitter range failed');
    assert(skill.aoe && skill.aoe.shape === 'LINE' && skill.aoe.length === 3, 'Earth Splitter AOE failed');
    assert(
        skill.generatesResource &&
            skill.generatesResource.type === 'EARTH' &&
            skill.generatesResource.amount === 1,
        'Earth Splitter resource generation failed'
    );
}
// --- ▲ [신규] 대지 가르기 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 도발 & 방패 치기 테스트 로직 추가 ▼ ---
{
    const skill = skillModifierEngine.getModifiedSkill(tauntBase.NORMAL, 'NORMAL');
    assert.strictEqual(skill.cooldown, 3, 'Taunt cooldown failed');
    assert(skill.selfEffect && skill.selfEffect.modifiers.stat === 'physicalDefense', 'Taunt selfEffect failed');
}
{
    const skill = skillModifierEngine.getModifiedSkill(shieldBashBase.NORMAL, 'NORMAL');
    assert.strictEqual(skill.range, 1, 'Shield Bash range failed');
    assert(skill.effect && skill.effect.chance === 0.3, 'Shield Bash effect failed');
}
// --- ▲ [신규] 도발 & 방패 치기 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 버서커 & 스펠브레이커 스킬 테스트 로직 추가 ▼ ---
{
    const skill = skillModifierEngine.getModifiedSkill(frenziedBlowBase.NORMAL, 'NORMAL');
    assert.strictEqual(skill.cooldown, 1, 'Frenzied Blow cooldown failed');
    assert(skill.selfEffect && skill.selfEffect.modifiers.value === -0.1, 'Frenzied Blow selfEffect failed');
}
{
    const skill = skillModifierEngine.getModifiedSkill(bloodRageBase.NORMAL, 'NORMAL');
    assert(skill.effect && Array.isArray(skill.effect.modifiers), 'Blood Rage modifiers missing');
}
{
    const skill = skillModifierEngine.getModifiedSkill(manaSunderBase.NORMAL, 'NORMAL');
    assert(skill.effect && skill.effect.modifiers.stat === 'magicAttack', 'Mana Sunder effect failed');
}
{
    const skill = skillModifierEngine.getModifiedSkill(nullFieldBase.NORMAL, 'NORMAL');
    assert(skill.effect && skill.effect.modifiers.stat === 'magicDefense', 'Null Field effect failed');
}
// --- ▲ [신규] 버서커 & 스펠브레이커 스킬 테스트 로직 추가 ▲ ---

// Throwing Axe
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(throwingAxeBase[grade], grade);
    assert(skill.damageMultiplier && typeof skill.damageMultiplier === 'object');
}

// ------- Skill Usage Integration Test -------
const soldier = { uniqueId: 1, instanceName: 'TestWarrior', finalStats: { hp: 100 }, currentHp: 100 };
const enemy = { uniqueId: 2, instanceName: 'Dummy', finalStats: { hp: 100 }, currentHp: 100 };

const soldierEffects = [];
const enemyEffects = [];
let firstStoneSkin = null;
let firstShieldBreak = null;

// Initialize token and cooldown systems
tokenEngine.initializeUnits([soldier, enemy]);
cooldownManager.reset();

const baseSkills = [
    { data: chargeBase.NORMAL, target: enemy },
    { data: stoneSkinBase.NORMAL, target: soldier },
    { data: shieldBreakBase.NORMAL, target: enemy },
    { data: ironWillBase, target: soldier }
];

const rankedSkills = baseSkills.map((entry) => {
    const modified = skillModifierEngine.getModifiedSkill(entry.data, 'NORMAL');
    return { ...modified, target: entry.target };
});

const usedOrder = [];
const tokenHistory = [];

for (let turn = 1; turn <= 5; turn++) {
    skillEngine.resetTurnActions();
    tokenEngine.addTokensForNewTurn();

    for (const skill of rankedSkills) {
        if (skill.type === 'PASSIVE') continue;
        if (skillEngine.canUseSkill(soldier, skill)) {
            skillEngine.recordSkillUse(soldier, skill);
            if (skill.effect) {
                const effectCopy = JSON.parse(JSON.stringify(skill.effect));
                effectCopy.remaining = effectCopy.duration;
                if (skill.id === 'stoneSkin' && !firstStoneSkin) firstStoneSkin = effectCopy;
                if (skill.id === 'shieldBreak' && !firstShieldBreak) firstShieldBreak = effectCopy;
                (skill.target === soldier ? soldierEffects : enemyEffects).push(effectCopy);
            }
            usedOrder.push(skill.id);
            break;
        }
    }

    tokenHistory.push(tokenEngine.getTokens(soldier.uniqueId));
    cooldownManager.reduceCooldowns(soldier.uniqueId);

    for (const list of [soldierEffects, enemyEffects]) {
        for (let i = list.length - 1; i >= 0; i--) {
            const e = list[i];
            e.remaining -= 1;
            if (e.remaining <= 0) list.splice(i, 1);
        }
    }
}

assert.deepStrictEqual(usedOrder, ['charge', 'stoneSkin', 'shieldBreak', 'charge', 'stoneSkin']);
assert(tokenHistory.every(t => t === 1));

assert(firstStoneSkin && Math.abs((firstStoneSkin.modifiers.value ?? firstStoneSkin.modifiers.find(m => m.stat === 'damageReduction').value) - 0.15) < 1e-6);
assert(firstShieldBreak && Math.abs((firstShieldBreak.modifiers.value ?? firstShieldBreak.modifiers.find(m => m.stat === 'damageIncrease').value) - 0.15) < 1e-6);

console.log('Warrior skill integration test passed.');
