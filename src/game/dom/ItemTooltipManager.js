import { placeholderManager } from '../utils/PlaceholderManager.js';

/**
 * 장비 아이템 위에 마우스를 올렸을 때 상세 정보 툴팁을 표시하는 매니저
 */
export class ItemTooltipManager {
    static show(itemData, event) {
        this.hide();

        if (!itemData) return;

        const tooltip = document.createElement('div');
        tooltip.id = 'item-tooltip';
        // 등급별 스타일을 적용하기 위해 클래스 추가
        tooltip.className = `item-card-large grade-${itemData.grade.toLowerCase()}`;

        let statsHTML = '<ul>';
        for (const [stat, value] of Object.entries(itemData.stats)) {
            statsHTML += `<li>${this.formatStatName(stat)}: ${value}</li>`;
        }
        statsHTML += '</ul>';

        let mbtiHTML = '<ul>';
        itemData.mbtiEffects.forEach(effect => {
            mbtiHTML += `<li>[${effect.trait}]: ${effect.description.replace('{value}', effect.value)}</li>`;
        });
        mbtiHTML += '</ul>';

        let socketsHTML = '<div class="item-sockets-large">';
        for (let i = 0; i < itemData.sockets.length; i++) {
            socketsHTML += '<div class="item-socket-empty"></div>';
        }
        socketsHTML += '</div>';

        tooltip.innerHTML = `
            <div class="item-illustration-large" style="background-image: url(${placeholderManager.getPath(itemData.illustrationPath)})"></div>
            <div class="item-info-large">
                <div class="item-name-large">${itemData.name}</div>
                <div class="item-type-synergy-large">
                    <span>[${itemData.type}]</span>
                    <span>세트: ${itemData.synergy || '없음'}</span>
                </div>
                <div class="item-section-title">기본 & 추가 능력치</div>
                <div class="item-stats-large">${statsHTML}</div>
                <div class="item-section-title">MBTI 등급 효과</div>
                <div class="item-mbti-large">${mbtiHTML}</div>
                <div class="item-section-title">보석 홈</div>
                ${socketsHTML}
            </div>
        `;

        document.body.appendChild(tooltip);

        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
    }

    static hide() {
        const existingTooltip = document.getElementById('item-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }

    // 스탯 이름을 보기 좋게 변환하는 헬퍼 함수
    static formatStatName(statKey) {
        const names = {
            physicalAttack: '물리 공격력',
            physicalDefense: '물리 방어력',
            hp: '최대 체력',
            criticalChance: '치명타 확률',
            criticalDamageMultiplier: '치명타 피해',
            accuracy: '명중률',
            physicalEvadeChance: '회피율',
            hpRegen: '체력 재생',
            lifeSteal: '생명력 흡수',
            aspirationDecayReduction: '열망 붕괴 감소',
        };
        return names[statKey] || statKey.replace('Percentage', '%');
    }
}
