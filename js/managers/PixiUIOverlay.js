import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.mjs';
import { GAME_DEBUG_MODE, GAME_EVENTS, ATTACK_TYPES, UI_STATES, SKILL_TYPE_COLORS } from '../constants.js';

export class PixiUIOverlay {
    // OffscreenTextManager를 생성자에서 받습니다.
    constructor(renderer, measureManager, battleSimulationManager, animationManager, eventManager, sceneEngine, offscreenTextManager) {
        if (GAME_DEBUG_MODE) console.log('🎨 PixiUIOverlay initialized.');
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        this.eventManager = eventManager;
        this.sceneEngine = sceneEngine;
        this.offscreenTextManager = offscreenTextManager; // OffscreenTextManager 인스턴스 저장

        const view = document.createElement('canvas');
        view.id = 'pixi-ui-canvas';
        renderer.canvas.parentNode.appendChild(view);

        this.app = new PIXI.Application({ view, width: renderer.canvas.width / renderer.pixelRatio, height: renderer.canvas.height / renderer.pixelRatio, backgroundAlpha: 0, autoStart: false });
        this.uiContainer = new PIXI.Container();
        this.app.stage.addChild(this.uiContainer);
        this.shadowContainer = new PIXI.Container();
        this.app.stage.addChildAt(this.shadowContainer, 0);

        this.hpBars = new Map();
        this.nameSprites = new Map(); // PIXI.Text 대신 PIXI.Sprite를 사용합니다.
        this.damageTexts = [];
        this.skillTexts = [];

        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, this._onDisplayDamage.bind(this));
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_SKILL_NAME, this._onDisplaySkillName.bind(this));
    }

    resize(width, height) { this.app.renderer.resize(width, height); }

    _onDisplayDamage({ unitId, damage, color }) {
        if (this.sceneEngine.getCurrentSceneName() !== UI_STATES.COMBAT_SCREEN) return;
        const fontSize = this.measureManager.get('vfx.damageNumberBaseFontSize');
        const dmgCanvas = this.offscreenTextManager.getOrCreateText(String(damage), {
            fontSize,
            fontColor: color || '#FF4500',
            bgColor: 'rgba(0,0,0,0)'
        });
        const texture = PIXI.Texture.from(dmgCanvas);
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 1);
        sprite.scale.set(1 / this.offscreenTextManager.renderScale);
        this.damageTexts.push({ text: sprite, start: performance.now(), unitId });
        this.uiContainer.addChild(sprite);
    }

    _onDisplaySkillName({ unitId, skillName, skillType }) {
        if (this.sceneEngine.getCurrentSceneName() !== UI_STATES.COMBAT_SCREEN) return;
        const fontSize = Math.round(this.measureManager.get('vfx.damageNumberBaseFontSize') * 0.8);
        const skillCanvas = this.offscreenTextManager.getOrCreateText(skillName, {
            fontSize,
            fontColor: SKILL_TYPE_COLORS[skillType] || '#FFD700',
            bgColor: 'rgba(0,0,0,0)'
        });
        const texture = PIXI.Texture.from(skillCanvas);
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 1);
        sprite.scale.set(1 / this.offscreenTextManager.renderScale);
        this.skillTexts.push({ text: sprite, start: performance.now(), unitId });
        this.uiContainer.addChild(sprite);
    }

    _cleanupUnitUI(unitId) {
        if (this.hpBars.has(unitId)) { this.hpBars.get(unitId).destroy(); this.hpBars.delete(unitId); }
        if (this.nameSprites.has(unitId)) { this.nameSprites.get(unitId).destroy(); this.nameSprites.delete(unitId); }
        this.damageTexts = this.damageTexts.filter(obj => {
            if (obj.unitId === unitId) { obj.text.destroy(); return false; }
            return true;
        });
        this.skillTexts = this.skillTexts.filter(obj => {
            if (obj.unitId === unitId) { obj.text.destroy(); return false; }
            return true;
        });
    }

    update(delta) {
        if (this.sceneEngine.getCurrentSceneName() !== UI_STATES.COMBAT_SCREEN) {
            if (this.uiContainer.children.length > 0) {
                this.uiContainer.removeChildren().forEach(child => child.destroy({ children: true }));
                this.hpBars.clear();
                this.nameSprites.clear();
                this.damageTexts = [];
                this.skillTexts = [];
            }
            return;
        }

        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        const aliveUnitIds = new Set(this.battleSimulationManager.unitsOnGrid.map(u => u.id));

        for (const unitId of this.hpBars.keys()) {
            if (!aliveUnitIds.has(unitId)) this._cleanupUnitUI(unitId);
        }

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) { 
                this._cleanupUnitUI(unit.id); 
                continue; 
            }

            // ✨ nameSprite를 nameRect로 변경하여 테스트합니다.
            let nameRect = this.nameSprites.get(unit.id);
            let bar = this.hpBars.get(unit.id);

            if (!nameRect) {
                // --- ✨ 진단 코드 시작 ✨ ---
                // 텍스트 스프라이트 대신 단순한 PIXI.Graphics 사각형을 생성합니다.
                nameRect = new PIXI.Graphics();
                nameRect.beginFill(unit.type === ATTACK_TYPES.ENEMY ? 0xff0000 : 0x00ff00, 0.7); // 적은 빨강, 아군은 초록
                nameRect.drawRect(0, 0, effectiveTileSize * 0.8, effectiveTileSize * 0.15);
                nameRect.endFill();
                // --- ✨ 진단 코드 종료 ✨ ---

                this.uiContainer.addChild(nameRect);
                this.nameSprites.set(unit.id, nameRect); // 맵 이름은 그대로 사용합니다.

                bar = new PIXI.Graphics();
                this.uiContainer.addChild(bar);
                this.hpBars.set(unit.id, bar);
            }

            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const centerX = drawX + effectiveTileSize / 2;
            
            // 이름표(사각형) 위치 설정 (유닛 이미지 바로 위)
            const nameYPosition = drawY - 20; // 유닛 이미지 상단에서 20px 위
            nameRect.position.set(centerX - nameRect.width / 2, nameYPosition);

            // HP 바 위치 설정 (이름표 위)
            const barWidth = effectiveTileSize * 0.8;
            const barHeight = effectiveTileSize * 0.1;
            const barYOffset = nameYPosition - barHeight - 2;
            
            const maxHp = unit.baseStats?.hp || 1;
            const hpRatio = Math.max(0, unit.currentHp / maxHp);

            bar.clear();
            bar.beginFill(0x333333, 0.8);
            bar.drawRect(centerX - barWidth / 2, barYOffset, barWidth, barHeight);
            bar.endFill();
            bar.beginFill(0x00ff00);
            bar.drawRect(centerX - barWidth / 2, barYOffset, barWidth * barRatio, barHeight);
            bar.endFill();
        }

        const now = performance.now();
        const dmgDuration = this.measureManager.get('vfx.damageNumberDuration');
        this.damageTexts = this.damageTexts.filter(obj => {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === obj.unitId);
            if (!unit) { obj.text.destroy(); return false; }
            const progress = (now - obj.start) / dmgDuration;
            if (progress >= 1) { obj.text.destroy(); return false; }
            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            obj.text.position.set(drawX + effectiveTileSize / 2, drawY - progress * effectiveTileSize * 0.5);
            obj.text.alpha = 1 - progress;
            return true;
        });

        const skillDuration = 1500;
        const floatSpeed = 0.04;
        this.skillTexts = this.skillTexts.filter(obj => {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === obj.unitId);
            if (!unit) { obj.text.destroy(); return false; }
            const progress = (now - obj.start) / skillDuration;
            if (progress >= 1) { obj.text.destroy(); return false; }
            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const offsetY = floatSpeed * (now - obj.start);
            obj.text.position.set(drawX + effectiveTileSize / 2, drawY - offsetY - (effectiveTileSize * 0.2));
            obj.text.alpha = 1 - progress;
            return true;
        });

        this.app.render();
    }
}
