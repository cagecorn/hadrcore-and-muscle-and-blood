import { DOMEngine } from '../utils/DOMEngine.js';

/**
 * 출정 화면의 DOM 요소를 생성하고 관리하는 엔진
 */
export class DungeonDOMEngine {
    constructor(scene, domEngine) {
        this.scene = scene;
        this.domEngine = domEngine;
        this.container = document.getElementById('dungeon-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'dungeon-container';
            document.getElementById('app').appendChild(this.container);
        }
        this.grid = null;
        this.createView();
    }

    createView() {
        this.container.style.display = 'block';
        this.container.style.backgroundImage = 'url(assets/images/territory/dungeon-scene.png)';

        const grid = document.createElement('div');
        grid.id = 'dungeon-grid';
        this.container.appendChild(grid);
        this.grid = grid;

        // 첫 번째 타일 예시
        const tile = document.createElement('div');
        tile.className = 'dungeon-tile';
        tile.style.backgroundImage = 'url(assets/images/territory/cursed-forest.png)';
        tile.addEventListener('click', () => {
            this.scene.scene.start('CursedForestBattle');
        });

        const label = document.createElement('div');
        label.className = 'dungeon-label';
        label.innerText = '[저주받은 숲]';
        tile.appendChild(label);
        grid.appendChild(tile);
    }

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}
