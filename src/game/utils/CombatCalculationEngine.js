import { debugCombatLogManager } from '../debug/DebugCombatLogManager.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { debugStatusEffectManager } from '../debug/DebugStatusEffectManager.js';
import { skillModifierEngine } from './SkillModifierEngine.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
// ✨ 아이언 윌 로직에 필요한 모듈 추가
import { skillInventoryManager } from './SkillInventoryManager.js';
import { passiveSkills } from '../data/skills/passive.js';
// ✨ ValorEngine과 디버거를 import합니다.
import { statEngine } from './StatEngine.js';
import { debugValorManager } from '../debug/DebugValorManager.js';
// ✨ 1. GradeManager와 관련 상수들을 가져옵니다.
import { gradeManager } from './GradeManager.js';
import { ATTACK_TYPE } from '../data/classGrades.js';
import { SKILL_TAGS } from './SkillTagManager.js';
import { comboManager } from './ComboManager.js';
// 콤보 계산 과정을 상세히 기록하기 위한 디버그 매니저
import { debugComboManager } from '../debug/DebugComboManager.js';
// ✨ [신규] 확정 데미지 매니저를 import합니다.
import { fixedDamageManager } from './FixedDamageManager.js';
// ✨ [신규] 스택 매니저와 확정 데미지 타입 상수를 가져옵니다.
import { stackManager } from './StackManager.js';
import { FIXED_DAMAGE_TYPES } from './FixedDamageManager.js';
// ✨ AIMemoryEngine 추가
import { aiMemoryEngine } from './AIMemoryEngine.js';
import { aspirationEngine } from './AspirationEngine.js';
// ▼▼▼ [추가] 새로 만든 데미지 타입 매니저를 import 합니다. ▼▼▼
import { damageTypeManager } from './DamageTypeManager.js';
import { debugLogEngine } from './DebugLogEngine.js';
import { statusEffects } from '../data/status-effects.js';

/**
 * 실제 전투 데미지 계산을 담당하는 엔진
 */
class CombatCalculationEngine {
    // ✨ --- [핵심 버그 수정] 생성자와 battleSimulator 참조 추가 --- ✨
    constructor() {
        this.name = 'CombatCalculationEngine';
        this.battleSimulator = null;
        debugLogEngine.register(this);
    }

    /**
     * BattleSimulatorEngine의 참조를 이 엔진에 주입합니다.
     * @param {object} simulator - BattleSimulatorEngine 인스턴스
     */
    setBattleSimulator(simulator) {
        this.battleSimulator = simulator;
    }
    // ✨ --- 수정 완료 --- ✨

    /**
     * 스킬 또는 기본 공격 데미지 계산
     * @param {object} attacker
     * @param {object} defender
     * @param {object} skill - 사용된 스킬 데이터 (기본 공격 포함)
     * @returns {number} 최종 적용될 데미지
     */
    calculateDamage(attacker = {}, defender = {}, skill = {}, instanceId, grade = 'NORMAL') {
        // ▼▼▼ [추가] 데미지 계산 시작점에 이 코드를 추가합니다. ▼▼▼
        const damageTypes = damageTypeManager.identifyDamageTypes(skill);
        // 이제 'damageTypes' 배열에는 이 공격의 모든 속성 정보가 담겨 있습니다.
        // 추후 이 정보를 사용해 특정 속성 저항 등을 계산할 수 있습니다.
        // (예: if (damageTypes.includes(DAMAGE_TYPES.FIRE) && defender.fireResistance > 0) { ... })
        // ▲▲▲ [추가 끝] ▲▲▲

        // ✨ --- [핵심 수정] 데미지 계산 로직 확장 --- ✨
        // '나노레일건'의 복합 데미지를 처리하기 위해 함수를 분리합니다.
        if (skill.id === 'nanoRailgun' && typeof skill.damageMultiplier === 'object') {
            return this._calculateNanoRailgunDamage(attacker, defender, skill, instanceId, grade);
        }

        // ✨ --- [신규] 피해 무효화 효과 최우선 처리 --- ✨
        if (stackManager.hasStack(defender.uniqueId, FIXED_DAMAGE_TYPES.DAMAGE_IMMUNITY)) {
            stackManager.consumeStack(defender.uniqueId, FIXED_DAMAGE_TYPES.DAMAGE_IMMUNITY);
            debugCombatLogManager.logAttackCalculation(attacker, defender, 0, 0, 0);
            return { damage: 0, hitType: '무효', comboCount: 0 };
        }

        // ✨ [신규] '강화 학습' 버프 스택에 따른 스탯 보너스 적용
        const applyReinforcementLearning = (unit) => {
            const effects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
            const learningEffect = effects.find(e => e.id === 'reinforcementLearningBuff');
            if (learningEffect && learningEffect.stack > 0) {
                const boost = learningEffect.stack;
                const boostedStats = { ...unit.finalStats };
                boostedStats.physicalAttack += boost * 1.5;
                boostedStats.magicAttack += boost * 1.5;
                boostedStats.physicalDefense += boost * 1.2;
                boostedStats.magicDefense += boost * 1.2;
                return boostedStats;
            }
            return unit.finalStats;
        };
        const applyBraveryPassive = (unit, baseStats) => {
            if (unit.classPassive?.id !== 'bravery') return baseStats;

            const battleSimulator = this.battleSimulator;
            if (!battleSimulator) return baseStats;

            const enemies = battleSimulator.turnQueue.filter(u => u.team !== unit.team && u.currentHp > 0);
            const nearbyEnemies = enemies.filter(enemy => {
                const distance = Math.abs(unit.gridX - enemy.gridX) + Math.abs(unit.gridY - enemy.gridY);
                return distance <= 2;
            });

            if (nearbyEnemies.length > 0) {
                const boost = nearbyEnemies.length * 0.04;
                const boostedStats = { ...baseStats };
                boostedStats.physicalAttack *= (1 + boost);
                boostedStats.physicalDefense *= (1 + boost);
                debugLogEngine.log('CombatCalculationEngine', `[대담함] 패시브 발동! 주변 ${nearbyEnemies.length}명의 적에 의해 공/방 ${(boost * 100).toFixed(0)}% 증가.`);
                return boostedStats;
            }
            return baseStats;
        };

        const attackerStats = applyBraveryPassive(attacker, applyReinforcementLearning(attacker));
        const defenderStats = applyBraveryPassive(defender, applyReinforcementLearning(defender));

        // ✨ [핵심 수정] 마법, 원거리, 근접 순으로 공격 타입을 명확히 구분합니다.
        const isMagic = skill.tags?.includes(SKILL_TAGS.MAGIC);
        const isRanged = skill.tags?.includes(SKILL_TAGS.RANGED) && skill.tags?.includes(SKILL_TAGS.PHYSICAL);

        // 1. 공격자의 공격력 버프/디버프 보정치를 가져옵니다.
        const attackStatKey = isMagic ? 'magicAttack' : 'physicalAttack';
        const attackBuffPercent = statusEffectManager.getModifierValue(attacker, attackStatKey);

        const baseAttack = isMagic
            ? (attackerStats?.magicAttack || 0)
            : (attackerStats?.physicalAttack || 0); // isRanged는 physicalAttack을 공유

        // 2. 기본 공격력에 버프를 적용합니다.
        const buffedAttack = baseAttack * (1 + attackBuffPercent);

        // 콤보 배율 계산을 위한 정보
        let comboMultiplier = 1.0;
        let comboCount = 0;
        if (skill.type === 'ACTIVE') {
            comboCount = comboManager.recordAttack(attacker.uniqueId, defender.uniqueId);
            // ✨ ComboManager의 변경된 함수에 맞게 인자를 전달하여 콤보 보너스를 포함한 최종 배율을 가져옵니다.
            comboMultiplier = comboManager.getDamageMultiplier(attacker.uniqueId, comboCount, skill.tags || []);
        }

        // ✨ 1. 공격자의 배리어에 의한 데미지 증폭률을 먼저 계산합니다.
        const amp = statEngine.valorEngine.calculateDamageAmplification(attacker.currentBarrier, attacker.maxBarrier);
        if (amp > 1.0) {
            debugValorManager.logDamageAmplification(attacker, amp);
        }
        // 3. 버프가 적용된 공격력을 기반으로 배리어 증폭을 계산합니다.
        const amplifiedAttack = buffedAttack * amp;

        let finalSkill = skill;
        if (instanceId) {
            finalSkill = skillModifierEngine.getModifiedSkill(skill, grade);
        }
        // ✨ [추가] 저격, 화염병 투척의 조건부 데미지 로직
        let bonusMultiplier = 1.0;
        if (finalSkill.id === 'snipe' && (attacker.finalStats.attackRange || 1) >= 2) {
            bonusMultiplier += 0.20;
        }
        if (finalSkill.id === 'fireBottle' && (attacker.finalStats.attackRange || 1) <= 1) {
            bonusMultiplier += 0.20;
        }
        // --- ▼ [1. '처형' 스킬 효과 로직 추가] ▼ ---
        if (finalSkill.tags?.includes(SKILL_TAGS.EXECUTE) && (defender.currentHp / defender.finalStats.hp) <= 0.3) {
            bonusMultiplier *= 2.0; // 피해량 2배
            debugLogEngine.log(this.name, `[처형] 효과 발동! 대상의 체력이 낮아 피해량이 2배가 됩니다.`);
        }
        // --- ▲ [1. '처형' 스킬 효과 로직 추가] ▲ ---

        // ✨ [신규] 방어력 관통 효과 적용
        const armorPen = finalSkill.armorPenetration || 0;
        const defenseReductionPercent = statusEffectManager.getModifierValue(defender, isMagic ? 'magicDefense' : 'physicalDefense');

        // 마법 공격일 경우 마법 방어력, 아닐 경우 물리 방어력을 사용합니다.
        const initialDefense = isMagic
            ? (defenderStats?.magicDefense || 0)
            : (defenderStats?.physicalDefense || 0);

        const finalDefense = initialDefense * (1 + defenseReductionPercent) * (1 - armorPen);

        const damageMultiplier = (finalSkill.damageMultiplier || 1.0) * bonusMultiplier;
        // ✨ 2. 증폭된 공격력을 기반으로 스킬 데미지를 계산합니다.
        const skillDamage = amplifiedAttack * damageMultiplier;

        // ✨ --- [핵심 수정] 데미지 계산 공식 변경 --- ✨
        // 기존: let initialDamage = Math.max(1, skillDamage - finalDefense);
        // 변경: 방어력이 100일 때 데미지가 50% 감소하는 공식
        const damageReduction = 100 / (100 + finalDefense);
        let initialDamage = skillDamage * damageReduction;
        // ✨ --- 수정 완료 --- ✨

        // --- 센티넬 패시브 데미지 감소 로직 추가 ---
        const sentryDutyEffects = (statusEffectManager.activeEffects.get(attacker.uniqueId) || [])
            .filter(e => e.id === 'sentryDutyDebuff' && e.attackerId === defender.uniqueId);

        if (sentryDutyEffects.length > 0) {
            const sentryEffect = sentryDutyEffects[0];
            const modifier = Array.isArray(sentryEffect.modifiers)
                ? sentryEffect.modifiers.find(m => m.stat === 'damageToSentinel')
                : sentryEffect.modifiers;

            if (modifier && modifier.value && sentryEffect.stack) {
                const reduction = modifier.value * sentryEffect.stack;
                initialDamage *= (1 + reduction); // value가 음수이므로 덧셈
                debugLogEngine.log(
                    'CombatCalculationEngine',
                    `[전방 주시] 효과로 ${(defender.instanceName || defender.name)}에게 가하는 피해 ${(reduction * 100).toFixed(0)}% 감소`
                );
            }
        }
        // --- 로직 추가 끝 ---

        // --- ✨ 전투 판정 로직 수정 ---
        let hitType = null;
        let combatMultiplier = 1.0;

        // ✨ [수정] 방어자의 확정 효과 스택을 확인합니다.
        let defenderEffect = null;
        if (stackManager.hasStack(defender.uniqueId, FIXED_DAMAGE_TYPES.BLOCK)) {
            defenderEffect = FIXED_DAMAGE_TYPES.BLOCK;
        } else if (stackManager.hasStack(defender.uniqueId, FIXED_DAMAGE_TYPES.MITIGATION)) {
            defenderEffect = FIXED_DAMAGE_TYPES.MITIGATION;
        }

        // 1. 확정 데미지 판정을 먼저 확인합니다.
        const fixedResult = fixedDamageManager.calculateFixedDamage(finalSkill.fixedDamage, defenderEffect);

        if (fixedResult) {
            // 확정 판정이 있는 경우 해당 결과를 사용
            hitType = fixedResult.hitType;
            combatMultiplier = fixedResult.multiplier;

            // ✨ 방어자가 확정 효과를 사용했다면 스택을 소모합니다.
            if (defenderEffect) {
                stackManager.consumeStack(defender.uniqueId, defenderEffect);
            }
        } else {
            // 확정 판정이 없으면 기존 등급 시스템으로 계산
            const attackType = this.getAttackTypeFromSkill(finalSkill);
            if (attackType) {
                const resultTier = gradeManager.calculateCombatGrade(attacker, defender, attackType);

                const roll = Math.random();
                // 4. 공격자의 치명타 확률 버프를 가져와 기본 확률에 더합니다.
                const critChanceBuff = statusEffectManager.getModifierValue(attacker, 'criticalChance');

                switch (resultTier) {
                    case 2: {
                        const chance = 0.05 + ((attacker.finalStats.criticalChance || 0) / 100) + critChanceBuff;
                        if (roll < chance) {
                            hitType = '치명타';
                            combatMultiplier = 2.0;
                        }
                        break;
                    }
                    case 1: {
                        const chance = 0.05 + ((attacker.finalStats.weaknessChance || 0) / 100);
                        if (roll < chance) {
                            hitType = '약점';
                            combatMultiplier = 1.5;
                        }
                        break;
                    }
                    case -1: {
                        const chance = 0.05 + ((defender.finalStats.mitigationChance || 0) / 100);
                        if (roll < chance) {
                            hitType = '완화';
                            combatMultiplier = 0.75;
                        }
                        break;
                    }
                    case -2: {
                        const chance = 0.05 + ((defender.finalStats.blockChance || 0) / 100);
                        if (roll < chance) {
                            hitType = '막기';
                            combatMultiplier = 0.5;
                        }
                        break;
                    }
                }
            }
        }
        // --- ✨ 전투 판정 로직 종료 ---

        const damageAfterGrade = initialDamage * combatMultiplier;

        // ✨ 방어자의 받는 데미지 증가/감소 효과 적용
        let damageReductionPercent = statusEffectManager.getModifierValue(defender, 'damageReduction');
        const damageIncreasePercent = statusEffectManager.getModifierValue(defender, 'damageIncrease');

        // ✨ 아이언 윌 패시브 효과 계산
        const ironWillReduction = this.calculateIronWillReduction(defender);

        // 모든 데미지 감소/증가 효과를 합산
        const finalDamageMultiplier = 1 - damageReductionPercent - ironWillReduction + damageIncreasePercent;

        // --- ▼ [2. '약점 포착' 패시브 로직 추가] ▼ ---
        let damageAfterPassives = damageAfterGrade * finalDamageMultiplier;
        if (attacker.classPassive?.id === 'weaknessDetection' && (defender.currentHp / defender.finalStats.hp) <= 0.4) {
            damageAfterPassives *= 1.25; // 최종 데미지 25% 증가
            debugLogEngine.log(this.name, `[약점 포착] 패시브 발동! 대상의 체력이 낮아 최종 피해량이 25% 증가합니다.`);
        }
        const damageBeforeCombo = damageAfterPassives;
        // --- ▲ [2. '약점 포착' 패시브 로직 추가] ▲ ---
        const finalDamage = damageBeforeCombo * comboMultiplier;

        // 콤보 배율 적용 과정을 디버그 로그로 남깁니다.
        debugComboManager.logComboDamage(comboCount, comboMultiplier, damageBeforeCombo, finalDamage);

        if (damageReductionPercent > 0 || damageIncreasePercent > 0 || ironWillReduction > 0) {
            const effects = (statusEffectManager.activeEffects.get(defender.uniqueId) || [])
                .filter(e => {
                    if (!e.modifiers) return false;
                    if (Array.isArray(e.modifiers)) {
                        return e.modifiers.some(m => m.stat === 'damageReduction' || m.stat === 'damageIncrease');
                    }
                    return e.modifiers.stat === 'damageReduction' || e.modifiers.stat === 'damageIncrease';
                });
            debugStatusEffectManager.logDamageModification(defender, initialDamage, finalDamage, effects);
        }

        // ✨ 전투 결과를 AI 기억과 열망에 저장
        if (hitType && attacker.team !== defender.team) {
            const attackType = this.getAttackTypeFromSkill(finalSkill);
            if (attackType) {
                aiMemoryEngine.updateMemory(attacker.uniqueId, defender.uniqueId, attackType, hitType);
            }

            // ✨ 열망 시스템 연동
            switch (hitType) {
                case '치명타':
                case '약점':
                    aspirationEngine.addAspiration(attacker.uniqueId, 15, hitType);
                    aspirationEngine.addAspiration(defender.uniqueId, -10, `${hitType} 피격`);
                    break;
                case '완화':
                case '막기':
                    aspirationEngine.addAspiration(attacker.uniqueId, -10, hitType);
                    aspirationEngine.addAspiration(defender.uniqueId, 15, hitType);
                    break;
            }
        }

        debugCombatLogManager.logAttackCalculation(
            { ...attacker, finalStats: attackerStats },
            { ...defender, finalStats: defenderStats },
            skillDamage,
            finalDamage,
            finalDefense
        );
        // --- \u25BC [핵심 추가] 피격 사실을 방어자에게 기록 \u25BC ---
        defender.wasAttackedBy = attacker.uniqueId;
        
        // ✨ --- [핵심 버그 수정] 'attackerEffects' 변수 중복 선언 수정 --- ✨
        // 1. 변수를 let으로 한번만 선언합니다.
        let attackerEffects = statusEffectManager.activeEffects.get(attacker.uniqueId) || [];

        // 2. 나노봇 로직에서는 선언 없이 값을 사용합니다.
        const nanobotBuff = attackerEffects.find(e => e.id === 'nanobotBuff');
        if (nanobotBuff && skill.type === 'ACTIVE' && finalDamage > 0) {
            const baseAttack = Math.max(attacker.finalStats.physicalAttack || 0, attacker.finalStats.magicAttack || 0);
            const nanobotDamage = Math.round(baseAttack * 0.3);
            if (nanobotDamage > 0) {
                defender.currentHp -= nanobotDamage;
                if (this.battleSimulator && this.battleSimulator.vfxManager) {
                    this.battleSimulator.vfxManager.createDamageNumber(defender.sprite.x + 10, defender.sprite.y - 10, nanobotDamage, '#0ea5e9', '나노봇');
                }
                debugLogEngine.log(this.name, `[나노봇] 효과 발동! ${defender.instanceName}에게 추가 피해 ${nanobotDamage} 적용.`);
                if (defender.currentHp <= 0) {
                    this.battleSimulator.terminationManager.handleUnitDeath(defender, attacker);
                }
            }
        }

        // 3. 맹독 부여 로직에서도 선언 없이 값을 사용합니다. (이 부분은 이미 attackerEffects를 참조하고 있었으므로 수정 불필요)
        const poisonWeaponBuff = attackerEffects.find(e => e.id === 'poisonWeapon');
        if (poisonWeaponBuff && Math.random() < (poisonWeaponBuff.poisonChance || 0.5)) {
            const poisonSkill = { name: '맹독 부여', effect: statusEffects.poison };
            statusEffectManager.addEffect(defender, poisonSkill, attacker);
        }
        // ✨ --- 수정 완료 --- ✨

        return { damage: Math.round(finalDamage), hitType: hitType, comboCount };
    }

    // ✨ --- [신규] 나노레일건 전용 데미지 계산 메서드 --- ✨
    _calculateNanoRailgunDamage(attacker, defender, skill, instanceId, grade) {
        // 1. 물리 데미지 계산
        const physicalPart = { ...skill, damageMultiplier: skill.damageMultiplier.physical, tags: [SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL] };
        const { damage: physicalDamage, comboCount } = this.calculateDamage(attacker, defender, physicalPart, instanceId, grade);

        // 2. 마법 데미지 계산
        let magicMultiplier = skill.damageMultiplier.magic;
        if (['nanomancer', 'esper'].includes(attacker.id)) {
            magicMultiplier += 0.20; // 클래스 보너스
        }
        const magicPart = { ...skill, damageMultiplier: magicMultiplier, tags: [SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC] };
        const { damage: magicDamage } = this.calculateDamage(attacker, defender, magicPart, instanceId, grade);

        const totalDamage = physicalDamage + magicDamage;

        debugLogEngine.log('CombatCalculationEngine', `[나노레일건] 최종 피해량: 물리(${physicalDamage}) + 마법(${magicDamage}) = ${totalDamage}`);

        // hitType은 물리/마법 중 더 높게 나온 쪽을 따르거나, 별도 규칙을 정할 수 있습니다. 여기서는 고정 문자열을 사용합니다.
        return { damage: Math.round(totalDamage), hitType: 'Railgun', comboCount };
    }

    /**
     * 스킬 데이터의 태그를 분석하여 공격 타입을 반환합니다.
     * @param {object} skill - 스킬 데이터
     * @returns {string|null} - 'melee', 'ranged', 'magic' 또는 null
     */
    getAttackTypeFromSkill(skill) {
        if (!skill.tags) return null;
        if (skill.tags.includes(SKILL_TAGS.MELEE)) return ATTACK_TYPE.MELEE;
        if (skill.tags.includes(SKILL_TAGS.RANGED)) return ATTACK_TYPE.RANGED;
        if (skill.tags.includes(SKILL_TAGS.MAGIC)) return ATTACK_TYPE.MAGIC;
        return null;
    }

    /**
     * ✨ '아이언 윌' 패시브로 인한 데미지 감소율을 계산하는 새로운 메소드
     * @param {object} unit - 방어자 유닛
     * @returns {number} - 데미지 감소율 (예: 0.15는 15% 감소)
     */
    calculateIronWillReduction(unit) {
        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        let reduction = 0;

        equipped.forEach((instId) => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            if (inst && inst.skillId === 'ironWill') {
                const gradeData = passiveSkills.ironWill[inst.grade] || passiveSkills.ironWill.NORMAL;
                const maxReduction = gradeData.maxReduction;

                // 잃은 체력 비율 계산 (0 ~ 1)
                const lostHpRatio = 1 - (unit.currentHp / unit.finalStats.hp);

                // 잃은 체력에 비례하여 데미지 감소율 적용
                reduction = maxReduction * lostHpRatio;

                // 디버그 로그 추가
                debugStatusEffectManager.logDamageModification(
                    unit,
                    100,
                    100 * (1 - reduction),
                    [{ sourceSkillName: `아이언 윌 (체력 ${((unit.currentHp / unit.finalStats.hp) * 100).toFixed(0)}%)` }]
                );
            }
        });

        return reduction;
    }
}

export const combatCalculationEngine = new CombatCalculationEngine();
