// js/managers/MercenaryPanelManager.js

export class MercenaryPanelManager {
    // 생성자에서 캔버스 요소 대신 필요한 매니저들을 직접 받도록 변경합니다.
    constructor(measureManager, battleSimulationManager, logicManager, eventManager) {
        console.log("\uD83D\uDC65 MercenaryPanelManager initialized. Ready to display mercenary details. \uD83D\uDC65");
        // this.canvas, this.ctx는 이제 더 이상 자체적으로 관리하지 않습니다.
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
        this.logicManager = logicManager;
        this.eventManager = eventManager;

        // MeasureManager에서 그리드 행/열 정보를 가져옴
        this.gridRows = this.measureManager.get('mercenaryPanel.gridRows');
        this.gridCols = this.measureManager.get('mercenaryPanel.gridCols');
        this.numSlots = this.gridRows * this.gridCols;

        console.log("[MercenaryPanelManager] Initialized as a drawing component.");
    }

    /**
     * 용병 패널과 그리드를 그립니다.
     * 이 메서드는 UIEngine에 의해 호출되며, 메인 게임 캔버스의 컨텍스트를 받습니다.
     * @param {CanvasRenderingContext2D} ctx - 메인 게임 캔버스의 2D 렌더링 컨텍스트
     * @param {number} panelX - 패널을 그릴 X 좌표
     * @param {number} panelY - 패널을 그릴 Y 좌표
     * @param {number} panelWidth - 패널의 너비
     * @param {number} panelHeight - 패널의 높이
     */
    draw(ctx, panelX, panelY, panelWidth, panelHeight) {
        // 패널 배경 그리기 (반투명 검은색)
        ctx.clearRect(panelX, panelY, panelWidth, panelHeight); // 기존 내용 지우기
        ctx.fillStyle = 'rgba(26, 26, 26, 0.9)'; // 반투명 배경
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        // 슬롯 크기 재계산 (주어진 패널 크기에 맞게)
        const slotWidth = panelWidth / this.gridCols;
        const slotHeight = panelHeight / this.gridRows;

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;

        // 그리드 선 그리기
        for (let i = 0; i <= this.gridCols; i++) {
            ctx.beginPath();
            ctx.moveTo(panelX + i * slotWidth, panelY);
            ctx.lineTo(panelX + i * slotWidth, panelY + panelHeight);
            ctx.stroke();
        }
        for (let i = 0; i <= this.gridRows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, panelY + i * slotHeight); // 패널 영역 전체에 선을 그림
            ctx.lineTo(panelX + panelWidth, panelY + i * slotHeight);
            ctx.stroke();
        }

        const units = this.battleSimulationManager ? this.battleSimulationManager.unitsOnGrid : [];
        ctx.fillStyle = 'white';
        const unitTextFontSize = Math.floor(slotHeight * this.measureManager.get('mercenaryPanel.unitTextFontSizeRatio'));
        const unitHpFontSize = Math.floor(unitTextFontSize * this.measureManager.get('mercenaryPanel.unitHpFontSizeScale'));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 각 슬롯에 유닛 정보 그리기
        for (let i = 0; i < this.numSlots; i++) {
            const row = Math.floor(i / this.gridCols);
            const col = i % this.gridCols;
            const x = panelX + col * slotWidth + slotWidth / 2;
            const y = panelY + row * slotHeight + slotHeight / 2;

            if (units[i]) {
                const unit = units[i];
                ctx.font = `${unitTextFontSize}px Arial`;
                ctx.fillText(`${unit.name}`, x, y - unitTextFontSize * this.measureManager.get('mercenaryPanel.unitTextOffsetYScale'));

                ctx.font = `${unitHpFontSize}px Arial`;
                ctx.fillText(`HP: ${unit.currentHp}/${unit.baseStats.hp}`, x, y + unitHpFontSize * this.measureManager.get('mercenaryPanel.unitTextOffsetYScale'));

                // ✨ panelImage가 존재하면 우선 사용하고, 없으면 기본 이미지 사용
                const imageToDraw = unit.panelImage || unit.image;
                if (imageToDraw) {
                    const imgSize = Math.min(slotWidth, slotHeight) * this.measureManager.get('mercenaryPanel.unitImageScale');
                    const imgX = panelX + col * slotWidth + (slotWidth - imgSize) / 2;
                    const imgY = panelY + row * slotHeight + (slotHeight - imgSize) / 2 - unitTextFontSize * this.measureManager.get('mercenaryPanel.unitImageOffsetYScale');
                    ctx.drawImage(imageToDraw, imgX, imgY, imgSize, imgSize);
                }
            } else {
                ctx.font = `${unitTextFontSize}px Arial`;
                ctx.fillText(`Slot ${i + 1}`, x, y);
            }
        }
    }
}
