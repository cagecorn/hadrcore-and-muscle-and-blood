import { surveyEngine } from '../utils/SurveyEngine.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { statEngine } from '../utils/StatEngine.js';

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
        this.hireModal = null;
        this.unitDetailView = null; // 유닛 상세 정보창 컨테이너

        // --- 용병 기본 데이터 정의 ---
        this.mercenaries = {
            warrior: {
                id: 'warrior',
                name: '전사',
                hireImage: 'assets/images/territory/warrior-hire.png',
                uiImage: 'assets/images/territory/warrior-ui.png',
                description: '"그는 단 한 사람을 지키기 위해 검을 든다."',
                baseStats: {
                    hp: 120, valor: 10, strength: 15, endurance: 12,
                    agility: 8, intelligence: 5, wisdom: 5, luck: 7
                }
            },
            gunner: {
                id: 'gunner',
                name: '거너',
                hireImage: 'assets/images/territory/gunner-hire.png',
                uiImage: 'assets/images/territory/gunner-ui.png',
                description: '"한 발, 한 발. 신중하게, 그리고 차갑게."',
                baseStats: {
                    hp: 80, valor: 5, strength: 7, endurance: 6,
                    agility: 15, intelligence: 8, wisdom: 10, luck: 12
                }
            }
        };
        this.mercenaryList = Object.values(this.mercenaries);
        this.currentMercenaryIndex = 0;

        this.createGrid();
        this.addBuilding(0, 0, 'tavern-icon', '[여관]');
    }

    // ... createGrid, addBuilding, showTavernView, hideHireModal 등 기존 메소드는 그대로 ...

    showHireModal() {
        // ... 기존 showHireModal 로직 ...

        // --- 수정: 이미지 클릭 시 상세 정보창을 띄우도록 변경 ---
        const mercenaryImage = document.getElementById('mercenary-image');
        mercenaryImage.onclick = () => {
            const currentMercenaryData = this.mercenaryList[this.currentMercenaryIndex];
            this.showUnitDetails(currentMercenaryData);
        };

        // ...
    }

    changeMercenary(direction) {
        this.currentMercenaryIndex += direction;

        if (this.currentMercenaryIndex >= this.mercenaryList.length) {
            this.currentMercenaryIndex = 0;
        } else if (this.currentMercenaryIndex < 0) {
            this.currentMercenaryIndex = this.mercenaryList.length - 1;
        }

        this.updateMercenaryImage();
    }

    updateMercenaryImage() {
        const mercenaryImage = document.getElementById('mercenary-image');
        if (mercenaryImage) {
            const newMercenary = this.mercenaryList[this.currentMercenaryIndex];
            mercenaryImage.src = newMercenary.hireImage;
            mercenaryImage.alt = newMercenary.name;
        }
    }

    /**
     * 유닛 상세 정보 UI를 생성하고 표시합니다.
     * @param {object} unitData - 표시할 유닛의 데이터 (this.mercenaries 객체 중 하나)
     */
    showUnitDetails(unitData) {
        if (this.unitDetailView) this.unitDetailView.remove();

        // 1. StatEngine을 사용하여 최종 스탯을 계산합니다.
        const finalStats = statEngine.calculateStats(unitData, unitData.baseStats, []);

        // 2. UI 레이아웃을 동적으로 생성합니다.
        this.unitDetailView = document.createElement('div');
        this.unitDetailView.id = 'unit-detail-overlay';
        this.unitDetailView.onclick = (e) => { // 오버레이 클릭 시 닫기
            if (e.target.id === 'unit-detail-overlay') {
                this.hideUnitDetails();
            }
        };

        const detailPane = document.createElement('div');
        detailPane.id = 'unit-detail-pane';

        // 헤더 (이름, 레벨)
        detailPane.innerHTML += `
            <div class="detail-header">
                <span class="unit-name">no.001 ${unitData.name}</span>
                <span class="unit-level">Lv. 1</span>
            </div>
            <div id="unit-detail-close" onclick="this.closest('#unit-detail-overlay').remove()">X</div>
        `;

        // 컨텐츠 (초상화, 스탯, 장비 등)
        const detailContent = document.createElement('div');
        detailContent.className = 'detail-content';

        const leftSection = document.createElement('div');
        leftSection.className = 'detail-section left';
        leftSection.innerHTML = `
            <div class="unit-portrait" style="background-image: url(${unitData.uiImage})"></div>
            <div class="unit-description">"${unitData.description}"</div>
        `;

        const rightSection = document.createElement('div');
        rightSection.className = 'detail-section right';
        rightSection.innerHTML = `
            <div class="stats-grid">
                <div class="section-title">스탯</div>
                <div class="stat-item"><span>HP</span><span>${finalStats.hp}</span></div>
                <div class="stat-item"><span>용맹</span><span>${finalStats.valor}</span></div>
                <div class="stat-item"><span>힘</span><span>${finalStats.strength}</span></div>
                <div class="stat-item"><span>인내</span><span>${finalStats.endurance}</span></div>
                <div class="stat-item"><span>민첩</span><span>${finalStats.agility}</span></div>
                <div class="stat-item"><span>지능</span><span>${finalStats.intelligence}</span></div>
                <div class="stat-item"><span>지혜</span><span>${finalStats.wisdom}</span></div>
                <div class="stat-item"><span>행운</span><span>${finalStats.luck}</span></div>
            </div>
            <div class="equipment-grid">
                <div class="section-title">장비</div>
                <div class="equip-slot"></div>
                <div class="equip-slot"></div>
                <div class="equip-slot"></div>
                <div class="equip-slot"></div>
                <div class="equip-slot"></div>
            </div>
        `;

        // 푸터 (병종, 스킬)
        const detailFooter = document.createElement('div');
        detailFooter.className = 'detail-footer';
        detailFooter.innerHTML = `
            <div class="unit-class">
                <div class="section-title">병종</div>
                <div class="class-icon"></div>
            </div>
            <div class="unit-skills">
                <div class="section-title">스킬</div>
                <div class="skill-grid">
                    <div class="skill-slot"></div>
                    <div class="skill-slot"></div>
                    <div class="skill-slot"></div>
                </div>
            </div>
        `;

        detailContent.appendChild(leftSection);
        detailContent.appendChild(rightSection);
        detailPane.appendChild(detailContent);
        detailPane.appendChild(detailFooter);
        this.unitDetailView.appendChild(detailPane);
        this.container.appendChild(this.unitDetailView);
    }

    hideUnitDetails() {
        if (this.unitDetailView) {
            this.unitDetailView.remove();
            this.unitDetailView = null;
        }
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
