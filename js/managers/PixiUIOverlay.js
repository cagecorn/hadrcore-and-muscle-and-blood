import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.mjs';
import { GAME_DEBUG_MODE, GAME_EVENTS, ATTACK_TYPES, UI_STATES } from '../constants.js';

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

        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, this._onDisplayDamage.bind(this));
    }

    resize(width, height) { this.app.renderer.resize(width, height); }

    _onDisplayDamage({ unitId, damage, color }) {
        if (this.sceneEngine.getCurrentSceneName() !== UI_STATES.COMBAT_SCREEN) return;
        const style = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: this.measureManager.get('vfx.damageNumberBaseFontSize'), fill: color || '#FF4500', stroke: '#000', strokeThickness: 2, resolution: 2 });
        const text = new PIXI.Text(String(damage), style);
        text.anchor.set(0.5, 1);
        this.damageTexts.push({ text, start: performance.now(), unitId });
        this.uiContainer.addChild(text);
    }

    _cleanupUnitUI(unitId) {
        if (this.hpBars.has(unitId)) { this.hpBars.get(unitId).destroy(); this.hpBars.delete(unitId); }
        if (this.nameSprites.has(unitId)) { this.nameSprites.get(unitId).destroy(); this.nameSprites.delete(unitId); }
    }

    update(delta) {
        if (this.sceneEngine.getCurrentSceneName() !== UI_STATES.COMBAT_SCREEN) {
            if (this.uiContainer.children.length > 0) {
                this.uiContainer.removeChildren().forEach(child => child.destroy());
                this.hpBars.clear(); this.nameSprites.clear(); this.damageTexts = [];
            }
            return;
        }

        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        const aliveUnitIds = new Set(this.battleSimulationManager.unitsOnGrid.map(u => u.id));

        for (const unitId of this.hpBars.keys()) {
            if (!aliveUnitIds.has(unitId)) this._cleanupUnitUI(unitId);
        }

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) { this._cleanupUnitUI(unit.id); continue; }

            let nameSprite = this.nameSprites.get(unit.id);
            let bar = this.hpBars.get(unit.id);

            if (!nameSprite) {
                const bgColor = unit.type === ATTACK_TYPES.MERCENARY ? 'rgba(0, 51, 204, 0.8)' : 'rgba(204, 0, 0, 0.8)';
                const fontSize = Math.round(effectiveTileSize * 0.18);

                // OffscreenTextManager를 통해 텍스트 이미지를 생성합니다.
                const nameImage = this.offscreenTextManager.getOrCreateText(unit.name, { fontSize: fontSize, bgColor: bgColor });

                // 생성된 이미지로 PixiJS 텍스처와 스프라이트를 만듭니다.
                const texture = PIXI.Texture.from(nameImage);
                nameSprite = new PIXI.Sprite(texture);
                nameSprite.anchor.set(0.5, 0);
                this.uiContainer.addChild(nameSprite);
                this.nameSprites.set(unit.id, nameSprite);

                bar = new PIXI.Graphics();
                this.uiContainer.addChild(bar);
                this.hpBars.set(unit.id, bar);
            }

            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const centerX = drawX + effectiveTileSize / 2;

            // 이름표 위치 설정
            const nameYPosition = drawY + effectiveTileSize + 5;
            nameSprite.position.set(centerX, nameYPosition);

            // HP 바 로직
            const barWidth = effectiveTileSize * 0.8;
            const barHeight = effectiveTileSize * 0.1;
            const barYOffset = drawY + effectiveTileSize - barHeight;
            const maxHp = unit.baseStats?.hp || 1;
            const hpRatio = Math.max(0, unit.currentHp / maxHp);

            bar.clear();
            bar.beginFill(0x333333, 0.8);
            bar.drawRect(centerX - barWidth / 2, barYOffset, barWidth, barHeight);
            bar.endFill();
            bar.beginFill(0x00ff00);
            bar.drawRect(centerX - barWidth / 2, barYOffset, barWidth * hpRatio, barHeight);
            bar.endFill();
        }

        const now = performance.now();
        const duration = this.measureManager.get('vfx.damageNumberDuration');
        this.damageTexts = this.damageTexts.filter(obj => {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === obj.unitId);
            if (!unit) { obj.text.destroy(); return false; }
            const progress = (now - obj.start) / duration;
            if (progress >= 1) { obj.text.destroy(); return false; }
            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            obj.text.position.set(drawX + effectiveTileSize / 2, drawY - progress * effectiveTileSize * 0.5);
            obj.text.alpha = 1 - progress;
            return true;
        });

        this.app.render();
    }
}
