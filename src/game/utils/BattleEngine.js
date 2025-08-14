/**
 * 전투 로직의 기반이 되는 엔진
 * 현재는 간단한 구조만 제공하며, 이후 전투 기능 구현 시 확장될 예정이다.
 */
class BattleEngine {
    constructor() {
        this.currentBattle = null;
    }

    /**
     * 전투를 초기화한다.
     * @param {Array<object>} allies - 아군 유닛 목록
     * @param {Array<object>} enemies - 적군 유닛 목록
     */
    startBattle(allies, enemies) {
        this.currentBattle = {
            allies,
            enemies,
            turn: 0
        };
        console.log('Battle started', this.currentBattle);
    }

    /**
     * 매 턴 호출되어 전투를 진행한다.
     * 상세 로직은 추후 구현한다.
     */
    update() {
        if (!this.currentBattle) return;
        // TODO: turn processing logic
    }

    /**
     * 전투를 종료한다.
     */
    endBattle() {
        if (this.currentBattle) {
            console.log('Battle ended');
            this.currentBattle = null;
        }
    }
}

export const battleEngine = new BattleEngine();
