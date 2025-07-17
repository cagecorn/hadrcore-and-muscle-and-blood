// js/ai/core/CompositeNode.js
import { Node } from './Node.js';

export class CompositeNode extends Node {
    /**
     * @param {Node[]} children - 자식 노드의 배열
     */
    constructor(children = []) {
        super();
        this.children = children;
    }
}
