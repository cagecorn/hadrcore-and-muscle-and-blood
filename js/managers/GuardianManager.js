// js/managers/GuardianManager.js

// 커스텀 오류 클래스 정의 (Python의 ImmutableRuleError와 유사)
class ImmutableRuleViolationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ImmutableRuleViolationError";
    }
}

export class GuardianManager {
    constructor() {
        console.log("\uD83D\uDEE1️ GuardianManager is now monitoring the system. \uD83D\uDEE1️");
        // 앞으로 MapLoader나 TestRunner 같은 종속성을 받을 수 있습니다.
    }

    /**
     * '작은 엔진': 게임 데이터의 불변 규칙을 검증합니다.
     * 현재는 간단한 예시 규칙을 검증합니다.
     * @param {object} gameData - 검증할 게임 데이터 (예: 유닛 데이터, 스탯 데이터 등)
     * @returns {boolean} - 모든 규칙이 준수되었으면 true, 아니면 오류 발생.
     * @throws {ImmutableRuleViolationError} - 불변 규칙이 위반되었을 때 발생.
     */
    enforceRules(gameData) {
        console.log("[GuardianManager] Enforcing rules on provided game data...");

        // --- 불변 규칙 예시 (작은 엔진의 역할) ---

        // 규칙 1: 모든 유닛의 체력은 0보다 커야 한다.
        if (gameData && gameData.units) {
            for (const unit of gameData.units) {
                if (unit.hp <= 0) {
                    throw new ImmutableRuleViolationError(
                        `Rule Violation: Unit '${unit.name}' (ID: ${unit.id}) has non-positive HP (${unit.hp}).`
                    );
                }
            }
        } else {
            // 초기 게임 데이터가 없어도 오류는 아니지만, 규칙 검증이 불완전할 수 있음을 알림
            console.warn("[GuardianManager] No unit data provided for HP rule enforcement.");
        }

        // 규칙 2: 게임의 최소 해상도는 800x600 이상이어야 한다.
        if (gameData && gameData.config && gameData.config.resolution) {
            const { width, height } = gameData.config.resolution;
            if (width < 800 || height < 600) {
                throw new ImmutableRuleViolationError(
                    `Rule Violation: Minimum resolution requirement not met (${width}x${height}). Must be at least 800x600.`
                );
            }
        } else {
            console.warn("[GuardianManager] No resolution config provided for rule enforcement.");
        }

        // --- 모든 규칙이 준수됨 ---
        console.log("[GuardianManager] All rules checked and respected. \u2705");
        return true;
    }

    // 앞으로 맵 로딩 후 검증이나 특정 상태 변화 시 규칙을 검증하는 메서드가 추가될 수 있습니다.
    // 예를 들어, setupMapValidation(mapLoader) { ... }
    // 또는 onUnitCreated(unitData) { this.enforceRules({ units: [unitData] }); }
}
