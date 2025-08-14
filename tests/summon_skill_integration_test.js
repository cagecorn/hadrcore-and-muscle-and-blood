import assert from 'assert';
import { getSummonBase } from '../src/game/data/summon.js';

const base = getSummonBase('ancestorPeor');
assert(base && base.baseStats.hp === 80);
console.log('Summon skill integration test passed.');
