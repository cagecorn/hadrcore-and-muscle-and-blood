// js/ai/BehaviorTree.js
/**
 * 행동 트리의 전체 실행을 관리하는 컨테이너 클래스입니다.
 */
export class BehaviorTree {
    constructor(root) {
        this.root = root;
    }

    async evaluate(blackboard) {
        return await this.root.evaluate(blackboard);
    }
}
