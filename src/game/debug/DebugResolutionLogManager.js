import { debugLogEngine } from '../utils/DebugLogEngine.js';

class DebugResolutionLogManager {
    constructor() {
        this.name = 'DebugResolution';
        debugLogEngine.register(this);
    }

    /**
     * 현재 해상도 관련 정보를 콘솔에 그룹화하여 출력합니다.
     * @param {Phaser.Game} game - Phaser 게임 인스턴스
     */
    logResolution(game) {
        const config = game.config;
        const canvas = game.canvas;

        console.groupCollapsed(`%c[${this.name}]`, `color: #1d4ed8; font-weight: bold;`, `현재 해상도 정보`);

        debugLogEngine.log(this.name, '--- 논리적 크기 (게임 월드 기준) ---');
        debugLogEngine.log(this.name, `Game Config: ${config.width}x${config.height}`);

        debugLogEngine.log(this.name, '--- 물리적 크기 (실제 렌더링 기준) ---');
        debugLogEngine.log(this.name, `Device Pixel Ratio: ${window.devicePixelRatio}`);
        debugLogEngine.log(this.name, `Phaser Canvas: ${canvas.width}x${canvas.height} (논리적 크기 * DPR)`);

        console.groupEnd();
    }
}

export const debugResolutionLogManager = new DebugResolutionLogManager();
