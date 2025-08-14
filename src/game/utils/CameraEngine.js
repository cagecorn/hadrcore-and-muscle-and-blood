import { debugCameraLogManager } from '../debug/DebugCameraLogManager.js';

/**
 * 게임 카메라의 복잡한 움직임과 연출을 담당하는 엔진 (싱글턴)
 */
class CameraEngine {
    constructor() {
        if (CameraEngine.instance) {
            return CameraEngine.instance;
        }
        this.scene = null;
        this.camera = null;

        debugCameraLogManager.logAction('엔진 초기화', { message: '카메라 엔진 초기화. 씬이 등록되기를 기다립니다...' });
        CameraEngine.instance = this;
    }
    
    /**
     * 엔진이 제어할 씬과 카메라를 등록합니다.
     * 보통 새로운 씬이 시작될 때마다 호출됩니다.
     * @param {Phaser.Scene} scene - 제어할 대상 씬
     */
    registerScene(scene) {
        this.scene = scene;
        this.camera = scene.cameras.main;
        debugCameraLogManager.logAction('씬 등록', { scene: scene.scene.key });
    }

    /**
     * 특정 게임 오브젝트에 줌인하여 클로즈업합니다.
     * @param {Phaser.GameObjects.GameObject} target - 클로즈업할 대상
     * @param {number} zoomLevel - 줌 레벨 (예: 2는 2배 확대)
     * @param {number} duration - 효과에 걸리는 시간 (밀리초)
     * @returns {Promise<void>} 카메라 효과가 완료되면 resolve되는 Promise
     */
    closeupOn(target, zoomLevel = 2, duration = 1000) {
        return new Promise(resolve => {
            if (!this.camera) {
                console.error('CameraEngine', '카메라가 등록되지 않았습니다.');
                return resolve();
            }

            debugCameraLogManager.logAction('클로즈업', { target: target.name, zoom: zoomLevel, duration });
            
            // Pan(이동)과 Zoom(확대) 효과를 동시에 실행합니다.
            this.camera.pan(target.x, target.y, duration, 'Sine.easeInOut');
            this.camera.zoomTo(zoomLevel, duration, 'Sine.easeInOut');

            // 효과가 완료되면 Promise를 resolve하여 다음 동작을 수행할 수 있도록 합니다.
            this.scene.time.delayedCall(duration, resolve);
        });
    }

    /**
     * 카메라를 원래의 줌과 위치로 부드럽게 복원합니다.
     * @param {number} duration - 효과에 걸리는 시간 (밀리초)
     * @returns {Promise<void>} 카메라 효과가 완료되면 resolve되는 Promise
     */
    reset(duration = 1000) {
        return new Promise(resolve => {
            if (!this.camera) {
                console.error('CameraEngine', '카메라가 등록되지 않았습니다.');
                return resolve();
            }

            debugCameraLogManager.logAction('리셋', { duration });
            
            // 기본 줌 레벨(1)과 월드 중앙으로 되돌아갑니다.
            // Pan과 Zoom의 대상 좌표와 레벨은 게임에 맞게 수정할 수 있습니다.
            this.camera.pan(512, 384, duration, 'Sine.easeInOut');
            this.camera.zoomTo(1, duration, 'Sine.easeInOut');

            this.scene.time.delayedCall(duration, resolve);
        });
    }

    /**
     * 화면을 흔들어 타격감 등을 연출합니다.
     * @param {number} intensity - 흔들림의 강도 (0에서 1 사이)
     * @param {number} duration - 효과에 걸리는 시간 (밀리초)
     * @returns {Promise<void>} 카메라 효과가 완료되면 resolve되는 Promise
     */
    shake(intensity = 0.01, duration = 200) {
        return new Promise(resolve => {
            if (!this.camera) {
                console.error('CameraEngine', '카메라가 등록되지 않았습니다.');
                return resolve();
            }

            debugCameraLogManager.logAction('화면 흔들기', { duration, intensity });

            this.camera.shake(duration, intensity);
            
            this.scene.time.delayedCall(duration, resolve);
        });
    }
}

// 다른 파일에서 쉽게 사용하도록 유일한 인스턴스를 생성하여 내보냅니다.
export const cameraEngine = new CameraEngine();
