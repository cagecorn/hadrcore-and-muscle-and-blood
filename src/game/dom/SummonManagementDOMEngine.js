import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { UnitDetailDOM } from './UnitDetailDOM.js';
import { SkillTooltipManager } from './SkillTooltipManager.js';
import { skillModifierEngine } from '../utils/SkillModifierEngine.js';
// ✨ SKILL_TAGS를 import합니다.
import { SKILL_TAGS } from '../utils/SkillTagManager.js';

export class SummonManagementDOMEngine {
    constructor(scene) {
        this.scene = scene;
        this.container = document.getElementById('summon-management-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'summon-management-container';
            // ID를 CSS와 일치시키기 위해 skill-management-container 클래스를 사용합니다.
            this.container.className = 'skill-management-container';
            document.getElementById('app').appendChild(this.container);
        }

        this.selectedMercenaryData = null;
        this.draggedData = null;

        this.createView();
    }

    createView() {
        this.container.style.display = 'block';
        // ✨ 새로운 배경 이미지로 설정합니다.
        this.container.style.backgroundImage = 'url(assets/images/territory/summon-scene.png)';

        const mainLayout = document.createElement('div');
        mainLayout.id = 'skill-main-layout';
        this.container.appendChild(mainLayout);

        const listPanel = this.createPanel('skill-list-panel', '출정 용병');
        mainLayout.appendChild(listPanel);
        this.mercenaryListContent = listPanel.querySelector('.panel-content');

        const detailsPanel = this.createPanel('skill-details-panel', '용병 스킬 슬롯');
        mainLayout.appendChild(detailsPanel);
        this.mercenaryDetailsContent = detailsPanel.querySelector('.panel-content');

        // ✨ 패널 제목을 변경합니다.
        const inventoryPanel = this.createPanel('skill-inventory-panel', '선조 소환석 인벤토리');
        mainLayout.appendChild(inventoryPanel);
        this.skillInventoryContent = inventoryPanel.querySelector('.panel-content');

        this.skillInventoryContent.ondragover = e => e.preventDefault();
        this.skillInventoryContent.ondrop = e => this.onDropOnInventory(e);

        this.populateMercenaryList();
        this.refreshSkillInventory();

        const backButton = document.createElement('div');
        backButton.id = 'skill-back-button';
        backButton.innerText = '← 영지로';
        backButton.onclick = () => this.scene.scene.start('TerritoryScene');
        this.container.appendChild(backButton);
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
        slotsContainer.className = 'merc-skill-slots-container';

        const equipped = ownedSkillsManager.getEquippedSkills(mercData.uniqueId);

        mercData.skillSlots.forEach((slotType, idx) => {
            const slot = this.createSkillSlotElement(slotType, idx, equipped[idx]);
            slotsContainer.appendChild(slot);
        });

        this.mercenaryDetailsContent.appendChild(slotsContainer);
    }

    createSkillSlotElement(slotType, index, instanceId) {
        const slot = document.createElement('div');
        // ✨ 소환 슬롯도 타입 제한 없이 동일한 스타일을 사용합니다.
        slot.className = 'merc-skill-slot';
        slot.dataset.slotIndex = index;

        if (instanceId) {
            const instanceData = skillInventoryManager.getInstanceData(instanceId);
            const baseSkillData = skillInventoryManager.getSkillData(instanceData.skillId, instanceData.grade);
            const modifiedSkill = skillModifierEngine.getModifiedSkill(baseSkillData, index + 1, instanceData.grade);

            // 등급별 테두리 클래스를 부여합니다.
            slot.classList.add(`grade-${instanceData.grade.toLowerCase()}`);

            slot.style.backgroundImage = `url(${modifiedSkill.illustrationPath})`;
            slot.dataset.instanceId = instanceId;
            slot.draggable = true;
            slot.ondragstart = e => this.onDragStart(e, { source: 'slot', instanceId, slotIndex: index });
            slot.onmouseenter = e => SkillTooltipManager.show(modifiedSkill, e, instanceData.grade);
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

        const rank = document.createElement('span');
        rank.innerText = `${index + 1} 순위`;
        slot.appendChild(rank);

        return slot;
    }

    refreshSkillInventory() {
        this.skillInventoryContent.innerHTML = '';
        const gradeMap = { 'NORMAL': 1, 'RARE': 2, 'EPIC': 3, 'LEGENDARY': 4 };

        skillInventoryManager.getInventory()
            // ✨ 1. 인벤토리에서 스킬 데이터를 먼저 가져옵니다.
            .map(instance => ({
                instance,
                data: skillInventoryManager.getSkillData(instance.skillId, instance.grade)
            }))
            // ✨ 2. 스킬 타입이 'SUMMON'인 것만 필터링합니다.
            .filter(item => item.data && item.data.type === 'SUMMON')
            .forEach(({ instance, data }) => {
                const card = document.createElement('div');
                card.className = `skill-inventory-card ${data.type.toLowerCase()}-card grade-${instance.grade.toLowerCase()}`;
                card.style.backgroundImage = `url(${data.illustrationPath})`;
                card.draggable = true;
                card.dataset.instanceId = instance.instanceId;
                card.ondragstart = e => this.onDragStart(e, { source: 'inventory', instanceId: instance.instanceId });
                card.onmouseenter = e => SkillTooltipManager.show(data, e, instance.grade);
                card.onmouseleave = () => SkillTooltipManager.hide();

            // 별 생성 컨테이너
            const starsContainer = document.createElement('div');
            starsContainer.className = 'grade-stars';
            const starCount = gradeMap[instance.grade] || 1;
            for (let i = 0; i < starCount; i++) {
                const starImg = document.createElement('img');
                starImg.src = 'assets/images/territory/skill-card-star.png';
                starsContainer.appendChild(starImg);
            }
            card.appendChild(starsContainer);

            // 인벤토리 카드에서는 클래스 태그를 표시하지 않습니다.
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
                // 빈 슬롯이 아니었다면, 기존 스킬을 인벤토리로 되돌립니다.
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

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}
