import { debugLogEngine } from '../utils/DebugLogEngine.js';

class DebugImageLogManager {
    constructor() {
        this.name = 'DebugImage';
        debugLogEngine.register(this);
    }

    /**
     * 이미지 리사이즈 정보를 콘솔에 그룹화하여 출력합니다.
     * @param {string} key - 이미지의 텍스처 키
     * @param {object} originalSize - {width, height} 원본 크기
     * @param {object} targetInfo - {type, targetSize, dimension} 목표 정보
     * @param {number} scale - 최종 적용된 스케일 값
     */
    logResize(key, originalSize, targetInfo, scale) {
        console.groupCollapsed(
            `%c[${this.name}]`,
            `color: #f59e0b; font-weight: bold;`,
            `'${key}' 이미지 크기 조절됨`
        );

        debugLogEngine.log(this.name, `원본 크기: ${originalSize.width}x${originalSize.height}`);
        debugLogEngine.log(this.name, `목표 유형: ${targetInfo.type}`);
        debugLogEngine.log(this.name, `목표 기준: ${targetInfo.dimension}을(를) ${targetInfo.targetSize}px로 설정`);
        debugLogEngine.log(this.name, `계산된 스케일: ${scale.toFixed(4)}`);

        console.groupEnd();
    }
}

export const debugImageLogManager = new DebugImageLogManager();
