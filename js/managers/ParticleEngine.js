// js/managers/ParticleEngine.js
import { GAME_DEBUG_MODE } from '../constants.js';

export class ParticleEngine {
    constructor(measureManager, cameraEngine, battleSimulationManager) {
        if (GAME_DEBUG_MODE) console.log("\u2728 ParticleEngine initialized. Ready to create visual sparks. \u2728");
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 위치 정보를 얻기 위함

        this.activeParticles = [];
    }

    /**
     * 특정 유닛의 위치에서 파티클을 생성하여 추가합니다.
     * @param {string} unitId - 파티클을 생성할 유닛의 ID
     * @param {string} color - 파티클의 색상 (예: 'red')
     */
    addParticles(unitId, color) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!unit) {
            console.warn(`[ParticleEngine] Cannot add particles for unknown unit: ${unitId}`);
            return;
        }

        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions();
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');

        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;
        const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;

        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        const baseParticleSize = this.measureManager.get('particle.baseSize');
        const particleCount = this.measureManager.get('particle.count');
        const particleDuration = this.measureManager.get('particle.duration');
        const particleSpeedY = this.measureManager.get('particle.speedY');
        const particleSpread = this.measureManager.get('particle.spread');
        const particleStartOffsetY = this.measureManager.get('particle.startOffsetY'); // ✨ 새 상수 추가

        // 유닛의 중심에서 파티클이 튀어나오도록 초기 위치 계산
        const unitCenterX = gridOffsetX + unit.gridX * effectiveTileSize + effectiveTileSize / 2;
        // 유닛 이미지의 상단 근처에서 튀어나오도록 조정
        const unitTopY = gridOffsetY + unit.gridY * effectiveTileSize + effectiveTileSize * particleStartOffsetY; // ✨ Y 위치 조정

        for (let i = 0; i < particleCount; i++) {
            // ✨ speedX, speedY에 더 큰 무작위성 추가
            const speedX = (Math.random() - 0.5) * particleSpread; // 좌우로 더 많이 퍼지게
            const speedY = particleSpeedY * (0.5 + Math.random() * 0.5); // 수직 속도에 변화를 줌 (최대 절반까지 감소)

            const particle = {
                x: unitCenterX + (Math.random() * baseParticleSize * 2 - baseParticleSize), // 유닛 중심 근처에서 약간 랜덤한 시작 X
                y: unitTopY, // ✨ 유닛 이미지 상단에서 시작
                size: baseParticleSize * (0.7 + Math.random() * 0.6), // 크기 변화 (0.7 ~ 1.3배)
                color: color,
                speedX: speedX,
                speedY: speedY,
                alpha: 1,
                startTime: performance.now(),
                duration: particleDuration,
                initialY: unitTopY // 초기 y 위치 저장 (재계산을 위해)
            };
            this.activeParticles.push(particle);
        }
        if (GAME_DEBUG_MODE) console.log(`[ParticleEngine] Added ${particleCount} particles for unit ${unitId}.`);
    }

    /**
     * ✨ 유닛의 잔상(afterimage)을 생성하여 추가합니다.
     * @param {string} unitId - 잔상을 생성할 유닛의 ID
     * @param {HTMLImageElement} unitImage - 유닛 이미지 객체
     * @param {number} gridX - 잔상 생성 시 유닛의 그리드 X 좌표
     * @param {number} gridY - 잔상 생성 시 유닛의 그리드 Y 좌표
     */
    addUnitAfterimage(unitId, unitImage, gridX, gridY) {
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();

        const afterimageDuration = 300;
        const fadeDuration = 300;

        const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
            unitId, gridX, gridY, effectiveTileSize, gridOffsetX, gridOffsetY
        );

        this.activeParticles.push({
            x: drawX,
            y: drawY,
            size: effectiveTileSize,
            image: unitImage,
            alpha: 0.7,
            startTime: performance.now(),
            duration: afterimageDuration,
            fadeDuration: fadeDuration,
            type: 'afterimage'
        });
    }

    /**
     * 모든 활성 파티클의 상태를 업데이트합니다.
     * @param {number} deltaTime - 지난 프레임과의 시간 차이 (ms)
     */
    update(deltaTime) {
        const currentTime = performance.now();
        let i = this.activeParticles.length;
        while (i--) {
            const particle = this.activeParticles[i];
            const elapsed = currentTime - particle.startTime;
            if (elapsed > particle.duration) {
                this.activeParticles.splice(i, 1);
                continue;
            }

            if (particle.type === 'afterimage') {
                const progress = elapsed / particle.fadeDuration;
                particle.alpha = Math.max(0, particle.alpha - progress);
            } else {
                particle.x += particle.speedX * (deltaTime / 16);
                particle.y -= particle.speedY * (deltaTime / 16);
                particle.alpha = Math.max(0, 1 - (elapsed / particle.duration));
            }
        }
    }

    /**
     * 모든 활성 파티클을 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        ctx.save();
        // CameraEngine 변환은 LayerEngine에서 이미 적용될 것이므로 여기서 다시 적용하지 않습니다.
        // 파티클은 배경 레이어 위에 그려지므로, 카메라 변환을 따라야 합니다.

        for (const particle of this.activeParticles) {
            ctx.globalAlpha = particle.alpha;

            if (particle.type === 'afterimage' && particle.image) {
                ctx.drawImage(
                    particle.image,
                    particle.x,
                    particle.y,
                    particle.size,
                    particle.size
                );
            } else {
                ctx.fillStyle = particle.color;
                ctx.fillRect(
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size
                );
            }
        }
        ctx.restore();
    }
}
