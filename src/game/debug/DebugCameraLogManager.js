import { debugLogEngine } from '../utils/DebugLogEngine.js';

class DebugCameraLogManager {
    constructor() {
        // 이 매니저의 이름을 'DebugCamera'로 정합니다.
        this.name = 'DebugCamera';
        debugLogEngine.register(this);
    }

    /**
     * 게임 시작 시 해상도 및 카메라 관련 정보를 로그로 남깁니다.
     * @param {Phaser.Cameras.Scene2D.Camera} camera - Phaser 카메라 객체
     * @param {Phaser.Core.Config} config - 게임 설정 객체
     */
    logInitialState(camera, config) {
        console.groupCollapsed(`%c[${this.name}]`, `color: #3b82f6; font-weight: bold;`, `초기 카메라 및 해상도 정보`);

        debugLogEngine.log(this.name, '--- 해상도 정보 ---');
        debugLogEngine.log(this.name, `게임 논리적 크기: ${config.width}x${config.height}`);
        debugLogEngine.log(this.name, `기기 픽셀 비율(DPR): ${window.devicePixelRatio}`);
        debugLogEngine.log(this.name, `최종 렌더링 해상도: ${config.width * config.resolution}x${config.height * config.resolution}`);

        debugLogEngine.log(this.name, '--- 카메라 초기 상태 ---');
        debugLogEngine.log(this.name, `초기 줌: ${camera.zoom}`);
        debugLogEngine.log(this.name, `초기 스크롤(x, y): ${camera.scrollX}, ${camera.scrollY}`);
        debugLogEngine.log(this.name, `월드 경계(w, h): ${camera.worldView.width}, ${camera.worldView.height}`);

        console.groupEnd();
    }

    /**
     * 카메라 연출에 대한 로그를 남깁니다.
     * @param {string} action - 수행하는 연출 (예: '줌인', '흔들기')
     * @param {object} details - 연출에 대한 상세 정보
     */
    logAction(action, details) {
        debugLogEngine.log(this.name, `연출 시작: ${action}`, details);
    }
}

// 유일한 인스턴스로 내보냅니다.
export const debugCameraLogManager = new DebugCameraLogManager();
