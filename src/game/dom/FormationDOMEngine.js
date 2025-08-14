import { partyEngine } from '../utils/PartyEngine.js';
import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { formationEngine } from '../utils/FormationEngine.js';

export class FormationDOMEngine {
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

        const backButton = document.createElement('div');
        backButton.id = 'formation-back-button';
        backButton.innerText = '←';
        backButton.addEventListener('click', () => {
            this.hide();
            this.scene.scene.start('TerritoryScene');
        });
        this.container.appendChild(backButton);
    }

    placeUnits() {
        const partyMembers = partyEngine.getPartyMembers();
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();
        const cells = Array.from(this.grid.children).filter(c => c.classList.contains('ally-area'));
        let cellIndex = 0;
        partyMembers.forEach(id => {
            const unit = allMercs.find(m => m.uniqueId === id);
            if (!unit) return;

            let cell = null;
            const savedIndex = formationEngine.getPosition(id);
            if (savedIndex !== undefined) {
                cell = this.grid.querySelector(`[data-index='${savedIndex}']`);
            }
            if (!cell || !cell.classList.contains('ally-area')) {
                cell = cells[cellIndex++];
            }
            if (!cell) return;

            const unitDiv = document.createElement('div');
            unitDiv.className = 'formation-unit';
            unitDiv.dataset.unitId = id;
            // Use the mercenary id to build an explicit path so images load
            // correctly regardless of sprite key configuration.
            unitDiv.style.backgroundImage = `url(assets/images/unit/${unit.id}.png)`;
            unitDiv.draggable = true;
            unitDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('unit-id', id);
                e.dataTransfer.setData('from-cell', unitDiv.parentElement.dataset.index);
            });

            const nameLabel = document.createElement('div');
            nameLabel.className = 'formation-unit-name';
            nameLabel.innerText = unit.instanceName || unit.name;
            unitDiv.appendChild(nameLabel);

            cell.appendChild(unitDiv);
            formationEngine.setPosition(id, parseInt(cell.dataset.index));
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

    hide() {
        this.container.style.display = 'none';
    }

    destroy() {
        this.container.innerHTML = '';
        this.hide();
    }
}
