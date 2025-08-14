import { debugImageLogManager } from '../debug/DebugImageLogManager.js';

/**
 * 게임 내 모든 이미지의 목표 크기를 정의하고,
 * 원본 크기에 따른 적절한 스케일 값을 계산하는 중앙 관리 매니저.
 */
class ImageSizeManager {
    constructor() {
        // 이미지 종류별 목표 크기(너비 기준)를 정의합니다.
        // 단위는 픽셀(px)입니다.
        this.targetSizes = {
            LOGO: 400,          // 메인 로고 너비
            ICON_IN_PARTY: 50   // 용병 관리 그리드 아이콘 너비
        };
    }

    /**
     * 이미지 종류와 원본 텍스처를 받아 적절한 스케일 값을 계산하여 반환합니다.
     * @param {string} type - 'LOGO', 'ICON_IN_PARTY' 등
     * @param {Phaser.Textures.Texture} texture - Phaser의 텍스처 객체
     * @param {string} dimension - 크기 기준 ('width' 또는 'height')
     * @returns {number} - 계산된 스케일 값
     */
    getScale(type, texture, dimension = 'width') {
        const targetSize = this.targetSizes[type];
        if (!targetSize) {
            console.warn(`ImageSizeManager: '${type}'에 대한 목표 크기가 정의되지 않았습니다.`);
            return 1;
        }

        const originalSize = texture.source[0][dimension];
        if (originalSize === 0) {
            return 1; // 텍스처가 아직 로드되지 않았을 수 있습니다.
        }

        const scale = targetSize / originalSize;

        // 디버그 로그를 남깁니다.
        debugImageLogManager.logResize(
            texture.key,
            { width: texture.source[0].width, height: texture.source[0].height },
            { type, targetSize, dimension },
            scale
        );

        return scale;
    }
}

export const imageSizeManager = new ImageSizeManager();
