import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';
import { turnOrderManager } from '../src/game/utils/TurnOrderManager.js';
import { tokenEngine } from '../src/game/utils/TokenEngine.js';

const suppressShotBase = {
    NORMAL: { id: 'suppressShot', damageMultiplier: { min: 0.7, max: 0.9 }, turnOrderEffect: 'pushToBack' },
    RARE: { id: 'suppressShot', damageMultiplier: { min: 0.9, max: 1.1 }, turnOrderEffect: 'pushToBack' },
    EPIC: { id: 'suppressShot', damageMultiplier: { min: 1.1, max: 1.3 }, turnOrderEffect: 'pushToBack' },
    LEGENDARY: { id: 'suppressShot', damageMultiplier: { min: 1.1, max: 1.3 }, turnOrderEffect: 'pushToBack', effect: { tokenLoss: 1 } }
};

// --- ▼ [신규] 넉백샷 테스트 데이터 추가 ▼ ---
const knockbackShotBase = {
    NORMAL: { id: 'knockbackShot', cost: 2, cooldown: 2, damageMultiplier: { min: 0.7, max: 0.9 }, push: 1 },
    RARE: { id: 'knockbackShot', cost: 2, cooldown: 1, damageMultiplier: { min: 0.7, max: 0.9 }, push: 1 },
    EPIC: { id: 'knockbackShot', cost: 1, cooldown: 1, damageMultiplier: { min: 0.7, max: 0.9 }, push: 1 },
    LEGENDARY: { id: 'knockbackShot', cost: 1, cooldown: 1, damageMultiplier: { min: 0.7, max: 0.9 }, push: 2 }
};

// --- ▲ [신규] 넉백샷 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 도탄 사격 테스트 데이터 추가 ▼ ---
const ricochetShotBase = {
    NORMAL: { id: 'ricochetShot', cost: 2, cooldown: 2, range: 3, damageMultiplier: { min: 0.75, max: 0.85 } },
    RARE: { id: 'ricochetShot', cost: 2, cooldown: 2, range: 3, damageMultiplier: { min: 0.75, max: 0.85 } },
    EPIC: { id: 'ricochetShot', cost: 2, cooldown: 2, range: 3, damageMultiplier: { min: 0.75, max: 0.85 } },
    LEGENDARY: { id: 'ricochetShot', cost: 2, cooldown: 2, range: 3, damageMultiplier: { min: 0.75, max: 0.85 } }
};
// --- ▲ [신규] 도탄 사격 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 사냥꾼의 감각 테스트 데이터 추가 ▼ ---
const huntSenseBase = {
    NORMAL: {
        id: 'huntSense',
        cost: 2,
        cooldown: 4,
        effect: { duration: 3, modifiers: [ { stat: 'rangedAttack', type: 'flat', value: 1 }, { stat: 'criticalChance', type: 'percentage', value: 0.15 } ] }
    },
    RARE: {
        id: 'huntSense',
        cost: 1,
        cooldown: 4,
        effect: { duration: 3, modifiers: [ { stat: 'rangedAttack', type: 'flat', value: 1 }, { stat: 'criticalChance', type: 'percentage', value: 0.15 } ] }
    },
    EPIC: {
        id: 'huntSense',
        cost: 1,
        cooldown: 3,
        effect: { duration: 3, modifiers: [ { stat: 'rangedAttack', type: 'flat', value: 1 }, { stat: 'criticalChance', type: 'percentage', value: 0.15 } ] }
    },
    LEGENDARY: {
        id: 'huntSense',
        cost: 1,
        cooldown: 3,
        effect: { duration: 4, modifiers: [ { stat: 'rangedAttack', type: 'flat', value: 1 }, { stat: 'criticalChance', type: 'percentage', value: 0.15 } ] }
    }
};
// --- ▲ [신규] 사냥꾼의 감각 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 관통 사격 테스트 데이터 추가 ▼ ---
const piercingShotBase = {
    NORMAL: {
        id: 'piercingShot',
        cost: 3,
        cooldown: 3,
        range: 4,
        aoe: { shape: 'LINE', length: 3 },
        damageMultiplier: { min: 0.8, max: 1.0 }
    },
    RARE: {
        id: 'piercingShot',
        cost: 3,
        cooldown: 2,
        range: 4,
        aoe: { shape: 'LINE', length: 3 },
        damageMultiplier: { min: 0.9, max: 1.1 }
    },
    EPIC: {
        id: 'piercingShot',
        cost: 2,
        cooldown: 2,
        range: 5,
        aoe: { shape: 'LINE', length: 3 },
        damageMultiplier: { min: 1.0, max: 1.2 }
    },
    LEGENDARY: {
        id: 'piercingShot',
        cost: 2,
        cooldown: 2,
        range: 5,
        aoe: { shape: 'LINE', length: 3 },
        damageMultiplier: { min: 1.0, max: 1.2 },
        armorPenetration: 0.25
    }
};
// --- ▲ [신규] 관통 사격 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 집중 포화 테스트 데이터 추가 ▼ ---
const focusFireBase = {
    NORMAL: {
        id: 'focusFire',
        cost: 0,
        cooldown: 4,
        range: 5,
        resourceCost: { type: 'IRON', amount: 2 },
        effect: { id: 'focusFireMark', duration: 3 }
    },
    RARE: {
        id: 'focusFire',
        cost: 0,
        cooldown: 4,
        range: 5,
        resourceCost: { type: 'IRON', amount: 2 },
        effect: { id: 'focusFireMark', duration: 3, modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.20 } }
    },
    EPIC: {
        id: 'focusFire',
        cost: 0,
        cooldown: 3,
        range: 6,
        resourceCost: { type: 'IRON', amount: 2 },
        effect: {
            id: 'focusFireMark',
            duration: 3,
            modifiers: [
                { stat: 'damageIncrease', type: 'percentage', value: 0.25 },
                { stat: 'physicalDefense', type: 'percentage', value: -0.10 }
            ]
        }
    },
    LEGENDARY: {
        id: 'focusFire',
        cost: 0,
        cooldown: 3,
        range: 6,
        resourceCost: { type: 'IRON', amount: 1 },
        effect: {
            id: 'focusFireMark',
            duration: 4,
            modifiers: [
                { stat: 'damageIncrease', type: 'percentage', value: 0.30 },
                { stat: 'physicalDefense', type: 'percentage', value: -0.15 },
                { stat: 'magicDefense', type: 'percentage', value: -0.15 }
            ]
        }
    }
};
// --- ▲ [신규] 집중 포화 테스트 데이터 추가 ▲ ---

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

// 1. 데미지 계수 테스트
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(suppressShotBase[grade], grade);
    assert(skill.damageMultiplier && typeof skill.damageMultiplier === 'object');
}

// 2. 턴 순서 변경 테스트
let testQueue = [
    { uniqueId: 1, instanceName: 'A' },
    { uniqueId: 2, instanceName: 'B' },
    { uniqueId: 3, instanceName: 'C' }
];
const target = testQueue[1];
testQueue = turnOrderManager.pushToBack(testQueue, target);
assert.deepStrictEqual(testQueue.map(u => u.instanceName), ['A', 'C', 'B'], 'Turn order pushToBack failed');

// 3. 토큰 감소 효과 테스트
const testUnit = { uniqueId: 10, instanceName: 'TestDummy' };
tokenEngine.initializeUnits([testUnit]);
tokenEngine.addTokensForNewTurn();
assert.strictEqual(tokenEngine.getTokens(testUnit.uniqueId), 3, 'Initial token setup failed');

tokenEngine.spendTokens(testUnit.uniqueId, 1, '제압 사격 효과');
assert.strictEqual(tokenEngine.getTokens(testUnit.uniqueId), 2, 'Token loss effect failed');

// --- ▼ [신규] 넉백샷 테스트 로직 추가 ▼ ---
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(knockbackShotBase[grade], grade);
    assert(skill.damageMultiplier && typeof skill.damageMultiplier === 'object');

    const expectedCost = (grade === 'EPIC' || grade === 'LEGENDARY') ? 1 : 2;
    const expectedCooldown = grade === 'NORMAL' ? 2 : 1;
    const expectedPush = grade === 'LEGENDARY' ? 2 : 1;

    assert.strictEqual(skill.cost, expectedCost, `Knockback cost failed for ${grade}`);
    assert.strictEqual(skill.cooldown, expectedCooldown, `Knockback cooldown failed for ${grade}`);
    assert.strictEqual(skill.push, expectedPush, `Knockback push failed for ${grade}`);
}
// --- ▲ [신규] 넉백샷 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 도탄 사격 테스트 로직 추가 ▼ ---
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(ricochetShotBase[grade], grade);
    assert(skill.damageMultiplier && typeof skill.damageMultiplier === 'object');
    assert.strictEqual(skill.range, 3, `Ricochet range failed for ${grade}`);
    assert.strictEqual(skill.cooldown, 2, `Ricochet cooldown failed for ${grade}`);
    assert.strictEqual(skill.cost, 2, `Ricochet cost failed for ${grade}`);
}
// --- ▲ [신규] 도탄 사격 테스트 로직 추가 ▲ ---


// --- ▼ [신규] 사냥꾼의 감각 테스트 로직 추가 ▼ ---
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(huntSenseBase[grade], grade);
    const critMod = skill.effect.modifiers.find(m => m.stat === 'criticalChance');
    const rangedMod = skill.effect.modifiers.find(m => m.stat === 'rangedAttack');

    assert.strictEqual(skill.cost, huntSenseBase[grade].cost, `Hunt Sense cost failed for grade ${grade}`);
    assert.strictEqual(skill.cooldown, huntSenseBase[grade].cooldown, `Hunt Sense cooldown failed for grade ${grade}`);
    assert.strictEqual(skill.effect.duration, huntSenseBase[grade].effect.duration, `Hunt Sense duration failed for grade ${grade}`);
    assert(rangedMod && rangedMod.value === 1, `Ranged attack modifier failed for grade ${grade}`);
    assert(Math.abs(critMod.value - 0.15) < 1e-6, `Crit chance modifier failed for grade ${grade}`);
}
// --- ▲ [신규] 사냥꾼의 감각 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 관통 사격 테스트 로직 추가 ▼ ---
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(piercingShotBase[grade], grade);

    const expectedCost = (grade === 'EPIC' || grade === 'LEGENDARY') ? 2 : 3;
    const expectedCooldown = grade === 'NORMAL' ? 3 : 2;
    const expectedRange = (grade === 'NORMAL' || grade === 'RARE') ? 4 : 5;

    assert.strictEqual(skill.cost, expectedCost, `Piercing Shot cost failed for grade ${grade}`);
    assert.strictEqual(skill.cooldown, expectedCooldown, `Piercing Shot cooldown failed for grade ${grade}`);
    assert.strictEqual(skill.range, expectedRange, `Piercing Shot range failed for grade ${grade}`);
    assert(skill.aoe && skill.aoe.shape === 'LINE' && skill.aoe.length === 3, `Piercing Shot AOE failed for grade ${grade}`);

    if (grade === 'LEGENDARY') {
        assert(Math.abs((skill.armorPenetration || 0) - 0.25) < 1e-6, 'Piercing Shot armor penetration failed for LEGENDARY');
    } else {
        assert.strictEqual(skill.armorPenetration, undefined, `Piercing Shot armor penetration should be undefined for grade ${grade}`);
    }
}
// --- ▲ [신규] 관통 사격 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 집중 포화 테스트 로직 추가 ▼ ---
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(focusFireBase[grade], grade);

    const expectedAmount = grade === 'LEGENDARY' ? 1 : 2;
    const expectedDuration = grade === 'LEGENDARY' ? 4 : 3;

    assert.strictEqual(skill.resourceCost.amount, expectedAmount, `Focus Fire resource cost failed for grade ${grade}`);
    assert.strictEqual(skill.effect.duration, expectedDuration, `Focus Fire duration failed for grade ${grade}`);

    if (grade !== 'NORMAL') {
        const mods = Array.isArray(skill.effect.modifiers) ? skill.effect.modifiers : [skill.effect.modifiers];
        const dmgMod = mods.find(m => m.stat === 'damageIncrease');
        const expectedDmg = grade === 'RARE' ? 0.20 : grade === 'EPIC' ? 0.25 : 0.30;
        assert(dmgMod && Math.abs(dmgMod.value - expectedDmg) < 1e-6, `Focus Fire damage modifier failed for grade ${grade}`);

        if (grade === 'EPIC' || grade === 'LEGENDARY') {
            const defMod = mods.find(m => m.stat === 'physicalDefense');
            const expectedDef = grade === 'EPIC' ? -0.10 : -0.15;
            assert(defMod && Math.abs(defMod.value - expectedDef) < 1e-6, `Focus Fire physical defense mod failed for grade ${grade}`);
        }
        if (grade === 'LEGENDARY') {
            const mdefMod = mods.find(m => m.stat === 'magicDefense');
            assert(mdefMod && Math.abs(mdefMod.value + 0.15) < 1e-6, 'Focus Fire magic defense mod failed for LEGENDARY');
        }
    }
}
// --- ▲ [신규] 집중 포화 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 강철 덫 테스트 로직 추가 ▼ ---
const steelTrapBase = {
    NORMAL: {
        id: 'steelTrap',
        cost: 2,
        cooldown: 2,
        range: 3,
        trapData: {
            duration: 3,
            effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 1 }
        }
    }
};
const steelTrap = skillModifierEngine.getModifiedSkill(steelTrapBase.NORMAL, 'NORMAL');
assert.strictEqual(steelTrap.cost, 2, 'Steel Trap cost failed');
assert.strictEqual(steelTrap.cooldown, 2, 'Steel Trap cooldown failed');
assert(steelTrap.trapData && steelTrap.trapData.duration === 3, 'Steel Trap duration failed');
assert.strictEqual(steelTrap.trapData.effect.id, 'bind', 'Steel Trap effect id failed');
// --- ▲ [신규] 강철 덫 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 맹독 함정 테스트 로직 추가 ▼ ---
const venomTrapBase = {
    NORMAL: {
        id: 'venomTrap',
        cost: 2,
        cooldown: 3,
        range: 3,
        trapData: {
            duration: 3,
            effect: { id: 'poison', type: 'DEBUFF', duration: 2 }
        }
    }
};
const venomTrap = skillModifierEngine.getModifiedSkill(venomTrapBase.NORMAL, 'NORMAL');
assert.strictEqual(venomTrap.cost, 2, 'Venom Trap cost failed');
assert.strictEqual(venomTrap.cooldown, 3, 'Venom Trap cooldown failed');
assert(venomTrap.trapData && venomTrap.trapData.duration === 3, 'Venom Trap duration failed');
assert.strictEqual(venomTrap.trapData.effect.id, 'poison', 'Venom Trap effect id failed');
// --- ▲ [신규] 맹독 함정 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 전격 함정 테스트 로직 추가 ▼ ---
const shockTrapBase = {
    NORMAL: {
        id: 'shockTrap',
        cost: 3,
        cooldown: 4,
        range: 3,
        trapData: {
            duration: 2,
            effect: { id: 'shock', type: 'DEBUFF', duration: 2 }
        }
    }
};
const shockTrap = skillModifierEngine.getModifiedSkill(shockTrapBase.NORMAL, 'NORMAL');
assert.strictEqual(shockTrap.cost, 3, 'Shock Trap cost failed');
assert.strictEqual(shockTrap.cooldown, 4, 'Shock Trap cooldown failed');
assert(shockTrap.trapData && shockTrap.trapData.duration === 2, 'Shock Trap duration failed');
assert.strictEqual(shockTrap.trapData.effect.id, 'shock', 'Shock Trap effect id failed');
// --- ▲ [신규] 전격 함정 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 빙결 함정 테스트 로직 추가 ▼ ---
const frostTrapBase = {
    NORMAL: {
        id: 'frostTrap',
        cost: 1,
        cooldown: 2,
        range: 3,
        trapData: {
            duration: 3,
            effect: { id: 'frost', type: 'DEBUFF', duration: 2 }
        }
    }
};
const frostTrap = skillModifierEngine.getModifiedSkill(frostTrapBase.NORMAL, 'NORMAL');
assert.strictEqual(frostTrap.cost, 1, 'Frost Trap cost failed');
assert.strictEqual(frostTrap.cooldown, 2, 'Frost Trap cooldown failed');
assert(frostTrap.trapData && frostTrap.trapData.duration === 3, 'Frost Trap duration failed');
assert.strictEqual(frostTrap.trapData.effect.id, 'frost', 'Frost Trap effect id failed');
// --- ▲ [신규] 빙결 함정 테스트 로직 추가 ▲ ---

console.log('Gunner skills integration test passed.');
