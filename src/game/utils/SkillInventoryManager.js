import { debugLogEngine } from './DebugLogEngine.js';
import { skillCardDatabase } from '../data/skills/SkillCardDatabase.js';
import { placeholderManager } from './PlaceholderManager.js';

/**
 * 플레이어가 획득한 모든 스킬 카드의 인벤토리를 관리하는 엔진
 * 각 스킬 카드는 고유 instanceId로 관리됩니다.
 */
class SkillInventoryManager {
    constructor() {
        this.skillInventory = [];
        this.instanceMap = new Map();
        this.nextInstanceId = 1;
        debugLogEngine.log('SkillInventoryManager', '스킬 인벤토리 매니저가 초기화되었습니다.');
        this.initializeSkillCards();
    }

    /**
     * 게임 시작 시 기본 스킬 카드를 지급합니다.
     */
    initializeSkillCards() {
        // 등급별 기본 스킬 지급
        const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
        grades.forEach(grade => {
            for (let i = 0; i < 2; i++) {
                this.addSkillById('charge', grade);
                this.addSkillById('attack', grade); // 공격 스킬도 각 등급별 2장 지급

                // ✨ 추가 기본 스킬 카드 지급
                this.addSkillById('nanobeam', grade);
                this.addSkillById('axeStrike', grade);
                this.addSkillById('stoneSkin', grade);
                this.addSkillById('shieldBreak', grade);
                this.addSkillById('heal', grade);
                // ✨ 넉백샷 카드 추가
                this.addSkillById('knockbackShot', grade);
                // ✨ 제압 사격 카드 추가
                this.addSkillById('suppressShot', grade);
                // ✨ 낙인 카드 추가
                this.addSkillById('stigma', grade);
                // ✨ [신규] 전투의 함성 카드 지급
                this.addSkillById('battleCry', grade);
                // ✨ [신규] 사냥꾼의 감각 카드 지급
                this.addSkillById('huntSense', grade);
                // ✨ [신규] 크리티컬 샷 카드 지급
                this.addSkillById('criticalShot', grade);
                // ✨ [신규] 윌 가드 카드 지급
                this.addSkillById('willGuard', grade);
                // ✨ [신규] 마이티 쉴드 카드 지급
                this.addSkillById('mightyShield', grade);
                // ✨ 컨퓨전 스킬 카드 지급 추가
                this.addSkillById('confusion', grade);
            }
        });

        // "선조 페오르 소환" 스킬 카드 5장 지급 (NORMAL 등급)
        for (let i = 0; i < 5; i++) {
            this.addSkillById('summonAncestorPeor', 'NORMAL');
        }

        // ✨ [신규] '돌격 명령' 전략 카드 3장 지급
        for (let i = 0; i < 3; i++) {
            this.addSkillById('chargeOrder', 'NORMAL');
        }

        // ✨ [추가] 테스트를 위해 새로운 스킬 카드를 5장씩 지급합니다.
        for (let i = 0; i < 5; i++) {
            this.addSkillById('javelinThrow', 'NORMAL');
            this.addSkillById('snipe', 'NORMAL');
            this.addSkillById('fireBottle', 'NORMAL');
            this.addSkillById('nanoRailgun', 'NORMAL');
            this.addSkillById('proofOfValor', 'NORMAL');
        }

        // ✨ [추가] 테스트를 위해 나노봇 스킬 카드를 5장 지급합니다.
        for (let i = 0; i < 5; i++) {
            this.addSkillById('nanobot', 'NORMAL');
        }

        // 나머지 스킬은 노멀 등급으로 10장씩 생성
        for (const skillId in skillCardDatabase) {
            if (skillCardDatabase.hasOwnProperty(skillId) && skillId !== 'charge' && skillId !== 'attack') {
                for (let i = 0; i < 10; i++) {
                    this.addSkillById(skillId, 'NORMAL');
                }
            }
        }
        debugLogEngine.log('SkillInventoryManager', `초기 스킬 카드 ${this.skillInventory.length}장 생성 완료.`);
    }

    /**
     * 스킬 ID를 기반으로 새로운 스킬 인스턴스를 생성해 인벤토리에 추가합니다.
     *
     * @param {string} skillId
     * @returns {object} 생성된 스킬 인스턴스
     */
    addSkillById(skillId, grade = 'NORMAL') {
        const instance = { instanceId: this.nextInstanceId++, skillId, grade };
        this.skillInventory.push(instance);
        this.instanceMap.set(instance.instanceId, { skillId, grade });
        return instance;
    }

    /**
     * 인벤토리에서 특정 인스턴스를 제거합니다. (맵에서도 제거)
     * @param {number} instanceId
     */
    removeSkillByInstanceId(instanceId) {
        this.skillInventory = this.skillInventory.filter(s => s.instanceId !== instanceId);
        this.instanceMap.delete(instanceId);
    }

    /**
     * 인벤토리 '목록'에서만 특정 인스턴스를 제거합니다.
     * instanceMap에는 데이터를 남겨둬 다른 시스템이 스킬 정보를 조회할 수 있습니다.
     * @param {number} instanceId
     */
    removeSkillFromInventoryList(instanceId) {
        this.skillInventory = this.skillInventory.filter(s => s.instanceId !== instanceId);
    }

    /**
     * ✨ [기존 메서드 수정] 인벤토리에서 특정 skillId를 가진 첫 번째 인스턴스를 찾아 제거하고 반환합니다.
     * @param {string} skillId - 찾을 스킬의 ID (예: 'attack')
     * @returns {object|null} - 찾은 스킬 인스턴스 또는 null
     */
    findAndRemoveInstanceOfSkill(skillId, grade = 'NORMAL') {
        const index = this.skillInventory.findIndex(s => s.skillId === skillId && s.grade === grade);
        if (index !== -1) {
            const instance = this.skillInventory.splice(index, 1)[0];
            // ✨ 인벤토리에서 완전히 제거되므로 instanceMap에서도 삭제합니다.
            this.instanceMap.delete(instance.instanceId);
            return instance;
        }
        return null;
    }

    /** 현재 인벤토리에 있는 스킬 인스턴스 배열을 반환 */
    getInventory() {
        return this.skillInventory;
    }

    /** 스킬 ID와 등급으로 스킬 데이터 조회
     * 요청한 등급이 없으면 NORMAL 등급으로 대체(Fallback)합니다.
     * 이미지 경로가 없으면 PlaceholderManager에 기대 경로를 알려줍니다.
     */
    getSkillData(skillId, grade = 'NORMAL') {
        const entry = skillCardDatabase[skillId];
        if (!entry) return null;

        // [수정] 요청한 등급이 없으면 NORMAL로, NORMAL도 없으면 그냥 entry로 대체
        const gradeData = entry[grade] || entry['NORMAL'] || entry;

        const baseData = { ...entry };
        delete baseData.NORMAL;
        delete baseData.RARE;
        delete baseData.EPIC;
        delete baseData.LEGENDARY;
        
        const finalSkillData = { ...baseData, ...gradeData };

        // ✨ [수정] illustrationPath가 없을 경우, skillId를 기반으로 자동 경로를 생성합니다.
        // placeholderManager는 경로가 실제로 없을 때만 경고를 출력합니다.
        if (!finalSkillData.illustrationPath) {
            const expectedPath = `assets/images/skills/${finalSkillData.id}.png`;
            finalSkillData.illustrationPath = placeholderManager.getPath(null, expectedPath);
        }

        return finalSkillData;
    }

    getInstanceData(instanceId) {
        return this.instanceMap.get(instanceId);
    }
}

export const skillInventoryManager = new SkillInventoryManager();
