import assert from 'assert';
import { mercenaryData } from '../src/game/data/mercenaries.js';
import { statEngine } from '../src/game/utils/StatEngine.js';

const warrior = mercenaryData.warrior;
const gunner = mercenaryData.gunner;
const medic = mercenaryData.medic;

assert.strictEqual(statEngine.calculateStats(warrior, warrior.baseStats, []).movement, 3);
assert.strictEqual(statEngine.calculateStats(gunner, gunner.baseStats, []).movement, 3);
assert.strictEqual(statEngine.calculateStats(medic, medic.baseStats, []).movement, 2);

console.log('Movement stat tests passed.');
