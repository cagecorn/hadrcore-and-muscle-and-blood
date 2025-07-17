export function runGuardianManagerTests(guardianManager) {
    console.log("--- GuardianManager Test Start ---");

    let testCount = 0;
    let passCount = 0;

    testCount++;
    if (guardianManager) {
        console.log("GuardianManager: Successfully initialized. [PASS]");
        passCount++;
    } else {
        console.error("GuardianManager: Initialization failed. [FAIL]");
    }

    testCount++;
    const validData = {
        units: [{ id: 'u1', name: 'Valid Unit', hp: 50 }],
        config: { resolution: { width: 1024, height: 768 } }
    };
    try {
        const result = guardianManager.enforceRules(validData);
        if (result === true) {
            console.log("GuardianManager: Enforced rules with valid data successfully. [PASS]");
            passCount++;
        } else {
            console.error("GuardianManager: Enforced rules with valid data returned unexpected result. [FAIL]");
        }
    } catch (e) {
        console.error("GuardianManager: Enforced rules with valid data threw an unexpected error. [FAIL]", e);
    }

    testCount++;
    const invalidDataHp = {
        units: [{ id: 'u2', name: 'Dead Unit', hp: 0 }],
        config: { resolution: { width: 1024, height: 768 } }
    };
    try {
        guardianManager.enforceRules(invalidDataHp);
        console.error("GuardianManager: Enforced rules with invalid HP did not throw error. [FAIL]");
    } catch (e) {
        if (e.name === "ImmutableRuleViolationError") {
            console.log("GuardianManager: Enforced rules with invalid HP threw expected ImmutableRuleViolationError. [PASS]", e.message);
            passCount++;
        } else {
            console.error("GuardianManager: Enforced rules with invalid HP threw unexpected error. [FAIL]", e);
        }
    }

    testCount++;
    const invalidDataResolution = {
        units: [{ id: 'u3', name: 'Another Unit', hp: 10 }],
        config: { resolution: { width: 799, height: 599 } }
    };
    try {
        guardianManager.enforceRules(invalidDataResolution);
        console.error("GuardianManager: Enforced rules with invalid resolution did not throw error. [FAIL]");
    } catch (e) {
        if (e.name === "ImmutableRuleViolationError") {
            console.log("GuardianManager: Enforced rules with invalid resolution threw expected ImmutableRuleViolationError. [PASS]", e.message);
            passCount++;
        } else {
            console.error("GuardianManager: Enforced rules with invalid resolution threw unexpected error. [FAIL]", e);
        }
    }

    console.log(`--- GuardianManager Test End: ${passCount}/${testCount} tests passed ---`);
}
