import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { FormationDOMEngine } from '../dom/FormationDOMEngine.js';

export class FormationScene extends Scene {
    constructor() {
        super('FormationScene');
        this.formationDomEngine = null;
    }

    create() {
        const territoryContainer = document.getElementById('territory-container');
        if (territoryContainer) {
            territoryContainer.style.display = 'none';
        }
        const domEngine = new DOMEngine(this);
        this.formationDomEngine = new FormationDOMEngine(this, domEngine);

        this.events.on('shutdown', () => {
            this.formationDomEngine.destroy();
        });
    }
}
