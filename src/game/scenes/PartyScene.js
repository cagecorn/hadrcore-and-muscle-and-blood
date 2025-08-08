import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { PartyDOMEngine } from '../dom/PartyDOMEngine.js';

export class PartyScene extends Scene {
    constructor() {
        super('PartyScene');
        this.partyDomEngine = null;
    }

    preload() {
        // DOM 기반 UI 사용으로 별도 자원 로드 없음
    }

    create() {
        // 영지 화면 DOM을 숨기고 파티 관리 DOM을 표시합니다.
        const territoryContainer = document.getElementById('territory-container');
        if (territoryContainer) {
            territoryContainer.style.display = 'none';
        }

        const domEngine = new DOMEngine(this);
        this.partyDomEngine = new PartyDOMEngine(this, domEngine);

        this.events.on('shutdown', () => {
            this.partyDomEngine.destroy();
        });
    }
}
