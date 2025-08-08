import { statEngine } from './StatEngine.js';
import { birthReportManager } from '../debug/BirthReportManager.js';
// PartyEngine을 불러옵니다.
import { partyEngine } from './PartyEngine.js';
import { uniqueIDManager } from './UniqueIDManager.js';
// 스킬 엔진을 불러옵니다.
// ✨ 1. 속성 특화 데이터와 주사위 엔진을 가져옵니다.
import { attributeSpecializations } from '../data/attributeSpecializations.js';
import { diceEngine } from './DiceEngine.js';
// ✨ [추가] 아키타입 결정 엔진을 가져옵니다.
import { archetypeAssignmentEngine } from './ArchetypeAssignmentEngine.js';

/**
 * 용병의 생성, 저장, 관리를 전담하는 엔진 (싱글턴)
 */
class MercenaryEngine {
    constructor() {
        this.alliedMercenaries = new Map();
        this.enemyMercenaries = new Map();

        this.mercenaryNames = ['크리스', '레온', '아이온', '가레스', '로릭', '이반', '오린', '바엘', '팰크', '스팅'];
    }

    /**
     * MBTI 성향 점수를 생성합니다.
     * @returns {object} - 각 MBTI 축에 대한 점수
     */
    _generateMBTI() {
        const traits = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        const axes = [ ['E','I'], ['S','N'], ['T','F'], ['J','P'] ];
        axes.forEach(axis => {
            const score = Math.floor(Math.random() * 101); // 0-100
            traits[axis[0]] = score;
            traits[axis[1]] = 100 - score;
        });
        return traits;
    }

    /**
     * 특정 타입의 용병을 고용하고, 고유한 인스턴스를 생성하여 반환합니다.
     * @param {object} baseMercenaryData - 고용할 용병의 기본 데이터
     * @param {string} type - 생성할 유닛의 타입 ('ally' 또는 'enemy')
     * @returns {object} - 새로운 용병 인스턴스
     */
    hireMercenary(baseMercenaryData, type = 'ally') {
        const randomName = this.mercenaryNames[Math.floor(Math.random() * this.mercenaryNames.length)];
        const uniqueId = uniqueIDManager.getNextId();

        const newInstance = {
            ...baseMercenaryData,
            uniqueId,
            instanceName: randomName,
            level: 1,
            exp: 0,
            equippedItems: [],
            // ✨ 모든 용병이 동일한 형태의 스킬 슬롯을 갖도록 초기화합니다.
            skillSlots: [null, null, null, null, null, null, null, null],
            // ✨ 각 용병은 고유한 MBTI 성향을 가집니다.
            mbti: this._generateMBTI()
        };

        // ✨ [핵심 추가] 용병 생성 직후 아키타입을 결정합니다.
        archetypeAssignmentEngine.assignArchetype(newInstance);

        // ✨ 2. [신규] 용병 생성 시 무작위 속성 특화 태그를 부여합니다.
        const randomAttribute = diceEngine.getRandomElement(attributeSpecializations);
        if (randomAttribute) {
            newInstance.attributeSpec = randomAttribute;
        }

        // ✨ 모든 클래스가 동일한 슬롯 구조를 사용하므로 추가 로직이 필요 없습니다.

        newInstance.finalStats = statEngine.calculateStats(newInstance, newInstance.baseStats, newInstance.equippedItems);

        if (type === 'ally') {
            this.alliedMercenaries.set(uniqueId, newInstance);
            birthReportManager.logNewUnit(newInstance, '아군');
            // --- 파티에 추가 ---
            partyEngine.addPartyMember(uniqueId);
        } else {
            this.enemyMercenaries.set(uniqueId, newInstance);
            birthReportManager.logNewUnit(newInstance, '적군');
        }
        
        return newInstance;
    }

    getMercenaryById(uniqueId, type = 'ally') {
        return type === 'ally' ? this.alliedMercenaries.get(uniqueId) : this.enemyMercenaries.get(uniqueId);
    }

    getAllAlliedMercenaries() {
        return Array.from(this.alliedMercenaries.values());
    }

    getPartyMembers() {
        return partyEngine.getPartyMembers();
    }
}

export const mercenaryEngine = new MercenaryEngine();
