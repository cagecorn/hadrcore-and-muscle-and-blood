import { DomSync } from './DomSync.js';
import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 게임 내 모든 DOM 요소(텍스트, 툴팁, UI 등)를 생성하고 관리하는 엔진
 */
export class DOMEngine {
    constructor(scene) {
        this.scene = scene;
        this.uiContainer = document.getElementById('ui-container');
        this.activeSyncs = []; // 활성화된 DomSync 인스턴스들을 관리
        this.tooltip = null;

        // 씬의 update 루프에 맞춰 자신의 update 함수를 실행하도록 등록
        this.scene.events.on('update', this.update, this);
        // 씬이 종료될 때 정리 함수를 실행하도록 등록
        this.scene.events.on('shutdown', this.shutdown, this);

        debugLogEngine.log('DOMEngine', 'DOM 엔진이 활성화되었습니다.');
    }

    /**
     * 특정 게임 오브젝트에 동기화되는 텍스트를 생성합니다.
     * @param {Phaser.GameObjects.GameObject} target - 텍스트가 따라다닐 게임 오브젝트
     * @param {string} text - 표시할 텍스트
     * @param {object} style - CSS 스타일을 담은 객체
     * @returns {HTMLElement} 생성된 DOM 요소
     */
    createSyncedText(target, text, style = {}) {
        const textElement = document.createElement('div');
        textElement.innerText = text;
        textElement.style.position = 'absolute';
        Object.assign(textElement.style, style); // 전달된 스타일 적용

        this.uiContainer.appendChild(textElement);

        // DomSync 인스턴스를 만들어 동기화 목록에 추가
        const sync = new DomSync(this.scene, target, textElement);
        this.activeSyncs.push(sync);

        return textElement;
    }

    /**
     * 임의의 DOM 요소를 게임 오브젝트와 동기화합니다.
     * @param {Phaser.GameObjects.GameObject} target - DOM 요소가 따라다닐 게임 오브젝트
     * @param {HTMLElement} element - 동기화할 DOM 요소
     * @returns {HTMLElement} 동기화된 DOM 요소
     */
    syncElement(target, element) {
        element.style.position = 'absolute';
        this.uiContainer.appendChild(element);
        const sync = new DomSync(this.scene, target, element);
        this.activeSyncs.push(sync);
        return element;
    }

    /**
     * 툴팁을 표시합니다.
     * @param {number} x - 툴팁의 기준 x 좌표
     * @param {number} y - 툴팁의 기준 y 좌표
     * @param {string} text - 표시할 텍스트
     */
    showTooltip(x, y, text) {
        if (this.tooltip) this.hideTooltip();

        this.tooltip = document.createElement('div');
        this.tooltip.innerText = text;

        const style = {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            transform: 'translate(10px, -100%)',
            pointerEvents: 'none',
            zIndex: '10000'
        };
        Object.assign(this.tooltip.style, style);

        this.uiContainer.appendChild(this.tooltip);
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }

    /**
     * 매 프레임마다 모든 동기화된 DOM 요소의 위치를 업데이트합니다.
     */
    update() {
        for (let i = this.activeSyncs.length - 1; i >= 0; i--) {
            if (this.activeSyncs[i].domElement) {
                this.activeSyncs[i].update();
            } else {
                // domElement가 제거되었으면 배열에서도 제거
                this.activeSyncs.splice(i, 1);
            }
        }
    }

    /**
     * 씬이 종료될 때 모든 DOM 요소를 정리합니다.
     */
    shutdown() {
        debugLogEngine.log('DOMEngine', 'DOM 엔진을 종료하고 모든 요소를 정리합니다.');
        this.activeSyncs.forEach(sync => sync.destroy());
        this.activeSyncs = [];
    }
}
