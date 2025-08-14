import { SKILL_TAGS } from './SkillTagManager.js';
import { skillInventoryManager } from './SkillInventoryManager.js';
import { classProficiencies } from '../data/classProficiencies.js';
import { classSpecializations } from '../data/classSpecializations.js';

/**
 * 용병의 MBTI 성향에 따라 장착할 스킬 카드를 결정하는 엔진 (심화 버전)
 */
class MercenaryCardSelector {
    constructor() {
        this.name = 'MercenaryCardSelector';
    }

    /**
     * 용병 한 명에게 장착할 8개의 스킬을 선택합니다.
     * @param {object} mercenary - 스킬을 장착할 용병
     * @param {Array<object>} availableCards - 사용 가능한 스킬 카드 인스턴스 목록
     * @returns {{selectedCards: Array<object>, remainingCards: Array<object>}} - 선택된 카드와 남은 카드 목록
     */
    selectCardsForMercenary(mercenary, availableCards) {
        // 1. 주 스킬과 특수 스킬 후보군 분리
        const mainSkillCandidates = availableCards.filter(inst => {
            const data = this._getSkillData(inst);
            return data && data.type !== 'STRATEGY' && !data.tags?.includes(SKILL_TAGS.SPECIAL);
        });

        const specialSkillCandidates = availableCards.filter(inst => {
            const data = this._getSkillData(inst);
            return data && data.type !== 'STRATEGY' && data.tags?.includes(SKILL_TAGS.SPECIAL);
        });

        // 2. 주 스킬과 특수 스킬을 성향에 맞게 선택
        const selectedMainSkills = this._selectSkillsByMBTI(mercenary, mainSkillCandidates, 4);
        const remainingForSpecial = specialSkillCandidates.filter(inst => !selectedMainSkills.find(s => s.instanceId === inst.instanceId));
        const selectedSpecialSkills = this._selectSkillsByMBTI(mercenary, remainingForSpecial, 4);

        // 3. 최종 결과 조합 및 반환
        const selectedCards = [...selectedMainSkills, ...selectedSpecialSkills];
        const remainingCards = availableCards.filter(inst => !selectedCards.find(s => s.instanceId === inst.instanceId));

        return { selectedCards, remainingCards };
    }

    /**
     * MBTI 성향에 따라 스킬 목록을 필터링하고 가중치를 부여하여 스킬을 선택합니다.
     * @private
     */
    _selectSkillsByMBTI(mercenary, candidates, count) {
        let selected = [];
        let currentCandidates = [...candidates];

        const proficiencies = classProficiencies[mercenary.id] || [];
        const specializations = classSpecializations[mercenary.id]?.map(s => s.tag) || [];

        for (let i = 0; i < count; i++) {
            if (currentCandidates.length === 0) break;

            const proficientSkillsCount = selected.filter(inst => {
                const data = this._getSkillData(inst);
                return data.tags && data.tags.some(tag => proficiencies.includes(tag) || specializations.includes(tag));
            }).length;

            const weightedCandidates = currentCandidates.map(inst => {
                const card = this._getSkillData(inst);
                const tags = card.tags || [];
                let score = 100;

                // --- ▼ [핵심 수정] 클래스 제한 로직 수정 ▼ ---
                if (card.requiredClass) {
                    const required = Array.isArray(card.requiredClass) ? card.requiredClass : [card.requiredClass];
                    if (!required.includes(mercenary.id)) {
                        return { instance: inst, score: 0 };
                    }
                }
                // --- ▲ [핵심 수정] 클래스 제한 로직 수정 ▲ ---

                const isProficientOrSpecialized = tags.some(tag => proficiencies.includes(tag) || specializations.includes(tag));
                if (isProficientOrSpecialized) {
                    if (proficientSkillsCount < 2) {
                        score += 400;
                    } else if (proficientSkillsCount < 4) {
                        score += 150;
                    } else {
                        score += 50;
                    }
                }

                // E vs I: 외향(공격/돌진) vs 내향(원거리/방어)
                if (tags.some(t => [SKILL_TAGS.CHARGE, SKILL_TAGS.MELEE].includes(t))) score += mercenary.mbti.E;
                if (tags.some(t => [SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD].includes(t)) || card.type === 'BUFF') score += mercenary.mbti.I;

                // S vs N: 감각(단순/확정) vs 직관(복합/상태이상)
                if (tags.includes(SKILL_TAGS.FIXED) || (!card.effect && (card.damageMultiplier || card.healMultiplier))) score += mercenary.mbti.S;
                if (card.effect || card.push || card.turnOrderEffect || tags.includes(SKILL_TAGS.PROHIBITION)) score += mercenary.mbti.N;

                // T vs F: 사고(자신 강화/적 약화) vs 감정(아군 지원/치유)
                if (card.type === 'DEBUFF' || (card.type === 'BUFF' && card.targetType === 'self')) score += mercenary.mbti.T;
                if (card.type === 'AID' || (card.effect && card.effect.isGlobal)) score += mercenary.mbti.F;

                // J vs P: 판단(정석/숙련) vs 인식(변칙/비숙련)
                const isConventional = this._isConventional(card, mercenary.id);
                if (isConventional) score += mercenary.mbti.J;
                if (!isConventional) score += mercenary.mbti.P;

                // =================================================================
                // [수정] 스탯 시너지 보너스 시작
                // =================================================================
                const finalStats = mercenary.finalStats || {};
                const scoreMultiplier = 1.5; // 스탯 반영 가중치 (필요시 이 값을 조절하세요)

                if (tags.includes(SKILL_TAGS.MAGIC)) {
                    // [마법] 태그 스킬은 '지능'에 비례한 보너스를 받습니다.
                    score += (finalStats.intelligence || 0) * scoreMultiplier;
                } else if (tags.includes(SKILL_TAGS.MELEE)) {
                    // [근접] 태그 스킬은 '힘'에 비례한 보너스를 받습니다.
                    score += (finalStats.strength || 0) * scoreMultiplier;
                } else if (tags.includes(SKILL_TAGS.RANGED)) {
                    // [원거리] 태그 스킬은 '민첩'에 비례한 보너스를 받습니다.
                    score += (finalStats.agility || 0) * scoreMultiplier;
                }
                // =================================================================
                // [수정] 스탯 시너지 보너스 끝
                // =================================================================

                // ✨ --- [신규] 추가된 태그에 대한 MBTI 선호도 점수 --- ✨
                // INTJ, ENTJ (전략가, 통솔관)는 전장 통제 스킬을 선호
                if (tags.includes(SKILL_TAGS.AREA_DENIAL)) score += (mercenary.mbti.N + mercenary.mbti.T) / 2;

                // INTP, ESTJ (논리술사, 관리자)는 중첩을 통한 꾸준한 이득을 선호
                if (tags.includes(SKILL_TAGS.STACKABLE)) score += (mercenary.mbti.I + mercenary.mbti.T) / 2;

                // ENFP, ENTP (활동가, 변론가)는 변수를 창출하는 연쇄 효과를 선호
                if (tags.includes(SKILL_TAGS.CHAIN)) score += (mercenary.mbti.E + mercenary.mbti.P) / 2;

                // ISTP (재주꾼)와 S타입은 타격 시 발동하는 확실한 효과를 선호
                if (tags.includes(SKILL_TAGS.ON_HIT)) score += (mercenary.mbti.S + mercenary.mbti.T) / 2;

                // ENFJ (선도자)는 자신의 소환수를 강화하는 것을 선호
                if (tags.includes(SKILL_TAGS.SUMMON_BUFF)) score += mercenary.mbti.E + mercenary.mbti.F;

                // F타입은 '신성' 태그에, T타입은 '산성' 태그에 높은 가중치
                if (tags.includes(SKILL_TAGS.HOLY)) score += mercenary.mbti.F;
                if (tags.includes(SKILL_TAGS.ACID)) score += mercenary.mbti.T;

                // ISFP, I타입은 '은신'에, ESTP, INFJ는 '혈마법'에 높은 가중치
                if (tags.includes(SKILL_TAGS.STEALTH)) score += mercenary.mbti.I + mercenary.mbti.P;
                if (tags.includes(SKILL_TAGS.BLOOD_MAGIC)) score += mercenary.mbti.E + mercenary.mbti.N; // 리스크와 변수 창출
                // ✨ --- 추가 완료 --- ✨

                return { instance: inst, score };
            });

            // 점수에 기반한 가중치 랜덤 선택
            const totalScore = weightedCandidates.reduce((sum, c) => sum + c.score, 0);

            // 모든 후보의 점수가 0이면 더 이상 선택하지 않고 종료
            if (totalScore === 0) break;

            let random = Math.random() * totalScore;

            let choice = weightedCandidates[weightedCandidates.length - 1].instance; // fallback
            for (const candidate of weightedCandidates) {
                if (random < candidate.score) {
                    choice = candidate.instance;
                    break;
                }
                random -= candidate.score;
            }
            
            selected.push(choice);
            const chosenSkillId = this._getSkillData(choice).id;
            currentCandidates = currentCandidates.filter(c => this._getSkillData(c).id !== chosenSkillId);
        }
        return selected;
    }

    // --- 헬퍼 함수들 ---

    _getSkillData(instance) {
        return skillInventoryManager.getSkillData(instance.skillId, instance.grade);
    }

    _isConventional(card, classId) {
        const proficiencies = classProficiencies[classId] || [];
        const tags = card.tags || [];
        return tags.some(tag => proficiencies.includes(tag));
    }
}

export const mercenaryCardSelector = new MercenaryCardSelector();
