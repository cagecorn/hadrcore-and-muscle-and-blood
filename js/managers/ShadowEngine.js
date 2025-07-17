// js/managers/ShadowEngine.js

import { GAME_DEBUG_MODE } from '../constants.js'; // 디버그 모드 상수 임포트

export class ShadowEngine {
    /**
     * ShadowEngine을 초기화합니다.
     * @param {BattleSimulationManager} battleSimulationManager - 유닛 데이터 및 그리드 조회를 위한 인스턴스
     * @param {AnimationManager} animationManager - 유닛의 현재 렌더링 위치(애니메이션 적용) 조회를 위한 인스턴스
     * @param {MeasureManager} measureManager - 크기 관련 설정을 위한 인스턴스
     */
    constructor(battleSimulationManager, animationManager, measureManager) {
        if (GAME_DEBUG_MODE) console.log("\ud83c\udf11 ShadowEngine initialized. Ready to cast dynamic shadows. \ud83c\udf11");
        if (!battleSimulationManager || !animationManager || !measureManager) {
            throw new Error("[ShadowEngine] Missing essential dependencies. Cannot initialize.");
        }

        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        this.measureManager = measureManager;

        this.shadowsEnabled = true; // \u2728 그림자 효과 활성화/비활성화 토글 기능
        this.baseShadowOpacity = 0.4; // 그림자 기본 투명도
        // 그림자 타원 형태 비율
        this.shadowScaleY = 0.5; // 그림자의 Y축 스케일 (납작하게 만듦)
        // 그림자 오프셋 (유닛 타일 크기 대비 비율) - 45도 느낌
        this.shadowOffsetXRatio = 0.3;
        this.shadowOffsetYRatio = 0.3;
    }

    /**
     * 그림자 효과를 켜거나 끕니다.
     * @param {boolean} enable - true면 켜고, false면 끕니다.
     */
    setShadowsEnabled(enable) {
        this.shadowsEnabled = enable;
        if (GAME_DEBUG_MODE) console.log(`[ShadowEngine] Shadows are now ${this.shadowsEnabled ? 'ENABLED' : 'DISABLED'}.`); // \u2728 조건부 로그
    }

    /**
     * 현재 그림자 효과 활성화 상태를 토글합니다.
     * @returns {boolean} 새로운 그림자 활성화 상태
     */
    toggleShadows() {
        this.shadowsEnabled = !this.shadowsEnabled;
        if (GAME_DEBUG_MODE) console.log(`[ShadowEngine] Toggled shadows to: ${this.shadowsEnabled}.`); // \u2728 조건부 로그
        return this.shadowsEnabled;
    }

    /**
     * 모든 유닛의 그림자를 캔버스에 그립니다. LayerEngine에 의해 호출됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        if (!this.shadowsEnabled) {
            return; // 그림자 효과가 비활성화되어 있으면 그리지 않습니다.
        }

        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0 || !unit.image) {
                continue; // 죽었거나 이미지가 없는 유닛은 그림자를 그리지 않습니다.
            }

            // 유닛의 현재 렌더링 위치(애니메이션 적용된 위치)를 가져옵니다.
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            ctx.save();
            ctx.globalAlpha = this.baseShadowOpacity;
            ctx.fillStyle = 'black';

            const offsetX = effectiveTileSize * this.shadowOffsetXRatio;
            const offsetY = effectiveTileSize * this.shadowOffsetYRatio;
            const shadowDrawX = drawX + offsetX;
            const shadowDrawY = drawY + offsetY;

            ctx.translate(shadowDrawX + effectiveTileSize / 2, shadowDrawY + effectiveTileSize / 2);
            ctx.scale(1, this.shadowScaleY);
            ctx.translate(-(shadowDrawX + effectiveTileSize / 2), -(shadowDrawY + effectiveTileSize / 2));

            ctx.beginPath();
            ctx.ellipse(
                shadowDrawX + effectiveTileSize / 2,
                shadowDrawY + effectiveTileSize * 0.9,
                effectiveTileSize / 2,
                (effectiveTileSize * this.shadowScaleY) / 2,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.restore();
        }
    }
}
