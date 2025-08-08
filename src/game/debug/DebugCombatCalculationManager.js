import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * 전투 데미지 계산의 모든 단계를 로그로 기록하는 디버그 매니저
 */
class DebugCombatCalculationManager {
    constructor() {
        this.name = 'DebugCombatCalc';
        debugLogEngine.register(this);
    }

    /**
     * 공격의 상세 계산식을 콘솔에 그룹화하여 출력합니다.
     * @param {object} attacker - 공격자 정보
     * @param {object} defender - 방어자 정보
     * @param {number} baseDamage - 기본 데미지
     * @param {number} finalDamage - 최종 적용 데미지
     */
    logAttackCalculation(attacker, defender, baseDamage, finalDamage) {
        console.groupCollapsed(`%c[${this.name}]`, `color: #d946ef; font-weight: bold;`, `${attacker.instanceName} -> ${defender.instanceName} 피해량 계산`);
        
        debugLogEngine.log(this.name, `--- 공격자: ${attacker.instanceName} ---`);
        debugLogEngine.log(this.name, `기본 공격력: ${attacker.finalStats.physicalAttack}`);

        debugLogEngine.log(this.name, `--- 방어자: ${defender.instanceName} ---`);
        debugLogEngine.log(this.name, `기본 방어력: ${defender.finalStats.physicalDefense}`);
        
        debugLogEngine.log(this.name, `--- 최종 계산 ---`);
        debugLogEngine.log(this.name, `공식: (기본 공격력 - 기본 방어력), 최소 1`);
        debugLogEngine.log(this.name, `계산: ${baseDamage} - ${defender.finalStats.physicalDefense} = ${baseDamage - defender.finalStats.physicalDefense}`);
        debugLogEngine.log(this.name, `최종 피해량: ${finalDamage}`);
        
        console.groupEnd();
    }
}

export const debugCombatCalculationManager = new DebugCombatCalculationManager();
