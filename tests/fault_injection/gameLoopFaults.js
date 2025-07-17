let updateShouldThrow = false;
let drawShouldThrow = false;

export function injectGameLoopFault(faultType, setFaultFlag) {
    console.warn(`--- Injecting GameLoop Fault in ${faultType} function ---`);
    if (setFaultFlag && typeof setFaultFlag === 'function') {
        setFaultFlag(faultType, true);
        console.log(`Fault flag set for ${faultType} function. Check console for errors in game loop.`);
    } else {
        console.error("GameLoop Fault Test: setFaultFlag function is missing or invalid. [FAIL]");
    }
    console.warn("--- GameLoop Fault Injection End ---");
}

export function getFaultFlags() {
    return {
        update: updateShouldThrow,
        draw: drawShouldThrow
    };
}

export function setFaultFlag(type, value) {
    if (type === 'update') {
        updateShouldThrow = value;
    } else if (type === 'draw') {
        drawShouldThrow = value;
    }
}
