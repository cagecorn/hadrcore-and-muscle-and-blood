// Use the ESM build of Pixi.js directly from the CDN. This avoids the browser
// error about failing to resolve the module specifier when running without a
// bundler.
import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.mjs';
import { GAME_DEBUG_MODE, GAME_EVENTS, ATTACK_TYPES } from '../constants.js';

export class PixiUIOverlay {
    constructor(renderer, measureManager, battleSimulationManager, animationManager, eventManager) {
        if (GAME_DEBUG_MODE) console.log('\uD83D\uDD8C️ PixiUIOverlay initialized.');
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        this.eventManager = eventManager;

        const view = document.createElement('canvas');
        view.id = 'pixi-ui-canvas';
        view.style.position = 'absolute';
        view.style.left = '0';
        view.style.top = '0';
        view.style.pointerEvents = 'none';
        renderer.canvas.parentNode.appendChild(view);

        this.app = new PIXI.Application({
            view,
            width: renderer.canvas.width / renderer.pixelRatio,
            height: renderer.canvas.height / renderer.pixelRatio,
            backgroundAlpha: 0,
            autoStart: false
        });

        this.uiContainer = new PIXI.Container();
        this.app.stage.addChild(this.uiContainer);

        // 그림자 전용 컨테이너를 추가하여 다른 UI 요소와 분리합니다.
        this.shadowContainer = new PIXI.Container();
        // stage의 최하단에 위치하도록 인덱스 0에 배치합니다.
        this.app.stage.addChildAt(this.shadowContainer, 0);

        this.hpBars = new Map();
        this.nameTexts = new Map();
        this.nameBackgrounds = new Map();
        this.buffIcons = new Map();
        this.damageTexts = [];

        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, this._onDisplayDamage.bind(this));
    }

    resize(width, height) {
        this.app.renderer.resize(width, height);
    }

    _onDisplayDamage({ unitId, damage, color }) {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: this.measureManager.get('vfx.damageNumberBaseFontSize'),
            fill: color || '#FF4500',
            stroke: '#000',
            strokeThickness: 2
        });
        const text = new PIXI.Text(String(damage), style);
        text.anchor.set(0.5, 1);
        this.damageTexts.push({ text, start: performance.now(), unitId });
        this.uiContainer.addChild(text);
    }

    update(delta) {
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) {
                if (this.nameTexts.has(unit.id)) {
                    this.uiContainer.removeChild(this.nameTexts.get(unit.id));
                    this.nameTexts.delete(unit.id);
                }
                if (this.nameBackgrounds.has(unit.id)) {
                    this.uiContainer.removeChild(this.nameBackgrounds.get(unit.id));
                    this.nameBackgrounds.delete(unit.id);
                }
                continue;
            }

            let bar = this.hpBars.get(unit.id);
            let nameText = this.nameTexts.get(unit.id);
            let nameBg = this.nameBackgrounds.get(unit.id);
            let buff = this.buffIcons.get(unit.id);
            if (!bar) {
                bar = new PIXI.Graphics();
                this.uiContainer.addChild(bar);
                this.hpBars.set(unit.id, bar);

                const textStyle = new PIXI.TextStyle({
                    fontFamily: 'Arial',
                    fontSize: effectiveTileSize * 0.2,
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                });
                nameText = new PIXI.Text(unit.name, textStyle);
                nameText.anchor.set(0.5, 0);
                this.uiContainer.addChild(nameText);
                this.nameTexts.set(unit.id, nameText);

                nameBg = new PIXI.Graphics();
                this.uiContainer.addChild(nameBg);
                this.nameBackgrounds.set(unit.id, nameBg);

                buff = new PIXI.Graphics();
                this.uiContainer.addChild(buff);
                this.buffIcons.set(unit.id, buff);
            }
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );
            const centerX = drawX + effectiveTileSize / 2;
            const centerY = drawY + effectiveTileSize / 2;
            const barWidth = effectiveTileSize * this.measureManager.get('vfx.hpBarWidthRatio');
            const barHeight = effectiveTileSize * this.measureManager.get('vfx.hpBarHeightRatio');
            const offsetY = -(barHeight + this.measureManager.get('vfx.hpBarVerticalOffset'));
            const maxHp = unit.baseStats?.hp || unit.currentHp || 1;
            const currentHp = unit.currentHp !== undefined ? unit.currentHp : maxHp;
            const ratio = currentHp / maxHp;
            bar.clear();
            bar.beginFill(0x333333, 0.8);
            bar.drawRect(-barWidth/2, offsetY, barWidth, barHeight);
            bar.endFill();
            bar.beginFill(0x00ff00);
            bar.drawRect(-barWidth/2, offsetY, barWidth * ratio, barHeight);
            bar.endFill();
            bar.position.set(centerX, centerY);

            // Update name text and background
            const padding = 4;
            const nameYPosition = drawY + effectiveTileSize + 5;

            nameText.text = unit.name;
            nameText.position.set(centerX, nameYPosition);

            const bgColor = unit.type === ATTACK_TYPES.MERCENARY ? 0x0000ff : 0xff0000;
            nameBg.clear();
            nameBg.beginFill(bgColor, 0.7);
            nameBg.drawRect(
                -nameText.width / 2 - padding,
                -padding / 2,
                nameText.width + padding * 2,
                nameText.height + padding
            );
            nameBg.endFill();
            nameBg.position.set(centerX, nameYPosition + nameText.height / 2);

            buff.clear();
            buff.beginFill(0xffff00);
            const iconSize = effectiveTileSize * 0.2;
            buff.drawCircle(0, offsetY - iconSize, iconSize / 2);
            buff.endFill();
            buff.position.set(centerX, centerY);
        }

        const now = performance.now();
        const duration = this.measureManager.get('vfx.damageNumberDuration');
        this.damageTexts = this.damageTexts.filter(obj => {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === obj.unitId);
            if (!unit) {
                this.uiContainer.removeChild(obj.text);
                return false;
            }
            const progress = (now - obj.start) / duration;
            if (progress >= 1) {
                this.uiContainer.removeChild(obj.text);
                return false;
            }
            const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );
            obj.text.position.set(drawX + effectiveTileSize / 2, drawY - progress * effectiveTileSize * 0.5);
            obj.text.alpha = 1 - progress;
            return true;
        });

        this.app.render();
    }
}
