export function injectGuardianManagerFaults(guardianManager) {
    console.warn("--- Injecting GuardianManager Faults ---");
    let faultTestCount = 0;
    let faultPassCount = 0;

    faultTestCount++;
    try {
        console.log("GuardianManager Fault Test (Null unit data): Enforcing rules with null units...");
        guardianManager.enforceRules({ units: null, config: { resolution: { width: 1280, height: 720 } } });
        console.log("GuardianManager Fault Test (Null unit data): Handled null unit data gracefully. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("GuardianManager Fault Test (Null unit data): Threw unexpected error. [FAIL]", e);
    }

    faultTestCount++;
    try {
        console.log("GuardianManager Fault Test (Non-array unit data): Enforcing rules with non-array units...");
        guardianManager.enforceRules({ units: "not an array", config: { resolution: { width: 1280, height: 720 } } });
        console.error("GuardianManager Fault Test (Non-array unit data): Did not throw TypeError as expected. [FAIL]");
    } catch (e) {
        if (e instanceof TypeError) {
            console.log("GuardianManager Fault Test (Non-array unit data): Threw expected TypeError. [PASS]", e);
            faultPassCount++;
        } else {
            console.error("GuardianManager Fault Test (Non-array unit data): Threw unexpected error type. [FAIL]", e);
        }
    }

    faultTestCount++;
    try {
        console.log("GuardianManager Fault Test (Missing resolution data): Enforcing rules with missing resolution...");
        guardianManager.enforceRules({ units: [{ id: 'u4', name: 'Test Unit', hp: 1 }], config: {} });
        console.log("GuardianManager Fault Test (Missing resolution data): Handled missing resolution data gracefully. [PASS]");
        faultPassCount++;
    } catch (e) {
        console.error("GuardianManager Fault Test (Missing resolution data): Threw unexpected error. [FAIL]", e);
    }

    console.warn(`--- GuardianManager Fault Injection End: ${faultPassCount}/${faultTestCount} faults tested ---`);
}
