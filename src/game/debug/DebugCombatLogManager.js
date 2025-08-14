import { debugLogEngine } from '../utils/DebugLogEngine.js';
// ✨ 상세 정보 조회를 위해 필요한 모든 매니저를 import합니다.
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';
import { equipmentManager } from '../utils/EquipmentManager.js';
import { itemInventoryManager } from '../utils/ItemInventoryManager.js';

class DebugCombatLogManager {
    constructor() {
        this.name = 'DebugCombatCalc';
        debugLogEngine.register(this);
    }

    /**
     * ✨ (신규) 로그 출력을 위해 유닛의 상세 정보를 요약하는 헬퍼 함수
     * @param {object} unit - 유닛 객체
     * @returns {object} - 로깅에 사용할 요약 정보
     * @private
     */
    _getUnitLogDetails(unit) {
        // 장착 스킬 정보 조회
        const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const skills = equippedSkillInstances
            .map(instId => {
                if (!instId) return '---';
                const inst = skillInventoryManager.getInstanceData(instId);
                const data = skillInventoryManager.getSkillData(inst.skillId, inst.grade);
                return data ? `${data.name} [${inst.grade[0]}]` : '---';
            })
            .filter(s => s !== '---');

        // 장착 장비 정보 조회
        const equippedItemIds = equipmentManager.getEquippedItems(unit.uniqueId);
        const items = equippedItemIds
            .map(instId => {
                if (!instId) return '---';
                const item = equipmentManager.itemInstanceCache.get(instId) || itemInventoryManager.getItem(instId);
                return item ? `${item.name} [${item.grade[0]}]` : '---';
            })
            .filter(i => i !== '---');

        return {
            Class: unit.id || 'N/A',
            Skills: skills.join(', ') || '없음',
            Items: items.join(', ') || '없음',
        };
    }

    /**
     * ✨ (수정) 공격의 상세 계산식을 더욱 풍부한 정보와 함께 콘솔에 그룹화하여 출력합니다.
     * @param {object} attacker - 공격자 정보
     * @param {object} defender - 방어자 정보
     * @param {number} baseDamage - 기본 데미지
     * @param {number} finalDamage - 최종 적용 데미지
     * @param {number} finalDefense - 효과가 적용된 최종 방어력
     */
    logAttackCalculation(attacker, defender, baseDamage, finalDamage, finalDefense) {
        const atkName = attacker.instanceName || attacker.name || 'unknown';
        const defName = defender.instanceName || defender.name || 'unknown';

        console.groupCollapsed(
            `%c[${this.name}]`,
            `color: #d946ef; font-weight: bold;`,
            `${atkName} -> ${defName} 피해량 계산`
        );

        // 공격자 상세 정보 (접을 수 있는 그룹으로 표시)
        console.groupCollapsed(`%c공격자: ${atkName}`, 'font-weight: bold;');
        console.table(this._getUnitLogDetails(attacker));
        console.table(attacker.finalStats);
        console.groupEnd();

        // 방어자 상세 정보
        console.groupCollapsed(`%c방어자: ${defName}`, 'font-weight: bold;');
        console.table(this._getUnitLogDetails(defender));
        console.table(defender.finalStats);
        console.groupEnd();

        // 최종 계산 과정
        console.groupCollapsed('%c--- 최종 계산 ---', 'font-style: italic;');
        debugLogEngine.log(this.name, `공식: (기본 데미지 - 최종 방어력), 최소 1`);
        debugLogEngine.log(
            this.name,
            `계산: ${baseDamage.toFixed(2)} - ${finalDefense.toFixed(2)} = ${(baseDamage - finalDefense).toFixed(2)}`
        );
        debugLogEngine.log(this.name, `최종 피해량: %c${finalDamage}`, 'color: #ef4444; font-weight: bold;');
        console.groupEnd();

        console.groupEnd();
    }
}

export const debugCombatLogManager = new DebugCombatLogManager();
