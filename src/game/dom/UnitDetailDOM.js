import { statEngine } from '../utils/StatEngine.js';
import { SKILL_TYPES } from '../utils/SkillEngine.js';
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';
import { SkillTooltipManager } from './SkillTooltipManager.js';
import { skillModifierEngine } from '../utils/SkillModifierEngine.js';
// ✨ 등급 데이터를 가져오기 위해 classGrades를 import합니다.
import { classGrades } from '../data/classGrades.js';
// ✨ 1. 새로 만든 숙련도 태그 데이터를 가져옵니다.
import { classProficiencies } from '../data/classProficiencies.js';
// ✨ 새로 만든 특화 태그 데이터를 가져옵니다.
import { classSpecializations } from '../data/classSpecializations.js';

/**
 * 용병 상세 정보 창의 DOM을 생성하고 관리하는 유틸리티 클래스
 */
export class UnitDetailDOM {
    static create(unitData) {
        const finalStats = statEngine.calculateStats(unitData, unitData.baseStats, []);
        // ✨ 해당 유닛의 등급 데이터를 가져옵니다.
        const grades = classGrades[unitData.id] || {};
        // ✨ 2. 현재 유닛의 숙련도 태그 목록을 가져옵니다.
        const proficiencies = classProficiencies[unitData.id] || [];
        // ✨ 특화 태그 목록을 가져옵니다.
        const specializations = classSpecializations[unitData.id] || [];
        // ✨ 1. 용병의 고유 속성 특화 정보를 가져옵니다.
        const attributeSpec = unitData.attributeSpec;

        // --- MBTI 문자열과 툴팁 텍스트를 준비합니다. ---
        const mbti = unitData.mbti;
        let mbtiString = '';
        if (mbti) {
            mbtiString += mbti.E > mbti.I ? 'E' : 'I';
            mbtiString += mbti.S > mbti.N ? 'S' : 'N';
            mbtiString += mbti.T > mbti.F ? 'T' : 'F';
            mbtiString += mbti.J > mbti.P ? 'J' : 'P';
        }

        const mbtiTooltips = {
            E: `**E (외향)**\n- 선호 스킬: 돌진, 근접\n- 선호 장비: 공격력, 용맹\n- 열망 붕괴: 남은 능력을 모두 사용해 최후의 발악을 합니다.`,
            I: `**I (내향)**\n- 선호 스킬: 원거리, 버프, 의지 방패\n- 선호 장비: 방어력, 토큰 소모량 감소\n- 열망 붕괴: 안전한 위치로 후퇴하여 생존을 도모합니다.`,
            S: `**S (감각)**\n- 선호 스킬: 확정 효과, 단순 피해/치유\n- 선호 장비: 명중률, 치명타 확률\n- 열망 붕괴: 자신을 기절시킨 적에게 복수하려 합니다.`,
            N: `**N (직관)**\n- 선호 스킬: 상태이상, 위치 변경 등 복합 효과\n- 선호 장비: 시너지 효과, 상태이상 적용 확률\n- 열망 붕괴: 전황을 다시 파악하고 가장 유리한 대상을 공격합니다.`,
            T: `**T (사고)**\n- 선호 스킬: 자신 강화(Self-Buff), 적 약화(Debuff)\n- 선호 장비: 치명타 피해, 생명력 흡수\n- 열망 붕괴: 적의 위협적인 버프에 디버프로 맞서려 합니다.`,
            F: `**F (감정)**\n- 선호 스킬: 아군 지원(AID), 치유\n- 선호 장비: 최대 체력, 치유량 증가\n- 열망 붕괴: 위험에 처한 아군을 우선적으로 보호합니다.`,
            J: `**J (판단)**\n- 선호 스킬: 클래스 숙련도에 맞는 정석적인 스킬\n- 선호 장비: 세트 아이템\n- 열망 붕괴: 다음 턴을 위해 안전하게 재정비합니다.`,
            P: `**P (인식)**\n- 선호 스킬: 변칙적인 비숙련 스킬\n- 선호 장비: 특수 효과(MBTI 효과)가 붙은 아이템\n- 열망 붕괴: 토큰 소모가 없는 스킬을 사용해 변수를 만들려 합니다.`
        };

        // =======================================================================
        // ✨ 1. [수정] MBTI 툴팁 내용을 구체적인 설명으로 변경합니다.
        // =======================================================================
        let fullTooltipText = "## MBTI 행동 패턴\n\n**[선호도]**\n";
        if (mbtiString) {
            fullTooltipText += `${mbtiTooltips[mbtiString[0]]}\n${mbtiTooltips[mbtiString[1]]}\n${mbtiTooltips[mbtiString[2]]}\n${mbtiTooltips[mbtiString[3]]}`;
        }
        // =======================================================================

        const overlay = document.createElement('div');
        // ✨ [수정] ID 대신 클래스를 사용합니다.
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => {
            // ✨ [수정] fade-out 애니메이션을 위해 클래스를 제거하는 방식으로 변경합니다.
            if (e.target === overlay) {
                overlay.classList.remove('visible');
                // 애니메이션이 끝난 후 DOM에서 완전히 제거합니다.
                overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
            }
        };

        const detailPane = document.createElement('div');
        detailPane.id = 'unit-detail-pane';

        const instanceName = unitData.instanceName || unitData.name;
        let headerHTML = `
            <div class="detail-header">
                <span class="unit-name">${instanceName}</span>
                <span class="unit-class">${unitData.name}</span>
                <div class="unit-mbti" data-tooltip="${fullTooltipText.replace(/(\r\n|\n|\r)/gm, '&#10;')}" style="user-select: none; cursor: help;">${mbtiString}</div>
                <span class="unit-level">Lv. ${unitData.level}</span>
            </div>
            <div id="unit-detail-close">X</div>
        `;
        detailPane.innerHTML = headerHTML;

        const detailContent = document.createElement('div');
        detailContent.className = 'detail-content';

        const leftSection = document.createElement('div');
        leftSection.className = 'detail-section left';

        // =======================================================================
        // ✨ 2 & 3. [수정] 클래스 패시브 HTML을 초상화(unit-portrait) 내부로 이동합니다.
        // =======================================================================
        let classPassiveHTML = '';
        if (unitData.classPassive) {
            classPassiveHTML = `
                <div class="class-passive-section" data-tooltip="${unitData.classPassive.description}">
                    <img src="${unitData.classPassive.iconPath}" class="passive-skill-icon"/>
                    <span class="passive-skill-name">${unitData.classPassive.name}</span>
                </div>
            `;
        }

        const gradeDisplayHTML = `
            <div class="unit-grades-container">
                <div class="unit-grades left">
                    <div class="grade-item" data-tooltip="근접 공격 등급: 이 유닛이 근접 공격 시 얼마나 우위를 갖는지 나타냅니다. 높을수록 강력합니다.">⚔️ ${grades.meleeAttack || 1}</div>
                    <div class="grade-item" data-tooltip="원거리 공격 등급: 원거리 공격 시 유불리를 나타냅니다. 원거리 딜러에게 중요합니다.">🏹 ${grades.rangedAttack || 1}</div>
                    <div class="grade-item" data-tooltip="마법 공격 등급: 마법 공격 시 효율을 나타냅니다. 마법사 클래스의 핵심 능력치입니다.">🔮 ${grades.magicAttack || 1}</div>
                </div>
                <div class="unit-portrait" style="background-image: url(${unitData.uiImage})">
                    ${classPassiveHTML}
                    <div class="proficiency-tags-container">
                        ${proficiencies.map(tag => `<span class="proficiency-tag">${tag}</span>`).join('')}
                        ${specializations.map(spec => `<span class="specialization-tag" data-tooltip="${spec.description}">${spec.tag}</span>`).join('')}
                        ${attributeSpec ? `<span class="attribute-tag" data-tooltip="${attributeSpec.description}">${attributeSpec.tag}</span>` : ''}
                    </div>
                </div>
                <div class="unit-grades right">
                    <div class="grade-item" data-tooltip="근접 방어 등급: 근접 공격을 받았을 때 얼마나 잘 버티는지 나타냅니다. 탱커에게 필수적입니다.">🛡️ ${grades.meleeDefense || 1}</div>
                    <div class="grade-item" data-tooltip="원거리 방어 등급: 화살이나 총탄 등 원거리 공격에 대한 저항력입니다.">🎯 ${grades.rangedDefense || 1}</div>
                    <div class="grade-item" data-tooltip="마법 방어 등급: 마법 공격에 대한 저항력입니다. 적 마법사를 상대할 때 중요합니다.">✨ ${grades.magicDefense || 1}</div>
                </div>
            </div>
        `;
        
        // --- ▼ [핵심 변경] 스탯 표시 영역 구조 변경 ---
        const statsContainerHTML = `
            <div class="stats-container">
                <div class="stats-header">
                    <div class="section-title">스탯</div>
                    <div class="stats-pagination">
                        <button class="stats-page-btn active" data-page="1">기본</button>
                        <button class="stats-page-btn" data-page="2">반영</button>
                    </div>
                </div>
                <div id="stats-page-1" class="stats-grid stats-page active">
                    <div class="stat-item" data-tooltip="체력. 0이 되면 전투에서 패배합니다."><span>HP</span><span>${finalStats.hp}</span></div>
                    <div class="stat-item" data-tooltip="전투 시작 시 용맹 수치에 비례하는 '배리어'를 생성하며, 배리어가 높을수록 공격력이 증가합니다."><span>용맹</span><span>${finalStats.valor}</span></div>
                    <div class="stat-item" data-tooltip="물리 공격력에 영향을 줍니다."><span>힘</span><span>${finalStats.strength}</span></div>
                    <div class="stat-item" data-tooltip="물리 방어력과 상태이상 저항력에 영향을 줍니다."><span>인내</span><span>${finalStats.endurance}</span></div>
                    <div class="stat-item" data-tooltip="물리 공격 회피율과 명중률에 영향을 줍니다."><span>민첩</span><span>${finalStats.agility}</span></div>
                    <div class="stat-item" data-tooltip="마법 공격력과 상태이상 적용 확률에 영향을 줍니다."><span>지능</span><span>${finalStats.intelligence}</span></div>
                    <div class="stat-item" data-tooltip="마법 방어력과 치유량에 영향을 줍니다."><span>지혜</span><span>${finalStats.wisdom}</span></div>
                    <div class="stat-item" data-tooltip="마법 회피율과 치명타 확률에 영향을 줍니다."><span>행운</span><span>${finalStats.luck}</span></div>
                </div>
                <div id="stats-page-2" class="stats-grid stats-page">
                    <div class="stat-item"><span>최대 배리어</span><span>${finalStats.maxBarrier}</span></div>
                    <div class="stat-item"><span>총 무게</span><span>${finalStats.totalWeight}</span></div>
                    <div class="stat-item"><span>물리 공격력</span><span>${finalStats.physicalAttack.toFixed(1)}</span></div>
                    <div class="stat-item"><span>물리 방어력</span><span>${finalStats.physicalDefense.toFixed(1)}</span></div>
                    <div class="stat-item"><span>마법 공격력</span><span>${finalStats.magicAttack.toFixed(1)}</span></div>
                    <div class="stat-item"><span>마법 방어력</span><span>${finalStats.magicDefense.toFixed(1)}</span></div>
                    <div class="stat-item"><span>치명타 확률</span><span>${(finalStats.criticalChance ?? 0).toFixed(1)}%</span></div>
                    <div class="stat-item"><span>물리 회피율</span><span>${(finalStats.physicalEvadeChance ?? 0).toFixed(1)}%</span></div>
                    <div class="stat-item"><span>상태이상 저항</span><span>${(finalStats.statusEffectResistance ?? 0).toFixed(1)}%</span></div>
                    <div class="stat-item"><span>상태이상 적용</span><span>${(finalStats.statusEffectApplication ?? 0).toFixed(1)}%</span></div>
                </div>
            </div>
        `;
        // =======================================================================
        // ✨ [수정] 클래스 패시브 섹션이 위로 이동했으므로 여기서는 제거합니다.
        // =======================================================================
        leftSection.innerHTML = `
            ${gradeDisplayHTML}
            ${statsContainerHTML}
        `;
        // =======================================================================

        const rightSection = document.createElement('div');
        rightSection.className = 'detail-section right';
        
        // --- 스킬 컨테이너 구조 변경 ---
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'unit-skills-container';

        const mainSkillsSection = document.createElement('div');
        mainSkillsSection.className = 'unit-skills';
        mainSkillsSection.innerHTML = `<div class="section-title">주스킬</div>`;
        const mainSkillGrid = document.createElement('div');
        mainSkillGrid.className = 'skill-grid';
        mainSkillsSection.appendChild(mainSkillGrid);

        const specialSkillsSection = document.createElement('div');
        specialSkillsSection.className = 'unit-skills';
        specialSkillsSection.innerHTML = `<div class="section-title">특수스킬</div>`;
        const specialSkillGrid = document.createElement('div');
        specialSkillGrid.className = 'skill-grid';
        specialSkillsSection.appendChild(specialSkillGrid);

        skillsContainer.appendChild(mainSkillsSection);
        skillsContainer.appendChild(specialSkillsSection);

        const equippedSkills = ownedSkillsManager.getEquippedSkills(unitData.uniqueId);
        const gradeMap = { NORMAL: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 };

        if (unitData.skillSlots && unitData.skillSlots.length > 0) {
            unitData.skillSlots.forEach((slotType, index) => {
                const instanceId = equippedSkills[index];

                const slot = document.createElement('div');
                // ✨ 모든 슬롯이 동일한 스타일을 사용합니다.
                slot.className = 'skill-slot';

                // MBTI 알파벳 표시 (MBTI 스택 버프 시스템 제거로 비활성화)
                // if (index < 4 && mbtiString) {
                //     const mbtiIndicator = document.createElement('div');
                //     mbtiIndicator.className = 'mbti-slot-indicator';
                //     mbtiIndicator.innerText = mbtiString[index];
                //     slot.appendChild(mbtiIndicator);
                // }

                let bgImage = 'url(assets/images/skills/skill-slot.png)';
                if (instanceId) {
                    const instData = skillInventoryManager.getInstanceData(instanceId);
                    const baseSkillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);
                    if (baseSkillData) {
                        const modifiedSkill = skillModifierEngine.getModifiedSkill(baseSkillData, index + 1, instData.grade);
                        bgImage = `url(${modifiedSkill.illustrationPath})`;
                        slot.onmouseenter = (e) => SkillTooltipManager.show(modifiedSkill, e, instData.grade);
                        slot.onmouseleave = () => SkillTooltipManager.hide();

                        // 등급 표시를 위한 클래스와 별 이미지 추가
                        slot.classList.add(`grade-${instData.grade.toLowerCase()}`);
                        const starsContainer = document.createElement('div');
                        starsContainer.className = 'grade-stars';
                        const starCount = gradeMap[instData.grade] || 1;
                        for (let i = 0; i < starCount; i++) {
                            const starImg = document.createElement('img');
                            starImg.src = 'assets/images/territory/skill-card-star.png';
                            starsContainer.appendChild(starImg);
                        }
                        slot.appendChild(starsContainer);
                    }
                }
                slot.style.backgroundImage = bgImage;
                if (index < 4) {
                    mainSkillGrid.appendChild(slot);
                } else {
                    specialSkillGrid.appendChild(slot);
                }
            });
        }

        rightSection.appendChild(skillsContainer);

        // --- ▼ 장비 카드 섹션 추가 ▼ ---
        const equipmentSection = document.createElement('div');
        equipmentSection.className = 'equipment-section';
        equipmentSection.innerHTML = `<div class="section-title">장비 카드</div>`;

        const equipmentGrid = document.createElement('div');
        equipmentGrid.className = 'equipment-grid';

        const equipSlots = [
            { label: '무기' },
            { label: '갑옷' },
            { label: '악세사리1' },
            { label: '악세사리2' }
        ];

        equipSlots.forEach(slotInfo => {
            const slot = document.createElement('div');
            slot.className = 'equip-slot';

            const slotImage = document.createElement('div');
            slotImage.className = 'equip-slot-image';

            const slotLabel = document.createElement('div');
            slotLabel.className = 'equip-slot-label';
            slotLabel.innerText = slotInfo.label;

            slot.appendChild(slotImage);
            slot.appendChild(slotLabel);
            equipmentGrid.appendChild(slot);
        });

        equipmentSection.appendChild(equipmentGrid);
        rightSection.appendChild(equipmentSection);
        // --- ▲ 장비 카드 섹션 추가 ▲ ---

        detailContent.appendChild(leftSection);
        detailContent.appendChild(rightSection);
        detailPane.appendChild(detailContent);
        overlay.appendChild(detailPane);

        // ✨ [추가] 닫기 버튼에 이벤트 리스너를 추가합니다.
        const closeButton = detailPane.querySelector('#unit-detail-close');
        closeButton.onclick = () => {
            overlay.classList.remove('visible');
            overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
        };

        // --- ▼ [핵심 변경] 페이지네이션 버튼 이벤트 리스너 추가 ---
        const pageButtons = leftSection.querySelectorAll('.stats-page-btn');
        pageButtons.forEach(button => {
            button.onclick = () => {
                const pageNumber = button.dataset.page;

                // 모든 페이지와 버튼에서 active 클래스 제거
                leftSection.querySelectorAll('.stats-page').forEach(p => p.classList.remove('active'));
                leftSection.querySelectorAll('.stats-page-btn').forEach(b => b.classList.remove('active'));

                // 클릭된 버튼과 해당 페이지에 active 클래스 추가
                leftSection.querySelector(`#stats-page-${pageNumber}`).classList.add('active');
                button.classList.add('active');
            };
        });
        // --- ▲ [핵심 변경] 페이지네이션 버튼 이벤트 리스너 추가 ---

        return overlay;
    }
}
