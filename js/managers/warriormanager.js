// js/managers/warriormanager.js

// Consolidated warrior-related definitions and classes
import { GAME_EVENTS, ATTACK_TYPES, GAME_DEBUG_MODE } from '../constants.js';
import { STATUS_EFFECTS } from '../../data/statusEffects.js';

// === data/unit.js ===
export const UNIT_TYPES = {
    MERCENARY: 'mercenary',
    NEUTRAL: 'neutral',
    ENEMY: 'enemy'
};

export const UNITS = {
    WARRIOR: {
        id: 'unit_warrior_001',
        name: '용맹한 전사',
        classId: 'class_warrior',
        type: UNIT_TYPES.MERCENARY,
        baseStats: {
            hp: 100,
            attack: 20,
            defense: 10,
            speed: 5,
            valor: 50,
            strength: 25,
            endurance: 20,
            agility: 10,
            intelligence: 5,
            wisdom: 10,
            luck: 15,
            weight: 30,
            attackRange: 1
        },
        spriteId: 'sprite_warrior_default',
        tags: ['용병', '남자', '근접', '방어', '전사']
    }
};

// === data/warriorSkills.js ===
export const SKILL_TYPES = {
    ACTIVE: 'active',
    PASSIVE: 'passive',
    DEBUFF: 'debuff',
    REACTION: 'reaction',
    BUFF: 'buff'
};

export const WARRIOR_SKILLS = {
    BATTLE_CRY: {
        id: 'skill_warrior_battle_cry',
        name: '전투의 외침',
        type: SKILL_TYPES.BUFF,
        icon: 'assets/icons/skills/battle_cry.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        aiFunction: 'battleCry',
        description: '자신의 공격력을 일시적으로 증가시키고 일반 공격을 수행합니다.',
        effect: {
            dice: { num: 1, sides: 6 },
            statusEffectId: 'status_battle_cry',
            allowAdditionalAttack: true
        }
    },
    RENDING_STRIKE: {
        id: 'skill_warrior_rending_strike',
        name: '찢어발기기',
        type: SKILL_TYPES.DEBUFF,
        icon: 'assets/icons/skills/rending_strike.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        probability: 0,
        description: '일반 공격 시 일정 확률로 적에게 출혈 디버프를 부여합니다.',
        effect: {
            statusEffectId: 'status_bleed'
        }
    },
    RETALIATE: {
        id: 'skill_warrior_retaliate',
        name: '반격',
        type: SKILL_TYPES.REACTION,
        icon: 'assets/icons/skills/retaliate.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        description: '공격을 받을 시 일정 확률로 즉시 80%의 피해로 반격합니다.',
        effect: {
            damageModifier: 0.8,
            tags: ['일반공격']
        }
    },
    SHIELD_BREAK: {
        id: 'skill_warrior_shield_break',
        name: '쉴드 브레이크',
        description: '일반 공격 시 대상이 3턴간 받는 피해를 10% 증가시킵니다.',
        type: SKILL_TYPES.DEBUFF,
        icon: 'assets/icons/skills/shield-break.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        effect: {
            statusEffectId: 'status_shield_break'
        }
    },
    DOUBLE_STRIKE: {
        id: 'skill_warrior_double_strike',
        name: '더블 스트라이크',
        description: '한 대상에게 빠르게 일반 공격을 2회 가합니다.',
        type: SKILL_TYPES.ACTIVE,
        icon: 'assets/icons/skills/double-strike-icon.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        aiFunction: 'doubleStrike',
        cost: 25,
        range: 1,
        cooldown: 2,
        effect: {
            tags: ['공격', '단일대상']
        },
        ai: {
            condition: (user, target) => target && user.getDistanceTo && user.getDistanceTo(target) <= 1
        }
    },
    STONE_SKIN: {
        id: 'skill_warrior_stone_skin',
        name: '스톤 스킨',
        description: '3턴 동안 받는 모든 피해가 15% 감소합니다.',
        type: 'active',
        icon: 'assets/icons/skills/stone-skin-icon.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        aiFunction: 'stoneSkin',
        cost: 20,
        range: 0,
        cooldown: 4,
        effect: {
            tags: ['방어', '버프'],
            appliesEffect: 'status_stone_skin'
        },
        ai: {}
    },
    IRON_WILL: {
        id: 'skill_warrior_iron_will',
        name: '강철 의지',
        type: SKILL_TYPES.PASSIVE,
        icon: 'assets/icons/skills/iron_will.png',
        tags: ['전사'],
        requiredUserTags: ['전사'],
        description: '잃은 체력에 비례하여 받는 피해량이 최대 30%까지 감소합니다.',
        effect: {
            type: 'damage_reduction_on_lost_hp',
            maxReduction: 0.3
        }
    }
};

// === data/class.js ===
export const CLASS_ROLES = {
    MELEE_DPS: 'melee_dps',
    RANGED_DPS: 'ranged_dps',
    TANK: 'tank',
    HEALER: 'healer',
    MAGIC_DPS: 'magic_dps'
};

export const CLASSES = {
    WARRIOR: {
        id: 'class_warrior',
        name: '전사',
        role: CLASS_ROLES.MELEE_DPS,
        description: '강력한 근접 공격과 방어력을 겸비한 병종.',
        skills: [],
        moveRange: 3,
        tags: ['근접', '방어', '용병', '전사']
    },
    WARRIOR_VALIANT: {
        id: 'class_warrior_valiant',
        name: '용맹 기사',
        role: CLASS_ROLES.TANK,
        description: '전사의 전투 경험을 극대화한 고급 병종으로, 방어와 리더십이 뛰어납니다.',
        skills: [],
        moveRange: 3,
        tags: ['근접', '방어', '용병', '전사', '고급']
    }
};

// === js/managers/warriorSkillsAI.js ===
export class WarriorSkillsAI {
    constructor(managers) {
        if (GAME_DEBUG_MODE) console.log("\u2694\ufe0f WarriorSkillsAI initialized. Ready to execute warrior skills. \u2694\ufe0f");
        this.managers = managers;
    }

    async battleCry(userUnit, skillData) {
        if (!userUnit || userUnit.currentHp <= 0) {
            if (GAME_DEBUG_MODE) console.warn("[WarriorSkillsAI] Battle Cry skill failed: Invalid user unit.");
            return;
        }
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} uses ${skillData.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
            unitId: userUnit.id,
            skillName: skillData.name
        });

        this.managers.eventManager.emit(GAME_EVENTS.SKILL_EXECUTED, {
            skillId: skillData.id,
            skillName: skillData.name,
            userId: userUnit.id
        });

        this.managers.workflowManager.triggerStatusEffectApplication(userUnit.id, skillData.effect.statusEffectId);
        await this.managers.delayEngine.waitFor(500);

        if (skillData.effect.allowAdditionalAttack) {
            console.log(`[WarriorSkillsAI] ${userUnit.name} performs an additional attack after Battle Cry.`);
            const closestEnemy = this.managers.coordinateManager.findClosestUnit(userUnit.id, ATTACK_TYPES.ENEMY);

            if (closestEnemy) {
                const attackRange = userUnit.baseStats.attackRange || 1;
                let distance = Math.abs(userUnit.gridX - closestEnemy.gridX) + Math.abs(userUnit.gridY - closestEnemy.gridY);

                if (distance > attackRange) {
                    const moveRange = userUnit.baseStats.moveRange || 1;
                    await this.managers.movingManager.chargeMove(userUnit, closestEnemy.gridX, closestEnemy.gridY, moveRange);
                    distance = Math.abs(userUnit.gridX - closestEnemy.gridX) + Math.abs(userUnit.gridY - closestEnemy.gridY);
                }

                if (distance <= attackRange) {
                    this.managers.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                        attackerId: userUnit.id,
                        targetId: closestEnemy.id,
                        attackType: ATTACK_TYPES.MELEE
                    });
                    const normalAttackData = { type: ATTACK_TYPES.PHYSICAL, dice: skillData.effect.dice };
                    this.managers.battleCalculationManager.requestDamageCalculation(userUnit.id, closestEnemy.id, normalAttackData);
                    await this.managers.delayEngine.waitFor(500);
                } else if (GAME_DEBUG_MODE) {
                    console.log(`[WarriorSkillsAI] Additional attack skipped. Target still out of range (${distance} > ${attackRange}).`);
                }
            } else {
                console.log(`[WarriorSkillsAI] No target found for additional attack.`);
            }
        }
    }

    async rendingStrike(userUnit, targetUnit, skillData) {
        if (!userUnit || !targetUnit || userUnit.currentHp <= 0 || targetUnit.currentHp <= 0) {
            console.warn("[WarriorSkillsAI] Rending Strike skill failed: Invalid user or target unit.");
            return;
        }
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} attempts ${skillData.name} on ${targetUnit.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
            unitId: userUnit.id,
            skillName: skillData.name
        });
        this.managers.workflowManager.triggerStatusEffectApplication(targetUnit.id, skillData.effect.statusEffectId);
        await this.managers.delayEngine.waitFor(100);
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${targetUnit.name} is now affected by ${skillData.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.SKILL_EXECUTED, {
            skillId: skillData.id,
            skillName: skillData.name,
            userId: userUnit.id,
            targetId: targetUnit.id
        });
    }

    async doubleStrike(userUnit, targetUnit, skillData) {
        if (!userUnit || !targetUnit || userUnit.currentHp <= 0) {
            if (GAME_DEBUG_MODE) console.warn("[WarriorSkillsAI] Double Strike failed: Invalid unit.");
            return;
        }

        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} uses ${skillData.name} on ${targetUnit.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
            unitId: userUnit.id,
            skillName: skillData.name
        });
        await this.managers.delayEngine.waitFor(300);

        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] Double Strike: First attack.`);
        this.managers.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
            attackerId: userUnit.id,
            targetId: targetUnit.id,
            attackType: ATTACK_TYPES.MELEE,
            skillId: null
        });
        await this.managers.delayEngine.waitFor(800);

        if (targetUnit.currentHp > 0) {
            if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] Double Strike: Second attack.`);
            this.managers.eventManager.emit(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, {
                attackerId: userUnit.id,
                targetId: targetUnit.id,
                attackType: ATTACK_TYPES.MELEE,
                skillId: null
            });
            await this.managers.delayEngine.waitFor(800);
        } else if (GAME_DEBUG_MODE) {
            console.log(`[WarriorSkillsAI] Target ${targetUnit.name} defeated. Second strike cancelled.`);
        }
    }

    async stoneSkin(userUnit, skillData) {
        if (!userUnit || userUnit.currentHp <= 0) {
            if (GAME_DEBUG_MODE) console.warn("[WarriorSkillsAI] Stone Skin failed: Invalid user unit.");
            return;
        }

        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} uses ${skillData.name}!`);

        this.managers.eventManager.emit(GAME_EVENTS.DISPLAY_SKILL_NAME, {
            unitId: userUnit.id,
            skillName: skillData.name
        });

        const effectId = skillData.effect.appliesEffect;
        if (effectId) {
            this.managers.workflowManager.triggerStatusEffectApplication(userUnit.id, effectId);
        }
        await this.managers.delayEngine.waitFor(500);
    }

    async retaliate(userUnit, attackerUnit, skillData) {
        if (!userUnit || !attackerUnit || userUnit.currentHp <= 0 || attackerUnit.currentHp <= 0) {
            console.warn("[WarriorSkillsAI] Retaliate skill failed: Invalid user or attacker unit.");
            return;
        }
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] ${userUnit.name} uses ${skillData.name} on ${attackerUnit.name}!`);

        const counterAttackDamageMultiplier = skillData.effect.counterAttackDamageMultiplier || 1;
        const attackSkillData = {
            type: ATTACK_TYPES.PHYSICAL,
            dice: { num: 1, sides: 6 },
            damageMultiplier: counterAttackDamageMultiplier
        };

        this.managers.battleCalculationManager.requestDamageCalculation(userUnit.id, attackerUnit.id, attackSkillData);
        await this.managers.delayEngine.waitFor(300);

        this.managers.eventManager.emit(GAME_EVENTS.SKILL_EXECUTED, {
            skillId: skillData.id,
            skillName: skillData.name,
            userId: userUnit.id,
            targetId: attackerUnit.id
        });
    }

    applyIronWillPassive(userUnit, skillData) {
        if (!userUnit) return;
        if (GAME_DEBUG_MODE) console.log(`[WarriorSkillsAI] Passive skill ${skillData.name} is active for ${userUnit.name}. Magic damage reduction: ${skillData.effect.magicDamageReduction * 100}%`);
    }
}

// === js/managers/StatManager.js ===
export class StatManager {
    constructor(valorEngine, weightEngine) {
        console.log("\uD83D\uDCCA StatManager initialized. Ready to calculate unit statistics. \uD83D\uDCCA");
        this.valorEngine = valorEngine;
        this.weightEngine = weightEngine;
    }

    getCalculatedStats(unitData, equippedItems = []) {
        const base = unitData.baseStats;
        if (!base) {
            console.warn(`[StatManager] No baseStats found for unit ${unitData.id || unitData.name}. Returning empty stats.`);
            return {};
        }

        const calculatedStats = {
            hp: base.hp || 0,
            valor: base.valor || 0,
            strength: base.strength || 0,
            endurance: base.endurance || 0,
            agility: base.agility || 0,
            intelligence: base.intelligence || 0,
            wisdom: base.wisdom || 0,
            luck: base.luck || 0,
            barrier: this.valorEngine.calculateInitialBarrier(base.valor || 0),
            damageAmplification: 1.0,
            totalWeight: this.weightEngine.calculateTotalWeight(unitData, equippedItems),
            turnWeightPenalty: 0,
            physicalAttack: (base.strength || 0) * 1.5,
            physicalDefense: (base.endurance || 0) * 1.2,
            magicAttack: (base.intelligence || 0) * 1.5,
            magicDefense: (base.wisdom || 0) * 1.2,
            physicalEvadeChance: (base.agility || 0) * 0.2,
            accuracy: (base.agility || 0) * 0.15,
            magicEvadeChance: (base.luck || 0) * 0.1,
            criticalChance: (base.luck || 0) * 0.05,
            criticalDamageMultiplier: 1.5,
            statusEffectResistance: (base.endurance || 0) * 0.1,
            statusEffectApplication: (base.intelligence || 0) * 0.1
        };
        calculatedStats.turnWeightPenalty = this.weightEngine.getTurnWeightPenalty(calculatedStats.totalWeight);
        console.log(`[StatManager] Calculated stats for ${unitData.name || unitData.id}:`, calculatedStats);
        return calculatedStats;
    }

    updateDamageAmplification(currentBarrier, maxBarrier) {
        return this.valorEngine.calculateDamageAmplification(currentBarrier, maxBarrier);
    }
}

// === js/managers/TagManager.js ===
export class TagManager {
    constructor(idManager) {
        console.log("\ud83c\udff7\ufe0f TagManager initialized. Ready to enforce tag-based rules. \ud83c\udff7\ufe0f");
        this.idManager = idManager;
    }

    hasTag(dataObject, tag) {
        if (!dataObject || !Array.isArray(dataObject.tags)) {
            return false;
        }
        return dataObject.tags.includes(tag);
    }

    hasAllTags(dataObject, requiredTags) {
        if (!dataObject || !Array.isArray(dataObject.tags)) {
            return requiredTags.length === 0;
        }
        return requiredTags.every(tag => dataObject.tags.includes(tag));
    }

    hasAnyTag(dataObject, anyTags) {
        if (!dataObject || !Array.isArray(dataObject.tags)) {
            return false;
        }
        return anyTags.some(tag => dataObject.tags.includes(tag));
    }

    canEquipItem(unitOrClassData, itemData) {
        console.log(`[TagManager DEBUG]  echipaj-echipare: '${unitOrClassData?.id}' echipând '${itemData?.id}'`);
        if (!unitOrClassData || !Array.isArray(unitOrClassData.tags)) {
            console.warn(`[TagManager] Unit/Class data missing or invalid tags for equip check:`, unitOrClassData);
            return false;
        }
        if (!itemData || !Array.isArray(itemData.requiredUnitTags)) {
            console.log(`[TagManager DEBUG] Rezultat: false (item-ul nu are requiredUnitTags)`);
            return false;
        }
        const canEquip = itemData.requiredUnitTags.some(requiredTag => unitOrClassData.tags.includes(requiredTag));
        console.log(`[TagManager DEBUG] Tag-uri unitate: [${unitOrClassData.tags.join(', ')}], Tag-uri necesare item: [${itemData.requiredUnitTags.join(', ')}]`);
        console.log(`[TagManager DEBUG] Rezultat: ${canEquip}`);
        if (!canEquip) {
            console.log(`[TagManager] Cannot equip '${itemData.id}'. Unit '${unitOrClassData.id}' tags [${unitOrClassData.tags.join(',')}] do not match required item tags [${itemData.requiredUnitTags.join(',')}]`);
        }
        return canEquip;
    }

    canUseSkill(unitOrClassData, skillData) {
        console.log(`[TagManager DEBUG] verificare-utilizare-skill: '${unitOrClassData?.id}' folosind '${skillData?.id}'`);
        if (!unitOrClassData || !Array.isArray(unitOrClassData.tags)) {
            console.warn(`[TagManager] Unit/Class data missing or invalid tags for skill check:`, unitOrClassData);
            return false;
        }
        if (!skillData || !Array.isArray(skillData.requiredUserTags)) {
            console.log(`[TagManager DEBUG] Rezultat: true (skill-ul nu are requiredUserTags)`);
            return true;
        }
        const canUse = skillData.requiredUserTags.every(requiredTag => unitOrClassData.tags.includes(requiredTag));
        console.log(`[TagManager DEBUG] Tag-uri unitate: [${unitOrClassData.tags.join(', ')}], Tag-uri necesare skill: [${skillData.requiredUserTags.join(', ')}]`);
        console.log(`[TagManager DEBUG] Rezultat: ${canUse}`);
        if (!canUse) {
            console.log(`[TagManager] Cannot use skill '${skillData.id}'. Unit '${unitOrClassData.id}' tags [${unitOrClassData.tags.join(',')}] do not match required skill tags [${skillData.requiredUserTags.join(',')}]`);
        }
        return canUse;
    }

    async validateDataTags(dataId, expectedTags) {
        const data = await this.idManager.get(dataId);
        if (!data) {
            console.error(`[TagManager] Validation failed: Data for ID '${dataId}' not found.`);
            return false;
        }
        if (!Array.isArray(data.tags)) {
            console.error(`[TagManager] Validation failed: Data for ID '${dataId}' has no 'tags' array.`);
            return false;
        }
        const missingExpected = expectedTags.filter(tag => !data.tags.includes(tag));
        const unexpectedExisting = data.tags.filter(tag => !expectedTags.includes(tag));
        if (missingExpected.length > 0) {
            console.error(`[TagManager] Validation failed for '${dataId}': Missing expected tags: [${missingExpected.join(', ')}]`);
            return false;
        }
        if (unexpectedExisting.length > 0) {
            console.warn(`[TagManager] Validation warning for '${dataId}': Unexpected tags found: [${unexpectedExisting.join(', ')}]`);
        }
        console.log(`[TagManager] Validation successful for '${dataId}'. All expected tags found.`);
        return true;
    }
}
