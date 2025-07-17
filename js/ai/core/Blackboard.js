// js/ai/core/Blackboard.js
/**
 * AI의 '뇌' 역할을 하는 중앙 데이터 저장소입니다.
 * 행동 트리의 노드들은 이 객체를 통해 데이터를 공유합니다.
 */
export class Blackboard {
    constructor() {
        this.data = new Map();
    }

    setData(key, value) {
        this.data.set(key, value);
    }

    getData(key) {
        return this.data.get(key);
    }

    hasData(key) {
        return this.data.has(key);
    }
}
