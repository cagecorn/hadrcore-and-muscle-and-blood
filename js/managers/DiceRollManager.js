// js/managers/DiceRollManager.js

export class DiceRollManager {
    /**
     * @param {DiceEngine} diceEngine
     * @param {ValorEngine} valorEngine
     * @param {StatusEffectManager} statusEffectManager - \u2728 상태 효과 확인을 위해 추가
     */
    constructor(diceEngine, valorEngine, statusEffectManager, modifierEngine, modifierLogManager) {
        console.log("\u2694\uFE0F DiceRollManager initialized. Ready for D&D-based rolls. \u2694\uFE0F");
        this.diceEngine = diceEngine;
        this.valorEngine = valorEngine;
        this.statusEffectManager = statusEffectManager; // \u2728 인스턴스 저장
        this.modifierEngine = modifierEngine;
        this.modifierLogManager = modifierLogManager; // <-- 로거 저장
    }

    /**
     * 지정된 개수의 주사위를 굴립니다. (예: 2d6)
     * @param {number} numDice - 굴릴 주사위의 개수
     * @param {number} sides - 주사위의 면 수
     * @returns {number} 모든 주사위 굴림의 합계
     */
    rollDice(numDice, sides) {
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            total += this.diceEngine.rollD(sides);
        }
        console.log(`[DiceRollManager] Rolled ${numDice}d${sides}: total ${total}`);
        return total;
    }

    /**
     * 어드밴티지(advantage)로 주사위를 굴립니다 (두 번 굴려 더 높은 값 사용).
     * @param {number} sides - 주사위의 면 수
     * @returns {number} 더 높은 주사위 굴림 결과
     */
    rollWithAdvantage(sides) {
        const roll1 = this.diceEngine.rollD(sides);
        const roll2 = this.diceEngine.rollD(sides);
        const result = Math.max(roll1, roll2);
        console.log(`[DiceRollManager] Rolled d${sides} with advantage (${roll1}, ${roll2}): ${result}`);
        return result;
    }

    /**
     * 디스어드밴티지(disadvantage)로 주사위를 굴립니다 (두 번 굴려 더 낮은 값 사용).
     * @param {number} sides - 주사위의 면 수
     * @returns {number} 더 낮은 주사위 굴림 결과
     */
    rollWithDisadvantage(sides) {
        const roll1 = this.diceEngine.rollD(sides);
        const roll2 = this.diceEngine.rollD(sides);
        const result = Math.min(roll1, roll2);
        console.log(`[DiceRollManager] Rolled d${sides} with disadvantage (${roll1}, ${roll2}): ${result}`);
        return result;
    }

    /**
     * D&D 스타일의 공격 대미지 굴림을 수행합니다.
     * (예시: 공격 굴림 + 스킬 효과 + 기타 보너스)
     * 공격자의 용맹(배리어)에 따른 데미지 증폭을 적용합니다.
     * @param {object} attackerUnit - 공격하는 유닛 객체 (fullUnitData, currentBarrier, maxBarrier 필요)
     * @param {object} skillData - 사용된 스킬 데이터 (데미지 주사위, 타입 등)
     * @returns {number} 계산된 순수 데미지 굴림 결과
     */
    performDamageRoll(attackerUnit, skillData = { type: 'physical', dice: { num: 1, sides: 6 } }) {
        const attackerStats = attackerUnit.baseStats;
        const modifiers = [];
        let formula = "";

        let damageRoll = 0;
        if (skillData.dice) {
            damageRoll = this.rollDice(skillData.dice.num, skillData.dice.sides);
            formula += `Dice[${damageRoll}]`;
        }

        let attackBonus = 0;
        if (skillData.type === 'physical') {
            attackBonus = attackerStats.attack;
        } else if (skillData.type === 'magic') {
            attackBonus = attackerStats.magic;
        }
        if (attackBonus > 0) {
            formula += ` + Stat[${attackBonus}]`;
        }

        let preMultipliedDamage = damageRoll + attackBonus;
        let finalMultiplier = 1.0;

        const valorAmplification = this.valorEngine.calculateDamageAmplification(
            attackerUnit.currentBarrier || 0,
            attackerUnit.maxBarrier || 0
        );
        if (valorAmplification !== 1.0) {
            finalMultiplier *= valorAmplification;
            modifiers.push({ source: 'Valor', value: valorAmplification, operation: '×' });
        }

        const statusEffectMultiplier = this.modifierEngine.getAttackMultiplier(attackerUnit.id);
        if (statusEffectMultiplier !== 1.0) {
            finalMultiplier *= statusEffectMultiplier;
        }

        if (skillData.damageModifier) {
            finalMultiplier *= skillData.damageModifier;
            modifiers.push({ source: 'Skill Modifier', value: skillData.damageModifier, operation: '×' });
        }

        let finalDamage = preMultipliedDamage * finalMultiplier;

        let formulaString = `(${formula}) * ${finalMultiplier.toFixed(2)}`;

        this.modifierLogManager.log(`'${attackerUnit.id}' Pre-Mitigation Damage`, {
            baseValue: 0,
            modifiers: [
                { source: 'Dice Roll', value: damageRoll, operation: '+' },
                { source: 'Stat Bonus', value: attackBonus, operation: '+' },
                ...modifiers
            ],
            formula: formulaString,
            finalValue: Math.floor(finalDamage)
        });

        return Math.max(0, Math.floor(finalDamage));
    }

    /**
     * D&D 스타일의 내성 굴림을 수행합니다.
     * @param {object} unitStats - 내성 굴림을 하는 유닛의 스탯
     * @param {number} difficultyClass - 내성 굴림의 난이도 (DC)
     * @param {string} saveType - 내성 굴림의 종류 (예: 'strength', 'dexterity', 'wisdom', 'fortitude', 'reflex', 'will')
     * @returns {boolean} 내성 굴림 성공 여부
     */
    performSavingThrow(unitStats, difficultyClass, saveType) {
        const roll = this.diceEngine.rollD(20); // D20 굴림
        let statBonus = 0;

        switch (saveType) {
            case 'strength':
                statBonus = unitStats.strength;
                break;
            case 'dexterity':
                statBonus = unitStats.agility; // 민첩 스탯으로 매핑
                break;
            case 'constitution':
            case 'fortitude':
                statBonus = unitStats.endurance; // 인내 스탯으로 매핑
                break;
            case 'intelligence':
                statBonus = unitStats.intelligence;
                break;
            case 'wisdom':
            case 'will':
                statBonus = unitStats.wisdom; // 지혜 스탯으로 매핑
                break;
            case 'charisma':
                statBonus = 0; // 현재 Charisma 스탯이 없으므로 0으로 가정
                break;
            default:
                console.warn(`[DiceRollManager] Unknown saving throw type: ${saveType}. No stat bonus applied.`);
                break;
        }

        const totalRoll = roll + statBonus;
        const success = totalRoll >= difficultyClass;
        console.log(`[DiceRollManager] Saving throw (${saveType}) against DC ${difficultyClass}: Rolled ${roll} + ${statBonus} = ${totalRoll}. Success: ${success}`);
        return success;
    }
}
