// js/managers/DelayEngine.js

export class DelayEngine {
    constructor() {
        console.log("\u23F1\uFE0F DelayEngine initialized. Ready to manage time. \u23F1\uFE0F");
        this.delayQueue = [];
        this.isProcessing = false;
    }

    /**
     * 특정 시간만큼 게임 진행을 지연시킵니다.
     * @param {number} ms - 지연할 시간 (밀리초)
     * @returns {Promise<void>} - 지연이 완료되면 resolve되는 Promise
     */
    async waitFor(ms) {
        console.log(`[DelayEngine] Waiting for ${ms}ms...`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 프로미스 기반의 작업을 큐에 추가하고 순차적으로 실행합니다.
     * 여러 애니메이션이나 이벤트가 순서대로 발생해야 할 때 유용합니다.
     * @param {Function} task - 실행할 비동기 함수 (Promise를 반환해야 함)
     */
    queueDelayTask(task) {
        this.delayQueue.push(task);
        if (!this.isProcessing) {
            this._processQueue();
        }
    }

    /**
     * 큐에 있는 작업을 순차적으로 처리합니다.
     * @private
     */
    async _processQueue() {
        this.isProcessing = true;
        while (this.delayQueue.length > 0) {
            const task = this.delayQueue.shift();
            try {
                await task();
            } catch (error) {
                console.error("[DelayEngine] Error processing delay task:", error);
            }
        }
        this.isProcessing = false;
        console.log("[DelayEngine] All delay tasks processed.");
    }

    /**
     * 현재 지연 큐가 비어있는지 여부를 반환합니다.
     * 턴 엔진이 다음 행동으로 넘어가기 전에 대기할지 결정하는 데 사용될 수 있습니다.
     * @returns {boolean}
     */
    isQueueEmpty() {
        return this.delayQueue.length === 0 && !this.isProcessing;
    }
}
