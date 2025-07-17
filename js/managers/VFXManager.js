// js/managers/VFXManager.js

import { GAME_EVENTS, GAME_DEBUG_MODE } from '../constants.js';

export class VFXManager {
    // animationManager를 추가로 받아 유닛의 애니메이션 위치를 참조합니다.
    constructor(renderer, measureManager, cameraEngine, battleSimulationManager, animationManager, eventManager, particleEngine = null) { // ✨ particleEngine 추가
        if (GAME_DEBUG_MODE) console.log("\u2728 VFXManager initialized. Ready to render visual effects. \u2728");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
        this.animationManager = animationManager; // ✨ AnimationManager 저장
        this.eventManager = eventManager;
        this.particleEngine = particleEngine; // ✨ ParticleEngine 저장

        this.activeDamageNumbers = [];

        // ✨ 무기 드롭 애니메이션 관리
        this.eventManager.subscribe(GAME_EVENTS.WEAPON_DROPPED, this._onWeaponDropped.bind(this));
        this.activeWeaponDrops = new Map(); // unitId => animation data
        if (GAME_DEBUG_MODE) console.log("[VFXManager] Subscribed to 'weaponDropped' event.");

        // ✨ subscribe to damage display events
        this.eventManager.subscribe(GAME_EVENTS.DISPLAY_DAMAGE, (data) => {
            this.addDamageNumber(data.unitId, data.damage, data.color);
            // 피해를 입었을 때 파티클 생성
            if (this.particleEngine && data.damage > 0) {
                this.particleEngine.addParticles(data.unitId, 'red'); // 붉은색 파티클
            }
        });
    }

    /**
     * 특정 유닛 위에 데미지 숫자를 표시하도록 큐에 추가합니다.
     * @param {string} unitId - 데미지를 받은 유닛의 ID
     * @param {number} damageAmount - 표시할 데미지 양
     * @param {string} [color='red'] - 데미지 숫자의 색상 (예: 'yellow', 'red')
     */
    addDamageNumber(unitId, damageAmount, color = 'red') {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!unit) {
            console.warn(`[VFXManager] Cannot show damage for unknown unit: ${unitId}`);
            return;
        }

        this.activeDamageNumbers.push({
            unitId: unitId,
            damage: damageAmount,
            startTime: performance.now(),
            duration: this.measureManager.get('vfx.damageNumberDuration'),
            floatSpeed: this.measureManager.get('vfx.damageNumberFloatSpeed'),
            color: color
        });
        if (GAME_DEBUG_MODE) console.log(`[VFXManager] Added damage number: ${damageAmount} (${color}) for ${unit.name}`);
    }

    /**
     * 'weaponDropped' 이벤트 발생 시 호출됩니다.
     * @param {{ unitId: string, weaponSpriteId: string }} data
     */
    _onWeaponDropped(data) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === data.unitId);
        if (!unit) {
            console.warn(`[VFXManager] Cannot find unit '${data.unitId}' for weapon drop animation.`);
            return;
        }

        const weaponImage = this.battleSimulationManager.assetLoaderManager.getImage(data.weaponSpriteId);
        if (!weaponImage) {
            console.warn(`[VFXManager] Weapon sprite '${data.weaponSpriteId}' not loaded.`);
            return;
        }

        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions(); // 이제 순수 그리드 크기를 반환
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        const stagePadding = this.measureManager.get('battleStage.padding');

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산
        const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        // (캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2 + 패딩
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        const { drawX, drawY } = this.animationManager.getRenderPosition(
            unit.id,
            unit.gridX,
            unit.gridY,
            effectiveTileSize,
            gridOffsetX,
            gridOffsetY
        );

        // ✨ 무기 크기, 시작/종료 위치 등을 MeasureManager 비율 값으로 계산
        const weaponSize = effectiveTileSize * this.measureManager.get('vfx.weaponDropScale');
        const startX = drawX + (effectiveTileSize - weaponSize) / 2;
        const startY = drawY - effectiveTileSize * this.measureManager.get('vfx.weaponDropStartOffsetY');

        this.activeWeaponDrops.set(data.unitId, {
            sprite: weaponImage,
            startX: startX,
            startY: startY,
            endY: drawY + effectiveTileSize * this.measureManager.get('vfx.weaponDropEndOffsetY'), // ✨ 끝 Y 위치 조정
            currentY: startY,
            opacity: 1,
            startTime: performance.now(),
            popDuration: this.measureManager.get('vfx.weaponDropPopDuration'),
            fallDuration: this.measureManager.get('vfx.weaponDropFallDuration'),
            fadeDuration: this.measureManager.get('vfx.weaponDropFadeDuration'),
            totalDuration: this.measureManager.get('vfx.weaponDropTotalDuration')
        });
        if (GAME_DEBUG_MODE) console.log(`[VFXManager] Weapon drop animation data added for unit ${data.unitId}.`);
    }

    /**
     * ✨ 활성 데미지 숫자의 상태를 업데이트합니다.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        const currentTime = performance.now();
        let i = this.activeDamageNumbers.length;
        while (i--) {
            const dmgNum = this.activeDamageNumbers[i];
            if (currentTime - dmgNum.startTime >= dmgNum.duration) {
                this.activeDamageNumbers.splice(i, 1);
            }
        }

        // 무기 드롭 애니메이션 업데이트
        for (const [unitId, drop] of this.activeWeaponDrops.entries()) {
            const elapsed = currentTime - drop.startTime;

            if (elapsed < drop.popDuration) {
                const progress = elapsed / drop.popDuration;
                drop.currentY = drop.startY - drop.sprite.height * progress;
            } else if (elapsed < drop.popDuration + drop.fallDuration) {
                const fallElapsed = elapsed - drop.popDuration;
                const progress = fallElapsed / drop.fallDuration;
                drop.currentY = drop.startY + (drop.endY - drop.startY) * progress;
            } else if (elapsed < drop.totalDuration) {
                const fadeElapsed = elapsed - (drop.popDuration + drop.fallDuration);
                const progress = fadeElapsed / drop.fadeDuration;
                drop.opacity = Math.max(0, 1 - progress);
            } else {
                this.activeWeaponDrops.delete(unitId);
                if (GAME_DEBUG_MODE) console.log(`[VFXManager] Weapon drop animation for unit ${unitId} completed.`);
            }
        }
    }

    /**
     * 특정 유닛의 HP 바를 그립니다.
     * 실제 그리기 위치는 AnimationManager로 계산된 값을 사용합니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - HP 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize - 유닛이 그려지는 타일의 유효 크기
     * @param {number} actualDrawX - 애니메이션이 적용된 x 좌표
     * @param {number} actualDrawY - 애니메이션이 적용된 y 좌표
     */
    drawHpBar(ctx, unit, effectiveTileSize, actualDrawX, actualDrawY) {
        if (!unit || !unit.baseStats) {
            console.warn("[VFXManager] Cannot draw HP bar: unit data is missing.", unit);
            return;
        }

        const maxHp = unit.baseStats.hp;
        const currentHp = unit.currentHp !== undefined ? unit.currentHp : maxHp;
        const hpRatio = currentHp / maxHp;

        const barWidth = effectiveTileSize * this.measureManager.get('vfx.hpBarWidthRatio');
        const barHeight = effectiveTileSize * this.measureManager.get('vfx.hpBarHeightRatio');
        const barOffsetY = -(barHeight + this.measureManager.get('vfx.hpBarVerticalOffset')); // 유닛 이미지 위에 위치

        const hpBarDrawX = actualDrawX + (effectiveTileSize - barWidth) / 2;
        const hpBarDrawY = actualDrawY + barOffsetY;

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(hpBarDrawX, hpBarDrawY, barWidth, barHeight);

        ctx.fillStyle = 'lightgreen'; // 항상 초록색으로 그립니다
        ctx.fillRect(hpBarDrawX, hpBarDrawY, barWidth * hpRatio, barHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(hpBarDrawX, hpBarDrawY, barWidth, barHeight);
    }

    /**
     * ✨ 특정 유닛의 배리어 바를 그립니다 (HP 바 위에 노란색 게이지를 덧씌움).
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - 배리어 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize - 유닛이 그려지는 타일의 유효 크기
     * @param {number} actualDrawX - 유닛의 실제 렌더링 x 좌표 (애니메이션이 적용된)
     * @param {number} actualDrawY - 유닛의 실제 렌더링 y 좌표 (애니메이션이 적용된)
     */
    drawBarrierBar(ctx, unit, effectiveTileSize, actualDrawX, actualDrawY) {
        if (!unit || unit.currentBarrier === undefined || unit.maxBarrier === undefined) {
            return;
        }

        const currentBarrier = unit.currentBarrier;
        const maxBarrier = unit.maxBarrier;
        const barrierRatio = maxBarrier > 0 ? currentBarrier / maxBarrier : 0;

        // HP 바와 동일한 위치와 크기로 계산하여 정확히 겹치도록 합니다
        const barWidth = effectiveTileSize * this.measureManager.get('vfx.hpBarWidthRatio');
        const barHeight = effectiveTileSize * this.measureManager.get('vfx.hpBarHeightRatio');
        const barOffsetY = -(barHeight + this.measureManager.get('vfx.hpBarVerticalOffset'));

        const barrierBarDrawX = actualDrawX + (effectiveTileSize - barWidth) / 2;
        const barrierBarDrawY = actualDrawY + barOffsetY;

        // 노란색 배리어 바를 HP 바 위에 덧씌움 (배경과 테두리는 없음)
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(barrierBarDrawX, barrierBarDrawY, barWidth * barrierRatio, barHeight);
    }

    /**
     * 모든 활성 시각 효과를 그립니다. 이 메서드는 LayerEngine에 의해 호출됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions(); // 이제 순수 그리드 크기를 반환
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        const stagePadding = this.measureManager.get('battleStage.padding');

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산
        const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        // (캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2 + 패딩
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        // ✨ DEBUG LOG START FOR VFXManager Drawing Parameters
        if (GAME_DEBUG_MODE) console.log(`[VFXManager Debug] Drawing VFX Parameters: \n            Canvas (Logical): ${canvasWidth}x${canvasHeight}\n            Effective Tile Size: ${effectiveTileSize.toFixed(2)}\n            Grid Offset (X, Y): ${gridOffsetX.toFixed(2)}, ${gridOffsetY.toFixed(2)}`);
        // ✨ DEBUG LOG END FOR VFXManager Drawing Parameters

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            // ✨ AnimationManager를 통해 현재 애니메이션이 적용된 위치를 조회합니다.
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );
            // ✨ 추가: 각 유닛의 HP/배리어 바가 그려지는 최종 위치 로그
            if (GAME_DEBUG_MODE) console.log(`[VFXManager Debug] Unit ${unit.id} (HP/Barrier Bar): drawX=${drawX.toFixed(2)}, drawY=${drawY.toFixed(2)}`);
            this.drawHpBar(ctx, unit, effectiveTileSize, drawX, drawY);
            this.drawBarrierBar(ctx, unit, effectiveTileSize, drawX, drawY); // ✨ 배리어 바 그리기 호출
        }

        // ✨ 데미지 숫자 그리기
        const currentTime = performance.now();
        for (const dmgNum of this.activeDamageNumbers) {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === dmgNum.unitId);
            if (!unit) continue;

            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            const elapsed = currentTime - dmgNum.startTime;
            const progress = elapsed / dmgNum.duration;

            const currentYOffset = this.measureManager.get('vfx.damageNumberFloatSpeed') * elapsed; // ✨ 비율 사용
            const alpha = Math.max(0, 1 - progress);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = dmgNum.color || ((dmgNum.damage > 0) ? '#FF4500' : '#ADFF2F');
            const baseFontSize = this.measureManager.get('vfx.damageNumberBaseFontSize');
            const scaleFactor = this.measureManager.get('vfx.damageNumberScaleFactor');
            ctx.font = `bold ${baseFontSize + (1 - progress) * scaleFactor}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                dmgNum.damage.toString(),
                drawX + effectiveTileSize / 2,
                drawY - currentYOffset - this.measureManager.get('vfx.damageNumberVerticalOffset')
            );
            ctx.restore();
        }

        // ✨ 무기 드롭 애니메이션 그리기
        for (const [unitId, drop] of this.activeWeaponDrops.entries()) {
            if (!drop.sprite) continue;

            const weaponSize = effectiveTileSize * this.measureManager.get('vfx.weaponDropScale'); // ✨ 비율 사용

            ctx.save();
            ctx.globalAlpha = drop.opacity;
            ctx.drawImage(drop.sprite, drop.startX, drop.currentY, weaponSize, weaponSize);
            ctx.restore();
        }
        // ✨ 파티클 그리기 호출
        if (this.particleEngine) {
            this.particleEngine.draw(ctx);
        }
    }
}
