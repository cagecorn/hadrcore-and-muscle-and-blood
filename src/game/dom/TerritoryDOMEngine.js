import { surveyEngine } from '../utils/SurveyEngine.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
// ✨ [변경] PartyDOMEngine의 UnitDetailDOM을 import 합니다.
import { UnitDetailDOM } from './UnitDetailDOM.js';
import { mercenaryData } from '../data/mercenaries.js';

/**
 * 영지 화면의 DOM 요소를 생성하고 관리하는 전용 엔진
 */
export class TerritoryDOMEngine {
    constructor(scene, domEngine) {
        this.scene = scene;
        this.domEngine = domEngine;
        this.container = document.getElementById('territory-container');
        this.grid = null;
        this.tavernView = null;
        this.unitDetailView = null;

        this.mercenaries = mercenaryData;

        this.createGrid();
        this.addBuilding(0, 0, 'tavern-icon', '[여관]');
        // --- 용병 관리 버튼 추가 ---
        this.addPartyManagementButton(1, 0);
        // --- 출정 버튼 추가 ---
        this.addExpeditionButton(2, 0);
        // --- 진형 관리 버튼 추가 ---
        this.addFormationButton(0, 1);
        // --- 스킬 관리 버튼 추가 ---
        this.addSkillManagementButton(1, 1);
        // --- ✨ [신규] 선조 소환 관리 버튼 추가 ---
        this.addSummonManagementButton(2, 1); // 스킬 관리 옆에 배치
        // ✨ [신규] 장비 관리 아이콘을 추가합니다.
        this.addEquipmentManagementButton(1, 2); // 비어있는 (1, 2) 슬롯에 추가
        this.addArenaButton(0, 2); // 아레나 아이콘 추가
        this.addWorldMapButton(2, 2); // 월드맵 아이콘 추가 (비어있는 2,2 위치)
    }

    createGrid() {
        this.grid = document.createElement('div');
        this.grid.id = 'territory-grid';

        const gridConfig = surveyEngine.territoryGrid;
        this.grid.style.gridTemplateColumns = `repeat(${gridConfig.cols}, 1fr)`;
        this.grid.style.gridTemplateRows = `repeat(${gridConfig.rows}, 1fr)`;

        this.container.appendChild(this.grid);
    }

    addBuilding(col, row, iconId, tooltipText) {
        const icon = document.createElement('div');
        icon.className = 'building-icon';
        icon.style.backgroundImage = `url(assets/images/territory/${iconId}.png)`;

        icon.style.gridColumnStart = col + 1;
        icon.style.gridRowStart = row + 1;

        icon.addEventListener('mouseover', (event) => {
            this.domEngine.showTooltip(event.clientX, event.clientY, tooltipText);
        });

        icon.addEventListener('mouseout', () => {
            this.domEngine.hideTooltip();
        });

        icon.addEventListener('click', () => {
            if (iconId === 'tavern-icon') {
                this.showTavernView();
            }
        });

        this.grid.appendChild(icon);
    }

    // --- 새로운 버튼 추가 메소드 ---
    addPartyManagementButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/party-icon.png)`;
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[용병 관리]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            console.log('용병 관리 버튼 클릭');

            // DOM을 파괴하는 대신 영지 컨테이너를 일시적으로 숨깁니다.
            this.container.style.display = 'none';

            this.scene.scene.start('PartyScene');
        });
        this.grid.appendChild(button);
    }

    addExpeditionButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/dungeon-icon.png)`;
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[출정]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.scene.scene.start('DungeonScene');
        });
        this.grid.appendChild(button);
    }

    addFormationButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/formation-icon.png)`;
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[진형]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.scene.scene.start('FormationScene');
        });
        this.grid.appendChild(button);
    }

    addSkillManagementButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/skills-icon.png)`;
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[스킬 관리]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.scene.scene.start('SkillManagementScene');
        });
        this.grid.appendChild(button);
    }

    // ✨ 새로운 버튼 추가 메서드를 만듭니다.
    addSummonManagementButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/summon-icon.png)`; // 새 아이콘 이미지
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[선조 소환]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            // ✨ SummonManagementScene을 시작합니다.
            this.scene.scene.start('SummonManagementScene');
        });
        this.grid.appendChild(button);
    }

    // ✨ [신규] 장비 관리 버튼 추가 메소드
    addEquipmentManagementButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/inventory-icon.png)`;
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[장비 관리]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.scene.scene.start('EquipmentManagementScene');
        });
        this.grid.appendChild(button);
    }

    addArenaButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = 'url(assets/images/territory/arena-icon.png)';
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[아레나]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.scene.scene.start('ArenaScene');
        });
        this.grid.appendChild(button);
    }

    addWorldMapButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        // 월드맵 아이콘 이미지가 필요합니다. 여기서는 임시로 dungeon-icon을 재사용합니다.
        button.style.backgroundImage = 'url(assets/images/territory/dungeon-icon.png)';
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[월드맵]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.scene.scene.start('WorldMapScene');
        });
        this.grid.appendChild(button);
    }

    showTavernView() {
        this.grid.style.display = 'none';

        this.container.style.backgroundImage = `url(assets/images/territory/tavern-scene.png)`;

        this.tavernView = document.createElement('div');
        this.tavernView.id = 'tavern-view';
        this.container.appendChild(this.tavernView);

        const backButton = document.createElement('div');
        backButton.id = 'tavern-back-button';
        backButton.innerText = '←';
        backButton.addEventListener('click', () => {
            this.hideTavernView();
        });
        this.tavernView.appendChild(backButton);

        const tavernGrid = document.createElement('div');
        tavernGrid.id = 'tavern-grid';
        this.tavernView.appendChild(tavernGrid);

        // --- ▼ [신규] 랜덤 12명 고용 버튼 추가 ▼ ---
        const hireRandomButton = document.createElement('div');
        hireRandomButton.className = 'tavern-button';
        hireRandomButton.style.backgroundImage = `url(assets/images/territory/party-icon.png)`;
        hireRandomButton.addEventListener('click', () => {
            const currentParty = partyEngine.getPartyMembers();
            currentParty.forEach(id => {
                if (id !== undefined) {
                    partyEngine.removePartyMember(id);
                }
            });

            const mercenaryTypes = Object.values(this.mercenaries);
            for (let i = 0; i < 12; i++) {
                const randomType = mercenaryTypes[Math.floor(Math.random() * mercenaryTypes.length)];
                mercenaryEngine.hireMercenary(randomType, 'ally');
            }
            alert('랜덤 용병 12명이 고용되어 파티에 자동 추가되었습니다.');
        });
        hireRandomButton.addEventListener('mouseover', (event) => {
            this.domEngine.showTooltip(event.clientX, event.clientY, '[랜덤 12명 고용]');
        });
        hireRandomButton.addEventListener('mouseout', () => {
            this.domEngine.hideTooltip();
        });

        tavernGrid.appendChild(hireRandomButton);
        // --- ▲ [신규] 랜덤 12명 고용 버튼 추가 ▲ ---
    }

    hideTavernView() {
        if (this.tavernView) {
            this.tavernView.remove();
            this.tavernView = null;
        }
        this.container.style.backgroundImage = `url(assets/images/territory/city-1.png)`;
        this.grid.style.display = 'grid';
    }

    showUnitDetails(unitData) {
        if (this.unitDetailView) this.unitDetailView.remove();

        this.unitDetailView = UnitDetailDOM.create(unitData);
        this.container.appendChild(this.unitDetailView);

        // ✨ [추가] fade-in 애니메이션을 트리거합니다.
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

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}
