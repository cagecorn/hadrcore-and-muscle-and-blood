import { GAME_EVENTS, SKILL_TYPE_COLORS } from '../constants.js';

export class DOMVFXEngine {
    constructor(battleSimulationManager, cameraEngine, eventManager, domAnimationManager) {
        console.log("\ud83c\udfe3 DOMVFXEngine initialized. Managing UI elements in the DOM. \ud83c\udfe3");
        this.battleSimulationManager = battleSimulationManager;
        this.cameraEngine = cameraEngine;
        this.eventManager = eventManager;
        this.domAnimationManager = domAnimationManager;

        this.container = document.getElementById('dom-vfx-container');
        this.unitUIs = new Map();

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

        // HP & Barrier Bar Container
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';

        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar';

        const barrierBar = document.createElement('div');
        barrierBar.className = 'barrier-bar';

        barContainer.appendChild(hpBar);
        barContainer.appendChild(barrierBar);

        const nameTag = document.createElement('div');
        nameTag.className = 'unit-name-tag';
        nameTag.textContent = unit.name;
        nameTag.style.color = unit.isPlayerUnit ? '#66ccff' : '#ffd700';

        uiContainer.appendChild(barContainer);
        uiContainer.appendChild(nameTag);
        this.container.appendChild(uiContainer);

        this.unitUIs.set(unit.id, {
            container: uiContainer,
            hpBar: hpBar,
            barrierBar: barrierBar,
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
        const text = (damage > 0 && color === 'lime') ? `+${damage}` : `${Math.abs(damage)}`;
        this.domAnimationManager.add(unitId, text, 'damage-number', color, 1000, 0);
    }

    showSkillName(unitId, skillName, skillType) {
        const color = SKILL_TYPE_COLORS[skillType] || '#FFD700';
        const { effectiveTileSize } = this.battleSimulationManager.getGridRenderParameters();
        this.domAnimationManager.add(unitId, skillName, 'skill-name-display', color, 1500, effectiveTileSize * 0.5);
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
            const hpRatio = Math.max(0, unit.currentHp) / unit.baseStats.hp;
            ui.hpBar.style.width = `${hpRatio * 100}%`;

            const barrierValue = unit.currentBarrier || 0;
            if (barrierValue > 0) {
                const barrierRatio = Math.min(hpRatio + (barrierValue / unit.baseStats.hp), 1);
                ui.barrierBar.style.width = `${barrierRatio * 100}%`;
                ui.barrierBar.style.display = 'block';
            } else {
                ui.barrierBar.style.display = 'none';
            }
        }

    }

    clearAllUIs() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.unitUIs.clear();
        if (this.domAnimationManager) {
            this.domAnimationManager.clearAll();
        }
    }
}
