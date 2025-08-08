import assert from 'assert';
import './setup-indexeddb.js';
import { pathfinderEngine } from '../src/game/utils/PathfinderEngine.js';
import { aiMemoryEngine } from '../src/game/utils/AIMemoryEngine.js';
aiMemoryEngine.initPromise = Promise.resolve();
aiMemoryEngine.getMemory = async () => ({});

// --- 테스트를 위한 Mock 객체 설정 ---
// 실제 게임 엔진 대신 테스트용 가짜 객체를 만들어 사용합니다.
const mockFormationEngine = {
    grid: {
        cells: [],
        getCell(col, row) {
            return this.cells.find(c => c.col === col && c.row === row);
        },
        // 테스트용 그리드를 생성하는 헬퍼 함수
        createMockGrid(cols, rows) {
            this.cells = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    this.cells.push({ col: c, row: r, isOccupied: false });
                }
            }
        }
    }
};

// PathfinderEngine이 formationEngine을 참조하도록 연결합니다.
pathfinderEngine.formationEngine = mockFormationEngine;

// --- 테스트 시작 ---
console.log('--- 플라잉맨 경로 탐색 버그 통합 테스트 시작 ---');

// 1. 테스트 환경 설정
mockFormationEngine.grid.createMockGrid(5, 5);

const flyingman = { id: 'flyingmen', name: '테스트 플라잉맨' };
const warrior = { id: 'warrior', name: '테스트 전사' };

// 유닛 배치: (1,2)에 장애물 유닛을 놓습니다.
mockFormationEngine.grid.getCell(1, 2).isOccupied = true;
// 전사가 우회하지 못하도록 주변 경로를 추가로 차단합니다.
mockFormationEngine.grid.getCell(0, 1).isOccupied = true;
mockFormationEngine.grid.getCell(2, 1).isOccupied = true;
mockFormationEngine.grid.getCell(1, 0).isOccupied = true;
mockFormationEngine.grid.getCell(0, 0).isOccupied = true;
mockFormationEngine.grid.getCell(2, 0).isOccupied = true;

// 2. 테스트 케이스 실행
// 테스트 1: 플라잉맨이 장애물이 있는 (1,2) 칸을 '목표'로 경로를 찾을 수 없는지 확인
const path1 = await pathfinderEngine.findPath(flyingman, { col: 1, row: 1 }, { col: 1, row: 2 });
assert.strictEqual(path1, null, '테스트 1 실패: 플라잉맨이 점유된 칸으로의 경로를 생성했습니다.');
console.log('✅ 테스트 1 통과: 플라잉맨은 점유된 칸에 도착할 수 없습니다.');

// 테스트 2: 플라잉맨이 장애물이 있는 (1,2) 칸을 '통과'하여 (1,3)으로 갈 수 없는지 확인
const path2 = await pathfinderEngine.findPath(flyingman, { col: 1, row: 1 }, { col: 1, row: 3 });
assert.strictEqual(path2, null, '테스트 2 실패: 플라잉맨이 점유된 칸을 통과하는 경로를 생성했습니다.');
console.log('✅ 테스트 2 통과: 플라잉맨은 점유된 칸을 통과할 수 없습니다.');

// 테스트 3: 일반 유닛(전사)이 장애물이 있는 (1,2) 칸을 '통과'할 수 없는지 확인
const path3 = await pathfinderEngine.findPath(warrior, { col: 1, row: 1 }, { col: 1, row: 3 });
assert.strictEqual(path3, null, '테스트 3 실패: 일반 유닛이 점유된 칸을 통과하는 경로를 생성했습니다.');
console.log('✅ 테스트 3 통과: 일반 유닛은 점유된 칸을 통과할 수 없습니다.');

console.log('--- 모든 플라잉맨 경로 탐색 테스트 완료 ---');
