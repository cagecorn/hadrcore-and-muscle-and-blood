import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 텍스트를 고해상도 오프스크린 캔버스에 그려
 * 완성된 캔버스 요소 자체를 캐싱하는 매니저입니다.
 * 이를 통해 캔버스 위에서도 선명한 텍스트를 즉시 사용할 수 있습니다.
 */
export class OffscreenTextManager {
    constructor() {
        if (GAME_DEBUG_MODE) console.log('🖼️ OffscreenTextManager initialized. Ready to render crisp text.');
        this.textCanvas = document.createElement('canvas');
        this.textCtx = this.textCanvas.getContext('2d');
        // 캐시 값은 이제 HTMLCanvasElement를 저장합니다.
        this.textCache = new Map();
        this.renderScale = 2; // 2배 해상도로 렌더링하여 선명도 확보
    }

    /**
     * 텍스트와 설정을 기반으로 고품질 텍스트 이미지를 생성하거나 캐시에서 반환합니다.
     * @param {string} text - 렌더링할 텍스트
     * @param {object} options - 렌더링 옵션
     * @param {number} options.fontSize - 기본 폰트 크기
     * @param {string} options.fontColor - 폰트 색상
     * @param {string} options.bgColor - 배경 색상
     * @returns {HTMLCanvasElement} 렌더링된 텍스트가 그려진 캔버스 요소
     */
    getOrCreateText(text, { fontSize = 12, fontColor = '#FFFFFF', bgColor = '#000000' }) {
        const cacheKey = `${text}-${fontSize}-${fontColor}-${bgColor}`;
        if (this.textCache.has(cacheKey)) {
            return this.textCache.get(cacheKey);
        }

        // 새로운 캔버스를 만들어 텍스트를 그린 뒤 캐싱합니다.
        const newCanvas = document.createElement('canvas');
        const newCtx = newCanvas.getContext('2d');

        const scaledFontSize = fontSize * this.renderScale;
        const padding = 5 * this.renderScale;

        newCtx.font = `bold ${scaledFontSize}px \"Nanum Gothic\", Arial, sans-serif`;
        const textMetrics = newCtx.measureText(text);

        const canvasWidth = textMetrics.width + padding * 2;
        const canvasHeight = scaledFontSize + padding * 2;

        newCanvas.width = canvasWidth;
        newCanvas.height = canvasHeight;

        // 배경 그리기 (모서리를 살짝 둥글게 처리합니다)
        newCtx.fillStyle = bgColor;
        newCtx.beginPath();
        newCtx.moveTo(4, 0);
        newCtx.lineTo(canvasWidth - 4, 0);
        newCtx.quadraticCurveTo(canvasWidth, 0, canvasWidth, 4);
        newCtx.lineTo(canvasWidth, canvasHeight - 4);
        newCtx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - 4, canvasHeight);
        newCtx.lineTo(4, canvasHeight);
        newCtx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - 4);
        newCtx.lineTo(0, 4);
        newCtx.quadraticCurveTo(0, 0, 4, 0);
        newCtx.closePath();
        newCtx.fill();

        // 텍스트 그리기
        newCtx.fillStyle = fontColor;
        newCtx.font = `bold ${scaledFontSize}px \"Nanum Gothic\", Arial, sans-serif`;
        newCtx.textAlign = 'center';
        newCtx.textBaseline = 'middle';
        newCtx.fillText(text, canvasWidth / 2, canvasHeight / 2);

        // 완성된 캔버스를 캐시 후 반환합니다.
        this.textCache.set(cacheKey, newCanvas);

        return newCanvas;
    }

    /**
     * 캐시를 비웁니다. (필요시 사용)
     */
    clearCache() {
        this.textCache.clear();
    }
}
