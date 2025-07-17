// js/managers/AIEngine.js
import { BehaviorTree } from '../ai/BehaviorTree.js';
import { Blackboard } from '../ai/core/Blackboard.js';
import { Selector } from '../ai/core/Selector.js';
import { Sequence } from '../ai/core/Sequence.js';
import { FindTargetNode, MoveToTargetNode, AttackTargetNode, UseSkillNode, DecideSkillNode } from '../ai/nodes/UnitActionNodes.js';
import { IsTargetInRangeNode } from '../ai/nodes/UnitConditionNodes.js';

export class AIEngine {
    /**
     * @param {object} managers - 게임의 모든 주요 매니저 객체
     */
    constructor(managers) {
        console.log("🤖 AIEngine (Behavior Tree) initialized. Ready to orchestrate intelligent behaviors. 🤖");
        this.managers = managers;
        this.unitControllers = new Map(); // key: unitId, value: { bt: BehaviorTree, blackboard: Blackboard }
    }

    /**
     * 특정 유닛을 위한 BT 컨트롤러를 생성하고 등록합니다.
     * @param {object} unit - AI를 적용할 유닛
     * @param {object[]} allUnits - 현재 전장의 모든 유닛
     */
    registerUnit(unit, allUnits) {
        const blackboard = new Blackboard();
        blackboard.setData('self', unit);
        blackboard.setData('allUnits', allUnits);
        blackboard.setData('managers', this.managers);

        const behaviorTree = this._createBehaviorTreeForUnit(unit);
        this.unitControllers.set(unit.id, { bt: behaviorTree, blackboard });
        console.log(`[AIEngine] ${unit.name}을(를) 위한 행동 트리 컨트롤러를 생성하고 등록했습니다.`);
    }

    /**
     * 유닛의 클래스와 스킬에 따라 맞춤형 행동 트리를 생성합니다.
     * @param {object} unit
     * @returns {BehaviorTree}
     */
    _createBehaviorTreeForUnit(unit) {
        const root = new Selector([
            new Sequence([
                new DecideSkillNode(),
                new UseSkillNode(),
            ]),
            new Sequence([
                new FindTargetNode(),
                new Selector([
                    new IsTargetInRangeNode(1),
                    new MoveToTargetNode(),
                ]),
                new AttackTargetNode(),
            ]),
        ]);

        return new BehaviorTree(root);
    }

    /**
     * 특정 유닛의 턴에 행동을 결정하고 실행합니다.
     * @param {string} unitId - 행동할 유닛의 ID
     * @returns {Promise<void>}
     */
    async runUnitAI(unitId) {
        const controller = this.unitControllers.get(unitId);
        if (controller) {
            console.log(`%c[AIEngine] ${controller.blackboard.getData('self').name}의 AI를 실행합니다...`, "color: yellow");
            await controller.bt.evaluate(controller.blackboard);
        } else {
            console.warn(`[AIEngine] 유닛을 위한 BT 컨트롤러를 찾을 수 없습니다: ${unitId}`);
        }
    }

    /**
     * 전투 중 사망하거나 더 이상 필요하지 않은 유닛의 컨트롤러를 제거합니다.
     * @param {string} unitId
     */
    removeUnit(unitId) {
        if (this.unitControllers.delete(unitId)) {
            console.log(`[AIEngine] Removed controller for unit ${unitId}.`);
        }
    }

    /**
     * 전투 종료 시 모든 컨트롤러를 초기화합니다.
     */
    cleanup() {
        this.unitControllers.clear();
        console.log("[AIEngine] 모든 AI 컨트롤러를 정리했습니다.");
    }
}
