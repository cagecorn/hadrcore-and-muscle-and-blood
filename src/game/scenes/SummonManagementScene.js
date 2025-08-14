import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { SummonManagementDOMEngine } from '../dom/SummonManagementDOMEngine.js';

export class SummonManagementScene extends Scene {
    constructor() {
        super('SummonManagementScene');
        this.summonDomEngine = null;
    }

    create() {
        const territoryContainer = document.getElementById('territory-container');
        if (territoryContainer) {
            territoryContainer.style.display = 'none';
        }

        const domEngine = new DOMEngine(this);
        this.summonDomEngine = new SummonManagementDOMEngine(this);

        this.events.on('shutdown', () => {
            this.summonDomEngine.destroy();
        });
    }
}
