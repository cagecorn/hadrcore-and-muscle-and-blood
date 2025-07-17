import test from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../js/GameLoop.js';

// Basic unit test to ensure GameLoop constructs properly

test('GameLoop initializes correctly', () => {
  const loop = new GameLoop(() => {}, () => {});
  assert.equal(loop.isRunning, false);
  assert.equal(typeof loop.update, 'function');
  assert.equal(typeof loop.draw, 'function');
});
