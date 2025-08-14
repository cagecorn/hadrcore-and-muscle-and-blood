import { SKILL_TYPES } from '../utils/SkillEngine.js';

/**
 * 스킬 카드 DOM 요소를 생성하는 것을 전담하는 매니저
 */
export class SkillCardManager {
    /**
     * 스킬 데이터를 기반으로 스킬 카드 HTML 요소를 생성합니다.
     * @param {object} skillData - 카드를 만들 스킬의 정보
     * @returns {HTMLElement} - 생성된 스킬 카드 DOM 요소
     */
    static createCardElement(skillData) {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.dataset.skillId = skillData.id;

        // 1. 스킬 일러스트
        const illustration = document.createElement('div');
        illustration.className = 'skill-illustration';
        // illustration.style.backgroundImage = `url(${skillData.illustrationPath})`;
        card.appendChild(illustration);

        // 2. 스킬 정보 텍스트 창
        const infoContainer = document.createElement('div');
        infoContainer.className = 'skill-info';
        
        const name = document.createElement('div');
        name.className = 'skill-name';
        name.innerText = skillData.name || '스킬 이름';
        infoContainer.appendChild(name);

        const typeAndCost = document.createElement('div');
        typeAndCost.className = 'skill-type-cost';
        const skillTypeInfo = SKILL_TYPES[skillData.type];
        typeAndCost.innerHTML = `
            <span style="color: ${skillTypeInfo.color};">[${skillTypeInfo.name}]</span>
            <span>토큰 ${skillData.cost || 0}</span>
        `;
        infoContainer.appendChild(typeAndCost);

        const description = document.createElement('div');
        description.className = 'skill-description';
        description.innerText = skillData.description || '스킬에 대한 설명이 여기에 표시됩니다.';
        infoContainer.appendChild(description);
        
        card.appendChild(infoContainer);

        return card;
    }
}
