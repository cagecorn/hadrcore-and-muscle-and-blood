/**
 * 전투 중 AI의 행동 의도를 설명하는 나레이션을 표시하는 UI 매니저
 */
export class NarrationUIManager {
    constructor() {
        this.container = document.getElementById('narration-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'narration-container';
            document.getElementById('ui-container').appendChild(this.container);
        }
        this.narrationText = document.createElement('p');
        this.narrationText.className = 'narration-text';
        this.container.appendChild(this.narrationText);

        this.container.style.display = 'none';
        this.timeoutId = null;
    }

    /**
     * 나레이션 메시지를 표시합니다. 메시지는 일정 시간 후 자동으로 사라집니다.
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 메시지 표시 시간 (ms)
     */
    show(message, duration = 2500) {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.narrationText.textContent = message;
        this.container.style.display = 'block';
        this.container.style.opacity = 1;

        this.timeoutId = setTimeout(() => {
            this.container.style.opacity = 0;
            // 트랜지션이 끝난 후 숨김
            setTimeout(() => {
                if (this.container) this.container.style.display = 'none';
            }, 500);
        }, duration);
    }

    /**
     * UI를 즉시 숨깁니다.
     */
    hide() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * UI 요소를 DOM에서 완전히 제거합니다.
     */
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}
