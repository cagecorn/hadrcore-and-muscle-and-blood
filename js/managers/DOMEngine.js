import { GAME_EVENTS, UI_STATES } from '../constants.js';

/**
 * 게임의 모든 HTML DOM 요소를 관리하고 상호작용을 처리하는 엔진입니다.
 * 캔버스와 독립적으로 UI를 제어합니다.
 */
export class DOMEngine {
    constructor(eventManager) {
        console.log('\ud83c\udfdb\ufe0f DOMEngine initialized. Managing all HTML UI elements.');
        this.eventManager = eventManager;
        this.elements = new Map();
        this._registerElements();
        this._setupEventListeners();
    }

    _registerElements() {
        this.registerElement('gameCanvas', document.getElementById('gameCanvas'));
        this.registerElement('battle-log-panel', document.getElementById('battle-log-panel'));
        this.registerElement('hero-panel', document.getElementById('hero-panel'));
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, () => this.updateUIForScene(UI_STATES.COMBAT_SCREEN));
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_END, () => this.updateUIForScene(UI_STATES.MAP_SCREEN));
    }

    updateUIForScene(sceneName) {
        console.log(`[DOMEngine] Updating UI for scene: ${sceneName}`);
        const gameCanvas = this.getElement('gameCanvas');
        const logPanel = this.getElement('battle-log-panel');

        if (sceneName === UI_STATES.MAP_SCREEN) {
            gameCanvas && gameCanvas.classList.add('hidden');
            logPanel && logPanel.classList.add('hidden');
        } else {
            gameCanvas && gameCanvas.classList.remove('hidden');
            logPanel && logPanel.classList.remove('hidden');
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
