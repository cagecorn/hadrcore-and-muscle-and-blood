import { mercenaryEngine } from '../utils/MercenaryEngine.js';
// ✨ [변경] statEngine 대신 UnitDetailDOM을 import 합니다.
import { UnitDetailDOM } from './UnitDetailDOM.js';

/**
 * 파티 관리 화면의 DOM 요소를 생성하고 관리하는 엔진
 */
export class PartyDOMEngine {
    constructor(scene, domEngine) {
        this.scene = scene;
        this.domEngine = domEngine;
        this.container = document.getElementById('party-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'party-container';
            document.getElementById('app').appendChild(this.container);
        }
        this.activeGrid = null;
        this.reserveGrid = null;
        this.unitDetailView = null;

        this.container.style.display = 'block';

        this.createGrid();
        this.addBackButton();
    }

    createGrid() {
        const wrapper = document.createElement('div');
        wrapper.id = 'party-grid';
        this.container.appendChild(wrapper);

        this.activeGrid = document.createElement('div');
        this.activeGrid.id = 'party-active-grid';
        wrapper.appendChild(this.activeGrid);

        this.reserveGrid = document.createElement('div');
        this.reserveGrid.id = 'party-reserve-grid';
        wrapper.appendChild(this.reserveGrid);

        this.reserveGrid.addEventListener('dragover', (e) => e.preventDefault());
        this.reserveGrid.addEventListener('drop', (e) => {
            const unitId = parseInt(e.dataTransfer.getData('text/plain'));
            partyEngine.removePartyMember(unitId);
            this.refresh();
        });

        this.refresh();
    }

    renderPartyMembers() {
        const partyMembers = mercenaryEngine.getPartyMembers();
        const allMercenaries = mercenaryEngine.getAllAlliedMercenaries();

        this.activeGrid.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const slot = document.createElement('div');
            slot.className = 'party-slot';
            slot.dataset.index = i;
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                const unitId = parseInt(e.dataTransfer.getData('text/plain'));
                partyEngine.setPartyMember(i, unitId);
                this.refresh();
            });

            const img = document.createElement('div');
            img.className = 'party-slot-image';

            const unitId = partyMembers[i];
            let unitData = null;
            if (unitId) {
                unitData = allMercenaries.find(m => m.uniqueId === unitId);
                if (unitData) {
                    img.style.backgroundImage = `url(${unitData.uiImage})`;
                    img.addEventListener('click', () => this.showUnitDetails(unitData));
                    img.draggable = true;
                    img.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', unitData.uniqueId);
                    });
                }
            }

            const label = document.createElement('div');
            label.className = 'slot-name';
            label.innerText = unitData ? (unitData.instanceName || unitData.name) : '';

            slot.appendChild(img);
            slot.appendChild(label);
            this.activeGrid.appendChild(slot);
        }
    }

    renderReserveMembers() {
        const partyMembers = mercenaryEngine.getPartyMembers();
        const allMercenaries = mercenaryEngine.getAllAlliedMercenaries();
        const reserveUnits = allMercenaries.filter(m => !partyMembers.includes(m.uniqueId));

        this.reserveGrid.innerHTML = '';
        reserveUnits.forEach(unitData => {
            const unitDiv = document.createElement('div');
            unitDiv.className = 'reserve-unit';
            unitDiv.draggable = true;
            unitDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', unitData.uniqueId);
            });

            const img = document.createElement('div');
            img.className = 'reserve-image';
            img.style.backgroundImage = `url(${unitData.uiImage})`;
            img.addEventListener('click', () => this.showUnitDetails(unitData));

            const label = document.createElement('div');
            label.className = 'slot-name';
            label.innerText = unitData.instanceName || unitData.name;

            unitDiv.appendChild(img);
            unitDiv.appendChild(label);
            this.reserveGrid.appendChild(unitDiv);
        });
    }

    refresh() {
        this.renderPartyMembers();
        this.renderReserveMembers();
    }

    addBackButton() {
        const backButton = document.createElement('div');
        backButton.id = 'party-back-button';
        backButton.innerText = '←';
        backButton.addEventListener('click', () => {
            this.hide();
            this.scene.scene.start('TerritoryScene');
        });
        this.container.appendChild(backButton);
    }

    showUnitDetails(unitData) {
        if (this.unitDetailView) this.unitDetailView.remove();

        this.unitDetailView = UnitDetailDOM.create(unitData);
        this.container.appendChild(this.unitDetailView);

        // ✨ [추가] DOM에 추가한 후 'visible' 클래스를 추가하여 fade-in 애니메이션을 트리거합니다.
        // requestAnimationFrame을 사용하여 브라우저가 요소를 렌더링할 시간을 줍니다.
        requestAnimationFrame(() => {
            this.unitDetailView.classList.add('visible');
        });
    }

    hideUnitDetails() {
        if (this.unitDetailView) {
            this.unitDetailView.remove();
            this.unitDetailView = null;
        }
    }

    hide() {
        this.container.style.display = 'none';
    }

    destroy() {
        if (this.unitDetailView) this.unitDetailView.remove();
        this.container.innerHTML = '';
        this.hide();
    }
}
