// js/managers/DOMUIManager.js

import { UI_STATES, ATTACK_TYPES } from '../constants.js';

export class DOMUIManager {
    constructor(gameEngine) {
        console.log('DOMUIManager: Initialized.');
        this.battleSimManager = gameEngine.getBattleSimulationManager();
        this.cameraEngine = gameEngine.getCameraEngine();
        this.sceneEngine = gameEngine.getSceneEngine();
        this.animationManager = gameEngine.getAnimationManager();

        this.uiContainer = document.getElementById('dom-ui-container');
        this.unitElements = new Map(); // key: unitId, value: { wrapper, hpBar, name }
    }

    _createUnitElement(unit) {
        const element = document.createElement('div');
        element.className = 'unit-ui';

        const name = document.createElement('div');
        name.className = 'unit-name';
        name.textContent = unit.name;
        name.style.backgroundColor = unit.type === ATTACK_TYPES.MERCENARY ? 'blue' : 'red';

        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar';

        const hpBarCurrent = document.createElement('div');
        hpBarCurrent.className = 'hp-bar-current';

        hpBar.appendChild(hpBarCurrent);
        element.appendChild(name);
        element.appendChild(hpBar);

        this.uiContainer.appendChild(element);

        this.unitElements.set(unit.id, { wrapper: element, hpBar: hpBarCurrent, name: name });
    }

    update() {
        if (this.sceneEngine.getCurrentSceneName() !== UI_STATES.COMBAT_SCREEN) {
            this.uiContainer.style.display = 'none';
            return;
        }

        this.uiContainer.style.display = 'block';

        const aliveUnitIds = new Set(this.battleSimManager.unitsOnGrid.filter(u => u.currentHp > 0).map(u => u.id));
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimManager.getGridRenderParameters();

        for (const unit of this.battleSimManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue;

            if (!this.unitElements.has(unit.id)) {
                this._createUnitElement(unit);
            }

            const elements = this.unitElements.get(unit.id);
            const { wrapper, hpBar } = elements;

            const worldPos = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const screenX = (worldPos.drawX * this.cameraEngine.zoom) + this.cameraEngine.x;
            const screenY = (worldPos.drawY * this.cameraEngine.zoom) + this.cameraEngine.y;

            const finalX = screenX + (effectiveTileSize * this.cameraEngine.zoom / 2);
            const finalY = screenY + (effectiveTileSize * this.cameraEngine.zoom);

            wrapper.style.transform = `translate(-50%, 0) translate(${finalX}px, ${finalY}px) scale(${this.cameraEngine.zoom})`;

            hpBar.style.width = `${(unit.currentHp / unit.baseStats.hp) * 100}%`;
        }

        for (const unitId of this.unitElements.keys()) {
            if (!aliveUnitIds.has(unitId)) {
                this.unitElements.get(unitId).wrapper.remove();
                this.unitElements.delete(unitId);
            }
        }
    }
}
