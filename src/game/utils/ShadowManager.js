import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 유닛의 그림자를 생성하고 관리하는 엔진
 */
export class ShadowManager {
    constructor(scene) {
        this.scene = scene;
        // 그림자를 다른 요소보다 먼저, 배경 위에 표시하기 위해 레이어를 생성합니다.
        this.shadowLayer = this.scene.add.layer();
        this.shadowTextureKey = 'oval-shadow';

        // 게임 시작 시 한 번만 타원형 텍스처를 생성합니다.
        this._createShadowTexture();
        debugLogEngine.log('ShadowManager', '그림자 매니저가 초기화되었습니다.');
    }

    /**
     * 재사용할 타원형 그림자 텍스처를 생성하는 내부 메서드
     */
    _createShadowTexture() {
        const graphics = this.scene.make.graphics({ fillStyle: { color: 0x000000, alpha: 0.4 } }, false);
        graphics.fillEllipse(50, 15, 100, 30); // 너비 100, 높이 30의 타원
        graphics.generateTexture(this.shadowTextureKey, 100, 30);
        graphics.destroy();
    }

    /**
     * 특정 스프라이트에 대한 그림자를 생성합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite 원본 스프라이트
     * @returns {Phaser.GameObjects.Image|null} 생성된 그림자 이미지
     */
    createShadow(parentSprite) {
        if (!parentSprite || !parentSprite.texture || parentSprite.texture.key === '__MISSING') {
            debugLogEngine.warn('ShadowManager', '유효하지 않은 스프라이트에는 그림자를 생성할 수 없습니다.');
            return null;
        }

        // 유닛 발밑 중앙에 위치하도록 좌표를 계산합니다.
        const shadowX = parentSprite.x;
        const shadowY = parentSprite.y + parentSprite.displayHeight / 2 - 5; // 발밑에 살짝 붙도록 조정

        // 미리 생성된 텍스처로 그림자 이미지를 만듭니다.
        const shadow = this.scene.add.image(shadowX, shadowY, this.shadowTextureKey);

        // 유닛 크기에 맞춰 그림자 너비를 조정하고, 높이는 살짝만 조정하여 자연스럽게 만듭니다.
        shadow.displayWidth = parentSprite.displayWidth * 0.8;
        shadow.displayHeight = parentSprite.displayWidth * 0.2;

        // 레이어에 추가하고 깊이를 원본보다 한 단계 낮춥니다.
        this.shadowLayer.add(shadow);
        shadow.setDepth(parentSprite.depth - 1);

        debugLogEngine.log('ShadowManager', `'${parentSprite.texture.key}'의 그림자를 생성했습니다.`);
        return shadow;
    }

    /**
     * 모든 그림자를 제거합니다.
     */
    shutdown() {
        this.shadowLayer.destroy();
        debugLogEngine.log('ShadowManager', '그림자 매니저를 종료하고 모든 그림자를 제거합니다.');
    }
}
