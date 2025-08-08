import { partyEngine } from '../utils/PartyEngine.js';
import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { formationEngine } from '../utils/FormationEngine.js';
import { arenaManager } from '../utils/ArenaManager.js';
// ✨ UnitDetailDOM을 import하여 게임 내 상세 정보창을 사용합니다.
import { UnitDetailDOM } from './UnitDetailDOM.js';

export class ArenaDOMEngine {
    constructor(scene, domEngine) {
        this.scene = scene;
        this.domEngine = domEngine;
        this.container = document.getElementById('formation-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'formation-container';
            document.getElementById('app').appendChild(this.container);
        }
        this.grid = null;
        this.createView();
    }

    createView() {
        this.container.style.display = 'block';
        this.container.style.backgroundImage = 'url(assets/images/battle/battle-stage-arena.png)';

        const stage = document.createElement('div');
        stage.id = 'formation-stage';
        this.container.appendChild(stage);

        const grid = document.createElement('div');
        grid.id = 'formation-grid';
        this.container.appendChild(grid);
        this.grid = grid;

        const cols = 16;
        const rows = 9;
        let index = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'formation-cell';
                if (c < cols / 2) cell.classList.add('ally-area');
                cell.dataset.index = index++;
                cell.dataset.col = c;
                cell.dataset.row = r;
                cell.addEventListener('dragover', (e) => e.preventDefault());
                cell.addEventListener('drop', (e) => this.handleDrop(e, cell));
                grid.appendChild(cell);
            }
        }

        this.placeUnits();
        this.placeEnemyUnits(); // 적 유닛 배치

        const backButton = document.createElement('div');
        backButton.id = 'formation-back-button';
        backButton.innerText = '← 영지로';
        backButton.addEventListener('click', () => {
            this.hide();
            this.scene.scene.start('TerritoryScene');
        });
        this.container.appendChild(backButton);

        // --- 전투 시작 버튼 추가 ---
        const startBattleButton = document.createElement('div');
        startBattleButton.id = 'start-battle-button';
        startBattleButton.innerText = '[ 전투 시작 ]';
        startBattleButton.style.position = 'absolute';
        startBattleButton.style.top = '20px';
        startBattleButton.style.right = '20px';
        startBattleButton.style.padding = '10px 20px';
        startBattleButton.style.backgroundColor = '#991b1b';
        startBattleButton.style.color = '#fecaca';
        startBattleButton.style.border = '2px solid #7f1d1d';
        startBattleButton.style.borderRadius = '5px';
        startBattleButton.style.cursor = 'pointer';
        startBattleButton.style.fontSize = '18px';
        startBattleButton.style.pointerEvents = 'auto';
        startBattleButton.addEventListener('click', () => {
            this.hide();
            this.scene.scene.start('ArenaBattleScene');
        });
        this.container.appendChild(startBattleButton);
    }

    placeUnits() {
        const partyMembers = partyEngine.getPartyMembers();
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();
        const cells = Array.from(this.grid.children).filter(c => c.classList.contains('ally-area'));

        partyMembers.forEach(id => {
            if (id === undefined) return;
            const unit = allMercs.find(m => m.uniqueId === id);
            if (!unit) return;

            const savedIndex = formationEngine.getPosition(id);
            const cell = this.grid.querySelector(`.formation-cell[data-index='${savedIndex}']`);

            if(cell && !cell.hasChildNodes()) {
                const unitDiv = this.createUnitElement(unit, false);
                cell.appendChild(unitDiv);
            }
        });
    }

    handleDrop(e, targetCell) {
        e.preventDefault();
        if (!targetCell.classList.contains('ally-area')) return;
        const unitId = e.dataTransfer.getData('unit-id');
        const fromIndex = e.dataTransfer.getData('from-cell');
        if (!unitId || fromIndex === '') return;
        const fromCell = this.grid.querySelector(`[data-index='${fromIndex}']`);
        if (!fromCell) return;
        const draggedUnit = fromCell.firstElementChild;
        const targetUnit = targetCell.firstElementChild;
        if (!draggedUnit) return;

        targetCell.appendChild(draggedUnit);
        formationEngine.setPosition(parseInt(unitId), parseInt(targetCell.dataset.index));

        if (targetUnit) {
            fromCell.appendChild(targetUnit);
            const otherId = parseInt(targetUnit.dataset.unitId);
            if (otherId) formationEngine.setPosition(otherId, parseInt(fromCell.dataset.index));
        }
    }

    // ✨ [수정] 적 유닛 배치 로직 수정
    placeEnemyUnits() {
        const enemyTeam = arenaManager.getEnemyTeam();

        enemyTeam.forEach(unit => {
            // 적 유닛의 gridX, gridY를 사용해 올바른 셀 인덱스를 계산합니다.
            const index = unit.gridY * 16 + unit.gridX;
            const cell = this.grid.querySelector(`.formation-cell[data-index='${index}']`);

            // 셀이 존재하고, 아군 진영이 아니고, 비어있는 경우에만 배치합니다.
            if (cell && !cell.classList.contains('ally-area') && !cell.hasChildNodes()) {
                const unitDiv = this.createUnitElement(unit, true);
                cell.appendChild(unitDiv);
            }
        });
    }

    // ✨ [수정] 유닛 DOM 요소를 생성하는 헬퍼 함수 수정
    createUnitElement(unit, isEnemy) {
        const unitDiv = document.createElement('div');
        unitDiv.className = 'formation-unit';
        unitDiv.dataset.unitId = unit.uniqueId;
        unitDiv.style.backgroundImage = `url(assets/images/unit/${unit.id}.png)`;

        if (isEnemy) {
            // ✨ 2. 적 스프라이트 좌우 반전
            unitDiv.style.transform = 'scaleX(-1)';
            unitDiv.style.cursor = 'pointer';

            // ✨ 1. 새 탭 대신 게임 내 상세 정보창을 띄우도록 수정
            unitDiv.addEventListener('click', () => {
                const detailView = UnitDetailDOM.create(unit);
                this.container.appendChild(detailView);
                requestAnimationFrame(() => {
                    detailView.classList.add('visible');
                });
            });
        } else {
            unitDiv.draggable = true;
            unitDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('unit-id', unit.uniqueId);
                e.dataTransfer.setData('from-cell', unitDiv.parentElement.dataset.index);
            });
        }

        const nameLabel = document.createElement('div');
        nameLabel.className = 'formation-unit-name';
        nameLabel.innerText = unit.instanceName || unit.name;
        unitDiv.appendChild(nameLabel);

        return unitDiv;
    }

    hide() {
        this.container.style.display = 'none';
    }

    destroy() {
        this.container.innerHTML = '';
        this.hide();
    }
}
