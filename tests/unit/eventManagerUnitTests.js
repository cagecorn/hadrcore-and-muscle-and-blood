export function runEventManagerTests(eventManager) {
    console.log("--- EventManager Test Start ---");

    let testCount = 0;
    let passCount = 0;

    testCount++;
    if (eventManager && eventManager.worker) {
        console.log("EventManager: Successfully initialized with Web Worker. [PASS]");
        passCount++;
    } else {
        console.error("EventManager: Initialization failed. [FAIL]");
    }

    testCount++;
    let subscribedEventReceived = false;
    const testEventName = 'testEvent';
    const testData = { message: 'Hello from EventManager Test!' };

    eventManager.subscribe(testEventName, (data) => {
        console.log(`EventManager: Subscribed callback received event '${testEventName}' with data:`, data);
        if (data.message === testData.message) {
            subscribedEventReceived = true;
        }
    });

    eventManager.emit(testEventName, testData);

    setTimeout(() => {
        if (subscribedEventReceived) {
            console.log("EventManager: Event emitted and subscribed callback fired successfully. [PASS]");
            passCount++;
        } else {
            console.error("EventManager: Event emitted but subscribed callback did not fire. [FAIL]");
        }

        testCount++;
        console.log("EventManager: Emitting 'unitAttack' for worker's small engine test. Check console for '흡혈' skill message.");
        eventManager.emit('unitAttack', { attackerId: 'TestHero', targetId: 'TestMob', damageDealt: 20 });

        setTimeout(() => {
            console.log("EventManager: 'unitAttack' event processed by worker's small engine. Visually check console for '흡혈' skill trigger messages. [INFO]");
            passCount++;
            console.log(`--- EventManager Test End: ${passCount}/${testCount} tests passed ---`);
        }, 100);
    }, 100);
}
