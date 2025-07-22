// js/managers/MercenaryPanelManager.js

export class MercenaryPanelManager {
    constructor(measureManager, battleSimulationManager, logicManager, eventManager, heroEngine) {
        console.log("\uD83D\uDC65 MercenaryPanelManager initialized. Ready to display mercenary details. \uD83D\uDC65");
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.heroEngine = heroEngine;
        this.logicManager = logicManager;
        this.eventManager = eventManager;

        this.gridRows = this.measureManager.get('mercenaryPanel.gridRows');
        this.gridCols = this.measureManager.get('mercenaryPanel.gridCols');
        this.numSlots = this.gridRows * this.gridCols;
    }

    updatePanel() {
        const heroPanel = document.getElementById('hero-panel');
        if (!heroPanel || heroPanel.classList.contains('hidden')) {
            return;
        }
        heroPanel.innerHTML = '';
        const units = this.heroEngine ? this.heroEngine.getAllHeroes() : (this.battleSimulationManager ? this.battleSimulationManager.unitsOnGrid : []);

        for (let i = 0; i < this.numSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'hero-slot';
            if (units[i]) {
                const unit = units[i];
                const imgSrc = (unit.panelImage || unit.image) && (unit.panelImage || unit.image).src;
                if (imgSrc) {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    slot.appendChild(img);
                }
                const nameEl = document.createElement('p');
                nameEl.textContent = unit.name;
                slot.appendChild(nameEl);
                const hpEl = document.createElement('p');
                hpEl.textContent = `HP: ${unit.currentHp}/${unit.baseStats.hp}`;
                slot.appendChild(hpEl);
            } else {
                slot.textContent = `Slot ${i + 1}`;
            }
            heroPanel.appendChild(slot);
        }
    }
}
