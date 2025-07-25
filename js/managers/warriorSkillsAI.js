// js/managers/warriorSkillsAI.js

// 필요한 매니저들을 임포트 (실제 사용 시 추가)
// import { BattleSimulationManager } from './BattleSimulationManager.js';
// import { BattleCalculationManager } from './BattleCalculationManager.js';
// import { EventManager } from './EventManager.js';
// import { DelayEngine } from './DelayEngine.js';
// import { StatusEffectManager } from './StatusEffectManager.js';
// import { CoordinateManager } from './CoordinateManager.js';
// import { TargetingManager } from './TargetingManager.js';
// import { VFXManager } from './VFXManager.js';
import { GAME_EVENTS, ATTACK_TYPES, GAME_DEBUG_MODE } from '../constants.js'; // ✨ GAME_DEBUG_MODE 임포트
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';
import { STATUS_EFFECTS } from '../../data/statusEffects.js';

export class WarriorSkillsAI {
    /**
     * WarriorSkillsAI를 초기화합니다.
     * 모든 스킬 AI 함수는 공통적으로 필요한 매니저들을 받을 수 있습니다.
     * @param {object} managers - BattleSimulationManager, BattleCalculationManager, EventManager 등 스킬 실행에 필요한 모든 매니저 객체
     */
    constructor(managers) {
        if (GAME_DEBUG_MODE) console.log("\u2694\ufe0f WarriorSkillsAI initialized. Ready to execute warrior skills. \u2694\ufe0f");
        this.managers = managers; // 모든 필요한 매니저를 하나의 객체로 받음
    }


    /**
     * '전투의 외침' 스킬의 AI 및 효과를 실행합니다.
     * @param {object} userUnit - 스킬을 사용하는 유닛 객체
     * @param {object} targetUnit - 스킬 대상 유닛 객체 (버프이므로 보통 자기 자신)
     * @param {object} skillData - 스킬 데이터 (WARRIOR_SKILLS.BATTLE_CRY)
     * @returns {Promise<void>} 스킬 실행 완료 Promise
     */
    async battleCry(userUnit, targetUnit, skillData) {
        if (!userUnit || userUnit.currentHp <= 0) {
            if (GAME_DEBUG_MODE) console.warn("[WarriorSkillsAI] Battle Cry skill failed: Invalid user unit.");
            return;
        }
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} uses ${skillData.name}!`);

        // 스킬 이름 표시 이벤트
        this.managers.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
            unitId: userUnit.id,
            skillName: skillData.name,
            skillType: skillData.type
        });

        // 1. 스킬 시전 시각 효과
        this.managers.eventManager.emit(GAME_EVENTS.SKILL_EXECUTED, {
            skillId: skillData.id,
            skillName: skillData.name, // 이름 추가
            userId: userUnit.id
        });

        // 2. 자신에게 버프 상태 적용
        this.managers.workflowManager.triggerStatusEffectApplication(userUnit.id, skillData.effect.statusEffectId);
        await this.managers.delayEngine.waitFor(500);

        // 3. 버프 후 추가 공격 처리
        if (skillData.effect.allowAdditionalAttack) {
            console.log(`[WarriorSkillsAI] ${userUnit.name} performs an additional attack after Battle Cry.`);
            const closestEnemy = this.managers.coordinateManager.findClosestUnit(userUnit.id, ATTACK_TYPES.ENEMY);

            if (closestEnemy) {
                const attackRange = userUnit.baseStats.attackRange || 1;
                let inRange = this.managers.rangeManager.isTargetInRange(userUnit, closestEnemy);

                // 사거리 밖이면 이동 시도
                if (!inRange) {
                    const moveRange = userUnit.baseStats.moveRange || 1;
                    let moved = await this.managers.movingManager.chargeMove(userUnit, closestEnemy.gridX, closestEnemy.gridY, moveRange);

                    if (!moved) {
                        moved = await this.managers.movingManager.advanceTowards?.(userUnit, closestEnemy.gridX, closestEnemy.gridY, moveRange);
                    }

                    if (!moved && GAME_DEBUG_MODE) {
                        console.log(`[WarriorSkillsAI] Could not move closer to target for additional attack.`);
                    }

                    inRange = this.managers.rangeManager.isTargetInRange(userUnit, closestEnemy);
                }

                if (inRange) {
                    this.managers.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                        attackerId: userUnit.id,
                        targetId: closestEnemy.id,
                        attackType: ATTACK_TYPES.MELEE
                    });

                    const normalAttackData = { type: ATTACK_TYPES.PHYSICAL, dice: skillData.effect.dice };
                    this.managers.battleCalculationManager.requestDamageCalculation(userUnit.id, closestEnemy.id, normalAttackData);
                    await this.managers.delayEngine.waitFor(500);
                } else if (GAME_DEBUG_MODE) {
                    console.log(`[WarriorSkillsAI] Additional attack skipped. Target still out of range.`);
                }
            } else {
                console.log(`[WarriorSkillsAI] No target found for additional attack.`);
            }
        }
    }

    /**
     * '찢어발기기' 스킬의 AI 및 효과를 실행합니다. (디버프 스킬)
     * 이 스킬은 일반 공격 시 확률적으로 발동하는 타입입니다.
     * @param {object} userUnit - 스킬을 사용하는 유닛 객체
     * @param {object} targetUnit - 스킬의 대상 유닛 객체
     * @param {object} skillData - 스킬 데이터 (WARRIOR_SKILLS.RENDING_STRIKE)
     * @returns {Promise<void>} 스킬 실행 완료 Promise
     */
    async rendingStrike(userUnit, targetUnit, skillData) {
        if (!userUnit || !targetUnit || userUnit.currentHp <= 0 || targetUnit.currentHp <= 0) {
            console.warn("[WarriorSkillsAI] Rending Strike skill failed: Invalid user or target unit.");
            return;
        }
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} attempts ${skillData.name} on ${targetUnit.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
            unitId: userUnit.id,
            skillName: skillData.name,
            skillType: skillData.type
        });
        this.managers.workflowManager.triggerStatusEffectApplication(targetUnit.id, skillData.effect.statusEffectId);
        await this.managers.delayEngine.waitFor(100);
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${targetUnit.name} is now affected by ${skillData.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.SKILL_EXECUTED, {
            skillId: skillData.id,
            skillName: skillData.name, // 이름 추가
            userId: userUnit.id,
            targetId: targetUnit.id
        });
    }

    /**
     * '더블 스트라이크' 스킬을 실행합니다. 대상에게 연속으로 두 번의 기본 공격을 시도합니다.
     * @param {object} userUnit - 스킬 시전자
     * @param {object} targetUnit - 공격 대상
     * @param {object} skillData - 스킬 데이터 (WARRIOR_SKILLS.DOUBLE_STRIKE)
     */
    async doubleStrike(userUnit, targetUnit, skillData) {
        if (!userUnit || !targetUnit || userUnit.currentHp <= 0) {
            if (GAME_DEBUG_MODE) console.warn("[WarriorSkillsAI] Double Strike failed: Invalid unit.");
            return;
        }

        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} uses ${skillData.name} on ${targetUnit.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
            unitId: userUnit.id,
            skillName: skillData.name,
            skillType: skillData.type
        });
        await this.managers.delayEngine.waitFor(300);

        // 1. 목표가 사거리 밖에 있는지 확인하고 이동
        const inRange = this.managers.rangeManager.isTargetInRange(userUnit, targetUnit);
        if (!inRange) {
            if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] Target out of range. Moving closer...`);
            const moveRange = userUnit.baseStats.moveRange || 1;
            let moved = await this.managers.movingManager.chargeMove(userUnit, targetUnit.gridX, targetUnit.gridY, moveRange);

            // chargeMove가 실패하면 가능한 한 목표 방향으로 이동 시도
            if (!moved) {
                moved = await this.managers.movingManager.advanceTowards?.(userUnit, targetUnit.gridX, targetUnit.gridY, moveRange);
            }

            // 이동 후에도 사거리 밖이면 스킬 취소
            if (!moved || !this.managers.rangeManager.isTargetInRange(userUnit, targetUnit)) {
                if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] Could not reach target this turn. Double Strike cancelled.`);
                return;
            }
        }

        // 2. 첫 번째 공격
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] Double Strike: First attack.`);
        this.managers.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
            attackerId: userUnit.id,
            targetId: targetUnit.id,
            attackType: ATTACK_TYPES.MELEE,
            skillId: null
        });
        this.managers.battleCalculationManager.requestDamageCalculation(userUnit.id, targetUnit.id, { type: 'physical', dice: { num: 1, sides: 6 } });
        await this.managers.delayEngine.waitFor(800);

        // 3. 두 번째 공격 (대상이 살아있는 경우)
        if (targetUnit.currentHp > 0) {
            if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] Double Strike: Second attack.`);
            this.managers.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                attackerId: userUnit.id,
                targetId: targetUnit.id,
                attackType: ATTACK_TYPES.MELEE,
                skillId: null
            });
            this.managers.battleCalculationManager.requestDamageCalculation(userUnit.id, targetUnit.id, { type: 'physical', dice: { num: 1, sides: 6 } });
            await this.managers.delayEngine.waitFor(800);
        } else if (GAME_DEBUG_MODE) {
            console.log(`[WarriorSkillsAI] Target ${targetUnit.name} defeated. Second strike cancelled.`);
        }
    }

    /**
     * 스톤 스킨 스킬을 실행합니다. 자신에게 피해 감소 버프를 적용합니다.
     * @param {object} userUnit - 스킬 시전자
     * @param {object} targetUnit - 스킬 대상 유닛 객체 (버프라면 자기 자신)
     * @param {object} skillData - 스킬 데이터
     */
    async stoneSkin(userUnit, targetUnit, skillData) {
        if (!userUnit || userUnit.currentHp <= 0) {
            if (GAME_DEBUG_MODE) console.warn("[WarriorSkillsAI] Stone Skin failed: Invalid user unit.");
            return;
        }

        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} uses ${skillData.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
            unitId: userUnit.id,
            skillName: skillData.name,
            skillType: skillData.type
        });

        const effectId = skillData.effect.appliesEffect;
        if (effectId) {
            this.managers.workflowManager.triggerStatusEffectApplication(userUnit.id, effectId);
        }

        await this.managers.delayEngine.waitFor(500);
    }

    /**
     * '반격' 스킬의 AI 및 효과를 실행합니다. (리액션 스킬)
     * @param {object} userUnit - 스킬을 사용하는 유닛 객체 (공격받은 유닛)
     * @param {object} attackerUnit - 공격한 유닛 객체 (반격 대상)
     * @param {object} skillData - 스킬 데이터 (WARRIOR_SKILLS.RETALIATE)
     * @returns {Promise<void>} 스킬 실행 완료 Promise
     */
    async retaliate(userUnit, attackerUnit, skillData) {
        if (!userUnit || !attackerUnit || userUnit.currentHp <= 0 || attackerUnit.currentHp <= 0) {
            console.warn("[WarriorSkillsAI] Retaliate skill failed: Invalid user or attacker unit.");
            return;
        }
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} uses ${skillData.name} on ${attackerUnit.name}!`);

        const counterAttackDamageMultiplier = skillData.effect.counterAttackDamageMultiplier || 1;
        const attackSkillData = {
            type: ATTACK_TYPES.PHYSICAL,
            dice: { num: 1, sides: 6 }, // 기본 반격 주사위
            damageMultiplier: counterAttackDamageMultiplier
        };

        this.managers.battleCalculationManager.requestDamageCalculation(userUnit.id, attackerUnit.id, attackSkillData);
        await this.managers.delayEngine.waitFor(300);

        this.managers.eventManager.emit(GAME_EVENTS.SKILL_EXECUTED, {
            skillId: skillData.id,
            skillName: skillData.name, // 이름 추가
            userId: userUnit.id,
            targetId: attackerUnit.id
        });
    }

    /**
     * '강철 의지' 스킬의 AI 및 효과를 실행합니다. (패시브 스킬)
     * 패시브 스킬은 턴마다 명시적으로 호출되기보다, StatManager 등에서 유닛 스탯 계산 시 참조됩니다.
     * 여기서는 단순 로그를 출력하는 것으로 대체합니다.
     * @param {object} userUnit - 스킬을 가진 유닛 객체
     * @param {object} skillData - 스킬 데이터 (WARRIOR_SKILLS.IRON_WILL)
     */
    applyIronWillPassive(userUnit, skillData) {
        if (!userUnit) return;
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] Passive skill ${skillData.name} is active for ${userUnit.name}. Magic damage reduction: ${skillData.effect.magicDamageReduction * 100}%`);
    }
}
