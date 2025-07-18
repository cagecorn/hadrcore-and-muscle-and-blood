import test from 'node:test';
import assert from 'node:assert/strict';
import { TagManager } from '../js/managers/TagManager.js';
import { CLASSES } from '../data/class.js';
import { UNITS } from '../data/unit.js';
import { WARRIOR_SKILLS } from '../data/warriorSkills.js';

const tagManager = new TagManager({});

// Verify warrior class and unit tags
const warriorClass = CLASSES.WARRIOR;
const warriorUnit = UNITS.WARRIOR;

test('Warrior class and unit include warrior tag', () => {
  assert.ok(warriorClass.tags.includes('전사'));
  assert.ok(warriorUnit.tags.includes('전사'));
});

test('All warrior skills have warrior tag and are usable by warrior', () => {
  for (const skill of Object.values(WARRIOR_SKILLS)) {
    assert.ok(skill.tags.includes('전사'));
    assert.deepEqual(skill.requiredUserTags, ['전사']);
    assert.ok(tagManager.canUseSkill(warriorClass, skill));
  }
});
