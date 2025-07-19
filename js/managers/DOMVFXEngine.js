import { GAME_EVENTS, SKILL_TYPE_COLORS } from '../constants.js';

export class DOMVFXEngine {
    constructor(battleSimulationManager, cameraEngine, eventManager) {
        console.log("\ud83c\udfe3 DOMVFXEngine initialized. Managing UI elements in the DOM. \ud83c\udfe3");
        this.battleSimulationManager = battleSimulationManager;
        this.cameraEngine = cameraEngine;
        this.eventManager = eventManager;

        this.container = document.getElementById('dom-vfx-container');
        if (!this.container) {
            console.warn("[DOMVFXEngine] 'dom-vfx-container' element not found. VFX will not be displayed.");
        }
        this.unitUIs = new Map();
        this.tempElements = [];

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, () => this.initAllUnitUIs());
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_END, () => this.clearAllUIs());
        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, ({ unitId }) => this.removeUnitUI(unitId));
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, (data) => this.showDamageNumber(data.unitId, data.damage, data.color));
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_SKILL_NAME, (data) => this.showSkillName(data.unitId, data.skillName, data.skillType));
    }

    initAllUnitUIs() {
        this.clearAllUIs();
        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            this.createUnitUI(unit);
        }
    }

    createUnitUI(unit) {
        if (this.unitUIs.has(unit.id) || !this.container) return;

        const uiContainer = document.createElement('div');
        uiContainer.className = 'unit-ui-container';

        const hpBarContainer = document.createElement('div');
        hpBarContainer.className = 'hp-bar-container';
        const hpBarBackground = document.createElement('div');
        hpBarBackground.className = 'hp-bar-background';
        const hpBarForeground = document.createElement('div');
        hpBarForeground.className = 'hp-bar-foreground';
        const hpBarText = document.createElement('span');
        hpBarText.className = 'hp-bar-text';
        hpBarContainer.appendChild(hpBarBackground);
        hpBarContainer.appendChild(hpBarForeground);
        hpBarContainer.appendChild(hpBarText);

        const nameTag = document.createElement('div');
        nameTag.className = 'unit-name-tag';
        nameTag.textContent = unit.name;

        uiContainer.appendChild(hpBarContainer);
        uiContainer.appendChild(nameTag);
        this.container.appendChild(uiContainer);

        this.unitUIs.set(unit.id, {
            container: uiContainer,
            hpBar: hpBarForeground,
            hpText: hpBarText,
            nameTag: nameTag
        });
    }

    removeUnitUI(unitId) {
        if (this.unitUIs.has(unitId)) {
            this.unitUIs.get(unitId).container.remove();
            this.unitUIs.delete(unitId);
        }
    }

    showDamageNumber(unitId, damage, color = 'red') {
        if (!this.container) return;
        const element = document.createElement('div');
        element.className = 'damage-number';
        element.textContent = damage;
        element.style.color = color;
        const duration = 1000;
        element.style.animationDuration = `${duration}ms`;
        this.container.appendChild(element);
        this.tempElements.push({ element, unitId, startTime: performance.now(), duration, type: 'damage' });
    }

    showSkillName(unitId, skillName, skillType) {
        if (!this.container) return;
        const element = document.createElement('div');
        element.className = 'skill-name-display';
        element.textContent = skillName;
        element.style.color = SKILL_TYPE_COLORS[skillType] || '#FFD700';
        const duration = 1500;
        element.style.animationDuration = `${duration}ms`;
        this.container.appendChild(element);
        this.tempElements.push({ element, unitId, startTime: performance.now(), duration, type: 'skill' });
    }

    update() {
        if (!this.battleSimulationManager) return;
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();

        for (const [unitId, ui] of this.unitUIs.entries()) {
            const unit = this.battleSimulationManager.getUnitById(unitId);
            if (!unit || unit.currentHp <= 0) {
                ui.container.style.display = 'none';
                continue;
            } else {
                ui.container.style.display = 'block';
            }

            const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
                unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY
            );
            const xPos = drawX + effectiveTileSize / 2;
            const yPos = drawY - 10;
            ui.container.style.transform = `translate(-50%, -100%) translate(${xPos}px, ${yPos}px)`;
            const hpRatio = unit.currentHp / unit.baseStats.hp;
            ui.hpBar.style.width = `${hpRatio * 100}%`;
            ui.hpText.textContent = `${unit.currentHp} / ${unit.baseStats.hp}`;
        }

        const now = performance.now();
        for (let i = this.tempElements.length - 1; i >= 0; i--) {
            const item = this.tempElements[i];
            if (now - item.startTime > item.duration) {
                item.element.remove();
                this.tempElements.splice(i, 1);
                continue;
            }
            const unit = this.battleSimulationManager.getUnitById(item.unitId);
            if (unit) {
                const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
                    unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY
                );
                let yOffset = item.type === 'skill' ? effectiveTileSize * 0.5 : 0;
                const xPos = drawX + effectiveTileSize / 2;
                const yPos = drawY - yOffset;
                item.element.style.transform = `translate(-50%, -100%) translate(${xPos}px, ${yPos}px)`;
            }
        }
    }

    clearAllUIs() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.unitUIs.clear();
        this.tempElements = [];
    }
}
