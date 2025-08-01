import { WARRIOR_SKILLS } from "../../data/warriorSkills.js";
export class HeroDetailedUIManager {
    constructor(domEngine, statManager) {
        this.domEngine = domEngine;
        this.statManager = statManager;
        this.overlay = domEngine.getElement('hero-detail-overlay');
        this.portraitImg = domEngine.getElement('hero-detail-portrait');
        this.statsEl = domEngine.getElement('hero-detail-stats');
        this.traitsEl = domEngine.getElement('hero-detail-traits');
        this.synergiesEl = domEngine.getElement('hero-detail-synergies');
        this.equipmentEl = domEngine.getElement('hero-detail-equipment');
        this.skillsEl = domEngine.getElement('hero-detail-skills');
        this.closeBtn = domEngine.getElement('hero-detail-close-btn');
        this.closeBtn?.addEventListener('click', () => this.hide());
    }

    show(heroData) {
        if (!this.overlay || !heroData) return;
        const finalStats = this.statManager ? this.statManager.getCalculatedStats(heroData) : (heroData.baseStats || {});
        this._populateLeft(heroData, finalStats);
        this._populateRight(heroData);
        this.overlay.classList.remove('hidden');
    }

    hide() {
        this.overlay?.classList.add('hidden');
    }

    _populateLeft(hero, stats) {
        const portrait = this._getPortrait(hero.classId);
        if (this.portraitImg) {
            if (this.portraitImg.tagName === 'IMG') {
                this.portraitImg.src = portrait;
                this.portraitImg.alt = hero.name;
            } else {
                this.portraitImg.style.backgroundImage = `url(${portrait})`;
                this.portraitImg.title = hero.name;
            }
        }
        if (this.statsEl) {
            const s = stats || {};
            this.statsEl.innerHTML = `
                <p>HP: ${hero.currentHp ?? s.hp}/${s.hp ?? '?'}</p>
                <p>용맹: ${s.valor ?? 0}</p>
                <p>힘: ${s.strength ?? 0} 인내: ${s.endurance ?? 0}</p>
                <p>민첩: ${s.agility ?? 0}</p>
                <p>지능: ${s.intelligence ?? 0} 지혜: ${s.wisdom ?? 0}</p>
                <p>행운: ${s.luck ?? 0}</p>`;
        }
        if (this.traitsEl) this.traitsEl.textContent = '특성: (미구현)';
        if (this.synergiesEl) this.synergiesEl.textContent = '시너지: (미구현)';
    }

    _populateRight(hero) {
        if (this.equipmentEl) {
            this.equipmentEl.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const slot = document.createElement('div');
                slot.className = 'equipment-slot';
                this.equipmentEl.appendChild(slot);
            }
        }
        if (this.skillsEl) {
            this.skillsEl.innerHTML = '';
            const skills = hero.skillSlots || [];
            for (const skillId of skills) {
                const skillData = Object.values(WARRIOR_SKILLS).find(s => s.id === skillId) || null;
                const iconPath = skillData?.icon;
                const div = document.createElement('div');
                div.className = 'skill-entry';
                if (iconPath) {
                    const img = document.createElement('img');
                    img.src = iconPath;
                    img.alt = skillData.name;
                    img.title = skillData.description || '';
                    div.appendChild(img);
                }
                const span = document.createElement('span');
                span.textContent = skillData?.name || skillId;
                div.appendChild(span);
                this.skillsEl.appendChild(div);
            }
        }
    }

    _getPortrait(classId) {
        switch (classId) {
            case 'class_warrior':
                return 'assets/territory/warrior-ui.png';
            case 'class_gunner':
                return 'assets/territory/gunner-ui.png';
            default:
                return 'assets/territory/warrior-ui.png';
        }
    }
}
