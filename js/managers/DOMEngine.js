import { GAME_EVENTS, UI_STATES } from '../constants.js';

/**
 * 게임의 모든 HTML DOM 요소를 관리하고 상호작용을 처리하는 엔진입니다.
 * 캔버스와 독립적으로 UI를 제어합니다.
 */
export class DOMEngine {
    constructor(eventManager) {
        console.log('🏛️ DOMEngine initialized. Managing all HTML UI elements.');
        this.eventManager = eventManager;
        this.elements = new Map();
        this._registerElements();
        this._setupEventListeners();
    }

    _registerElements() {
        this.registerElement('tavern-icon-btn', document.getElementById('tavern-icon-btn'));
        this.registerElement('territory-screen', document.getElementById('territory-screen'));
        this.registerElement('territory-grid', document.getElementById('territory-grid'));
        this.registerElement('tavern-screen', document.getElementById('tavern-screen'));
        this.registerElement('tavern-grid', document.getElementById('tavern-grid'));
        this.registerElement('hire-hero-btn', document.getElementById('hire-hero-btn'));
        this.registerElement('tavern-back-btn', document.getElementById('tavern-back-btn'));
        // ✨ 고용 UI 요소 등록
        this.registerElement('hire-ui-overlay', document.getElementById('hire-ui-overlay'));
        this.registerElement('hire-class-image', document.getElementById('hire-class-image'));
        this.registerElement('prev-class-btn', document.getElementById('prev-class-btn'));
        this.registerElement('next-class-btn', document.getElementById('next-class-btn'));
        this.registerElement('gameCanvas', document.getElementById('gameCanvas'));
        this.registerElement('battle-log-panel', document.getElementById('battle-log-panel'));
        this.registerElement('hero-panel', document.getElementById('hero-panel'));
        this.registerElement('battleStartHtmlBtn', document.getElementById('battleStartHtmlBtn'));
        this.registerElement('hero-detail-overlay', document.getElementById('hero-detail-overlay'));
        this.registerElement('hero-detail-portrait', document.getElementById('hero-detail-portrait'));
        this.registerElement('hero-detail-stats', document.getElementById('hero-detail-stats'));
        this.registerElement('hero-detail-traits', document.getElementById('hero-detail-traits'));
        this.registerElement('hero-detail-synergies', document.getElementById('hero-detail-synergies'));
        this.registerElement('hero-detail-equipment', document.getElementById('hero-detail-equipment'));
        this.registerElement('hero-detail-skills', document.getElementById('hero-detail-skills'));
        this.registerElement('hero-detail-close-btn', document.getElementById('hero-detail-close-btn'));
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, () => this.updateUIForScene(UI_STATES.COMBAT_SCREEN));
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_END, () => this.updateUIForScene(UI_STATES.MAP_SCREEN));
    }

    updateUIForScene(sceneName) {
        console.log(`[DOMEngine] Updating UI for scene: ${sceneName}`);
        const tavernIcon = this.getElement('tavern-icon-btn');
        const territory = this.getElement('territory-screen');
        const tavernScreen = this.getElement('tavern-screen');
        const gameCanvas = this.getElement('gameCanvas');
        const logPanel = this.getElement('battle-log-panel');
        const battleStartBtn = this.getElement('battleStartHtmlBtn');
        const heroPanelBtn = document.getElementById('toggleHeroPanelBtn');

        if (sceneName === UI_STATES.MAP_SCREEN) {
            territory?.classList.remove('hidden');
            tavernIcon?.classList.remove('hidden');
            battleStartBtn?.classList.remove('hidden');
            heroPanelBtn?.classList.remove('hidden');

            tavernScreen?.classList.add('hidden');
            gameCanvas?.classList.add('hidden');
            logPanel?.classList.add('hidden');
        } else if (sceneName === UI_STATES.TAVERN_SCREEN) {
            tavernScreen?.classList.remove('hidden');

            territory?.classList.add('hidden');
            tavernIcon?.classList.add('hidden');
            battleStartBtn?.classList.add('hidden');
            heroPanelBtn?.classList.add('hidden');

            gameCanvas?.classList.add('hidden');
            logPanel?.classList.add('hidden');
        } else { // COMBAT_SCREEN
            territory?.classList.add('hidden');
            tavernIcon?.classList.add('hidden');
            battleStartBtn?.classList.add('hidden');
            heroPanelBtn?.classList.add('hidden');

            tavernScreen?.classList.add('hidden');
            gameCanvas?.classList.remove('hidden');
            logPanel?.classList.remove('hidden');
        }
    }

    registerElement(id, element) {
        if (!element) {
            console.warn(`[DOMEngine] Element with ID '${id}' not found in the document.`);
            return;
        }
        this.elements.set(id, element);
    }

    getElement(id) {
        return this.elements.get(id);
    }
}
