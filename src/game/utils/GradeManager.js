import { debugLogEngine } from './DebugLogEngine.js'
import { classGrades, ATTACK_TYPE, CLASS_GRADE_TYPE } from '../data/classGrades.js'
// 등급 보정치를 얻기 위해 상태 효과 매니저를 가져옵니다.
import { statusEffectManager } from './StatusEffectManager.js'

/**
 * 클래스 간의 등급 상성을 계산하고 전투 결과를 결정하는 매니저
 */
class GradeManager {
    constructor() {
        this.name = 'GradeManager'
        debugLogEngine.register(this)
    }

    /**
     * 공격자와 방어자의 등급을 비교하여 최종 전투 등급 티어를 계산합니다.
     * @param {object} attacker - 공격자 유닛 데이터
     * @param {object} defender - 방어자 유닛 데이터
     * @param {string} attackType - ATTACK_TYPE에 정의된 공격 타입
     * @returns {number} - 최종 등급 티어 (예: 2, 1, 0, -1, -2)
     */
    calculateCombatGrade(attacker, defender, attackType) {
        const attackerClass = attacker.id
        const defenderClass = defender.id

        const attackerGradeData = classGrades[attackerClass]
        const defenderGradeData = classGrades[defenderClass]

        if (!attackerGradeData || !defenderGradeData) {
            debugLogEngine.warn(this.name, `'${attackerClass}' 또는 '${defenderClass}'의 등급 데이터를 찾을 수 없습니다.`)
            return 0
        }

        const attackGradeKey = `${attackType}${CLASS_GRADE_TYPE.ATTACK}`
        const defenseGradeKey = `${attackType}${CLASS_GRADE_TYPE.DEFENSE}`

        const baseAttackerTier = attackerGradeData[attackGradeKey] || 1
        const baseDefenderTier = defenderGradeData[defenseGradeKey] || 1

        // 상태 효과로 인한 등급 보정치를 합산합니다.
        const attackerBonus = statusEffectManager.getModifierValue(attacker, attackGradeKey)
        const defenderBonus = statusEffectManager.getModifierValue(defender, defenseGradeKey)

        const finalAttackerTier = baseAttackerTier + attackerBonus
        const finalDefenderTier = baseDefenderTier + defenderBonus

        const resultTier = finalAttackerTier - finalDefenderTier

        debugLogEngine.log(
            this.name,
            `[${attacker.instanceName}(${baseAttackerTier}+${attackerBonus})] vs [${defender.instanceName}(${baseDefenderTier}+${defenderBonus})] = 최종 ${resultTier}티어`
        )

        return resultTier
    }
}

export const gradeManager = new GradeManager()
