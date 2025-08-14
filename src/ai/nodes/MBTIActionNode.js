import Node, { NodeState } from './Node.js';
import { debugMBTIManager } from '../../game/debug/DebugMBTIManager.js';

/**
 * 용병의 MBTI 성향에 따라 확률적으로 SUCCESS 또는 FAILURE를 반환하는 노드
 */
class MBTIActionNode extends Node {
    /**
     * @param {string} trait - 확인할 MBTI 특성 (E, I, S, N, T, F, J, P)
     * @param {object} [engines={}] - AI에 주입될 엔진들 (VFXManager 등)
     */
    constructor(trait, engines = {}) {
        super();
        this.trait = trait.toUpperCase();
        this.vfxManager = engines.vfxManager;
    }

    async evaluate(unit, blackboard) {
        if (!unit.mbti || unit.mbti[this.trait] === undefined) {
            return NodeState.FAILURE;
        }

        const score = unit.mbti[this.trait];
        const roll = Math.random() * 100;
        const success = roll <= score;

        debugMBTIManager.logTraitCheck(this.trait, score, roll, success);

        if (success && this.vfxManager) {
            this.vfxManager.showMBTITrait(unit.sprite, this.trait);
        }

        return success ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

export default MBTIActionNode;
