import test from 'node:test';
import assert from 'node:assert/strict';
import { SkillIconManager } from '../js/managers/SkillIconManager.js';

class ImageMock {
  constructor() { this._src = ''; }
  set src(value) { this._src = value; }
  get src() { return this._src; }
}

test('SkillIconManager returns correct warrior skill icons', async () => {
  global.Image = ImageMock;
  const mockLoader = { loadImage: async (id, url) => ({ src: url }) };
  const sim = new SkillIconManager(mockLoader, {});
  await sim._loadAllIcons();
  const battleCry = sim.getSkillIcon('skill_warrior_battle_cry');
  const stoneSkin = sim.getSkillIcon('skill_warrior_stone_skin');
  assert.ok(battleCry.src.endsWith('battle_cry.png'));
  assert.ok(stoneSkin.src.endsWith('stone-skin-icon.png'));
});
