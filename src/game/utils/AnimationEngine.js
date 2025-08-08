import { debugLogEngine } from './DebugLogEngine.js';
import { battleSpeedManager } from './BattleSpeedManager.js';

/**
 * Phaser의 tween을 사용하여 게임 오브젝트에 부드러운 애니메이션 효과를 적용하는 엔진
 */
export class AnimationEngine {
    constructor(scene) {
        this.scene = scene;
        debugLogEngine.log('AnimationEngine', '애니메이션 엔진이 초기화되었습니다.');
    }

    /**
     * 대상을 확대하는 애니메이션
     * @param {Phaser.GameObjects.GameObject} target - 애니메이션을 적용할 대상
     * @param {number} scale - 최종 확대 크기
     * @param {number} duration - 애니메이션 시간 (밀리초)
     */
    scaleUp(target, scale = 1.2, duration = 100) {
        this.scene.tweens.add({
            targets: target,
            scale: scale,
            duration: duration,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 대상을 원래 크기로 축소하는 애니메이션
     * @param {Phaser.GameObjects.GameObject} target - 애니메이션을 적용할 대상
     * @param {number} scale - 원래 크기
     * @param {number} duration - 애니메이션 시간 (밀리초)
     */
    scaleDown(target, scale = 1.0, duration = 100) {
        this.scene.tweens.add({
            targets: target,
            scale: scale,
            duration: duration,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 특정 오브젝트를 지정된 좌표로 부드럽게 이동시킵니다.
     * @param {Phaser.GameObjects.GameObject} target - 이동시킬 대상
     * @param {number} x - 목표 x 좌표
     * @param {number} y - 목표 y 좌표
     * @param {number} duration - 애니메이션 지속 시간 (밀리초)
     * @param {function} onUpdateCallback - 이동하는 동안 매 프레임 호출될 콜백 함수
     * @returns {Promise<void>} - 애니메이션 완료 후 resolve되는 Promise
     */
    moveTo(target, x, y, duration = 500, onUpdateCallback = null) {
        return new Promise(resolve => {
            const finalDuration = duration / battleSpeedManager.getMultiplier();
            const tweenConfig = {
                targets: target,
                x: x,
                y: y,
                duration: finalDuration,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    resolve();
                }
            };

            if (onUpdateCallback) {
                tweenConfig.onUpdate = onUpdateCallback;
            }

            this.scene.tweens.add(tweenConfig);
        });
    }

    /**
     * 공격 모션을 표현하는 간단한 애니메이션 (앞으로 갔다가 돌아오기)
     * @param {Phaser.GameObjects.Sprite} target - 공격 모션을 할 대상
     * @param {object} targetPosition - 공격할 대상의 위치 {x, y}
     * @param {number} duration - 전체 애니메이션 시간
     * @returns {Promise<void>}
     */
    async attack(target, targetPosition, duration = 400) {
        const originalX = target.x;
        const originalY = target.y;

        const attackX = originalX + (targetPosition.x - originalX) * 0.3;
        const attackY = originalY + (targetPosition.y - originalY) * 0.3;

        await this.moveTo(target, attackX, attackY, duration / 2);
        await this.moveTo(target, originalX, originalY, duration / 2);
    }
}
