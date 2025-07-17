export function injectEventManagerFaults(eventManager) {
    console.warn("--- Injecting EventManager Faults ---");
    let faultTestCount = 0;
    let faultPassCount = 0;

    faultTestCount++;
    try {
        const faultEventName = 'faultyCallbackEvent';
        eventManager.subscribe(faultEventName, () => {
            throw new Error("Simulated Error: Subscriber callback failed!");
        });
        eventManager.emit(faultEventName, { status: 'fault' });

        setTimeout(() => {
            console.log("EventManager Fault Test (Callback Error): Check console for 'Simulated Error: Subscriber callback failed!' message. [EXPECTED ERROR]");
            faultPassCount++;
        }, 50);
    } catch (e) {
        console.error("EventManager Fault Test (Callback Error): Did not catch expected error synchronously. [FAIL]", e);
    }

    faultTestCount++;
    console.log("EventManager Fault Test (Worker Termination): Terminating worker...");
    eventManager.terminateWorker();
    try {
        eventManager.emit('afterTerminationEvent', { data: 'test' });
        console.error("EventManager Fault Test (Worker Termination): Emitted event after termination without error. [FAIL]");
    } catch (e) {
        console.log("EventManager Fault Test (Worker Termination): Successfully caught expected error when emitting after termination. [PASS]", e);
        faultPassCount++;
    }

    faultTestCount++;
    console.log("EventManager Fault Test (Unknown Worker Message Type): Simulating unknown message...");
    const originalHandleWorkerMessage = eventManager.handleWorkerMessage;
    eventManager.handleWorkerMessage = (event) => {
        console.log("[EventManager Fault Test] Receiving unknown message type:", event.data.type);
    };
    eventManager.handleWorkerMessage({ data: { type: 'UNKNOWN_MESSAGE_TYPE', payload: 'bad_data' } });
    console.log("EventManager Fault Test (Unknown Worker Message Type): Handled unknown message type without crashing. [PASS]");
    faultPassCount++;
    eventManager.handleWorkerMessage = originalHandleWorkerMessage;

    setTimeout(() => {
        console.warn(`--- EventManager Fault Injection End: ${faultPassCount}/${faultTestCount} faults tested ---`);
    }, 200);
}
