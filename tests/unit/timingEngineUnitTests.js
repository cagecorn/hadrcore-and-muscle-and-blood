// tests/unit/timingEngineUnitTests.js

import { TimingEngine } from '../../js/managers/TimingEngine.js';
import { DelayEngine } from '../../js/managers/DelayEngine.js';

export function runTimingEngineUnitTests() {
    console.log("--- TimingEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const delayEngine = new DelayEngine();

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const timingEngine = new TimingEngine(delayEngine);
        if (timingEngine.actionQueue instanceof Array && !timingEngine.isProcessingActions) {
            console.log("TimingEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("TimingEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("TimingEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: addTimedAction 및 우선순위 정렬 확인
    testCount++;
    try {
        const timingEngine = new TimingEngine(delayEngine);
        timingEngine.addTimedAction(async () => {}, 10, "Action C");
        timingEngine.addTimedAction(async () => {}, 5, "Action B");
        timingEngine.addTimedAction(async () => {}, 1, "Action A");

        if (timingEngine.actionQueue.length === 3 &&
            timingEngine.actionQueue[0].name === "Action A" &&
            timingEngine.actionQueue[1].name === "Action B" &&
            timingEngine.actionQueue[2].name === "Action C") {
            console.log("TimingEngine: Actions added and sorted by priority correctly. [PASS]");
            passCount++;
        } else {
            console.error("TimingEngine: Actions not sorted correctly. [FAIL]", timingEngine.actionQueue.map(a => a.name));
        }
    } catch (e) {
        console.error("TimingEngine: Error during addTimedAction or sorting. [FAIL]", e);
    }

    // 테스트 3: processActions 순차적 실행 확인
    testCount++;
    try {
        const timingEngine = new TimingEngine(delayEngine);
        let executionOrder = [];

        timingEngine.addTimedAction(async () => { executionOrder.push(1); await delayEngine.waitFor(5); }, 20, "Task 1");
        timingEngine.addTimedAction(async () => { executionOrder.push(2); }, 10, "Task 2");
        timingEngine.addTimedAction(async () => { executionOrder.push(3); await delayEngine.waitFor(10); }, 5, "Task 3");

        timingEngine.processActions().then(() => {
            if (executionOrder[0] === 3 && executionOrder[1] === 2 && executionOrder[2] === 1) {
                console.log("TimingEngine: Actions processed in correct priority order. [PASS]");
                passCount++;
            } else {
                console.error("TimingEngine: Actions processed in incorrect priority order. [FAIL]", executionOrder);
            }
        });
    } catch (e) {
        console.error("TimingEngine: Error during processActions. [FAIL]", e);
    }

    // 테스트 4: clearActions 확인
    testCount++;
    try {
        const timingEngine = new TimingEngine(delayEngine);
        timingEngine.addTimedAction(async () => {}, 1, "Action to clear");
        timingEngine.clearActions();
        if (timingEngine.actionQueue.length === 0 && !timingEngine.isProcessingActions) {
            console.log("TimingEngine: clearActions cleared the queue. [PASS]");
            passCount++;
        } else {
            console.error("TimingEngine: clearActions failed to clear queue. [FAIL]");
        }
    } catch (e) {
        console.error("TimingEngine: Error during clearActions test. [FAIL]", e);
    }

    setTimeout(() => {
        console.log(`--- TimingEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
    }, 200);
}
