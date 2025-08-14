import { itemEngine } from './ItemEngine.js';
// ✨ classProficiencies를 import하여 숙련도 정보를 조회할 수 있도록 합니다.
import { classProficiencies } from '../data/classProficiencies.js';
import { SKILL_TAGS } from './SkillTagManager.js';
// ✨ statusEffectManager와 EFFECT_TYPES를 import 합니다.
import { statusEffectManager } from './StatusEffectManager.js';
import { EFFECT_TYPES } from './EffectTypes.js';

/**
 * 용맹(Valor) 시스템의 계산을 전담하는 엔진입니다.
 * 방어막 생성, 피해 증폭 등 '용맹' 스탯과 관련된 모든 로직을 담당합니다.
 */
class ValorEngine {
    constructor() {
        // 나중에 용맹 관련 설정값들을 여기에 추가할 수 있습니다. (예: this.barrierMultiplier = 10;)
    }

    /**
     * 용맹 스탯을 기반으로 전투 시작 시의 초기 방어막(Barrier) 양을 계산합니다.
     * @param {number} valor - 유닛의 순수 용맹 스탯
     * @returns {number} - 계산된 초기 방어막 수치
     */
    calculateInitialBarrier(valor = 0) {
        // 개념: 용맹 1포인트당 방어막 10을 부여합니다.
        return valor * 10;
    }

    /**
     * 현재 방어막 상태에 따라 피해 증폭률을 계산합니다.
     * @param {number} currentBarrier - 현재 남은 방어막 수치
     * @param {number} maxBarrier - 최대 방어막 수치
     * @returns {number} - 피해량에 곱해질 증폭률 (예: 1.0은 100%, 1.3은 130%)
     */
    calculateDamageAmplification(currentBarrier = 0, maxBarrier = 1) {
        if (maxBarrier <= 0) return 1.0;
        // 개념: 방어막이 가득 찰수록(1에 가까이) 추가 피해를 주고,
        // 방어막이 없을수록(0에 가까이) 추가 피해가 없습니다.
        // 현재는 최대 30%의 추가 피해를 주는 것으로 설정합니다.
        const amplification = (currentBarrier / maxBarrier) * 0.3;
        return 1.0 + amplification;
    }
}

/**
 * 무게(Weight) 시스템의 계산을 전담하는 엔진입니다.
 * 장비 무게 합산, 턴 순서 결정 등 '무게'와 관련된 모든 로직을 담당합니다.
 */
class WeightEngine {
    constructor() {
        // 나중에 무게 관련 설정값들을 여기에 추가할 수 있습니다.
    }

    /**
     * 유닛과 장착한 아이템들의 총 무게를 계산합니다.
     * @param {object} unitData - 유닛의 기본 정보 (기본 무게 등)
     * @param {Array<object>} equippedItems - 장착한 모든 아이템 목록
     * @returns {number} - 합산된 총 무게
     */
    calculateTotalWeight(unitData = {}, equippedItems = []) {
        let totalWeight = unitData.weight || 0;
        // itemEngine을 통해 장비의 무게를 합산하도록 수정 (향후 확장성 고려)
        const equipmentBonusStats = itemEngine.getBonusStatsFromEquipment(unitData);
        totalWeight += equipmentBonusStats.weight || 0;
        return totalWeight;
    }

    /**
     * 총 무게를 기반으로 행동 순서를 결정하는 데 사용될 최종 수치를 계산합니다.
     * @param {number} totalWeight - 유닛의 총 무게
     * @returns {number} - 턴 계산에 사용될 최종 무게 값 (수치가 낮을수록 선턴)
     */
    getTurnValue(totalWeight = 0, agility = 0) {
        // ✨ 민첩 스탯이 무게를 감소시켜 턴 순서에 영향을 주도록 수정
        return Math.max(1, totalWeight - (agility * 0.5));
    }
}

/**
 * 게임 내 모든 유닛의 스탯을 계산하고 관리하는 핵심 엔진.
 * 각 전문 엔진(ValorEngine, WeightEngine)을 통합하여 최종 스탯을 산출합니다.
 */
class StatEngine {
    constructor() {
        this.valorEngine = new ValorEngine();
        this.weightEngine = new WeightEngine();
    }

    /**
     * ✨ [신규] 턴 시작 시 발동하는 동적 패시브를 처리합니다.
     * @param {object} unit - 현재 턴인 유닛
     * @param {Array<object>} allUnits - 전장의 모든 유닛
     */
    handleTurnStartPassives(unit, allUnits) {
        if (!unit.classPassive) return;

        switch (unit.classPassive.id) {
            case 'clownsJoke': {
                let debuffedCount = 0;
                const radius = 3;

                allUnits.forEach(target => {
                    if (target.currentHp <= 0) return;
                    const distance = Math.abs(unit.gridX - target.gridX) + Math.abs(unit.gridY - target.gridY);
                    if (distance <= radius) {
                        const effects = statusEffectManager.activeEffects.get(target.uniqueId) || [];
                        if (effects.some(e => e.type === EFFECT_TYPES.DEBUFF)) {
                            debuffedCount++;
                        }
                    }
                });

                if (debuffedCount > 0) {
                    const critBonus = 0.05 * debuffedCount;
                    const weaknessBonus = 0.05 * debuffedCount;
                    const attackBonus = 0.05 * debuffedCount;

                    const buffEffect = {
                        id: 'clownsJokeBuff',
                        type: EFFECT_TYPES.BUFF,
                        duration: 1,
                        modifiers: [
                            { stat: 'criticalChance', type: 'percentage', value: critBonus },
                            { stat: 'weaknessChance', type: 'percentage', value: weaknessBonus },
                            { stat: 'physicalAttackPercentage', type: 'percentage', value: attackBonus },
                            { stat: 'magicAttackPercentage', type: 'percentage', value: attackBonus }
                        ]
                    };

                    statusEffectManager.addEffect(unit, { name: '광대의 농담', effect: buffEffect }, unit);
                }
                break;
            }
            // ... 다른 턴 시작 패시브 case 추가 ...
        }
    }

    /**
     * 전투 시작 후 위치가 확정된 유닛들에게 동적인 패시브 효과를 적용합니다.
     * @param {object} unit - 효과를 적용받을 유닛
     * @param {Array<object>} allAllies - 모든 아군 유닛 목록
     */
    applyDynamicPassives(unit, allAllies) {
        if (!unit.classPassive) return;

        // 패시브로 인해 증가한 스탯을 임시 저장합니다.
        const passiveBonus = {};

        switch (unit.classPassive.id) {
            case 'mindExplosion': {
                let nearbyMagicUsers = 0;
                allAllies.forEach(ally => {
                    if (ally.uniqueId === unit.uniqueId) return;

                    const distance = Math.abs(unit.gridX - ally.gridX) + Math.abs(unit.gridY - ally.gridY);
                    if (distance <= 3) {
                        const allyProficiencies = classProficiencies[ally.id] || [];
                        if (allyProficiencies.includes(SKILL_TAGS.MAGIC)) {
                            nearbyMagicUsers++;
                        }
                    }
                });

                if (nearbyMagicUsers > 0) {
                    const intelligenceBonus = unit.baseStats.intelligence * (0.03 * nearbyMagicUsers);
                    passiveBonus.intelligence = (passiveBonus.intelligence || 0) + intelligenceBonus;
                }
                break;
            }
            // ... 다른 동적 패시브 case 추가 ...
        }

        // 계산된 모든 패시브 보너스를 한 번에 적용합니다.
        for (const [stat, value] of Object.entries(passiveBonus)) {
            unit.finalStats[stat] = (unit.finalStats[stat] || 0) + value;
        }

        // 지능 보너스가 있다면 파생 스탯을 다시 계산합니다.
        if (passiveBonus.intelligence) {
            const multiplier = 1 + (unit.finalStats.magicAttackPercentage || 0) / 100;
            const baseMagicAttack = (unit.finalStats.magicAttack || 0) / multiplier;
            const newBase = baseMagicAttack + passiveBonus.intelligence * 1.5;
            unit.finalStats.magicAttack = newBase * multiplier;
        }
    }

    /**
     * 기본 스탯, 장비 정보 등을 바탕으로 최종 적용될 스탯 객체를 생성합니다.
     * @param {object} unitData - 유닛의 기본 정보 (예: { name: '전사', baseWeight: 10 })
     * @param {object} baseStats - 순수 스탯 포인트 (예: { hp: 100, strength: 10, valor: 5 })
     * @param {Array<object>} equippedItems - 장착한 아이템 목록 (현재는 ItemEngine을 통해 자동으로 처리됨)
     * @returns {object} - 모든 계산이 완료된 최종 스탯 객체
     */
    calculateStats(unitData = {}, baseStats = {}) {
        const finalStats = { ...baseStats };

        // 모든 스탯 키 목록: 이 목록에 있는 스탯은 항상 0으로 초기화되어 'undefined' 오류를 방지합니다.
        const allStatKeys = [
            'hp', 'valor', 'strength', 'endurance', 'agility', 'intelligence', 'wisdom', 'luck',
            'movement', 'attackRange', 'weight', 'physicalAttack', 'magicAttack', 'rangedAttack',
            'physicalDefense', 'magicDefense', 'rangedDefense', 'criticalChance', 'criticalDamageMultiplier',
            'physicalEvadeChance', 'magicEvadeChance', 'statusEffectResistance', 'statusEffectApplication',
            'maxBarrier', 'currentBarrier', 'totalWeight', 'turnValue', 'physicalAttackPercentage', 'magicAttackPercentage'
        ];

        allStatKeys.forEach(key => {
            finalStats[key] = finalStats[key] || 0;
        });

        const equipmentBonusStats = itemEngine.getBonusStatsFromEquipment(unitData);
        for (const [stat, value] of Object.entries(equipmentBonusStats)) {
            finalStats[stat] = (finalStats[stat] || 0) + value;
        }

        // 파생 스탯 계산
        finalStats.physicalAttack = (finalStats.strength * 1.5) + (finalStats.physicalAttack || 0);
        finalStats.physicalAttack *= (1 + (finalStats.physicalAttackPercentage || 0) / 100);

        finalStats.magicAttack = (finalStats.intelligence * 1.5) + (finalStats.magicAttack || 0);
        finalStats.magicAttack *= (1 + (finalStats.magicAttackPercentage || 0) / 100);

        finalStats.rangedAttack = (finalStats.agility * 1.5) + (finalStats.rangedAttack || 0);
        
        finalStats.physicalDefense = (finalStats.endurance * 1.2) + (finalStats.physicalDefense || 0);
        finalStats.magicDefense = (finalStats.wisdom * 1.2) + (finalStats.magicDefense || 0);

        finalStats.maxBarrier = this.valorEngine.calculateInitialBarrier(finalStats.valor);
        finalStats.currentBarrier = finalStats.maxBarrier;
        finalStats.totalWeight = this.weightEngine.calculateTotalWeight(unitData);
        finalStats.weight = finalStats.totalWeight;
        finalStats.turnValue = this.weightEngine.getTurnValue(finalStats.totalWeight, finalStats.agility);

        return finalStats;
    }
}

export const statEngine = new StatEngine();

