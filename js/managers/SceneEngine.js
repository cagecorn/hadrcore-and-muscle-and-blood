// js/managers/SceneEngine.js

export class SceneEngine {
    constructor(eraserEngine = null, hideAndSeekManager = null) {
        console.log("🎬 SceneEngine initialized. Ready to manage game scenes. 🎬");
        this.scenes = new Map();
        this.currentSceneName = null;
        this.eraserEngine = eraserEngine;
        this.hideAndSeekManager = hideAndSeekManager;
    }

    /**
     * 씬을 등록합니다.
     * @param {string} name - 씬의 이름
     * @param {object[]} managers - 해당 씬에 속한 매니저 인스턴스 배열
     */
    registerScene(name, managers) {
        this.scenes.set(name, managers);
        console.log(`[SceneEngine] Scene '${name}' registered with ${managers.length} managers.`);
    }

    /**
     * 현재 씬을 설정합니다.
     * @param {string} sceneName - 활성화할 씬의 이름
     */
    setCurrentScene(sceneName) {
        if (this.scenes.has(sceneName)) {
            if (this.currentSceneName && this.hideAndSeekManager) {
                this.hideAndSeekManager.scanScene(this.currentSceneName, '정리 전');
            }

            if (this.currentSceneName && this.eraserEngine) {
                this.eraserEngine.cleanupScene(this.currentSceneName);
            }

            if (this.currentSceneName && this.hideAndSeekManager) {
                this.hideAndSeekManager.scanScene(this.currentSceneName, '정리 후');
            }
            this.currentSceneName = sceneName;
            console.log(`[SceneEngine] Current scene set to: ${sceneName}`);
        } else {
            console.warn(`[SceneEngine] Scene '${sceneName}' not found.`);
        }
    }

    /**
     * 현재 활성화된 씬의 이름을 반환합니다.
     * LogicManager 및 CameraEngine이 씬에 따라 제약 조건을 적용할 때 사용합니다.
     * @returns {string | null} 현재 씬의 이름
     */
    getCurrentSceneName() {
        return this.currentSceneName;
    }

    /**
     * 현재 씬의 모든 매니저를 업데이트합니다.
     * @param {number} deltaTime - 프레임 간 경과 시간
     */
    update(deltaTime) {
        if (this.currentSceneName) {
            const managers = this.scenes.get(this.currentSceneName);
            for (const manager of managers) {
                if (manager.update && typeof manager.update === 'function') {
                    manager.update(deltaTime);
                }
            }
        }
    }

    /**
     * 현재 씬의 모든 매니저를 그립니다.
     * 이 메서드는 LayerEngine으로부터 호출되며, SceneEngine은 변환을 직접 적용하지 않습니다.
     * 변환은 LayerEngine에서 CameraEngine을 통해 메서드 호출 스택의 상위에서 처리됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        if (this.currentSceneName) {
            const managers = this.scenes.get(this.currentSceneName);
            for (const manager of managers) {
                if (manager.draw && typeof manager.draw === 'function') {
                    manager.draw(ctx);
                }
            }
        }
    }
}
