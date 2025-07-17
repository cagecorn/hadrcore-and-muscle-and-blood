// tests/unit/delayEngineUnitTests.js

import { DelayEngine } from '../../js/managers/DelayEngine.js';

export function runDelayEngineUnitTests() {
    console.log("--- DelayEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const delayEngine = new DelayEngine();
        if (delayEngine.delayQueue instanceof Array && !delayEngine.isProcessing) {
            console.log("DelayEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("DelayEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("DelayEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: waitFor 메서드 (비동기)
    testCount++;
    try {
        const delayEngine = new DelayEngine();
        const startTime = performance.now();
        const delayTime = 50;

        delayEngine.waitFor(delayTime).then(() => {
            const endTime = performance.now();
            const elapsed = endTime - startTime;
            if (elapsed >= delayTime * 0.8 && elapsed <= delayTime * 1.5) {
                console.log("DelayEngine: waitFor completed with expected delay. [PASS]");
                passCount++;
            } else {
                console.error("DelayEngine: waitFor completed with unexpected delay. [FAIL]", `Elapsed: ${elapsed}ms`);
            }
        });
    } catch (e) {
        console.error("DelayEngine: Error during waitFor test. [FAIL]", e);
    }

    // 테스트 3: queueDelayTask 및 _processQueue (순차적 실행)
    testCount++;
    try {
        const delayEngine = new DelayEngine();
        let executionOrder = [];

        const task1 = async () => {
            executionOrder.push(1);
            await delayEngine.waitFor(10);
        };
        const task2 = async () => {
            executionOrder.push(2);
            await delayEngine.waitFor(5);
        };
        const task3 = async () => {
            executionOrder.push(3);
        };

        delayEngine.queueDelayTask(task1);
        delayEngine.queueDelayTask(task2);
        delayEngine.queueDelayTask(task3);

        delayEngine._processQueue().then(() => {
            if (executionOrder[0] === 1 && executionOrder[1] === 2 && executionOrder[2] === 3) {
                console.log("DelayEngine: Queued tasks processed in correct order. [PASS]");
                passCount++;
            } else {
                console.error("DelayEngine: Queued tasks processed in incorrect order. [FAIL]", executionOrder);
            }
        });
    } catch (e) {
        console.error("DelayEngine: Error during queueing tasks. [FAIL]", e);
    }

    // 테스트 4: isQueueEmpty 확인
    testCount++;
    try {
        const delayEngine = new DelayEngine();
        if (delayEngine.isQueueEmpty()) {
            console.log("DelayEngine: isQueueEmpty returns true for empty queue. [PASS]");
            passCount++;
        } else {
            console.error("DelayEngine: isQueueEmpty returned false for empty queue. [FAIL]");
        }

        delayEngine.queueDelayTask(async () => {});
        if (!delayEngine.isQueueEmpty()) {
            console.log("DelayEngine: isQueueEmpty returns false for non-empty queue. [PASS]");
            passCount++;
        } else {
            console.error("DelayEngine: isQueueEmpty returned true for non-empty queue. [FAIL]");
        }
        delayEngine._processQueue().then(() => {
            if (delayEngine.isQueueEmpty()) {
                console.log("DelayEngine: isQueueEmpty returns true after processing. [PASS]");
                passCount++;
            } else {
                console.error("DelayEngine: isQueueEmpty returned false after processing. [FAIL]");
            }
        });
    } catch (e) {
        console.error("DelayEngine: Error during isQueueEmpty test. [FAIL]", e);
    }

    setTimeout(() => {
        console.log(`--- DelayEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
    }, 500);
}
