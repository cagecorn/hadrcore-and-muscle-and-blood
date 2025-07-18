// js/managers/EraserEngine.js

/**
 * \uc2fc\uc774 \uc885\ub8cc\ub420 \ub54c \uc0ac\uc6a9\ub41c \uc694\uc57d\ud55c \ucee8\ud37c\ub7f0\ud2b8\ub97c \uc2dc\uc791\ub9cc \ubc1b\uc544 \ucc98\ub9ac\ud558\ub294 \uc5f0\uae30\ub97c \uc9c4\ud589\ud569\ub2c8\ub2e4.
 */
export class EraserEngine {
    constructor() {
        console.log("\uD83D\uDDD1\uFE0F EraserEngine initialized. Ready to clean up scenes.");
        this.cleanupTasks = new Map();
    }

    /**
     * \ud2b8\ub9ac\uadf8\ub7a8 \uc885\ub8cc \uc2dc \ubc1c\ud560 \uc9c4\ud589 \uc791\uc5c5\uc744 \ub4f1\ub85d\ud569\ub2c8\ub2e4.
     * @param {string} sceneName
     * @param {Function} task
     */
    registerCleanupTask(sceneName, task) {
        this.cleanupTasks.set(sceneName, task);
        console.log(`[EraserEngine] Cleanup task registered for scene: ${sceneName}`);
    }

    /**
     * \uc9c4\ud589 \uc791\uc5c5\uc744 \uc2e4\ud589\ud569\ub2c8\ub2e4.
     * @param {string} sceneName
     */
    cleanupScene(sceneName) {
        if (this.cleanupTasks.has(sceneName)) {
            console.log(`[EraserEngine] Cleaning up scene: ${sceneName}...`);
            const task = this.cleanupTasks.get(sceneName);
            task();
        }
    }
}
