import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { SkillManagementDOMEngine } from '../dom/SkillManagementDOMEngine.js';

export class SkillManagementScene extends Scene {
    constructor() {
        super('SkillManagementScene');
        this.skillDomEngine = null;
    }

    create() {
        const territoryContainer = document.getElementById('territory-container');
        if (territoryContainer) {
            territoryContainer.style.display = 'none';
        }

        const domEngine = new DOMEngine(this);
        this.skillDomEngine = new SkillManagementDOMEngine(this);

        this.events.on('shutdown', () => {
            this.skillDomEngine.destroy();
        });
    }
}
