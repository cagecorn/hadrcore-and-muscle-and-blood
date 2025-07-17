// js/managers/SceneEngine.js

export class SceneEngine {
    constructor() {
        console.log("\uD83C\uDFAC SceneEngine initialized. Ready to manage game scenes. \uD83C\uDFAC");
        this.scenes = new Map();
        this.currentSceneName = null;
    }

    /**
     * \uc2fc\uc744 \ub4f1\ub85d\ud569\ub2c8\ub2e4.
     * @param {string} name - \uc2fc\uc758 \uc774\ub984
     * @param {object[]} managers - \ud574\ub2f9 \uc2fc\uc5d0 \uc18d\ud55c \ub9e4\ub2c8\uc800 \uc778\uc2a4\ud134\uc2a4 \uc5f4\ub825
     */
    registerScene(name, managers) {
        this.scenes.set(name, managers);
        console.log(`[SceneEngine] Scene '${name}' registered with ${managers.length} managers.`);
    }

    /**
     * \ud604\uc7ac \uc2fc\uc744 \uc124\uc815\ud569\ub2c8\ub2e4.
     * @param {string} sceneName - \ud65c\uc131\ud654\ud560 \uc2fc\uc758 \uc774\ub984
     */
    setCurrentScene(sceneName) {
        if (this.scenes.has(sceneName)) {
            this.currentSceneName = sceneName;
            console.log(`[SceneEngine] Current scene set to: ${sceneName}`);
        } else {
            console.warn(`[SceneEngine] Scene '${sceneName}' not found.`);
        }
    }

    /**
     * \ud604\uc7ac \ud65c\uc131\ud654\ub41c \uc2fc\uc758 \uc774\ub984\uc744 \ubc18\ud658\ud569\ub2c8\ub2e4.
     * LogicManager \ubc0f CameraEngine\uc774 \uc2fc\uc5d0 \ub530\ub974\uc5b4 \uc81c\uc57d \uc870\uac74\uc744 \uc801\uc6a9\ud560 \ub54c \uc0ac\uc6a9\ud569\ub2c8\ub2e4.
     * @returns {string | null} \ud604\uc7ac \uc2fc\uc758 \uc774\ub984
     */
    getCurrentSceneName() {
        return this.currentSceneName;
    }

    /**
     * \ud604\uc7ac \uc2fc\uc758 \ubaa8\ub4e0 \ub9e4\ub2c8\uc800\ub97c \uc5c5\ub370\uc774\ud2b8\ud569\ub2c8\ub2e4.
     * @param {number} deltaTime - \ud504\ub808\uc784 \uac04 \uac74\uac04 \uc2dc\uac04
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
     * \ud604\uc7ac \uc2fc\uc758 \ubaa8\ub4e0 \ub9e4\ub2c8\uc800\ub97c \uadf8\ub9ac\ub294\ub2e4.
     * \uc774 \uba54\uc11c\ub4dc\ub294 LayerEngine\uc73c\ub85c\ubd80\ud130 \ud638\ucd9c\ub418\uba70, SceneEngine\uc740 \ubcc0\ud658\uc744 \uc9c0\ucdirect\ud788 \uc801\uc6a9\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.
     * \ubcc0\ud658\uc740 LayerEngine\uc5d0\uc11c CameraEngine\uc744 \ud1b5\ud574 \uba54\uc18c \ucd94\uc57d\ub429\ub2c8\ub2e4.
     * @param {CanvasRenderingContext2D} ctx - \ucee8\ubc84\uc2a4 2D \ub80c\ub354\ub9c1 \ucee8\ud14d\uc2a4\ud2b8
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
