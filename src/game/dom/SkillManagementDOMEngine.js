import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { UnitDetailDOM } from './UnitDetailDOM.js';
import { SkillTooltipManager } from './SkillTooltipManager.js';
import { skillModifierEngine } from '../utils/SkillModifierEngine.js';
// ✨ SKILL_TAGS를 import하여 'SPECIAL' 태그를 확인할 수 있게 합니다.
import { SKILL_TAGS } from '../utils/SkillTagManager.js';
import { mercenaryCardSelector } from '../utils/MercenaryCardSelector.js';
import { mercenaryData } from '../data/mercenaries.js';
import { placeholderManager } from '../utils/PlaceholderManager.js';

export class SkillManagementDOMEngine {
    constructor(scene) {
        this.scene = scene;
        this.container = document.getElementById('skill-management-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'skill-management-container';
            document.getElementById('app').appendChild(this.container);
        }

        this.selectedMercenaryData = null;
        this.draggedData = null;
        // 현재 필터 상태 (기본값: 전체)
        this.currentFilter = { type: 'all', value: null };

        this.createView();
    }

    createView() {
        this.container.style.display = 'block';
        this.container.style.backgroundImage = 'url(assets/images/territory/skills-scene.png)';

        const mainLayout = document.createElement('div');
        mainLayout.id = 'skill-main-layout';
        this.container.appendChild(mainLayout);

        const listPanel = this.createPanel('skill-list-panel', '출정 용병');
        mainLayout.appendChild(listPanel);
        this.mercenaryListContent = listPanel.querySelector('.panel-content');

        const detailsPanel = this.createPanel('skill-details-panel', '용병 스킬 슬롯');
        mainLayout.appendChild(detailsPanel);
        this.mercenaryDetailsContent = detailsPanel.querySelector('.panel-content');

        const inventoryPanel = this.createPanel('skill-inventory-panel', '스킬 카드 인벤토리');
        mainLayout.appendChild(inventoryPanel);

        // 필터 탭 영역을 생성합니다.
        this.createFilterTabs(inventoryPanel);

        this.skillInventoryContent = inventoryPanel.querySelector('.panel-content');

        this.skillInventoryContent.ondragover = e => e.preventDefault();
        this.skillInventoryContent.ondrop = e => this.onDropOnInventory(e);

        this.populateMercenaryList();
        this.refreshSkillInventory();

        const backButton = document.createElement('div');
        backButton.id = 'skill-back-button';
        backButton.innerText = '← 영지로';
        backButton.onclick = () => this.scene.scene.start('TerritoryScene');

        // --- ▼ [신규] 전원 자동장착 버튼 추가 ▼ ---
        const autoEquipButton = document.createElement('div');
        autoEquipButton.id = 'auto-equip-all-button';
        autoEquipButton.innerText = '[ 전원 자동장착 ]';
        Object.assign(autoEquipButton.style, {
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 15px',
            backgroundColor: 'rgba(240, 230, 140, 0.8)',
            color: '#333',
            border: '1px solid #f0e68c',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: '100'
        });

        autoEquipButton.onclick = () => {
            this.autoEquipAllSkills();
            alert('모든 용병의 스킬이 MBTI 성향에 따라 자동 장착되었습니다.');
        };
        this.container.appendChild(autoEquipButton);
        // --- ▲ [신규] 전원 자동장착 버튼 추가 ▲ ---

        this.container.appendChild(backButton);
    }

    // 인벤토리 필터 탭 생성
    createFilterTabs(parentPanel) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'skill-filter-tabs-container';

        const createTab = (text, type, value) => {
            const tab = document.createElement('button');
            tab.innerText = text;
            tab.className = 'skill-filter-tab';
            tab.onclick = () => {
                this.currentFilter = { type, value };
                this.refreshSkillInventory();

                filterContainer.querySelectorAll('.skill-filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            };
            return tab;
        };

        const allTab = createTab('전체', 'all', null);
        allTab.classList.add('active');
        filterContainer.appendChild(allTab);

        filterContainer.appendChild(createTab('전사', 'class', 'warrior'));
        filterContainer.appendChild(createTab('거너', 'class', 'gunner'));
        filterContainer.appendChild(createTab('메딕', 'class', 'medic'));

        filterContainer.appendChild(createTab('노멀', 'grade', 'NORMAL'));
        filterContainer.appendChild(createTab('레어', 'grade', 'RARE'));
        filterContainer.appendChild(createTab('에픽', 'grade', 'EPIC'));
        filterContainer.appendChild(createTab('레전더리', 'grade', 'LEGENDARY'));

        parentPanel.insertBefore(filterContainer, parentPanel.querySelector('.panel-content'));
    }

    createPanel(id, title) {
        const panel = document.createElement('div');
        panel.id = id;
        panel.className = 'skill-panel';
        panel.appendChild(Object.assign(document.createElement('div'), { className: 'panel-title', innerText: title }));
        panel.appendChild(Object.assign(document.createElement('div'), { className: 'panel-content' }));
        return panel;
    }

    populateMercenaryList() {
        this.mercenaryListContent.innerHTML = '';
        const partyMembers = partyEngine.getPartyMembers().filter(id => id !== undefined);
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();

        partyMembers.forEach(id => {
            const merc = allMercs.find(m => m.uniqueId === id);
            if (merc) {
                const item = document.createElement('div');
                item.className = 'merc-list-item';
                item.innerText = merc.instanceName;
                item.dataset.mercId = merc.uniqueId;
                item.onclick = () => this.selectMercenary(merc);
                this.mercenaryListContent.appendChild(item);
            }
        });

        if (partyMembers.length > 0) {
            const first = allMercs.find(m => m.uniqueId === partyMembers[0]);
            if (first) this.selectMercenary(first);
        }
    }

    selectMercenary(mercData) {
        this.selectedMercenaryData = mercData;

        const selected = this.mercenaryListContent.querySelector('.selected');
        if (selected) selected.classList.remove('selected');
        const newSelected = this.mercenaryListContent.querySelector(`[data-merc-id='${mercData.uniqueId}']`);
        if (newSelected) newSelected.classList.add('selected');

        this.refreshMercenaryDetails();
    }

    refreshMercenaryDetails() {
        if (!this.selectedMercenaryData) {
            this.mercenaryDetailsContent.innerHTML = '<p>용병을 선택하세요.</p>';
            return;
        }

        const mercData = this.selectedMercenaryData;
        this.mercenaryDetailsContent.innerHTML = '';

        const portrait = document.createElement('div');
        portrait.className = 'merc-portrait-small';
        portrait.style.backgroundImage = `url(${mercData.uiImage})`;
        portrait.onclick = () => document.body.appendChild(UnitDetailDOM.create(mercData));
        this.mercenaryDetailsContent.appendChild(portrait);

        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'merc-skill-slots-container-vertical';

        const mainSkillsSection = document.createElement('div');
        mainSkillsSection.innerHTML = `<div class="section-title-small">주스킬</div>`;
        const mainSlotsContainer = document.createElement('div');
        mainSlotsContainer.className = 'merc-skill-slots-container';
        mainSkillsSection.appendChild(mainSlotsContainer);

        const specialSkillsSection = document.createElement('div');
        specialSkillsSection.innerHTML = `<div class="section-title-small">특수스킬</div>`;
        const specialSlotsContainer = document.createElement('div');
        specialSlotsContainer.className = 'merc-skill-slots-container';
        specialSkillsSection.appendChild(specialSlotsContainer);

        slotsContainer.appendChild(mainSkillsSection);
        slotsContainer.appendChild(specialSkillsSection);

        const equipped = ownedSkillsManager.getEquippedSkills(mercData.uniqueId);

        mercData.skillSlots.forEach((slotType, idx) => {
            const slot = this.createSkillSlotElement(slotType, idx, equipped[idx]);
            if (idx < 4) {
                mainSlotsContainer.appendChild(slot);
            } else {
                specialSlotsContainer.appendChild(slot);
            }
        });

        this.mercenaryDetailsContent.appendChild(slotsContainer);
    }

    createSkillSlotElement(slotType, index, instanceId) {
        const slot = document.createElement('div');
        // ✨ 슬롯 타입에 관계없이 동일한 스타일을 사용합니다.
        slot.className = `merc-skill-slot`;
        slot.dataset.slotIndex = index;

        // MBTI 알파벳 표시
        if (index < 4 && this.selectedMercenaryData && this.selectedMercenaryData.mbti) {
            const mbti = this.selectedMercenaryData.mbti;
            const mbtiString =
                (mbti.E > mbti.I ? 'E' : 'I') +
                (mbti.S > mbti.N ? 'S' : 'N') +
                (mbti.T > mbti.F ? 'T' : 'F') +
                (mbti.J > mbti.P ? 'J' : 'P');

            const mbtiIndicator = document.createElement('div');
            mbtiIndicator.className = 'mbti-slot-indicator';
            mbtiIndicator.innerText = mbtiString[index];
            slot.appendChild(mbtiIndicator);
        }

        if (instanceId) {
            const instanceData = skillInventoryManager.getInstanceData(instanceId);
            const baseSkillData = skillInventoryManager.getSkillData(instanceData.skillId, instanceData.grade);
            const modifiedSkill = skillModifierEngine.getModifiedSkill(baseSkillData, index + 1, instanceData.grade);

            // 등급별 테두리 클래스를 부여합니다.
            slot.classList.add(`grade-${instanceData.grade.toLowerCase()}`);

            slot.style.backgroundImage = `url(${placeholderManager.getPath(modifiedSkill.illustrationPath)})`;
            slot.dataset.instanceId = instanceId;
            slot.draggable = true;
            slot.ondragstart = e => this.onDragStart(e, { source: 'slot', instanceId, slotIndex: index });
            // ✨ [핵심 변경] 툴팁 표시에 현재 용병 데이터를 전달합니다.
            slot.onmouseenter = e => SkillTooltipManager.show(modifiedSkill, e, instanceData.grade, this.selectedMercenaryData);
            slot.onmouseleave = () => SkillTooltipManager.hide();

            // 등급에 따른 별 표시
            const gradeMap = { NORMAL: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 };
            const starsContainer = document.createElement('div');
            starsContainer.className = 'grade-stars';
            const starCount = gradeMap[instanceData.grade] || 1;
            for (let i = 0; i < starCount; i++) {
                const starImg = document.createElement('img');
                starImg.src = 'assets/images/territory/skill-card-star.png';
                starsContainer.appendChild(starImg);
            }
            slot.appendChild(starsContainer);
        } else {
            slot.style.backgroundImage = 'url(assets/images/skills/skill-slot.png)';
        }

        slot.ondragover = e => e.preventDefault();
        slot.ondrop = e => this.onDropOnSlot(e);


        return slot;
    }

    refreshSkillInventory() {
        this.skillInventoryContent.innerHTML = '';
        const gradeMap = { 'NORMAL': 1, 'RARE': 2, 'EPIC': 3, 'LEGENDARY': 4 };

        let inventory = skillInventoryManager.getInventory();

        // 현재 선택된 필터에 따라 인벤토리를 필터링합니다.
        if (this.currentFilter.type === 'class') {
            inventory = inventory.filter(instance => {
                const data = skillInventoryManager.getSkillData(instance.skillId, instance.grade);
                if (!data.requiredClass) return true;
                const required = Array.isArray(data.requiredClass) ? data.requiredClass : [data.requiredClass];
                return required.includes(this.currentFilter.value);
            });
        } else if (this.currentFilter.type === 'grade') {
            inventory = inventory.filter(instance => instance.grade === this.currentFilter.value);
        }

        inventory.forEach(instance => {
            const data = skillInventoryManager.getSkillData(instance.skillId, instance.grade);
            if (!data) return;
            const card = document.createElement('div');
            card.className = `skill-inventory-card ${data.type.toLowerCase()}-card grade-${instance.grade.toLowerCase()}`;

            // --- ▼ [신규] 장착 불가 카드 시각적 처리 ▼ ---
            if (this.selectedMercenaryData && data.requiredClass) {
                const required = Array.isArray(data.requiredClass) ? data.requiredClass : [data.requiredClass];
                if (!required.includes(this.selectedMercenaryData.id)) {
                    card.classList.add('unusable-card');
                }
            }
            // --- ▲ [신규] 장착 불가 카드 시각적 처리 ▲ ---

            card.style.backgroundImage = `url(${placeholderManager.getPath(data.illustrationPath)})`;
            card.draggable = true;
            card.dataset.instanceId = instance.instanceId;
            card.ondragstart = e => this.onDragStart(e, { source: 'inventory', instanceId: instance.instanceId });
            // ✨ [핵심 변경] 툴팁 표시에 현재 용병 데이터를 전달합니다.
            card.onmouseenter = e => SkillTooltipManager.show(data, e, instance.grade, this.selectedMercenaryData);
            card.onmouseleave = () => SkillTooltipManager.hide();

            const starsContainer = document.createElement('div');
            starsContainer.className = 'grade-stars';
            const starCount = gradeMap[instance.grade] || 1;
            for (let i = 0; i < starCount; i++) {
                const starImg = document.createElement('img');
                starImg.src = 'assets/images/territory/skill-card-star.png';
                starsContainer.appendChild(starImg);
            }
            card.appendChild(starsContainer);
            this.skillInventoryContent.appendChild(card);
        });
    }

    onDragStart(event, data) {
        this.draggedData = data;
        event.dataTransfer.setData('text/plain', data.instanceId);
    }

    onDropOnSlot(event) {
        event.preventDefault();
        if (!this.selectedMercenaryData || !this.draggedData) return;

        const targetSlot = event.currentTarget;
        const targetSlotIndex = parseInt(targetSlot.dataset.slotIndex);
        const targetInstanceId = targetSlot.dataset.instanceId ? parseInt(targetSlot.dataset.instanceId) : null;

        const unitId = this.selectedMercenaryData.uniqueId;
        const draggedInstanceId = this.draggedData.instanceId;
        const draggedInstanceData = skillInventoryManager.getInstanceData(draggedInstanceId);
        const draggedSkillData = skillInventoryManager.getSkillData(draggedInstanceData.skillId, draggedInstanceData.grade);

        // --- ▼ [신규] 클래스 전용 스킬 장착 제한 로직 (수정) ▼ ---
        if (draggedSkillData.requiredClass) {
            const required = Array.isArray(draggedSkillData.requiredClass) ? draggedSkillData.requiredClass : [draggedSkillData.requiredClass];
            if (!required.includes(this.selectedMercenaryData.id)) {
                const classNames = required.map(id => mercenaryData[id].name).join(', ');
                alert(`[${draggedSkillData.name}] 스킬은 [${classNames}] 전용 스킬입니다.`);
                return;
            }
        }
        // --- ▲ [신규] 클래스 전용 스킬 장착 제한 로직 (수정) ▲ ---

        // --- ▼ 중복 착용 방지 로직 추가 ▼ ---
        if (this.draggedData.source === 'inventory') {
            if (ownedSkillsManager.hasSkillId(unitId, draggedInstanceData.skillId)) {
                alert('이미 동일한 종류의 스킬을 장착하고 있습니다.');
                return;
            }
        }
        // --- ▲ 중복 착용 방지 로직 추가 ▲ ---

        // ✨ [추가] 스킬 장착 규칙 검사
        const isSpecialSkill = draggedSkillData.tags.includes(SKILL_TAGS.SPECIAL);
        const isSpecialSlot = targetSlotIndex >= 4;

        if (isSpecialSkill && !isSpecialSlot) {
            alert('특수 스킬은 5~8번(특수) 슬롯에만 장착할 수 있습니다.');
            return;
        }
        if (!isSpecialSkill && isSpecialSlot) {
            alert('일반 스킬은 특수 스킬 슬롯에 장착할 수 없습니다.');
            return;
        }

        if (this.draggedData.source === 'inventory') {
            ownedSkillsManager.equipSkill(unitId, targetSlotIndex, draggedInstanceId);
            // 인벤토리 목록에서만 제거하여 장착 후에도 스킬 데이터를 참조할 수 있게 합니다.
            skillInventoryManager.removeSkillFromInventoryList(draggedInstanceId);
            if (targetInstanceId) {
                ownedSkillsManager.equipSkill(unitId, targetSlotIndex, draggedInstanceId);
                this.addSkillToInventory(targetInstanceId);
            }
        } else if (this.draggedData.source === 'slot') {
            const sourceSlotIndex = this.draggedData.slotIndex;
            ownedSkillsManager.equipSkill(unitId, targetSlotIndex, draggedInstanceId);
            ownedSkillsManager.equipSkill(unitId, sourceSlotIndex, targetInstanceId);
        }

        this.refreshAll();
    }

    onDropOnInventory(event) {
        event.preventDefault();
        if (!this.selectedMercenaryData || !this.draggedData || this.draggedData.source !== 'slot') return;

        const unitId = this.selectedMercenaryData.uniqueId;
        const sourceSlotIndex = this.draggedData.slotIndex;
        const instanceId = this.draggedData.instanceId;

        ownedSkillsManager.unequipSkill(unitId, sourceSlotIndex);
        this.addSkillToInventory(instanceId);

        this.refreshAll();
    }

    addSkillToInventory(instanceId) {
        const inst = skillInventoryManager.getInstanceData(instanceId);
        if (inst) {
            skillInventoryManager.skillInventory.push({ instanceId, skillId: inst.skillId, grade: inst.grade });
            skillInventoryManager.skillInventory.sort((a, b) => a.instanceId - b.instanceId);
        }
    }

    refreshAll() {
        this.refreshMercenaryDetails();
        this.refreshSkillInventory();
        this.draggedData = null;
    }

    // --- ▼ [신규] 전원 자동 장착 메소드 추가 ▼ ---
    autoEquipAllSkills() {
        const partyMembers = partyEngine.getPartyMembers().filter(id => id !== undefined);
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();
        let availableCards = [...skillInventoryManager.getInventory()];

        allMercs.forEach(merc => {
            const equipped = ownedSkillsManager.getEquippedSkills(merc.uniqueId);
            equipped.forEach((instanceId, index) => {
                if (instanceId) {
                    ownedSkillsManager.unequipSkill(merc.uniqueId, index);
                    this.addSkillToInventory(instanceId);
                }
            });
        });
        availableCards = [...skillInventoryManager.getInventory()];

        partyMembers.forEach(id => {
            const merc = allMercs.find(m => m.uniqueId === id);
            if (!merc) return;

            const { selectedCards, remainingCards } = mercenaryCardSelector.selectCardsForMercenary(merc, availableCards);

            selectedCards.forEach((cardInstance, index) => {
                ownedSkillsManager.equipSkill(merc.uniqueId, index, cardInstance.instanceId);
            });
            availableCards = remainingCards;
        });

        skillInventoryManager.skillInventory = availableCards;

        this.refreshAll();
    }
    // --- ▲ [신규] 전원 자동 장착 메소드 추가 ▲ ---

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}
