import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 전투 속도를 관리하는 중앙 매니저 (싱글턴)
 */
class BattleSpeedManager {
    constructor() {
        if (BattleSpeedManager.instance) {
            return BattleSpeedManager.instance;
        }
        this.name = 'BattleSpeedManager';
        this.speeds = [1, 2, 3];
        this.currentIndex = 0;
        this.currentMultiplier = this.speeds[this.currentIndex];
        debugLogEngine.log(this.name, '전투 속도 매니저가 초기화되었습니다.');
        BattleSpeedManager.instance = this;
    }

    /**
     * 사용 가능한 속도 배율을 순환합니다.
     * @returns {number} 변경된 속도 배율
     */
    cycleSpeed() {
        this.currentIndex = (this.currentIndex + 1) % this.speeds.length;
        this.currentMultiplier = this.speeds[this.currentIndex];
        debugLogEngine.log(this.name, `전투 속도가 ${this.currentMultiplier}x로 변경되었습니다.`);
        return this.currentMultiplier;
    }

    /**
     * 현재 속도 배율을 반환합니다.
     * @returns {number}
     */
    getMultiplier() {
        return this.currentMultiplier;
    }

    /**
     * 속도를 초기값으로 되돌립니다.
     */
    reset() {
        this.currentIndex = 0;
        this.currentMultiplier = this.speeds[this.currentIndex];
    }
}

export { BattleSpeedManager };
export const battleSpeedManager = new BattleSpeedManager();
