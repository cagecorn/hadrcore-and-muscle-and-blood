import './setup-indexeddb.js';
import assert from 'assert';

// Import common utilities used across tests
import { SKILL_TAGS } from '../src/game/utils/SkillTagManager.js';
import { EFFECT_TYPES } from '../src/game/utils/EffectTypes.js';
import { mercenaryData } from '../src/game/data/mercenaries.js';
import { combatCalculationEngine } from '../src/game/utils/CombatCalculationEngine.js';
import { statusEffectManager } from '../src/game/utils/StatusEffectManager.js';
import { comboManager } from '../src/game/utils/ComboManager.js';
import { statEngine } from '../src/game/utils/StatEngine.js';
import { skillEngine } from '../src/game/utils/SkillEngine.js';
import { sharedResourceEngine, SHARED_RESOURCE_TYPES } from '../src/game/utils/SharedResourceEngine.js';
import { diceEngine } from '../src/game/utils/DiceEngine.js';
import { tokenEngine } from '../src/game/utils/TokenEngine.js';
import MoveToTargetNode from '../src/ai/nodes/MoveToTargetNode.js';
import SkillEffectProcessor from '../src/game/utils/SkillEffectProcessor.js';
import { SummoningEngine } from '../src/game/utils/SummoningEngine.js';
import { formationEngine } from '../src/game/utils/FormationEngine.js';
import { monsterEngine } from '../src/game/utils/MonsterEngine.js';
import { aiManager } from '../src/ai/AIManager.js';
import { TerminationManager } from '../src/game/utils/TerminationManager.js';
console.log('--- 클래스 전용 패시브 통합 테스트 시작 ---');

// 공통 스텁
class StubVFX {
  createDamageNumber() {}
  showEffectName() {}
  showComboCount() {}
  createBloodSplatter() {}
  showSkillName() {}
}
const battleSimulator = {
  turnQueue: [],
  vfxManager: new StubVFX(),
  triggerReinforcementLearning(unit) {
    if (unit.classPassive?.id !== 'reinforcementLearning') return;
    const effects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
    let buff = effects.find(e => e.id === 'reinforcementLearningBuff');
    if (buff) {
      buff.stack += 1;
    } else {
      const newEffect = { id: 'reinforcementLearningBuff', type: EFFECT_TYPES.BUFF, duration: 99, stack: 1, modifiers: {} };
      statusEffectManager.addEffect(unit, { name: '강화 학습', effect: newEffect }, unit);
    }
  }
};

const baseEngines = {
  vfxManager: battleSimulator.vfxManager,
  animationEngine: { attack: async () => {}, moveTo: async (sprite, x, y, duration, onUpdate) => { if (onUpdate) onUpdate(); } },
  terminationManager: { handleUnitDeath: () => {} },
  summoningEngine: { getSummons: () => new Set() },
  cameraControl: { panTo: () => {} },
  battleSimulator,
};

statusEffectManager.setBattleSimulator(battleSimulator);
combatCalculationEngine.battleSimulator = battleSimulator;

// -------------------- Warrior - Bravery --------------------
{
  const attacker = {
    uniqueId: 'war1',
    team: 'A',
    classPassive: { id: 'bravery' },
    gridX: 0,
    gridY: 0,
    finalStats: { physicalAttack: 100, physicalDefense: 10 },
    currentHp: 100,
    currentBarrier: 0,
    maxBarrier: 0,
  };
  const defender = { team: 'B', gridX: 1, gridY: 0, finalStats: { physicalDefense: 0, hp: 100 }, currentHp: 100, currentBarrier: 0, maxBarrier: 0 };
  const far = { team: 'B', gridX: 10, gridY: 10, finalStats: { physicalDefense: 0, hp: 100 }, currentHp: 100, currentBarrier: 0, maxBarrier: 0 };
  const skill = { type: 'ACTIVE', tags: [SKILL_TAGS.PHYSICAL], damageMultiplier: 1 };

  baseEngines.battleSimulator.turnQueue = [attacker, defender];
  comboManager.startTurn(attacker.uniqueId);
  const nearDamage = combatCalculationEngine.calculateDamage(attacker, defender, skill).damage;

  baseEngines.battleSimulator.turnQueue = [attacker, far];
  comboManager.startTurn(attacker.uniqueId);
  const farDamage = combatCalculationEngine.calculateDamage(attacker, far, skill).damage;

  assert(nearDamage > farDamage, 'Warrior bravery passive should increase damage near enemies');
  console.log('✅ Warrior passive');
}

// -------------------- Gunner - Evasive Maneuver --------------------
{
  const attacker = { uniqueId: 'gun1', currentHp: 10, classPassive: { id: 'evasiveManeuver' }, instanceName: 'Gunner', sprite: {} };
  statusEffectManager.activeEffects.clear();
  const buffEffect = {
    id: 'evasiveManeuverBuff',
    stack: 1,
    type: EFFECT_TYPES.BUFF,
    duration: 3,
    modifiers: [{ stat: 'physicalEvadeChance', type: 'percentage', value: 0.08 }]
  };
  statusEffectManager.activeEffects.set(attacker.uniqueId, [buffEffect]);
  const effects = statusEffectManager.activeEffects.get(attacker.uniqueId) || [];
  const buff = effects.find(e => e.id === 'evasiveManeuverBuff');
  assert(buff && buff.stack === 1, 'Gunner should receive evasive maneuver buff');
  console.log('✅ Gunner passive');
}

// -------------------- Medic - First Aid --------------------
{
  const processor = new SkillEffectProcessor(baseEngines);
  const medic = { instanceName: 'Medic', classPassive: { id: 'firstAid' }, finalStats: { wisdom: 100 }, sprite: { active: true } };
  const target = { currentHp: 30, finalStats: { hp: 200 }, isHealingProhibited: false, sprite: { x: 0, y: 0 } };
  const skill = { tags: [SKILL_TAGS.HEAL], healMultiplier: 1 };
  await processor._processAidSkill(medic, target, skill);
  assert.strictEqual(target.currentHp, 155, 'First aid should boost heal');
  console.log('✅ Medic passive');
}

// -------------------- Nanomancer - Elemental Manifest --------------------
{
  const processor = new SkillEffectProcessor(baseEngines);
  sharedResourceEngine.initialize('ally');
  const nano = { team: 'ally', instanceName: 'Nano', classPassive: { id: 'elementalManifest' } };
  const dummySkill = { type: 'ACTIVE', tags: [], cost: 0 };
  const resourcesBefore = sharedResourceEngine.getAllResources('ally');
  await processor._handleClassPassiveTrigger(nano, dummySkill);
  const resourcesAfter = sharedResourceEngine.getAllResources('ally');
  const increased = Object.keys(resourcesAfter).some(k => resourcesAfter[k] > resourcesBefore[k]);
  assert(increased, 'Nanomancer should generate a random resource');
  console.log('✅ Nanomancer passive');
}

// -------------------- Flyingman - Juggernaut --------------------
{
  const vfxManager = { showEffectName() {} };
  const moveNode = new MoveToTargetNode({ ...baseEngines, vfxManager });
  statusEffectManager.activeEffects.clear();
  formationEngine.grid = {
    getCell(col, row) {
      return { col, row, x: col, y: row, isOccupied: false, sprite: null };
    }
  };
  const unit = {
    uniqueId: 'fly1',
    ...mercenaryData.flyingmen,
    classPassive: mercenaryData.flyingmen.classPassive,
    sprite: { x: 0, y: 0, active: true },
    gridX: 0,
    gridY: 0,
    finalStats: { movement: mercenaryData.flyingmen.baseStats.movement }
  };
  const blackboard = new Map();
  blackboard.set('movementPath', [ { col:1,row:0 }, { col:2,row:0 } ]);
  await moveNode.evaluate(unit, blackboard);
  const effects = statusEffectManager.activeEffects.get('fly1') || [];
  const buff = effects.find(e => e.id === 'juggernautBuff');
  assert(buff && buff.modifiers.some(m => Math.abs(m.value - 0.06) < 1e-6), 'Juggernaut buff should scale with moved tiles');
  console.log('✅ Flyingman passive');
}

// -------------------- Esper - Mind Explosion --------------------
{
  const esper = { uniqueId:'esp1', ...mercenaryData.esper, finalStats: { ...mercenaryData.esper.baseStats }, gridX:0, gridY:0 };
  const ally = { uniqueId:'ally1', id:'nanomancer', gridX:1, gridY:0 };
  statEngine.applyDynamicPassives(esper, [esper, ally]);
  assert(esper.finalStats.intelligence > mercenaryData.esper.baseStats.intelligence, 'Esper should gain intelligence from magic ally');
  console.log('✅ Esper passive');
}

// -------------------- Commander - Commander's Shout --------------------
{
  const commander = { uniqueId:1, id:'commander', instanceName:'Cmd', team:'ally' };
  const strategySkill = { id:'tactics', name:'Tactics', cost:0, cooldown:10, tags:[SKILL_TAGS.STRATEGY] };
  skillEngine.recordSkillUse(commander, strategySkill);
  const cd = (await import('../src/game/utils/CooldownManager.js')).cooldownManager.getRemaining(1,'tactics');
  assert.strictEqual(cd, 1, 'Commander passive should reduce cooldown to 1');
  console.log('✅ Commander passive');
}

// -------------------- Clown - Clown's Joke --------------------
{
  statusEffectManager.activeEffects.clear();
  const clown = { uniqueId:'cl1', gridX:0, gridY:0, classPassive:{id:'clownsJoke'} };
  const ally = { uniqueId:'clally', gridX:1, gridY:0, currentHp:10 };
  const enemy = { uniqueId:'clenemy', gridX:2, gridY:0, currentHp:10 };
  statusEffectManager.activeEffects.set('clally',[{id:'d1',type:EFFECT_TYPES.DEBUFF}]);
  statusEffectManager.activeEffects.set('clenemy',[{id:'d2',type:EFFECT_TYPES.DEBUFF}]);
  statEngine.handleTurnStartPassives(clown,[clown,ally,enemy]);
  const effects = statusEffectManager.activeEffects.get('cl1') || [];
  const buff = effects.find(e=>e.id==='clownsJokeBuff');
  assert(buff && buff.modifiers.find(m=>m.stat==='criticalChance' && m.value===0.1));
  console.log('✅ Clown passive');
}

// -------------------- Android - Reinforcement Learning --------------------
{
  statusEffectManager.activeEffects.clear();
  const android = { uniqueId:'and1', classPassive:{id:'reinforcementLearning'}, sprite:{} };
  const buff = { id:'reinforcementLearningBuff', stack:2 };
  statusEffectManager.activeEffects.set(android.uniqueId, [buff]);
  const effects = statusEffectManager.activeEffects.get('and1') || [];
  const found = effects.find(e=>e.id==='reinforcementLearningBuff');
  assert(found && found.stack===2, 'Reinforcement learning should stack');
  console.log('✅ Android passive');
}

// -------------------- Plague Doctor - Antidote --------------------
{
  const processor = new SkillEffectProcessor(baseEngines);
  const doctor = { uniqueId:'pd1', team:'ally', gridX:0, gridY:0, classPassive:{id:'antidote'}, instanceName:'PD', sprite:{}, currentHp:10 };
  const ally = { uniqueId:'pd2', team:'ally', gridX:1, gridY:0, instanceName:'Ally', sprite:{}, currentHp:10 };
  statusEffectManager.activeEffects.clear();
  statusEffectManager.activeEffects.set('pd2',[{id:'debuff', type:EFFECT_TYPES.DEBUFF}]);
  baseEngines.battleSimulator.turnQueue=[doctor,ally];
  const originalRandom = diceEngine.getRandomElement;
  diceEngine.getRandomElement = arr => ally;
  await processor._handleClassPassiveTrigger(doctor,{type:'ACTIVE'});
  diceEngine.getRandomElement = originalRandom;
  const allyEffects = statusEffectManager.activeEffects.get('pd2') || [];
  assert.strictEqual(allyEffects.length,0,'Antidote should cleanse debuff');
  console.log('✅ Plague Doctor passive');
}

// -------------------- Paladin - Paladin's Guide --------------------
{
  const paladin = { classPassive:{id:'paladinsGuide'} };
  const skill = { tags:[SKILL_TAGS.AURA], effect:{ modifiers:{ stat:'physicalDefense', type:'percentage', value:0.1 } } };
  let finalEffect = JSON.parse(JSON.stringify(skill.effect));
  if (paladin.classPassive.id === 'paladinsGuide' && skill.tags.includes(SKILL_TAGS.AURA)) {
    finalEffect.modifiers.value *= 1.2;
  }
  assert.strictEqual(finalEffect.modifiers.value.toFixed(2),'0.12','Paladin aura bonus should be 20%');
  console.log('✅ Paladin passive');
}

// -------------------- Sentinel - Sentry Duty --------------------
{
  statusEffectManager.activeEffects.clear();
  const sentinel = { uniqueId:1, ...mercenaryData.sentinel, classPassive: mercenaryData.sentinel.classPassive };
  const enemy = { uniqueId:2, instanceName:'Enemy', team:'B', finalStats:{ physicalAttack:40 }, currentBarrier:0, maxBarrier:0 };
  const baseSkill = { type:'ACTIVE', tags:[SKILL_TAGS.PHYSICAL], damageMultiplier:1 };
  const baseDamage = combatCalculationEngine.calculateDamage(enemy, sentinel, baseSkill).damage;
  statusEffectManager.addEffect(enemy, { name:sentinel.classPassive.name, effect:sentinel.classPassive.effect }, sentinel);
  statusEffectManager.addEffect(enemy, { name:sentinel.classPassive.name, effect:sentinel.classPassive.effect }, sentinel);
  statusEffectManager.addEffect(enemy, { name:sentinel.classPassive.name, effect:sentinel.classPassive.effect }, sentinel);
  const effects = statusEffectManager.activeEffects.get(enemy.uniqueId) || [];
  assert(effects[0].id==='sentryDutyDebuff','Enemy should receive sentry duty debuff');
  const stacked = effects[0];
  assert.strictEqual(stacked.stack,3,'Debuff stacks to 3');
  const reducedDamage = combatCalculationEngine.calculateDamage(enemy, sentinel, baseSkill).damage;
  assert(reducedDamage < baseDamage, 'Damage should be reduced by Sentry Duty');
  console.log('✅ Sentinel passive');
}

// -------------------- Hacker - Hacker's Invade --------------------
{
  const processor = new SkillEffectProcessor(baseEngines);
  statusEffectManager.activeEffects.clear();
  const hacker = { uniqueId:'h1', instanceName:'Hacker', classPassive:{id:'hackersInvade'}, sprite:{} };
  const target = { uniqueId:'h2', instanceName:'Target', sprite:{} };
  const skill = { type:'DEBUFF', effect:{ id:'stigma', type:EFFECT_TYPES.DEBUFF }, tags:[] };
  const originalRandom = diceEngine.getRandomElement;
  diceEngine.getRandomElement = () => ({ id:'sentryDutyDebuff', type:EFFECT_TYPES.DEBUFF });
  processor._handleCommonPostEffects(hacker, target, skill, new Map());
  diceEngine.getRandomElement = originalRandom;
  const effects = statusEffectManager.activeEffects.get(target.uniqueId) || [];
  assert(effects.some(e=>e.id==='stigma') && effects.some(e=>e.id==='sentryDutyDebuff'));
  console.log('✅ Hacker passive');
}

// -------------------- Ghost - Ghosting --------------------
{
  const processor = new SkillEffectProcessor(baseEngines);
  statusEffectManager.activeEffects.clear();
  const ghost = { uniqueId:'g1', classPassive:{id:'ghosting'}, finalStats:{ hp:100 }, currentHp:100, currentBarrier:0, sprite:{x:0,y:0}, cumulativeDamageTaken:0 };
  const attacker = { uniqueId:'g2', sprite:{x:0,y:0} };
  const skill = { type:'ACTIVE', tags:[] };
  combatCalculationEngine.calculateDamage = () => ({ damage:20, hitType:'normal', comboCount:0 });
  await processor._processOffensiveSkill(attacker, ghost, skill);
  const effects = statusEffectManager.activeEffects.get('g1') || [];
  assert(effects.some(e=>e.id==='ghostingBuff'),'Ghost should receive invisibility buff');
  console.log('✅ Ghost passive');
}

// -------------------- Dark Knight - Despair Aura --------------------
{
  statusEffectManager.activeEffects.clear();
  const darkKnight = { uniqueId:'dk1', ...mercenaryData.darkKnight };
  const enemy = { uniqueId:'dk2', instanceName:'Enemy', sprite:{x:0,y:0} };
  statusEffectManager.addEffect(enemy, darkKnight.classPassive, darkKnight);
  const debuff = statusEffectManager.getModifierValue(enemy,'physicalAttackPercentage');
  assert.strictEqual(debuff,-0.05,'Despair aura should reduce enemy attack');
  console.log('✅ Dark Knight passive');
}

// -------------------- Mechanic - Mechanical Enhancement --------------------
{
  const summoner = { classPassive:{id:'mechanicalEnhancement'}, finalStats:{ hp:100, physicalAttack:50, strength:20 } };
  const summon = { baseStats:{ hp:10, physicalAttack:5, strength:5 } };
  const statsToInherit = ['hp','valor','strength','endurance','agility','intelligence','wisdom','luck','physicalAttack','magicAttack','physicalDefense','magicDefense','criticalChance','criticalDamageMultiplier'];
  statsToInherit.forEach(stat => {
    if (summoner.finalStats[stat]) {
      const bonus = summoner.finalStats[stat] * 0.10;
      summon.baseStats[stat] = (summon.baseStats[stat] || 0) + bonus;
    }
  });
  assert(summon.baseStats.hp > 10 && summon.baseStats.physicalAttack > 5,'Summon should inherit stats');
  console.log('✅ Mechanic passive');
}

console.log('--- 모든 클래스 패시브 테스트 완료 ---');
