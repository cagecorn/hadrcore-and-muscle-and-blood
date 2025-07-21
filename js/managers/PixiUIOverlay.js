import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.mjs';
import { GAME_DEBUG_MODE, GAME_EVENTS, ATTACK_TYPES, UI_STATES, SKILL_TYPE_COLORS, UNIT_NAME_BG_COLORS } from '../constants.js';

export class PixiUIOverlay {
    // OffscreenTextManager를 생성자에서 받습니다.
    constructor(renderer, measureManager, battleSimulationManager, animationManager, eventManager, sceneEngine, offscreenTextManager, cameraEngine) {
        if (GAME_DEBUG_MODE) console.log('🎨 PixiUIOverlay initialized.');
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        this.eventManager = eventManager;
        this.sceneEngine = sceneEngine;
        this.offscreenTextManager = offscreenTextManager; // OffscreenTextManager 인스턴스 저장
        this.cameraEngine = cameraEngine; // 카메라 변환 정보 참조

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
                this.uiContainer.removeChildren().forEach(child => child.destroy());
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
            if (unit.currentHp <= 0) { this._cleanupUnitUI(unit.id); continue; }

            let nameSprite = this.nameSprites.get(unit.id);
            let bar = this.hpBars.get(unit.id);

            if (!nameSprite) {
                // [디버그 1] 이름표가 '생성'되는 시점을 확인합니다.
                console.log(`[디버그] ${unit.name}의 이름표를 새로 생성합니다.`);

                const bgColor = UNIT_NAME_BG_COLORS[unit.type] || 'rgba(0,0,0,0)';
                const fontSize = Math.round(
                    effectiveTileSize * this.measureManager.get('vfx.unitNameFontSizeRatio')
                );

                // OffscreenTextManager로부터 캔버스를 받아 텍스처를 생성합니다.
                const nameCanvas = this.offscreenTextManager.getOrCreateText(unit.name, { fontSize: fontSize, bgColor: bgColor });

                // 캔버스는 이미 렌더링 완료된 상태이므로 바로 텍스처로 변환합니다.
                const texture = PIXI.Texture.from(nameCanvas);
                nameSprite = new PIXI.Sprite(texture);
                // 이름표를 타일 하단 중앙 기준으로 배치하기 위해 앵커를 중앙 상단으로 설정
                nameSprite.anchor.set(0.5, 0);
                // OffscreenTextManager의 렌더링 스케일만큼 다시 줄여 원래 크기로 맞춥니다.
                nameSprite.scale.set(1 / this.offscreenTextManager.renderScale);
                this.uiContainer.addChild(nameSprite);
                this.nameSprites.set(unit.id, nameSprite);

                // [디버그 2] 생성 직후 이름표 객체 상태를 확인합니다.
                console.log(`[디버그] ${unit.name} 이름표 생성 완료:`, nameSprite);

                bar = new PIXI.Graphics();
                this.uiContainer.addChild(bar);
                this.hpBars.set(unit.id, bar);
            }

            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            const worldCenterX = drawX + effectiveTileSize / 2;
            const worldNameY = drawY + effectiveTileSize + this.measureManager.get('vfx.unitNameVerticalOffset');
            const barWidth = effectiveTileSize * 0.8;
            const barHeight = effectiveTileSize * 0.1;
            const worldBarY = drawY - barHeight - 5;

            const screenCenter = this.cameraEngine ? this.cameraEngine.worldToScreen(worldCenterX, worldNameY) : { x: worldCenterX, y: worldNameY };
            const barScreenPos = this.cameraEngine ? this.cameraEngine.worldToScreen(worldCenterX, worldBarY) : { x: worldCenterX, y: worldBarY };

            // 이름표를 유닛 이미지 바로 아래 중앙에 배치
            nameSprite.anchor.set(0.5, 0);
            nameSprite.position.set(screenCenter.x, screenCenter.y);

            // [디버그 3] 매 프레임 이름표의 '위치'와 '상태'를 확인합니다.
            console.log(
                `[디버그] ${unit.name} 업데이트:`,
                `위치=(${nameSprite.x.toFixed(1)}, ${nameSprite.y.toFixed(1)})`,
                `보임=${nameSprite.visible}`,
                `투명도=${nameSprite.alpha}`,
                `부모=${nameSprite.parent ? nameSprite.parent.constructor.name : '없음'}`
            );

            // HP 바 위치를 유닛 위쪽으로 조정해 이름표와 겹치지 않게 함
            const maxHp = unit.baseStats?.hp || 1;
            const hpRatio = Math.max(0, unit.currentHp / maxHp);
            const screenBarWidth = barWidth;
            const screenBarHeight = barHeight;

            bar.clear();
            bar.beginFill(0x333333, 0.8);
            bar.drawRect(barScreenPos.x - screenBarWidth / 2, barScreenPos.y, screenBarWidth, screenBarHeight);
            bar.endFill();
            bar.beginFill(0x00ff00);
            bar.drawRect(barScreenPos.x - screenBarWidth / 2, barScreenPos.y, screenBarWidth * hpRatio, screenBarHeight);
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
            const worldX = drawX + effectiveTileSize / 2;
            const worldY = drawY - progress * effectiveTileSize * 0.5;
            const screenPos = this.cameraEngine ? this.cameraEngine.worldToScreen(worldX, worldY) : { x: worldX, y: worldY };
            obj.text.position.set(screenPos.x, screenPos.y);
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
            const worldX = drawX + effectiveTileSize / 2;
            const worldY = drawY - offsetY - (effectiveTileSize * 0.2);
            const screenPos = this.cameraEngine ? this.cameraEngine.worldToScreen(worldX, worldY) : { x: worldX, y: worldY };
            obj.text.position.set(screenPos.x, screenPos.y);
            obj.text.alpha = 1 - progress;
            return true;
        });

        this.app.render();
    }
}
