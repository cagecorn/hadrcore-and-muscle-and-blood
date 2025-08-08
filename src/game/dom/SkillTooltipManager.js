import { SKILL_TYPES } from '../utils/SkillEngine.js';
// ✨ 1. 숙련도 및 특화 데이터를 가져옵니다.
import { classProficiencies } from '../data/classProficiencies.js';
import { classSpecializations } from '../data/classSpecializations.js';
import { mercenaryData } from '../data/mercenaries.js';
import { placeholderManager } from '../utils/PlaceholderManager.js';

/**
 * 스킬 카드 위에 마우스를 올렸을 때 TCG 스타일의 큰 툴팁을 표시하는 매니저
 */
export class SkillTooltipManager {
    // ✨ [핵심 변경] 4번째 인자로 용병 데이터를 받습니다.
    static show(skillData, event, grade = 'NORMAL', mercData = null) {
        this.hide();

        if (!skillData) return;

        // ✨ 2. 용병 데이터가 있으면 숙련도와 특화 태그 목록을 준비합니다.
        const proficiencies = mercData ? classProficiencies[mercData.id] || [] : [];
        const specializations = mercData ? classSpecializations[mercData.id]?.map(s => s.tag) || [] : [];

        const tooltip = document.createElement('div');
        tooltip.id = 'skill-tooltip';
        tooltip.className = `skill-card-large ${skillData.type.toLowerCase()}-card grade-${grade.toLowerCase()}`;
        
        let description = skillData.description;

        let skillNameHTML = skillData.name;
        if (skillData.requiredClass) {
            const required = Array.isArray(skillData.requiredClass) ? skillData.requiredClass : [skillData.requiredClass];
            if (required.length > 0) {
                const classNames = required.map(id => mercenaryData[id] ? mercenaryData[id].name : id).join('/');
                skillNameHTML += ` <span style="font-size: 14px; color: #ffc107;">[${classNames} 전용]</span>`;
            }
        }

        // 사거리 텍스트: 없으면 "기본 사거리"로 표시
        const rangeText = skillData.range !== undefined ? `사거리 ${skillData.range}` : '기본 사거리';

        tooltip.innerHTML = `
            <div class="skill-illustration-large" style="background-image: url(${placeholderManager.getPath(skillData.illustrationPath)})"></div>
            <div class="skill-info-large">
                <div class="skill-name-large">${skillNameHTML}</div>
                <div class="skill-type-cost-large">
                    <span style="color: ${SKILL_TYPES[skillData.type].color};">[${SKILL_TYPES[skillData.type].name}]</span>
                    <span>${rangeText} | 쿨타임 ${skillData.cooldown || 0}</span>
                </div>
                <div class="skill-description-large">${description}</div>
                <div class="skill-cost-container-large"></div>
            </div>
        `;

        // ✨ 3. 스킬 태그를 생성할 때 숙련/특화 여부를 확인하고 클래스를 추가합니다.
        if (skillData.tags && skillData.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'skill-tags-container-large';
            skillData.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'skill-tag';
                if (proficiencies.includes(tag)) {
                    tagElement.classList.add('proficient-tag');
                }
                if (specializations.includes(tag)) {
                    tagElement.classList.add('specialized-tag');
                }
                tagElement.innerText = tag;
                tagsContainer.appendChild(tagElement);
            });
            tooltip.querySelector('.skill-info-large').appendChild(tagsContainer);
        }

        const gradeMap = { 'NORMAL': 1, 'RARE': 2, 'EPIC': 3, 'LEGENDARY': 4 };
        const starsContainer = document.createElement('div');
        starsContainer.className = 'grade-stars-large';
        const starCount = gradeMap[grade] || 1;
        for (let i = 0; i < starCount; i++) {
            const starImg = document.createElement('img');
            starImg.src = 'assets/images/territory/skill-card-star.png';
            starsContainer.appendChild(starImg);
        }
        tooltip.appendChild(starsContainer);

        const costContainer = tooltip.querySelector('.skill-cost-container-large');
        for (let i = 0; i < skillData.cost; i++) {
            const tokenIcon = document.createElement('img');
            tokenIcon.src = 'assets/images/battle/token.png';
            tokenIcon.className = 'token-icon-large';
            costContainer.appendChild(tokenIcon);
        }

        document.body.appendChild(tooltip);

        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
    }

    static hide() {
        const existingTooltip = document.getElementById('skill-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }
}
