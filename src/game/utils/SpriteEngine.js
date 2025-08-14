import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 유닛의 행동에 따라 스프라이트 텍스처를 동적으로 변경하는 엔진
 */
class SpriteEngine {
    constructor() {
        debugLogEngine.log('SpriteEngine', '스프라이트 엔진이 초기화되었습니다.');
    }

    /**
     * 유닛의 스프라이트를 지정된 행동 타입의 이미지로 변경하고,
     * 일정 시간 후 원래대로 되돌립니다.
     * @param {object} unit - 대상 유닛 객체 (sprite와 sprites 데이터 포함)
     * @param {string} actionType - 행동 타입 ('attack', 'hitted' 등)
     * @param {number} duration - 이미지가 변경된 상태로 유지될 시간 (ms)
     */
    changeSpriteForDuration(unit, actionType, duration = 500) {
        if (!unit || !unit.sprite || !unit.sprites) return;

        const originalTexture = unit.sprites.idle || unit.battleSprite;
        const actionTexture = unit.sprites[actionType];
        const scene = this.scene || unit.sprite.scene;
        if (!this.scene && scene) {
            this.scene = scene;
        }

        if (!actionTexture || !scene || !scene.textures || !scene.textures.exists(actionTexture)) {
            debugLogEngine.warn('SpriteEngine', `${actionType}\uC5D0 \uD574\uB2F9\uD558\uB294 \uC2A4\uD504\uB77C\uC774\uD2B8 \uD0A4 '${actionTexture}'\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
            return;
        }

        // 1. 행동에 맞는 텍스처로 즉시 변경
        unit.sprite.setTexture(actionTexture);
        debugLogEngine.log('SpriteEngine', `${unit.instanceName}\uC758 \uC2A4\uD504\uB77C\uC774\uD2B8\uB97C '${actionType}'\uC73C\uB85C \uBCC0\uACBD.`);

        // 2. 지정된 시간(duration)이 지난 후 원래 텍스처로 복귀
        if (unit.sprite.scene) {
            unit.sprite.scene.time.delayedCall(duration, () => {
                if (unit.sprite && unit.sprite.active) {
                    unit.sprite.setTexture(originalTexture);
                    debugLogEngine.log('SpriteEngine', `${unit.instanceName}\uC758 \uC2A4\uD504\uB77C\uC774\uD2B8\uB97C 'idle'\uB85C \uBCF5\uAD6C.`);
                }
            });
        }
    }

    /**
     * 스프라이트 엔진이 씬 컨텍스트에 접근할 수 있도록 설정합니다.
     * @param {Phaser.Scene} scene
     */
    setScene(scene) {
        this.scene = scene;
    }
}

export const spriteEngine = new SpriteEngine();

