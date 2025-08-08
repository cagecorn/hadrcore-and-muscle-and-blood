import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 전투 중 발생하는 모든 스킬 태그를 감지하고 기록하는 중앙 매니저입니다.
 * '원거리 공격에 데미지 감소'와 같은 패시브 스킬 구현의 기반이 됩니다.
 */
class BattleTagManager {
    constructor() {
        this.name = 'BattleTagManager';
        debugLogEngine.log(this.name, '배틀 태그 매니저가 초기화되었습니다.');
    }

    /**
     * 스킬 사용 이벤트를 기록하고 관련 정보를 로그로 출력합니다.
     * @param {object} attacker - 스킬을 사용한 유닛
     * @param {object} target - 스킬의 대상이 된 유닛
     * @param {object} skillData - 사용된 스킬의 데이터
     */
    recordSkillUse(attacker, target, skillData) {
        if (!skillData.tags || skillData.tags.length === 0) {
            return; // 태그가 없는 스킬은 기록하지 않습니다.
        }

        const tagString = skillData.tags.join(', ');

        // 콘솔에 그룹화된 로그를 출력하여 가독성을 높입니다.
        console.groupCollapsed(
            `%c[${this.name}]`, `color: #2dd4bf; font-weight: bold;`,
            `${attacker.instanceName} -> ${target.instanceName}에게 스킬 [${skillData.name}] 사용 감지`
        );
        debugLogEngine.log(this.name, `발생한 태그: %c${tagString}`, 'color: #facc15;');
        console.groupEnd();

        // 향후 이 곳에서 특정 태그에 반응하는 로직을 실행할 수 있습니다.
        // 예: eventEmitter.emit('skillTag', { attacker, target, skillData });
    }
}

export const battleTagManager = new BattleTagManager();
