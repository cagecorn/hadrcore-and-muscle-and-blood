import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { EquipmentManagementDOMEngine } from '../dom/EquipmentManagementDOMEngine.js';

export class EquipmentManagementScene extends Scene {
    constructor() {
        super('EquipmentManagementScene');
        this.equipmentDomEngine = null;
    }

    create() {
        const territoryContainer = document.getElementById('territory-container');
        if (territoryContainer) {
            territoryContainer.style.display = 'none';
        }

        const domEngine = new DOMEngine(this);
        this.equipmentDomEngine = new EquipmentManagementDOMEngine(this);

        this.events.on('shutdown', () => {
            this.equipmentDomEngine.destroy();
        });
    }
}
