/**
 * 게임 내 모든 객체에 대한 고유 ID를 생성하고 관리하는 중앙 매니저
 */
class UniqueIDManager {
    constructor() {
        this.nextId = 1;
    }

    /**
     * 다음 사용 가능한 고유 ID를 반환합니다.
     * @returns {number}
     */
    getNextId() {
        return this.nextId++;
    }
}

export const uniqueIDManager = new UniqueIDManager();
