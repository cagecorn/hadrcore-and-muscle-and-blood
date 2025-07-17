// js/ai/core/Node.js
export const NodeState = {
    RUNNING: 'RUNNING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE'
};

export class Node {
    constructor() {
        if (this.constructor === Node) {
            throw new Error("추상 클래스는 인스턴스화할 수 없습니다.");
        }
        this.name = this.constructor.name;
    }

    /**
     * 이 노드의 로직을 평가합니다.
     * @param {Blackboard} blackboard - AI의 데이터 공유 객체
     * @returns {Promise<NodeState>} 노드의 실행 결과 상태
     */
    async evaluate(blackboard) {
        throw new Error("메서드 'evaluate()'를 구현해야 합니다.");
    }
}
