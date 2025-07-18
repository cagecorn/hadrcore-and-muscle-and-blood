import test from 'node:test';
import assert from 'node:assert/strict';
import { BuffManager } from '../js/managers/BuffManager.js';
import { WARRIOR_SKILLS } from '../data/warriorSkills.js';

const mockDice = { getRandomFloat: () => 0.1 }; // always success
const mockIdManager = { get: async id => WARRIOR_SKILLS[id] };

const buffManager = new BuffManager(mockIdManager, mockDice);

test('BuffManager triggers Stone Skin and removes it from list', async () => {
  const unit = { name: 'tester', skillSlots: ['STONE_SKIN'] };
  const { activatedBuff, remainingSkills } = await buffManager.processBuffSkills(unit);
  assert.equal(activatedBuff.id, WARRIOR_SKILLS.STONE_SKIN.id);
  assert.equal(remainingSkills.length, 0);
});

test('BuffManager leaves non-buff skill for SlotMachineManager', async () => {
  const unit = { name: 'tester', skillSlots: ['DOUBLE_STRIKE'] };
  const { activatedBuff, remainingSkills } = await buffManager.processBuffSkills(unit);
  assert.equal(activatedBuff, null);
  assert.equal(remainingSkills.length, 1);
  assert.equal(remainingSkills[0].id, WARRIOR_SKILLS.DOUBLE_STRIKE.id);
});
