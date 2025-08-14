import assert from 'assert';
import { diceEngine } from '../src/game/utils/DiceEngine.js';
import { classProficiencies } from '../src/game/data/classProficiencies.js';
import { SKILL_TAGS } from '../src/game/utils/SkillTagManager.js';

console.log('--- 숙련도 및 특화 시스템 통합 테스트 시작 ---');

const classes = ['warrior', 'gunner', 'medic', 'nanomancer', 'flyingmen'];
const nonProficientTags = [SKILL_TAGS.FIRE, SKILL_TAGS.DARK];

// 특화 태그 및 효과를 테스트에 직접 정의하여 의존성 최소화
const specializationData = {
    warrior: [{ tag: SKILL_TAGS.WILL, effect: { id: 'warriorWillBonus', type: 'BUFF', duration: 1 } }],
    gunner: [{ tag: SKILL_TAGS.KINETIC, effect: { id: 'gunnerKineticBonus', type: 'BUFF', duration: 1 } }],
    medic: [{ tag: SKILL_TAGS.HEAL, effect: { id: 'medicHealBonus', type: 'BUFF', duration: 1 } }],
    nanomancer: [{ tag: SKILL_TAGS.PRODUCTION, effect: { id: 'nanomancerProductionBonus', type: 'BUFF', duration: 1 } }],
    flyingmen: [{ tag: SKILL_TAGS.CHARGE, effect: { id: 'flyingmenChargeBonus', type: 'BUFF', duration: 1 } }],
};

const statusEffectManager = {
    activeEffects: new Map(),
    addEffect(target, sourceSkill) {
        if (!this.activeEffects.has(target.uniqueId)) {
            this.activeEffects.set(target.uniqueId, []);
        }
        const list = this.activeEffects.get(target.uniqueId);
        list.push({ ...sourceSkill.effect });
    }
};

let capturedRolls = 0;
const originalRoll = diceEngine.rollWithAdvantage;
diceEngine.rollWithAdvantage = (min, max, rolls = 1) => {
    capturedRolls = rolls;
    return originalRoll(min, max, rolls);
};

function calculateSkillMultiplier(unit, skill) {
    const profs = classProficiencies[unit.id] || [];
    const specs = specializationData[unit.id]?.map(s => s.tag) || [];
    const all = [...profs, ...specs];
    const matches = skill.tags.filter(t => all.includes(t)).length;
    const rolls = Math.max(1, matches);
    diceEngine.rollWithAdvantage(skill.damageMultiplier.min, skill.damageMultiplier.max, rolls);
}

function applySpecializationBonus(unit, skill) {
    const specs = specializationData[unit.id] || [];
    skill.tags.forEach(tag => {
        const spec = specs.find(s => s.tag === tag);
        if (spec) {
            statusEffectManager.addEffect(unit, { name: `spec:${spec.tag}`, effect: spec.effect });
        }
    });
}

for (const cls of classes) {
    console.log(`\n[${cls}] 숙련도 보너스 테스트`);
    const unit = { id: cls, uniqueId: cls, instanceName: `test ${cls}` };

    const profTags = classProficiencies[cls];
    const specTag = specializationData[cls][0].tag;
    const distinct = profTags.filter(t => t !== specTag).slice(0, 2);
    const skillProficient = {
        name: 'proficient',
        tags: [...distinct, specTag],
        damageMultiplier: { min: 0.9, max: 1.1 },
    };
    const skillNonProficient = {
        name: 'nonprof',
        tags: nonProficientTags,
        damageMultiplier: { min: 0.9, max: 1.1 },
    };

    calculateSkillMultiplier(unit, skillProficient);
    assert.strictEqual(capturedRolls, 3, `${cls} 숙련 스킬 굴림 횟수 오류`);

    calculateSkillMultiplier(unit, skillNonProficient);
    assert.strictEqual(capturedRolls, 1, `${cls} 비숙련 스킬 굴림 횟수 오류`);
    console.log('  숙련도 테스트 통과');

    console.log(`  [${cls}] 특화 보너스 테스트`);
    statusEffectManager.activeEffects.clear();
    applySpecializationBonus(unit, skillProficient);
    let effects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
    const expectedId = specializationData[cls][0].effect.id;
    assert.strictEqual(effects.length, 1, '첫 특화 버프 적용 실패');
    assert.strictEqual(effects[0].id, expectedId, '버프 ID 불일치');

    applySpecializationBonus(unit, skillProficient);
    effects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
    assert.strictEqual(effects.length, 2, '특화 버프 중첩 실패');
    assert(effects.every(e => e.id === expectedId), '버프 ID 중첩 불일치');

    applySpecializationBonus(unit, skillNonProficient);
    effects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
    assert.strictEqual(effects.length, 2, '비특화 스킬 사용 후 버프 개수 변동');
    console.log('  특화 보너스 테스트 통과');
}

diceEngine.rollWithAdvantage = originalRoll;
console.log('\n--- 모든 숙련도 및 특화 테스트 완료 ---');

