import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { DungeonDOMEngine } from '../dom/DungeonDOMEngine.js';

export class DungeonScene extends Scene {
    constructor() {
        super('DungeonScene');
        this.dungeonDomEngine = null;
    }

    create() {
        const territoryContainer = document.getElementById('territory-container');
        if (territoryContainer) {
            territoryContainer.style.display = 'none';
        }
        const domEngine = new DOMEngine(this);
        this.dungeonDomEngine = new DungeonDOMEngine(this, domEngine);

        const backButton = document.createElement('div');
        backButton.id = 'dungeon-back-button';
        backButton.innerText = '←';
        backButton.addEventListener('click', () => {
            this.scene.start('TerritoryScene');
        });
        document.getElementById('dungeon-container').appendChild(backButton);

        this.events.on('shutdown', () => {
            this.dungeonDomEngine.destroy();
        });
    }
}
