// tests/unit/ruleManagerUnitTests.js

import { RuleManager } from '../../js/managers/RuleManager.js';

export function runRuleManagerUnitTests() {
    console.log("--- RuleManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // 테스트 1: 초기화 및 기본 규칙 로드 확인
    testCount++;
    try {
        const ruleManager = new RuleManager();
        if (ruleManager.rules instanceof Map && ruleManager.rules.has('unitActionPerTurn')) {
            console.log("RuleManager: Initialized correctly and loaded basic rules. [PASS]");
            passCount++;
        } else {
            console.error("RuleManager: Initialization failed or basic rules not loaded. [FAIL]");
        }
    } catch (e) {
        console.error("RuleManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: 규칙 추가
    testCount++;
    try {
        const ruleManager = new RuleManager();
        ruleManager.addRule('newRule', 'This is a new test rule.');
        if (ruleManager.rules.has('newRule') && ruleManager.getRule('newRule') === 'This is a new test rule.') {
            console.log("RuleManager: Added new rule successfully. [PASS]");
            passCount++;
        } else {
            console.error("RuleManager: Failed to add new rule. [FAIL]");
        }
    } catch (e) {
        console.error("RuleManager: Error adding rule. [FAIL]", e);
    }

    // 테스트 3: 기존 규칙 덮어쓰기
    testCount++;
    const originalWarn = console.warn;
    let warnCalled = false;
    console.warn = (message) => {
        if (message.includes("Rule 'unitActionPerTurn' already exists. Overwriting.")) {
            warnCalled = true;
        }
        originalWarn(message);
    };

    try {
        const ruleManager = new RuleManager();
        ruleManager.addRule('unitActionPerTurn', 'Overwritten rule description.');
        if (warnCalled && ruleManager.getRule('unitActionPerTurn') === 'Overwritten rule description.') {
            console.log("RuleManager: Overwrote existing rule successfully with warning. [PASS]");
            passCount++;
        } else {
            console.error("RuleManager: Failed to overwrite rule or warning not emitted. [FAIL]");
        }
    } catch (e) {
        console.error("RuleManager: Error overwriting rule. [FAIL]", e);
    } finally {
        console.warn = originalWarn;
    }

    // 테스트 4: 존재하지 않는 규칙 가져오기
    testCount++;
    try {
        const ruleManager = new RuleManager();
        const rule = ruleManager.getRule('nonExistentRule');
        if (rule === undefined) {
            console.log("RuleManager: getRule for non-existent rule returns undefined. [PASS]");
            passCount++;
        } else {
            console.error("RuleManager: getRule for non-existent rule returned unexpected value. [FAIL]", rule);
        }
    } catch (e) {
        console.error("RuleManager: Error getting non-existent rule. [FAIL]", e);
    }

    console.log(`--- RuleManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
