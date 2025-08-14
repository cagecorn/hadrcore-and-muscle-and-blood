import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 게임 내 그리드 시스템을 생성하고 관리하는 엔진
 */
export class GridEngine {
    constructor(scene) {
        this.scene = scene;
        this.gridCells = []; // 그리드 각 칸의 정보를 저장할 배열
        debugLogEngine.log('GridEngine', '그리드 엔진 생성됨.');
    }

    /**
     * 지정된 크기와 위치에 그리드를 생성합니다.
     * @param {number} x - 그리드가 시작될 x 좌표
     * @param {number} y - 그리드가 시작될 y 좌표
     * @param {number} cols - 그리드의 열 개수
     * @param {number} rows - 그리드의 행 개수
     * @param {number} cellWidth - 각 칸의 너비
     * @param {number} cellHeight - 각 칸의 높이
     */
    createGrid({ x, y, cols, rows, cellWidth, cellHeight }) {
        debugLogEngine.log('GridEngine', `${cols}x${rows} 그리드를 생성합니다.`);

        // 디버깅 목적으로 그리드를 시각적으로 표시할 그래픽스 객체
        this.graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00, alpha: 0.5 } });

        this.cols = cols;
        this.rows = rows;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellX = x + col * cellWidth;
                const cellY = y + row * cellHeight;

                // 각 칸의 정보를 객체로 만들어 배열에 저장
                const cell = {
                    x: cellX + cellWidth / 2,
                    y: cellY + cellHeight / 2,
                    width: cellWidth,
                    height: cellHeight,
                    col: col,
                    row: row,
                    isOccupied: false
                };
                this.gridCells.push(cell);

                // 디버깅용 사각형을 그립니다. 나중에 이 부분만 주석 처리하면 보이지 않게 됩니다.
                this.graphics.strokeRect(cellX, cellY, cellWidth, cellHeight);
            }
        }
    }

    /**
     * 특정 열과 행에 해당하는 칸의 정보를 반환합니다.
     * @param {number} col - 찾을 칸의 열
     * @param {number} row - 찾을 칸의 행
     * @returns {object|undefined} 찾은 칸의 정보 객체
     */
    getCell(col, row) {
        return this.gridCells.find(cell => cell.col === col && cell.row === row);
    }
}

