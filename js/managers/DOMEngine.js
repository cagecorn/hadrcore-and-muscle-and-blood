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
        this.registerElement('gameCanvas', document.getElementById('gameCanvas'));
        this.registerElement('battle-log-panel', document.getElementById('battle-log-panel'));
        this.registerElement('hero-panel', document.getElementById('hero-panel'));
        this.registerElement('battleStartHtmlBtn', document.getElementById('battleStartHtmlBtn'));
        this.registerElement('recruitWarriorBtn', document.getElementById('recruitWarriorBtn'));
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
        const recruitBtn = this.getElement('recruitWarriorBtn');
        const heroPanelBtn = document.getElementById('toggleHeroPanelBtn');

        if (sceneName === UI_STATES.MAP_SCREEN) {
            territory?.classList.remove('hidden');
            tavernIcon?.classList.remove('hidden');
            battleStartBtn?.classList.remove('hidden');
            recruitBtn?.classList.remove('hidden');
            heroPanelBtn?.classList.remove('hidden');

            tavernScreen?.classList.add('hidden');
            gameCanvas?.classList.add('hidden');
            logPanel?.classList.add('hidden');
        } else if (sceneName === UI_STATES.TAVERN_SCREEN) {
            tavernScreen?.classList.remove('hidden');

            territory?.classList.add('hidden');
            tavernIcon?.classList.add('hidden');
            battleStartBtn?.classList.add('hidden');
            recruitBtn?.classList.add('hidden');
            heroPanelBtn?.classList.add('hidden');

            gameCanvas?.classList.add('hidden');
            logPanel?.classList.add('hidden');
        } else { // COMBAT_SCREEN
            territory?.classList.add('hidden');
            tavernIcon?.classList.add('hidden');
            battleStartBtn?.classList.add('hidden');
            recruitBtn?.classList.add('hidden');
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
