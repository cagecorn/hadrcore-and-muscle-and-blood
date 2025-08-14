import { SHARED_RESOURCE_TYPES, sharedResourceEngine } from '../utils/SharedResourceEngine.js';

/**
 * 전투 중 공유 자원 현황을 표시하는 상단 UI 매니저
 */
export class SharedResourceUIManager {
    constructor() {
        this.container = document.getElementById('shared-resource-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'shared-resource-container';
            document.getElementById('ui-container').appendChild(this.container);
        }

        // 각 자원의 숫자 값을 업데이트하기 위해 DOM 요소 참조를 저장합니다.
        this.resourceValueElements = new Map();

        this._createLayout();
        this.container.style.display = 'none'; // 초기에는 숨김
    }

    /**
     * UI의 기본 레이아웃을 생성합니다.
     * @private
     */
    _createLayout() {
        this.container.innerHTML = ''; // 초기화

        Object.entries(SHARED_RESOURCE_TYPES).forEach(([key, name]) => {
            const resourceItem = document.createElement('div');
            resourceItem.className = 'resource-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'resource-name';
            nameSpan.innerText = `${name} -`;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'resource-value';
            valueSpan.id = `resource-value-${key}`;
            valueSpan.innerText = '0';

            resourceItem.appendChild(nameSpan);
            resourceItem.appendChild(valueSpan);
            this.container.appendChild(resourceItem);

            // 나중에 빠르게 접근하기 위해 값(value) span을 맵에 저장합니다.
            this.resourceValueElements.set(key, valueSpan);
        });
    }

    /**
     * 현재 자원 상태에 맞춰 UI를 업데이트합니다.
     */
    update() {
        const allResources = sharedResourceEngine.getAllResources('ally');
        for (const [type, value] of Object.entries(allResources)) {
            const element = this.resourceValueElements.get(type);
            if (element && element.innerText !== value.toString()) {
                element.innerText = value;
            }
        }
    }

    /**
     * UI를 화면에 표시합니다.
     */
    show() {
        this.container.style.display = 'flex';
        this.update(); // 표시될 때 최신 값으로 갱신
    }

    /**
     * UI를 화면에서 숨깁니다.
     */
    hide() {
        this.container.style.display = 'none';
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
