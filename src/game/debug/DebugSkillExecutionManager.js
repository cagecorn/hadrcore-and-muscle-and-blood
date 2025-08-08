import { debugLogEngine } from '../utils/DebugLogEngine.js';
import { SKILL_TYPES } from '../utils/SkillEngine.js';

/**
 * 스킬 실행의 상세 과정을 추적하고 로그로 남기는 디버그 매니저
 */
class DebugSkillExecutionManager {
    constructor() {
        this.name = 'DebugSkillExec';
        debugLogEngine.register(this);
    }

    /**
     * 스킬 사용에 대한 상세 정보를 콘솔에 그룹화하여 출력합니다.
     * @param {object} unit - 스킬을 사용하는 유닛
     * @param {object} baseSkill - 등급만 적용된 기본 스킬 데이터
     * @param {object} modifiedSkill - 순위까지 보정된 최종 스킬 데이터
     * @param {number} rank - 사용된 스킬 슬롯 순위 (1-4)
     * @param {string} grade - 사용된 스킬 등급
     */
    logSkillExecution(unit, baseSkill, modifiedSkill, grade) {
        const skillColor = SKILL_TYPES[baseSkill.type].color;

        console.groupCollapsed(
            `%c[${this.name}]`, `color: #4ade80; font-weight: bold;`,
            `${unit.instanceName}의 스킬 실행: %c${baseSkill.name}`, `color: ${skillColor};`
        );

        debugLogEngine.log(this.name, `--- 스킬 기본 정보 ---`);
        debugLogEngine.log(this.name, `스킬 등급: ${grade}`);

        console.groupCollapsed(`%c[${this.name}] 등급별 효과`, `color: #4ade80; font-weight: bold;`);
        console.table({
            '토큰 소모': { Base: baseSkill.cost, Grade: grade },
            '쿨타임': { Base: baseSkill.cooldown, Grade: grade },
            '지속시간': { Base: baseSkill.effect?.duration, Grade: grade }
        });
        console.groupEnd();
        
        console.groupCollapsed(`%c[${this.name}] 최종 보정 효과`, `color: #4ade80; font-weight: bold;`);
        console.table({
            '데미지 계수': { Base: baseSkill.damageMultiplier, Modified: modifiedSkill.damageMultiplier }
        });
        console.groupEnd();

        debugLogEngine.log(this.name, '--- 최종 적용 데이터 ---');
        console.log(modifiedSkill);
        
        console.groupEnd();
    }
}

export const debugSkillExecutionManager = new DebugSkillExecutionManager();
