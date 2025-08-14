/**
 * 플레이어의 파티를 관리하는 엔진 (싱글턴)
 */
import { mercenaryEngine } from './MercenaryEngine.js';

class PartyEngine {
    constructor() {
        this.maxPartySize = 12;
        // 고정 크기의 파티 슬롯을 초기화합니다. 비어있는 슬롯은 undefined로 표시됩니다.
        this.partyMembers = new Array(this.maxPartySize).fill(undefined);
    }

    /**
     * 용병을 파티에 추가합니다.
     * @param {number} unitId - 추가할 용병의 고유 ID
     * @returns {boolean} - 파티 추가 성공 여부 (파티가 가득 찼으면 false)
     */
    addPartyMember(unitId) {
        const emptyIndex = this.partyMembers.indexOf(undefined);
        if (emptyIndex !== -1) {
            this.partyMembers[emptyIndex] = unitId;
            console.log(`용병 (ID: ${unitId})이 파티에 합류했습니다. 현재 파티:`, this.partyMembers);
            return true;
        }
        console.warn('파티가 가득 찼습니다!');
        return false;
    }

    /**
     * 용병을 파티에서 제거합니다. (현재는 미구현)
     * @param {number} unitId - 제거할 용병의 고유 ID
     */
    removePartyMember(unitId) {
        const index = this.partyMembers.indexOf(unitId);
        if (index !== -1) {
            this.partyMembers[index] = undefined;
            console.log(`용병 (ID: ${unitId})이 파티에서 떠났습니다. 현재 파티:`, this.partyMembers);
        }
    }

    /**
     * 특정 슬롯에 용병을 배치합니다. 기존에 배치된 용병은 해제됩니다.
     * @param {number} slotIndex - 대상 슬롯 인덱스
     * @param {number} unitId - 배치할 용병 ID
     */
    setPartyMember(slotIndex, unitId) {
        if (slotIndex < 0 || slotIndex >= this.maxPartySize) return;
        const currentIndex = this.partyMembers.indexOf(unitId);
        if (currentIndex !== -1) {
            this.partyMembers[currentIndex] = undefined;
        }
        this.partyMembers[slotIndex] = unitId;
        console.log(`용병 (ID: ${unitId})이 ${slotIndex}번 슬롯에 배치되었습니다.`, this.partyMembers);
    }

    /**
     * 현재 파티에 있는 모든 용병의 ID를 반환합니다.
     * @returns {Array<number>} - 파티 멤버의 ID 배열
     */
    getPartyMembers() {
        return [...this.partyMembers];
    }

    getDeployedMercenaries() {
        return this.getPartyMembers()
            .filter(id => id !== undefined)
            .map(id => mercenaryEngine.getMercenaryById(id, 'ally'))
            .filter(m => m);
    }

    getMercenaryById(id) {
        return mercenaryEngine.getMercenaryById(id, 'ally');
    }
}

export const partyEngine = new PartyEngine();
