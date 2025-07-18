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
        this.registerElement('tavern-icon-btn', document.getElementById('tavern-icon-btn'));
    }

    _setupEventListeners() {
        const tavernIcon = this.getElement('tavern-icon-btn');
        if (tavernIcon) {
            tavernIcon.addEventListener('click', () => {
                if (!tavernIcon.classList.contains('hidden')) {
                    console.log('여관 아이콘(HTML 버튼)이 클릭되었습니다!');
                    // 여관 패널 열기 등 추가 로직을 넣을 수 있습니다.
                }
            });
        }

        this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, () => this.updateUIForScene(UI_STATES.COMBAT_SCREEN));
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_END, () => this.updateUIForScene(UI_STATES.MAP_SCREEN));
    }

    updateUIForScene(sceneName) {
        console.log(`[DOMEngine] Updating UI for scene: ${sceneName}`);
        const tavernIcon = this.getElement('tavern-icon-btn');
        if (!tavernIcon) return;
        if (sceneName === UI_STATES.MAP_SCREEN) {
            tavernIcon.classList.remove('hidden');
        } else {
            tavernIcon.classList.add('hidden');
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
