import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.mjs';
import { GAME_DEBUG_MODE, GAME_EVENTS, ATTACK_TYPES, UI_STATES } from '../constants.js';

export class PixiUIOverlay {
    // GameEngine에서 sceneEngine을 전달받도록 생성자 수정
    constructor(renderer, measureManager, battleSimulationManager, animationManager, eventManager, sceneEngine) {
        if (GAME_DEBUG_MODE) console.log('🎨 PixiUIOverlay initialized.');
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        this.eventManager = eventManager;
        this.sceneEngine = sceneEngine; // sceneEngine 인스턴스 저장

        const view = document.createElement('canvas');
        view.id = 'pixi-ui-canvas';
        document.getElementById('canvas-wrapper').appendChild(view);

        this.app = new PIXI.Application({
            view,
            width: renderer.canvas.width / renderer.pixelRatio,
            height: renderer.canvas.height / renderer.pixelRatio,
            backgroundAlpha: 0,
            autoStart: false
        });

        this.uiContainer = new PIXI.Container();
        this.app.stage.addChild(this.uiContainer);

        this.shadowContainer = new PIXI.Container();
        this.app.stage.addChildAt(this.shadowContainer, 0);

        // 관리할 UI 요소들을 Map으로 선언
        this.hpBars = new Map();
        this.nameTexts = new Map();
        this.nameBackgrounds = new Map();
        this.damageTexts = [];

        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, this._onDisplayDamage.bind(this));
    }

    resize(width, height) {
        this.app.renderer.resize(width, height);
    }

    _onDisplayDamage({ unitId, damage, color }) {
        // 전투 씬이 아니면 데미지 숫자를 표시하지 않음
        if (this.sceneEngine.getCurrentSceneName() !== UI_STATES.COMBAT_SCREEN) return;

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: this.measureManager.get('vfx.damageNumberBaseFontSize'),
            fill: color || '#FF4500',
            stroke: '#000',
            strokeThickness: 2,
            resolution: 2 // ✨ 텍스트 해상도 2배로 설정하여 선명도 향상
        });
        const text = new PIXI.Text(String(damage), style);
        text.anchor.set(0.5, 1);
        this.damageTexts.push({ text, start: performance.now(), unitId });
        this.uiContainer.addChild(text);
    }

    // 특정 유닛의 모든 UI 요소를 정리하는 헬퍼 메소드
    _cleanupUnitUI(unitId) {
        if (this.hpBars.has(unitId)) {
            this.hpBars.get(unitId).destroy();
            this.hpBars.delete(unitId);
        }
        if (this.nameTexts.has(unitId)) {
            this.nameTexts.get(unitId).destroy();
            this.nameTexts.delete(unitId);
        }
        if (this.nameBackgrounds.has(unitId)) {
            this.nameBackgrounds.get(unitId).destroy();
            this.nameBackgrounds.delete(unitId);
        }
    }

    update(delta) {
        // ✨ 1. 전투 씬이 아닐 경우, 모든 UI를 정리하고 즉시 종료
        if (this.sceneEngine.getCurrentSceneName() !== UI_STATES.COMBAT_SCREEN) {
            if (this.uiContainer.children.length > 0) {
                this.uiContainer.removeChildren().forEach(child => child.destroy());
                this.hpBars.clear();
                this.nameTexts.clear();
                this.nameBackgrounds.clear();
                this.damageTexts = [];
            }
            // 렌더링할 필요 없음
            return;
        }

        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        
        // ✨ 2. 현재 살아있는 유닛 목록을 기준으로 UI 정리
        const aliveUnitIds = new Set(this.battleSimulationManager.unitsOnGrid.map(u => u.id));
        for (const unitId of this.hpBars.keys()) {
            if (!aliveUnitIds.has(unitId)) {
                this._cleanupUnitUI(unitId);
            }
        }

        // ✨ 3. 살아있는 유닛들의 UI만 그리거나 업데이트
        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            // 죽은 유닛은 UI 정리 후 건너뜀
            if (unit.currentHp <= 0) {
                this._cleanupUnitUI(unit.id);
                continue;
            }
            
            let bar = this.hpBars.get(unit.id);
            let nameText = this.nameTexts.get(unit.id);
            let nameBg = this.nameBackgrounds.get(unit.id);
            
            if (!bar) {
                bar = new PIXI.Graphics();
                this.uiContainer.addChild(bar);
                this.hpBars.set(unit.id, bar);

                nameBg = new PIXI.Graphics();
                this.uiContainer.addChild(nameBg);
                this.nameBackgrounds.set(unit.id, nameBg);

                // ✨ 텍스트 품질 향상을 위해 resolution 옵션 추가
                const textStyle = new PIXI.TextStyle({
                    fontFamily: '"Nanum Gothic", Arial, sans-serif', // 좀 더 나은 폰트
                    fontSize: effectiveTileSize * 0.18,
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4,
                    resolution: 2 // 텍스트 해상도를 2배로 높여 선명하게 만듭니다.
                });
                nameText = new PIXI.Text(unit.name, textStyle);
                nameText.anchor.set(0.5, 0);
                this.uiContainer.addChild(nameText);
                this.nameTexts.set(unit.id, nameText);
            }

            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const centerX = drawX + effectiveTileSize / 2;
            
            // HP 바 로직
            const barWidth = effectiveTileSize * 0.8;
            const barHeight = effectiveTileSize * 0.1;
            const barYOffset = drawY + effectiveTileSize - barHeight; // 유닛 발밑으로 위치 변경
            
            const maxHp = unit.baseStats?.hp || 1;
            const hpRatio = Math.max(0, unit.currentHp / maxHp);

            bar.clear();
            bar.beginFill(0x333333, 0.8);
            bar.drawRect(centerX - barWidth / 2, barYOffset, barWidth, barHeight);
            bar.endFill();
            bar.beginFill(0x00ff00);
            bar.drawRect(centerX - barWidth / 2, barYOffset, barWidth * hpRatio, barHeight);
            bar.endFill();

            // 이름 및 배경 로직
            const padding = 5;
            const nameYPosition = drawY + effectiveTileSize + padding;
            
            nameText.position.set(centerX, nameYPosition);

            const bgColor = unit.type === ATTACK_TYPES.MERCENARY ? 0x0033CC : 0xCC0000;
            
            nameBg.clear();
            nameBg.beginFill(bgColor, 0.7);
            nameBg.drawRoundedRect(
                centerX - nameText.width / 2 - padding, 
                nameYPosition - padding / 2,
                nameText.width + padding * 2, 
                nameText.height + padding,
                4 // 모서리를 둥글게
            );
            nameBg.endFill();
        }

        // 데미지 텍스트 로직
        const now = performance.now();
        const duration = this.measureManager.get('vfx.damageNumberDuration');
        this.damageTexts = this.damageTexts.filter(obj => {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === obj.unitId);
            if (!unit) {
                obj.text.destroy();
                return false;
            }
            const progress = (now - obj.start) / duration;
            if (progress >= 1) {
                obj.text.destroy();
                return false;
            }
            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            obj.text.position.set(drawX + effectiveTileSize / 2, drawY - progress * effectiveTileSize * 0.5);
            obj.text.alpha = 1 - progress;
            return true;
        });

        this.app.render();
    }
}

