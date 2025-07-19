// js/managers/DetailInfoManager.js

import { GAME_EVENTS, UI_STATES } from '../constants.js';

export class DetailInfoManager {
    constructor(renderer, cameraEngine, battleSimulationManager, eventManager, assetLoaderManager) {
        console.log("\u2139\ufe0f DetailInfoManager initialized. Now using DOM for tooltips. \u2139\ufe0f");
        this.renderer = renderer;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager;
        this.eventManager = eventManager;
        this.assetLoaderManager = assetLoaderManager;
        this.currentUIState = UI_STATES.MAP_SCREEN;
        this.hoveredUnit = null;

        // DOM element for tooltip
        this.infoBox = document.createElement('div');
        this.infoBox.id = 'detail-info-box';
        this.infoBox.style.display = 'none';
        document.getElementById('dom-vfx-container').appendChild(this.infoBox);

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.UI_STATE_CHANGED, (state) => this.currentUIState = state);
        this.eventManager.subscribe(GAME_EVENTS.CANVAS_MOUSE_MOVED, (data) => this._onMouseMove(data));
    }

    _onMouseMove({ x, y }) {
        if (this.currentUIState !== UI_STATES.COMBAT_SCREEN) {
            this.hideInfo();
            return;
        }

        const worldPos = this.cameraEngine.screenToWorld(x, y);
        const unit = this.battleSimulationManager.getUnitAtWorldPosition(worldPos.x, worldPos.y);

        if (unit) {
            this.hoveredUnit = unit;
            this.showInfo(unit, x, y);
        } else {
            this.hoveredUnit = null;
            this.hideInfo();
        }
    }

    showInfo(unit, screenX, screenY) {
        this.infoBox.style.display = 'block';
        this.infoBox.innerHTML = this._buildInfoHTML(unit);

        const boxRect = this.infoBox.getBoundingClientRect();
        const canvasRect = this.renderer.canvas.getBoundingClientRect();

        let left = screenX + 20;
        let top = screenY + 20;

        if (left + boxRect.width > canvasRect.width) {
            left = screenX - boxRect.width - 20;
        }
        if (top + boxRect.height > canvasRect.height) {
            top = screenY - boxRect.height - 20;
        }

        this.infoBox.style.left = `${left}px`;
        this.infoBox.style.top = `${top}px`;
    }

    hideInfo() {
        this.infoBox.style.display = 'none';
    }

    _buildInfoHTML(unit) {
        const { baseStats, currentHp } = unit;
        const statusEffects = this.battleSimulationManager.statusEffectManager.getUnitStatusEffects(unit.id);

        let effectsHTML = '<div><strong>Status Effects:</strong></div>';
        if (statusEffects.length > 0) {
            effectsHTML += '<div class="effects-grid">';
            effectsHTML += statusEffects.map(effect => `\n                <div class="effect-item">\n                    <span>${effect.name} (${effect.duration})</span>\n                </div>`).join('');
            effectsHTML += '</div>';
        } else {
            effectsHTML += '<span>None</span>';
        }

        return `\n            <div class="info-header">\n                <h3>${unit.name}</h3>\n                <span>Level ${unit.level}</span>\n            </div>\n            <div class="info-body">\n                <div class="info-stats">\n                    <div>HP: ${currentHp} / ${baseStats.hp}</div>\n                    <div>ATK: ${baseStats.attack}</div>\n                    <div>DEF: ${baseStats.defense}</div>\n                    <div>SPD: ${baseStats.speed}</div>\n                </div>\n                <hr>\n                ${effectsHTML}\n            </div>\n        `;
    }

    update(deltaTime) {
        // No longer needed for drawing, but can be kept for other logic.
    }

    draw(ctx) {
        // All drawing logic is removed.
    }
}
