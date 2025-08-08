import { debugLogEngine } from '../utils/DebugLogEngine.js';
// 스킬 디버그 매니저를 import 합니다.
import { debugSkillManager } from './DebugSkillManager.js';

/**
 * 새로 생성된 모든 유닛(아군, 적군)의 데이터를 콘솔에 기록하는 매니저
 */
class BirthReportManager {
    constructor() {
        this.name = 'BirthReport';
        debugLogEngine.register(this);
    }

    /**
     * 새로운 유닛 인스턴스의 '출생 신고' 로그를 콘솔에 그룹화하여 출력합니다.
     * @param {object} unitInstance - 생성된 유닛의 전체 데이터
     * @param {string} unitType - 유닛의 타입 ('아군' 또는 '적군')
     */
    logNewUnit(unitInstance, unitType) {
        const typeColor = unitType === '아군' ? '#3b82f6' : '#ef4444';
        const typeName = `[${unitType}]`;

        console.groupCollapsed(
            `%c[${this.name}]%c ${typeName}`,
            `color: #a855f7; font-weight: bold;`,
            `color: ${typeColor}; font-weight: bold;`,
            `${unitInstance.instanceName} (ID: ${unitInstance.uniqueId}) 인스턴스 생성됨`
        );

        debugLogEngine.log(this.name, '--- 기본 정보 ---');
        debugLogEngine.log(this.name, `고유 ID: ${unitInstance.uniqueId}`);
        debugLogEngine.log(this.name, `이름: ${unitInstance.instanceName}`);
        debugLogEngine.log(this.name, `클래스: ${unitInstance.name}`);
        debugLogEngine.log(this.name, `레벨: ${unitInstance.level}`);

        // 스킬 슬롯 정보를 로그로 남깁니다.
        if (unitInstance.skillSlots) {
            debugSkillManager.logSkillSlots(unitInstance.skillSlots);
        }

        console.groupCollapsed(`%c[${this.name}] 최종 스탯 정보`, `color: #a855f7; font-weight: bold;`);
        console.table(unitInstance.finalStats);
        console.groupEnd();
        console.groupEnd();
    }
}

export const birthReportManager = new BirthReportManager();
