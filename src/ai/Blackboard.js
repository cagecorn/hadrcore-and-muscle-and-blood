/**
 * AI 유닛의 의사결정에 필요한 모든 데이터를 저장하고 관리하는 중앙 데이터 저장소입니다.
 * 각 AI 유닛은 자신만의 블랙보드 인스턴스를 가집니다.
 */
class Blackboard {
    constructor() {
        this.data = new Map();
        this.initializeDataKeys();
    }

    /**
     * 블랙보드에서 사용할 모든 데이터 키를 초기 상태로 설정합니다.
     */
    initializeDataKeys() {
        // --- 🎯 타겟팅 및 위치 관련 정보 ---
        this.set('nearestEnemy', null);
        this.set('lowestHealthEnemy', null);
        this.set('currentTargetUnit', null);
        this.set('optimalAttackPosition', null);
        this.set('safestRetreatPosition', null);
        this.set('enemiesInAttackRange', []);

        // --- ⚔️ 전술적 상황 판단 정보 ---
        // ✨ [추가] AI가 현재 위협받고 있는지 여부를 나타내는 플래그를 추가합니다.
        this.set('isThreatened', false);
        this.set('squadAdvantage', 0);
        this.set('enemyHealerUnit', null);
        this.set('threateningUnit', null);
        // ✨ [신규] 전략적 상황 판단을 위한 키 추가
        this.set('healthPercentage', 1.0); // 현재 체력 비율 (1.0 = 100%)
        this.set('isLastAllyAlive', false); // 자신이 마지막 생존자인지 여부
        this.set('allyDeathCountSinceLastTurn', 0); // 내 마지막 턴 이후 죽은 아군 수

        // --- 🤖 AI 자신의 상태 정보 ---
        this.set('canUseSkill_1', false);
        this.set('canUseSkill_2', false);
        this.set('canUseSkill_3', false);

        // --- 이동 및 공격 관련 신규 정보 ---
        this.set('movementPath', null);
        this.set('isTargetInAttackRange', false);

        // --- 턴 진행 플래그 ---
        this.set('hasMovedThisTurn', false);
        this.set('usedSkillsThisTurn', new Set());
        this.set('currentTargetSkill', null);
    }

    set(key, value) {
        this.data.set(key, value);
    }

    get(key) {
        return this.data.get(key);
    }

    has(key) {
        return this.data.has(key);
    }
}

export default Blackboard;
