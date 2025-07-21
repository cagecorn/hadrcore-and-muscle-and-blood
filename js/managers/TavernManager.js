import { GAME_DEBUG_MODE, UI_STATES } from '../constants.js';

export class TavernManager {
    constructor(domEngine, sceneEngine, uiEngine, heroManager) {
        if (GAME_DEBUG_MODE) console.log('🍻 TavernManager initialized.');
        this.domEngine = domEngine;
        this.sceneEngine = sceneEngine;
        this.uiEngine = uiEngine;
        this.heroManager = heroManager;

        // ✨ 고용 가능한 직업 및 관련 이미지 정보
        this.availableClasses = ['warrior', 'gunner', 'mage'];
        this.classIllustrations = {
            'warrior': 'assets/territory/warrior-hire.png',
            'gunner': 'assets/territory/gunner-hire.png',
            'mage': 'assets/territory/mage-hire.png'
        };
        this.currentClassIndex = 0;

        // ✨ UI 요소 캐싱
        this.tavernGrid = this.domEngine.getElement('tavern-grid');
        this.hireUI = this.domEngine.getElement('hire-ui-overlay');
        this.hireImageElement = this.domEngine.getElement('hire-class-image');
        this.prevButton = this.domEngine.getElement('prev-class-btn');
        this.nextButton = this.domEngine.getElement('next-class-btn');

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // 선술집 아이콘 클릭
        const tavernIcon = this.domEngine.getElement('tavern-icon-btn');
        tavernIcon?.addEventListener('click', () => this.enterTavern());

        // 기본 그리드 안의 영웅 고용 버튼
        const hireHeroBtn = this.domEngine.getElement('hire-hero-btn');
        hireHeroBtn?.addEventListener('click', () => this.openHireUI());

        // 오버레이 내부 버튼과 이벤트
        this.prevButton?.addEventListener('click', () => this._showPrevClass());
        this.nextButton?.addEventListener('click', () => this._showNextClass());

        this.hireUI?.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (event.deltaY > 0) {
                this._showNextClass();
            } else {
                this._showPrevClass();
            }
        });

        this.hireImageElement?.addEventListener('click', () => this.hireSelectedHero());
    }

    enterTavern() {
        if (GAME_DEBUG_MODE) console.log('Entering the tavern...');
        this.sceneEngine.setCurrentScene(UI_STATES.TAVERN_SCREEN);
        this.uiEngine.setUIState(UI_STATES.TAVERN_SCREEN);
        this.domEngine.updateUIForScene(UI_STATES.TAVERN_SCREEN);
        this.closeHireUI();
    }

    // ✨ 고용 UI 열기
    openHireUI() {
        if (GAME_DEBUG_MODE) console.log('[TavernManager] Opening Hire UI.');
        this.tavernGrid?.classList.add('hidden');
        this.hireUI?.classList.remove('hidden');
        this._updateHireUI();
    }

    // ✨ 고용 UI 닫기
    closeHireUI() {
        this.hireUI?.classList.add('hidden');
        this.tavernGrid?.classList.remove('hidden');
    }

    _updateHireUI() {
        const currentClass = this.availableClasses[this.currentClassIndex];
        if (this.hireImageElement && this.classIllustrations[currentClass]) {
            this.hireImageElement.src = this.classIllustrations[currentClass];
            this.hireImageElement.alt = `고용 가능한 ${currentClass}`;
        } else {
            console.warn(`Illustration for ${currentClass} not found.`);
            this.hireImageElement.src = '';
        }
    }

    _showPrevClass() {
        this.currentClassIndex = (this.currentClassIndex - 1 + this.availableClasses.length) % this.availableClasses.length;
        this._updateHireUI();
    }

    _showNextClass() {
        this.currentClassIndex = (this.currentClassIndex + 1) % this.availableClasses.length;
        this._updateHireUI();
    }

    hireSelectedHero() {
        const currentClass = this.availableClasses[this.currentClassIndex];
        if (GAME_DEBUG_MODE) console.log(`Attempting to hire a ${currentClass}.`);
        alert(`${currentClass}(을)를 고용합니다! (실제 고용 로직은 추후 구현)`);
        this.closeHireUI();
    }
}
