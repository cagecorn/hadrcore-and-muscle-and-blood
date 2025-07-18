import { GAME_DEBUG_MODE, UI_STATES } from '../constants.js';

export class TavernManager {
    constructor(domEngine, sceneEngine, uiEngine, heroManager) {
        if (GAME_DEBUG_MODE) console.log('🍻 TavernManager initialized.');
        this.domEngine = domEngine;
        this.sceneEngine = sceneEngine;
        this.uiEngine = uiEngine;
        this.heroManager = heroManager;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        const tavernIcon = this.domEngine.getElement('tavern-icon-btn');
        if (tavernIcon) {
            tavernIcon.addEventListener('click', () => this.enterTavern());
        }

        const hireHeroBtn = this.domEngine.getElement('hire-hero-btn');
        if (hireHeroBtn) {
            hireHeroBtn.addEventListener('click', () => this.hireHero());
        }
    }

    enterTavern() {
        if (GAME_DEBUG_MODE) console.log('Entering the tavern...');
        this.sceneEngine.setCurrentScene(UI_STATES.TAVERN_SCREEN);
        this.uiEngine.setUIState(UI_STATES.TAVERN_SCREEN);
        this.domEngine.updateUIForScene(UI_STATES.TAVERN_SCREEN);
    }

    hireHero() {
        if (GAME_DEBUG_MODE) {
            console.log('[TavernManager] "Hire Hero" button clicked. Preparing for class selection...');
        }
        alert('영웅의 직업을 선택하는 화면으로 이동할 예정입니다. (현재 개발 중)');
    }
}
