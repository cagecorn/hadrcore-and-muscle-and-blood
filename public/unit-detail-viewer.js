// 필요한 모든 데이터와 유틸리티를 직접 import합니다.
// 이 스크립트는 게임의 메인 번들과 독립적으로 실행됩니다.
import { UnitDetailDOM } from '../src/game/dom/UnitDetailDOM.js';
import { statEngine } from '../src/game/utils/StatEngine.js';
import { ownedSkillsManager } from '../src/game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../src/game/utils/SkillInventoryManager.js';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';
import { classGrades } from '../src/game/data/classGrades.js';
import { classProficiencies } from '../src/game/data/classProficiencies.js';
import { classSpecializations } from '../src/game/data/classSpecializations.js';

document.addEventListener('DOMContentLoaded', () => {
    const unitDataString = localStorage.getItem('selectedUnitForDetail');
    if (unitDataString) {
        const unitData = JSON.parse(unitDataString);
        const detailElement = UnitDetailDOM.create(unitData);
        const container = document.getElementById('detail-container');
        container.appendChild(detailElement);
        requestAnimationFrame(() => {
            detailElement.classList.add('visible');
        });
        detailElement.onclick = (e) => {
            if (e.target === detailElement) {
                window.close();
            }
        };
        const closeButton = detailElement.querySelector('#unit-detail-close');
        if(closeButton) {
            closeButton.onclick = () => window.close();
        }
    } else {
        document.body.innerHTML = '<h1>유닛 정보를 불러올 수 없습니다.</h1>';
    }
});
