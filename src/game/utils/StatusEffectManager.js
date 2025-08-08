import { debugLogEngine } from './DebugLogEngine.js';
import { debugStatusEffectManager } from '../debug/DebugStatusEffectManager.js';
import { statusEffects } from '../data/status-effects.js';
// ✨ 아이언 윌 로직에 필요한 모듈 추가
import { ownedSkillsManager } from './OwnedSkillsManager.js';
import { skillInventoryManager } from './SkillInventoryManager.js';
import { passiveSkills } from '../data/skills/passive.js';
// 상태이상 시 스프라이트 교체에 사용
import { spriteEngine } from './SpriteEngine.js';
// 효과 타입 상수 분리
import { EFFECT_TYPES } from './EffectTypes.js';
// ✨ [버그 수정] tokenEngine import 추가
import { tokenEngine } from './TokenEngine.js';

/**
 * 게임 내 모든 상태 효과(버프, 디버프, 상태이상)를 관리하는 중앙 엔진
 */
class StatusEffectManager {
    constructor() {
        // key: unitId, value: Array of active effects
        this.activeEffects = new Map();
        this.nextEffectInstanceId = 1;
        this.battleSimulator = null;
        debugLogEngine.log('StatusEffectManager', '상태 효과 매니저가 초기화되었습니다.');
    }

    /** BattleSimulatorEngine과 연동하여 유닛 검색에 사용할 참조를 설정합니다. */
    setBattleSimulator(simulator) {
        this.battleSimulator = simulator;
    }

    /**
     * 턴 종료 시 모든 활성 효과의 지속시간을 감소시키고 만료된 효과를 제거합니다.
     */
    onTurnEnd(turnQueue) {
        // 먼저 모든 효과의 지속시간을 감소시킵니다.
        for (const [unitId, effects] of this.activeEffects.entries()) {
            const remainingEffects = [];
            const expiredEffects = [];

            for (const effect of effects) {
                // duration이 숫자인 경우에만 감소시킵니다.
                if (typeof effect.duration === 'number') {
                    effect.duration--;
                    if (effect.duration > 0) {
                        remainingEffects.push(effect);
                    } else {
                        expiredEffects.push(effect);
                    }
                } else {
                    // duration이 없으면(스택 기반 효과 등) 그대로 유지합니다.
                    remainingEffects.push(effect);
                }
            }

            // 먼저 남은 효과로 상태를 업데이트합니다.
            this.activeEffects.set(unitId, remainingEffects);

            // 이후 만료된 효과들의 onRemove를 호출합니다.
            for (const effect of expiredEffects) {
                const effectDefinition = statusEffects[effect.id];
                if (effectDefinition && effectDefinition.onRemove) {
                    const unit = this.findUnitById(unitId);
                    if (unit) effectDefinition.onRemove(unit);
                }
                debugStatusEffectManager.logEffectExpired(unitId, effect);
            }
        }

        // ✨ 지속 피해 및 기타 턴 종료 효과를 처리합니다.
        turnQueue.forEach(unit => {
            if (unit.currentHp > 0) {
                const effects = this.activeEffects.get(unit.uniqueId) || [];
                effects.forEach(effect => {
                    let damage = 0;
                    let damageType = '';

                    if (effect.id === 'burn') {
                        damage = Math.round(unit.finalStats.hp * 0.05);
                        damageType = '화상';
                    } else if (effect.id === 'poison') {
                        damage = Math.round(unit.finalStats.hp * 0.08);
                        damageType = '중독';
                    }

                    // ✨ --- [핵심 추가] 용맹의 증거 오라 효과 처리 --- ✨
                    if (effect.id === 'proofOfValorAura' && effect.isAura) {
                        const caster = this.findUnitById(effect.attackerId);
                        if (caster && caster.currentHp > 0) {
                            const distance = Math.abs(unit.gridX - caster.gridX) + Math.abs(unit.gridY - caster.gridY);
                            if (distance <= effect.radius) {
                                const barrierHeal = Math.round(unit.maxBarrier * 0.05);
                                if (barrierHeal > 0) {
                                    unit.currentBarrier = Math.min(unit.maxBarrier, unit.currentBarrier + barrierHeal);
                                    if (this.battleSimulator.vfxManager) {
                                        this.battleSimulator.vfxManager.createDamageNumber(unit.sprite.x, unit.sprite.y - 10, `+${barrierHeal}`, '#ffd700', '배리어');
                                    }
                                }
                            }
                        }
                    }
                    // ✨ --- 추가 완료 --- ✨

                    if (damage > 0) {
                        unit.currentHp -= damage;
                        if (this.battleSimulator.vfxManager) {
                            this.battleSimulator.vfxManager.createDamageNumber(unit.sprite.x, unit.sprite.y, damage, '#9333ea', damageType);
                        }
                        if (unit.currentHp <= 0) {
                            this.battleSimulator.terminationManager.handleUnitDeath(unit);
                        }
                    }
                });

                // 아이언 윌 체력 회복 로직은 여기에 그대로 둡니다.
                this.applyIronWillRegen(unit);
            }
        });
    }

    /**
     * ✨ '아이언 윌'의 등급별 체력 회복 효과를 적용하는 새로운 메소드
     * @param {object} unit - 대상 유닛
     */
    applyIronWillRegen(unit) {
        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        equipped.forEach(instId => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            if (inst && inst.skillId === 'ironWill') {
                const skillData = passiveSkills.ironWill;
                const gradeData = skillData[inst.grade];

                if (gradeData && gradeData.hpRegen > 0) {
                    const healAmount = Math.round(unit.finalStats.hp * gradeData.hpRegen);
                    unit.currentHp = Math.min(unit.finalStats.hp, unit.currentHp + healAmount);

                    // VFX 매니저가 있다면 체력바 업데이트 및 회복량 표시
                    if (this.battleSimulator && this.battleSimulator.vfxManager) {
                        this.battleSimulator.vfxManager.updateHealthBar(unit.healthBar, unit.currentHp, unit.finalStats.hp);
                        this.battleSimulator.vfxManager.createDamageNumber(unit.sprite.x, unit.sprite.y - 20, `+${healAmount}`, '#22c55e');
                    }
                    debugLogEngine.log('StatusEffectManager', `${unit.instanceName}이(가) '아이언 윌' 효과로 HP ${healAmount} 회복.`);
                }
            }
        });
    }

    /**
     * 대상 유닛의 토큰을 즉시 감소시키는 효과를 적용합니다.
     * @param {object} targetUnit
     * @param {object} effectData
     */
    applyTokenLoss(targetUnit, effectData) {
        if (effectData.tokenLoss > 0) {
            tokenEngine.spendTokens(targetUnit.uniqueId, effectData.tokenLoss, '제압 사격 효과');
            if (this.battleSimulator && this.battleSimulator.vfxManager) {
                this.battleSimulator.vfxManager.showEffectName(targetUnit.sprite, '토큰 감소!', '#ef4444');
            }
        }
    }

    /**
     * 대상 유닛에게 새로운 상태 효과를 적용합니다.
     * @param {object} targetUnit - 효과를 받을 유닛
     * @param {object} sourceSkill - 효과를 발생시킨 스킬 데이터
     */
    addEffect(targetUnit, sourceSkill, attackerUnit = null) {
        if (!sourceSkill.effect) return;

        // ✨ [신규] isGlobal 효과 처리
        if (sourceSkill.effect.isGlobal) {
            const allies = this.battleSimulator.turnQueue.filter(u => u.team === targetUnit.team && u.currentHp > 0);
            allies.forEach(ally => {
                this.applySingleEffect(ally, sourceSkill, attackerUnit);
            });
        } else {
            this.applySingleEffect(targetUnit, sourceSkill, attackerUnit);
        }
    }

    // ✨ 기존 addEffect 로직을 별도 함수로 분리
    applySingleEffect(targetUnit, sourceSkill, attackerUnit = null) {
        // ✨ [수정] 버프 면역 상태인지 확인하는 로직을 추가합니다.
        if (targetUnit.isBuffImmune && sourceSkill.effect.type === EFFECT_TYPES.BUFF) {
            debugLogEngine.log('StatusEffectManager', `[${targetUnit.instanceName}]은(는) 버프 면역 상태라 [${sourceSkill.name}] 효과를 받지 않습니다.`);
            if (this.battleSimulator && this.battleSimulator.vfxManager) {
                this.battleSimulator.vfxManager.showEffectName(targetUnit.sprite, '면역', '#8b5cf6');
            }
            return; // 버프 효과 적용을 중단합니다.
        }

        const effectId = sourceSkill.effect.id;
        const effectDefinition = statusEffects[effectId];

        // 즉시 발동하는 토큰 감소 효과 처리
        if (sourceSkill.effect.applyOnce && sourceSkill.effect.tokenLoss) {
            this.applyTokenLoss(targetUnit, sourceSkill.effect);
            return;
        }

        if (!effectDefinition) {
            debugLogEngine.warn('StatusEffectManager', `정의되지 않은 효과 ID: ${effectId}`);
            return;
        }

        if (!this.activeEffects.has(targetUnit.uniqueId)) {
            this.activeEffects.set(targetUnit.uniqueId, []);
        }
        const activeEffectsOnTarget = this.activeEffects.get(targetUnit.uniqueId);

        // 기존에 동일한 ID의 효과가 있다면 처리합니다.
        const existingEffectIndex = activeEffectsOnTarget.findIndex(e => e.id === effectId);
        if (existingEffectIndex !== -1) {
            const existingEffect = activeEffectsOnTarget[existingEffectIndex];
            if (effectId === 'sentryDutyDebuff') {
                existingEffect.stack = Math.min((existingEffect.stack || 1) + 1, sourceSkill.effect.maxStacks || 1);
                debugLogEngine.log('StatusEffectManager', `[${targetUnit.instanceName}]의 [${effectDefinition.name}] 스택이 ${existingEffect.stack}이 되었습니다.`);
                return;
            } else {
                const removedEffect = activeEffectsOnTarget.splice(existingEffectIndex, 1)[0];
                debugLogEngine.log('StatusEffectManager', `[${targetUnit.instanceName}]의 기존 [${removedEffect.sourceSkillName}] 효과를 제거하고 새 효과로 갱신합니다.`);
            }
        }

        const newEffect = {
            instanceId: this.nextEffectInstanceId++,
            ...sourceSkill.effect,
            sourceSkillName: sourceSkill.name,
            attackerId: attackerUnit ? attackerUnit.uniqueId : null,
            stack: sourceSkill.effect.maxStacks ? 1 : undefined,
        };

        activeEffectsOnTarget.push(newEffect);

        if (effectDefinition.onApply) {
            // 스택 정보 등 추가 데이터를 전달하기 위해 newEffect 전체를 인자로 넘깁니다.
            effectDefinition.onApply(targetUnit, newEffect);
        }

        // ✨ If stun effect, remember who applied it
        if (newEffect.id === 'stun' && attackerUnit) {
            targetUnit.stunnedBy = attackerUnit;
        }

        // 상태 효과 이름 표시
        if (this.battleSimulator && this.battleSimulator.vfxManager && effectDefinition.name) {
            const color = newEffect.type === EFFECT_TYPES.BUFF ? '#22c55e' : '#ef4444';
            this.battleSimulator.vfxManager.showEffectName(targetUnit.sprite, effectDefinition.name, color);
        }

        // 버프가 아니라면 상태이상 스프라이트를 잠시 적용
        if (newEffect.type !== EFFECT_TYPES.BUFF) {
            spriteEngine.changeSpriteForDuration(targetUnit, 'status-effects', 1000);
        }

        debugStatusEffectManager.logEffectApplied(targetUnit, newEffect);
    }

    findUnitById(unitId) {
        if (!this.battleSimulator) return null;
        return this.battleSimulator.turnQueue.find(u => u.uniqueId === unitId) || null;
    }

    /**
     * 특정 유닛의 특정 보정치 타입 값을 합산합니다.
     * @param {object} unit - 대상 유닛
     * @param {string} modifierType - 계산할 보정치 타입 (예: 'physicalDefense', 'damageReduction')
     * @returns {number} - 해당 타입의 모든 효과 값을 합산한 결과
     */
    getModifierValue(unit, modifierType) {
        const effects = this.activeEffects.get(unit.uniqueId) || [];
        let totalValue = 0;

        const relevantEffects = [];

        for (const effect of effects) {
            const mods = effect.modifiers;
            if (Array.isArray(mods)) {
                for (const m of mods) {
                    if (m.stat === modifierType) {
                        totalValue += m.value;
                        relevantEffects.push(effect);
                    }
                }
            } else if (mods && mods.stat === modifierType) {
                totalValue += mods.value;
                relevantEffects.push(effect);
            }
        }

        // 값의 변화 로그는 CombatCalculationEngine에서 처리합니다.
        return totalValue;
    }

    // ▼▼▼ [신규] 유닛의 모든 버프를 제거하는 메서드 추가 ▼▼▼
    /**
     * 특정 유닛의 모든 이로운 효과(BUFF)를 제거합니다.
     * @param {object} unit - 버프를 제거할 유닛
     * @returns {number} - 제거된 버프의 개수
     */
    removeAllBuffs(unit) {
        const effects = this.activeEffects.get(unit.uniqueId);
        if (!effects || effects.length === 0) return 0;

        let removedCount = 0;
        const remainingEffects = [];

        effects.forEach(effect => {
            if (effect.type === EFFECT_TYPES.BUFF) {
                const def = statusEffects[effect.id];
                if (def && def.onRemove) {
                    def.onRemove(unit);
                }
                debugStatusEffectManager.logEffectExpired(unit.uniqueId, effect);
                removedCount++;
            } else {
                remainingEffects.push(effect);
            }
        });

        this.activeEffects.set(unit.uniqueId, remainingEffects);
        if (removedCount > 0) {
            debugLogEngine.log('StatusEffectManager', `[${unit.instanceName}]의 버프 ${removedCount}개를 제거했습니다.`);
        }
        return removedCount;
    }
    // ▲▲▲ [신규] 추가 완료 ▲▲▲

    // ▼▼▼ [신규] 유닛의 모든 디버프를 제거하는 메서드 추가 ▼▼▼
    /**
     * 특정 유닛의 모든 해로운 효과(DEBUFF, STATUS_EFFECT)를 제거합니다.
     * @param {object} unit - 디버프를 제거할 유닛
     * @returns {number} - 제거된 디버프의 개수
     */
    removeAllDebuffs(unit) {
        const effects = this.activeEffects.get(unit.uniqueId);
        if (!effects || effects.length === 0) return 0;

        let removedCount = 0;
        const remainingEffects = [];

        effects.forEach(effect => {
            // 타입이 BUFF가 아닌 모든 것을 해로운 효과로 간주합니다.
            if (effect.type !== EFFECT_TYPES.BUFF) {
                const def = statusEffects[effect.id];
                if (def && def.onRemove) {
                    def.onRemove(unit);
                }
                debugStatusEffectManager.logEffectExpired(unit.uniqueId, effect);
                removedCount++;
            } else {
                remainingEffects.push(effect);
            }
        });

        this.activeEffects.set(unit.uniqueId, remainingEffects);
        if (removedCount > 0) {
            debugLogEngine.log('StatusEffectManager', `[${unit.instanceName}]의 해로운 효과 ${removedCount}개를 제거했습니다.`);
        }
        return removedCount;
    }
    // ▲▲▲ [신규] 추가 완료 ▲▲▲

    // ✨ [신규] 해로운 효과 1개를 제거합니다.
    removeOneDebuff(unit) {
        const effects = this.activeEffects.get(unit.uniqueId);
        if (!effects || effects.length === 0) return false;
        const index = effects.findIndex(e => e.type !== EFFECT_TYPES.BUFF);
        if (index === -1) return false;

        const [removed] = effects.splice(index, 1);
        const def = statusEffects[removed.id];
        if (def && def.onRemove) {
            def.onRemove(unit);
        }
        debugStatusEffectManager.logEffectExpired(unit.uniqueId, removed);
        return true;
    }
}

export const statusEffectManager = new StatusEffectManager();
