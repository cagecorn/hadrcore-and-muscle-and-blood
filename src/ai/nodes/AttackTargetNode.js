import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { spriteEngine } from '../../game/utils/SpriteEngine.js';
import { skillEngine, SKILL_TYPES } from '../../game/utils/SkillEngine.js';
import { skillCardDatabase } from '../../game/data/skills/SkillCardDatabase.js';

class AttackTargetNode extends Node {
    constructor({ combatCalculationEngine, vfxManager, animationEngine, delayEngine, terminationManager }) {
        super();
        this.combatEngine = combatCalculationEngine;
        this.vfxManager = vfxManager;
        this.animationEngine = animationEngine;
        this.delayEngine = delayEngine;
        this.terminationManager = terminationManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }

        // ✨ 일반 공격도 토큰을 사용하는 스킬로 간주
        const attackSkill = skillCardDatabase.attack;
        if (!skillEngine.canUseSkill(unit, attackSkill)) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '일반 공격을 위한 토큰 부족');
            return NodeState.FAILURE;
        }
        skillEngine.recordSkillUse(unit, attackSkill);

        // 스킬 이름을 보여줍니다.
        const skillColor = SKILL_TYPES[attackSkill.type].color;
        this.vfxManager.showSkillName(unit.sprite, attackSkill.name, skillColor);

        // 공격 스프라이트로 일시 변경
        if (unit.sprite.scene && !spriteEngine.scene) {
            spriteEngine.setScene(unit.sprite.scene);
        }
        spriteEngine.changeSpriteForDuration(unit, 'attack', 400);

        // 공격 애니메이션
        await this.animationEngine.attack(unit.sprite, target.sprite);

        // 피격 스프라이트로 변경
        spriteEngine.changeSpriteForDuration(target, 'hitted', 300);

        // 데미지 계산 및 적용
        // ✨ 데미지 계산 시 스킬 정보 전달
        const { damage, hitType, comboCount } = this.combatEngine.calculateDamage(unit, target, attackSkill);
        target.currentHp -= damage;

        // 시각 효과
        this.vfxManager.updateHealthBar(target.healthBar, target.currentHp, target.finalStats.hp);
        this.vfxManager.showComboCount(comboCount);
        this.vfxManager.createBloodSplatter(target.sprite.x, target.sprite.y);
        this.vfxManager.createDamageNumber(target.sprite.x, target.sprite.y, damage, '#ff4d4d', hitType);

        // 딜레이
        await this.delayEngine.hold(200);

        // 사망 처리
        if (target.currentHp <= 0) {
            this.terminationManager.handleUnitDeath(target);
            blackboard.set('currentTargetUnit', null); // 타겟이 죽었으므로 초기화
        }

        console.log(`[AI] ${unit.instanceName}이(가) ${target.instanceName}에게 스킬 [${attackSkill.name}] 사용!`);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default AttackTargetNode;
