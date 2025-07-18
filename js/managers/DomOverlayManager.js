import { GAME_EVENTS, SKILL_TYPE_COLORS } from '../constants.js';

export class DomOverlayManager {
    constructor(container, measureManager, animationManager, battleSimulationManager, statusEffectManager, skillIconManager, eventManager) {
        this.container = container;
        this.measureManager = measureManager;
        this.animationManager = animationManager;
        this.battleSimulationManager = battleSimulationManager;
        this.statusEffectManager = statusEffectManager;
        this.skillIconManager = skillIconManager;
        this.eventManager = eventManager;

        this.unitOverlays = new Map();
        this.activeDamageNumbers = [];
        this.activeSkillNames = [];

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, ({ unitId, damage, color }) => {
            this.addDamageNumber(unitId, damage, color);
        });
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_SKILL_NAME, ({ unitId, skillName, skillType }) => {
            this.addSkillName(unitId, skillName, skillType);
        });
    }

    addDamageNumber(unitId, damage, color = 'red') {
        const el = document.createElement('div');
        el.className = 'damage-number';
        el.textContent = damage;
        el.style.color = color;
        this.container.appendChild(el);
        this.activeDamageNumbers.push({ unitId, startTime: performance.now(), duration: this.measureManager.get('vfx.damageNumberDuration'), el });
    }

    addSkillName(unitId, skillName, skillType) {
        const el = document.createElement('div');
        el.className = 'skill-name';
        el.textContent = skillName;
        el.style.color = SKILL_TYPE_COLORS[skillType] || '#FFD700';
        this.container.appendChild(el);
        this.activeSkillNames.push({ unitId, startTime: performance.now(), duration: 1500, el });
    }

    _ensureUnitOverlay(unit) {
        if (this.unitOverlays.has(unit.id)) return this.unitOverlays.get(unit.id);

        const wrapper = document.createElement('div');
        wrapper.className = 'unit-overlay';

        const hpBg = document.createElement('div');
        hpBg.className = 'hp-bar-bg';
        const hpFill = document.createElement('div');
        hpFill.className = 'hp-bar-fill';
        hpBg.appendChild(hpFill);

        const barrierBar = document.createElement('div');
        barrierBar.className = 'barrier-bar';
        hpBg.appendChild(barrierBar);

        const statusIcons = document.createElement('div');
        statusIcons.className = 'status-icons';

        wrapper.appendChild(hpBg);
        wrapper.appendChild(statusIcons);
        this.container.appendChild(wrapper);

        const info = { wrapper, hpFill, barrierBar, statusIcons };
        this.unitOverlays.set(unit.id, info);
        return info;
    }

    update(deltaTime) {
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        const activeIds = new Set();

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            activeIds.add(unit.id);
            const overlay = this._ensureUnitOverlay(unit);
            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            overlay.wrapper.style.left = `${drawX + effectiveTileSize / 2}px`;
            overlay.wrapper.style.top = `${drawY}px`;

            const maxHp = unit.baseStats ? unit.baseStats.hp : unit.currentHp || 1;
            const currentHp = unit.currentHp ?? maxHp;
            overlay.hpFill.style.width = `${(currentHp / maxHp) * 100}%`;

            if (unit.maxBarrier && unit.maxBarrier > 0) {
                overlay.barrierBar.style.display = 'block';
                overlay.barrierBar.style.width = `${(unit.currentBarrier / unit.maxBarrier) * 100}%`;
            } else {
                overlay.barrierBar.style.display = 'none';
            }

            const effects = this.statusEffectManager.turnCountManager.getEffectsOfUnit(unit.id);
            overlay.statusIcons.innerHTML = '';
            if (effects) {
                for (const [effectId] of effects.entries()) {
                    const iconImg = this.skillIconManager.getSkillIcon(effectId);
                    if (iconImg) {
                        const img = document.createElement('img');
                        img.src = iconImg.src;
                        overlay.statusIcons.appendChild(img);
                    }
                }
            }
        }

        for (const [unitId, overlay] of this.unitOverlays.entries()) {
            if (!activeIds.has(unitId)) {
                overlay.wrapper.remove();
                this.unitOverlays.delete(unitId);
            }
        }

        const now = performance.now();
        this.activeDamageNumbers = this.activeDamageNumbers.filter(effect => {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === effect.unitId);
            if (!unit) {
                effect.el.remove();
                return false;
            }
            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const progress = (now - effect.startTime) / effect.duration;
            if (progress >= 1) {
                effect.el.remove();
                return false;
            }
            effect.el.style.left = `${drawX + effectiveTileSize / 2}px`;
            effect.el.style.top = `${drawY - progress * effectiveTileSize}px`;
            effect.el.style.opacity = (1 - progress).toString();
            return true;
        });

        this.activeSkillNames = this.activeSkillNames.filter(effect => {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === effect.unitId);
            if (!unit) {
                effect.el.remove();
                return false;
            }
            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const progress = (now - effect.startTime) / effect.duration;
            if (progress >= 1) {
                effect.el.remove();
                return false;
            }
            effect.el.style.left = `${drawX + effectiveTileSize / 2}px`;
            effect.el.style.top = `${drawY - progress * effectiveTileSize}px`;
            effect.el.style.opacity = (1 - progress).toString();
            return true;
        });
    }
}
