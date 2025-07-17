// js/managers/TimingEngine.js

export class TimingEngine {
    constructor(delayEngine) {
        console.log("\u23F1\uFE0F TimingEngine initialized. Ready to orchestrate turn events. \u23F1\uFE0F");
        this.delayEngine = delayEngine;
        this.actionQueue = []; // 현재 턴에서 처리할 액션 큐
        this.isProcessingActions = false;
    }

    /**
     * 턴 내에서 순서대로 처리해야 할 액션을 추가합니다.
     * @param {Function} actionFunction - 실행할 비동기 함수 (Promise를 반환할 수 있음)
     * @param {number} priority - 액션의 우선순위 (낮을수록 먼저 실행)
     * @param {string} name - 액션의 설명 (디버깅용)
     */
    addTimedAction(actionFunction, priority = 0, name = "Unnamed Action") {
        this.actionQueue.push({ actionFunction, priority, name });
        this.actionQueue.sort((a, b) => a.priority - b.priority);
        console.log(`[TimingEngine] Added action '${name}' with priority ${priority}. Current queue size: ${this.actionQueue.length}`);
    }

    /**
     * 큐에 있는 모든 액션을 우선순위에 따라 순차적으로 실행합니다.
     */
    async processActions() {
        if (this.isProcessingActions) {
            console.warn("[TimingEngine] Already processing actions. Call ignored.");
            return;
        }

        this.isProcessingActions = true;
        console.log(`[TimingEngine] Processing ${this.actionQueue.length} actions in order...`);

        while (this.actionQueue.length > 0) {
            const action = this.actionQueue.shift();
            console.log(`[TimingEngine] Executing action: '${action.name}' (Priority: ${action.priority})`);
            try {
                await action.actionFunction();
            } catch (error) {
                console.error(`[TimingEngine] Error executing action '${action.name}':`, error);
            }
        }
        this.isProcessingActions = false;
        console.log("[TimingEngine] All actions processed for this turn.");
    }

    /**
     * 현재 액션 큐를 비웁니다. 다음 턴 시작 시 호출될 수 있습니다.
     */
    clearActions() {
        this.actionQueue = [];
        this.isProcessingActions = false;
        console.log("[TimingEngine] Action queue cleared.");
    }
}
