import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 텍스트를 고해상도 오프스크린 캔버스에 그린 후,
 * 이미지 데이터로 변환하여 캐싱하는 매니저입니다.
 * 이를 통해 캔버스 위에서도 선명한 텍스트를 출력할 수 있습니다.
 */
export class OffscreenTextManager {
    constructor() {
        if (GAME_DEBUG_MODE) console.log('🖼️ OffscreenTextManager initialized. Ready to render crisp text.');
        this.textCanvas = document.createElement('canvas');
        this.textCtx = this.textCanvas.getContext('2d');
        this.textCache = new Map(); // key: cacheKey, value: HTMLImageElement
        this.renderScale = 2; // 2배 해상도로 렌더링하여 선명도 확보
    }

    /**
     * 텍스트와 설정을 기반으로 고품질 텍스트 이미지를 생성하거나 캐시에서 반환합니다.
     * @param {string} text - 렌더링할 텍스트
     * @param {object} options - 렌더링 옵션
     * @param {number} options.fontSize - 기본 폰트 크기
     * @param {string} options.fontColor - 폰트 색상
     * @param {string} options.bgColor - 배경 색상
     * @returns {HTMLImageElement} 렌더링된 텍스트 이미지
     */
    getOrCreateText(text, { fontSize = 12, fontColor = '#FFFFFF', bgColor = '#000000' }) {
        const cacheKey = `${text}-${fontSize}-${fontColor}-${bgColor}`;
        if (this.textCache.has(cacheKey)) {
            return this.textCache.get(cacheKey);
        }

        const scaledFontSize = fontSize * this.renderScale;
        const padding = 5 * this.renderScale;

        this.textCtx.font = `bold ${scaledFontSize}px \"Nanum Gothic\", Arial, sans-serif`;
        const textMetrics = this.textCtx.measureText(text);

        const canvasWidth = textMetrics.width + padding * 2;
        const canvasHeight = scaledFontSize + padding * 2;

        this.textCanvas.width = canvasWidth;
        this.textCanvas.height = canvasHeight;

        // 배경 그리기
        this.textCtx.fillStyle = bgColor;
        this.textCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 텍스트 그리기
        this.textCtx.fillStyle = fontColor;
        this.textCtx.font = `bold ${scaledFontSize}px \"Nanum Gothic\", Arial, sans-serif`;
        this.textCtx.textAlign = 'center';
        this.textCtx.textBaseline = 'middle';
        this.textCtx.fillText(text, canvasWidth / 2, canvasHeight / 2);

        const textImage = new Image();
        textImage.src = this.textCanvas.toDataURL();
        this.textCache.set(cacheKey, textImage);

        return textImage;
    }

    /**
     * 캐시를 비웁니다. (필요시 사용)
     */
    clearCache() {
        this.textCache.clear();
    }
}
