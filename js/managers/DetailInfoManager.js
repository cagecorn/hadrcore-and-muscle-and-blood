// js/managers/DetailInfoManager.js
import { GAME_EVENTS } from '../constants.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class DetailInfoManager {
    constructor(eventManager, measureManager, battleSimulationManager, heroEngine, idManager, cameraEngine, skillIconManager, overlayContainer) {
        console.log('🔍 DetailInfoManager initialized. Ready to show unit details on hover. 🔍');
        this.eventManager = eventManager;
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.heroEngine = heroEngine;
        this.idManager = idManager;
        this.cameraEngine = cameraEngine;
        this.skillIconManager = skillIconManager;
        this.overlayContainer = overlayContainer;

        this.hoveredUnit = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.tooltipEl = document.createElement('div');
        this.tooltipEl.className = 'unit-tooltip hidden';
        this.overlayContainer.appendChild(this.tooltipEl);

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.CANVAS_MOUSE_MOVED, this._onCanvasMouseMove.bind(this));
    }

    _onCanvasMouseMove(data) {
        this.lastMouseX = data.x;
        this.lastMouseY = data.y;
    }

    async update(deltaTime) {
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        const worldMouse = this.cameraEngine ? this.cameraEngine.screenToWorld(this.lastMouseX, this.lastMouseY) : { x: this.lastMouseX, y: this.lastMouseY };
        let currentHovered = null;

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue;
            const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const unitW = effectiveTileSize;
            const unitH = effectiveTileSize;
            if (worldMouse.x >= drawX && worldMouse.x <= drawX + unitW && worldMouse.y >= drawY && worldMouse.y <= drawY + unitH) {
                currentHovered = unit;
                break;
            }
        }

        if (currentHovered) {
            if (this.hoveredUnit !== currentHovered) {
                this.hoveredUnit = currentHovered;
                await this._populateTooltip(currentHovered);
                this.tooltipEl.classList.remove('hidden');
            }
            this.tooltipEl.style.left = `${this.lastMouseX + 15}px`;
            this.tooltipEl.style.top = `${this.lastMouseY + 15}px`;
        } else {
            this.hoveredUnit = null;
            this.tooltipEl.classList.add('hidden');
        }
    }

    async _populateTooltip(unit) {
        const heroDetails = await this.heroEngine.getHero(unit.id);
        let className = '';
        if (unit.classId) {
            const cd = await this.idManager.get(unit.classId);
            className = cd ? cd.name : unit.classId;
        }
        const hp = unit.currentHp ?? (unit.baseStats ? unit.baseStats.hp : '?');
        const maxHp = unit.baseStats ? unit.baseStats.hp : '?';
        const barrier = unit.currentBarrier ?? 0;
        const maxBarrier = unit.maxBarrier ?? 0;

        const parts = [`<strong>${unit.name}</strong>`, `클래스: ${className}`, `HP: ${hp}/${maxHp}`, `배리어: ${barrier}/${maxBarrier}`];

        if (heroDetails && heroDetails.skillSlots && heroDetails.skillSlots.length > 0) {
            const skills = heroDetails.skillSlots.map(id => {
                const s = Object.values(WARRIOR_SKILLS).find(sk => sk.id === id);
                return s ? s.name : id;
            });
            parts.push('스킬: ' + skills.join(', '));
        }
        this.tooltipEl.innerHTML = parts.join('<br>');
    }

    draw() {
        // DOM based, nothing to draw on canvas
    }
}
