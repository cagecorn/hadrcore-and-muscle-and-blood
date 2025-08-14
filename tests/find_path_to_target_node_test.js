import assert from 'assert';
import './setup-indexeddb.js';
import FindPathToTargetNode from '../src/ai/nodes/FindPathToTargetNode.js';
import Blackboard from '../src/ai/Blackboard.js';

const mockPathfinderEngine = {
    async findPath() {
        return {}; // 잘못된 경로 형식 시뮬레이션
    }
};

const mockFormationEngine = {
    grid: {
        rows: 3,
        cols: 3,
        getCell(col, row) {
            return { col, row, isOccupied: false };
        }
    }
};

const node = new FindPathToTargetNode({ pathfinderEngine: mockPathfinderEngine, formationEngine: mockFormationEngine });

const unit = { gridX: 0, gridY: 1, finalStats: { attackRange: 1 }, instanceName: '테스트유닛' };
const target = { gridX: 2, gridY: 1, instanceName: '목표유닛' };

const blackboard = new Blackboard();
blackboard.set('currentTargetUnit', target);

const result = await node.evaluate(unit, blackboard);
const path = blackboard.get('movementPath');

assert.strictEqual(result, 'SUCCESS');
assert.ok(Array.isArray(path) && path.length === 1 && path[0].col === 1 && path[0].row === 1);

console.log('✅ FindPathToTargetNode fallback path test passed');
