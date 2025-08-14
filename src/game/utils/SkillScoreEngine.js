import { debugLogEngine } from './DebugLogEngine.js';
import { SKILL_TYPES } from './SkillEngine.js';
import { SKILL_TAGS } from './SkillTagManager.js';
import { statusEffectManager } from './StatusEffectManager.js';
// 새로 만든 점수 데이터 파일을 import 합니다.
import { SCORE_BY_TYPE, SCORE_BY_TAG } from '../data/skillScores.js';
// ✨ AIMemoryEngine과 Debug 매니저 추가
import { aiMemoryEngine } from './AIMemoryEngine.js';
// ✨ 1. 아키타입 기억 엔진을 새로 import 합니다.
import { archetypeMemoryEngine } from './ArchetypeMemoryEngine.js';
import { debugAIMemoryManager } from '../debug/DebugAIMemoryManager.js';
// ✨ 1. YinYangEngine을 import 합니다.
import { yinYangEngine } from './YinYangEngine.js';
import { debugYinYangManager } from '../debug/DebugYinYangManager.js';
import { aspirationEngine, ASPIRATION_STATE } from './AspirationEngine.js';

/**
 * AI의 스킬 선택을 위해 각 스킬의 전략적 가치를 계산하는 엔진
 */
class SkillScoreEngine {
    constructor() {
        this.name = 'SkillScoreEngine';

        // Scorer 시스템을 통해 추가적인 상황 평가 로직을 주입할 수 있습니다.
        this.scorers = [
            {
                name: 'MissingHealthScorer',
                weight: 1.5,
                logic: (unit, skill, target) => {
                    // 힐 태그가 없는 스킬은 점수 부여 없음
                    if (!skill.tags?.includes(SKILL_TAGS.HEAL) || !target) return 0;

                    const maxHp = target.finalStats?.hp ?? target.maxHp ?? 0;
                    const missingHealth = maxHp - target.currentHp;
                    if (missingHealth <= 0) return -100; // 체력이 가득 차 있으면 사용 금지
                    return (missingHealth / maxHp) * 100;
                }
            },
            {
                name: 'FocusFireScorer',
                weight: 1.2,
                logic: (unit, skill, target) => {
                    if (!target) return 0;
                    // 공격/디버프 스킬이 아니면 무시
                    const offensive = skill.targetType === 'enemy' && (skill.type === 'ACTIVE' || skill.type === 'DEBUFF');
                    if (!offensive || target.team === unit.team) return 0;

                    const maxHp = target.finalStats?.hp ?? target.maxHp ?? 1;
                    let score = ((maxHp - target.currentHp) / maxHp) * 50; // 체력이 낮을수록 가산
                    if (target.isAlreadyTargetedByAllies) {
                        score += 30; // 아군이 집중하고 있는 대상이면 추가 점수
                    }
                    return score;
                }
            }
        ];

        // 현재 조건의 스킬 점수를 캐시하여 재계산을 제한합니다.
        this._cache = new Map();

        debugLogEngine.register(this);
    }

    /**
     * 주어진 스킬 데이터와 현재 전투 상황을 바탕으로 총점을 계산합니다.
     * @param {object} unit - 스킬 사용 주체 유닛
     * @param {object} skillData - 점수를 계산할 스킬의 데이터
     * @param {Array<object>} allies - 모든 아군 유닛 목록
     * @param {Array<object>} enemies - 모든 적군 유닛 목록
     * @returns {number} - 계산된 최종 점수
     */
    async calculateScore(unit, skillData, target, allies, enemies) {
        if (!skillData || skillData.type === 'PASSIVE') {
            return 0;
        }

        const cacheKey = this._createCacheKey(unit, skillData, target);
        if (this._cache.has(cacheKey)) {
            // 이미 계산된 결과를 반환하며 추가 로그를 생략합니다.
            return this._cache.get(cacheKey);
        }

        // 가독성을 위해 계산 항목을 구분해 기록합니다.
        let baseScore = SCORE_BY_TYPE[skillData.type] || 0;
        let tagScore = 0;
        let situationScore = 0;
        // ✨ 2. 음양 보너스 점수를 위한 변수 추가
        let yinYangBonus = 0;
        // ✨ [신규] MBTI 성향 점수 변수
        let mbtiScore = 0;
        // ✨ [신규] 역할군 보너스 점수 변수
        let roleScore = 0;
        // ✨ 열망 보너스 점수 변수 추가
        let aspirationBonus = 0;
        // --- ▼ [신규] 스탯 시너지 점수 변수 추가 ▼ ---
        let statSynergyScore = 0;
        // --- ▲ [신규] 스탯 시너지 점수 변수 추가 ▲ ---
        const situationLogs = [];

        if (skillData.tags) {
            skillData.tags.forEach(tag => {
                tagScore += SCORE_BY_TAG[tag] || 0;
            });
        }

        // 공격 스킬 기본 가중치 및 마무리 보너스
        if (skillData.type === 'ACTIVE') {
            baseScore *= 1.5;
            if (target && target.currentHp < target.finalStats.hp * 0.4) {
                situationScore += 45; // ✨ 마무리 점수 상향 (20 -> 45)
                situationLogs.push('마무리:+45');
            }
        }

        // ✨ [신규] 공격 역할군 보너스
        const offensiveClasses = ['warrior', 'gunner', 'flyingmen', 'ghost', 'darkKnight', 'hacker'];
        if (offensiveClasses.includes(unit.id)) {
            if (skillData.type === 'ACTIVE' || skillData.type === 'DEBUFF') {
                roleScore += 20;
            }
        }

        const lowHealthAllies = allies.filter(a => a.currentHp / a.finalStats.hp <= 0.5).length;
        if (lowHealthAllies > 0 && (skillData.tags.includes(SKILL_TAGS.HEAL) || skillData.tags.includes(SKILL_TAGS.AID))) {
            const bonus = lowHealthAllies * 15;
            situationScore += bonus;
            situationLogs.push(`부상 아군(${lowHealthAllies}명):+${bonus}`);
        }

        const buffedEnemies = enemies.filter(e => {
            const effects = statusEffectManager.activeEffects.get(e.uniqueId) || [];
            return effects.some(effect => effect.id === 'battleCryBuff');
        });
        if (buffedEnemies.length > 0) {
            if (skillData.tags.includes(SKILL_TAGS.DEBUFF)) {
                situationScore += 10;
                situationLogs.push(`적 버프 대응:+10`);
            }
            if (skillData.tags.includes(SKILL_TAGS.FIXED) || skillData.type === 'STRATEGY') {
                situationScore += 5;
                situationLogs.push(`적 버프 대응(고위력):+5`);
            }
        }

        if (unit.currentHp < unit.finalStats.hp * 0.3) {
            if (skillData.tags.includes(SKILL_TAGS.WILL_GUARD) || skillData.type === 'BUFF') {
                situationScore += 10;
                situationLogs.push(`생존:+10`);
            }
        }

        // ✨ [신규] INTP 성향 보너스
        if (unit.mbti) {
            const mbtiString = (unit.mbti.E > unit.mbti.I ? 'E' : 'I') +
                (unit.mbti.S > unit.mbti.N ? 'S' : 'N') +
                (unit.mbti.T > unit.mbti.F ? 'T' : 'F') +
                (unit.mbti.J > unit.mbti.P ? 'J' : 'P');
            if (mbtiString === 'INTP') {
                if (skillData.tags?.includes(SKILL_TAGS.COMBO)) {
                    mbtiScore += 15; // 콤보 스킬에 높은 추가 점수
                }
                if (skillData.tags?.includes(SKILL_TAGS.PRODUCTION)) {
                    mbtiScore += 10; // 생산 스킬에도 추가 점수
                }
            }

            // ✨ ENTP 성향 보너스
            if (mbtiString === 'ENTP') {
                const tags = skillData.tags || [];
                if (tags.includes(SKILL_TAGS.DELAY)) mbtiScore += 20;
                if (tags.includes(SKILL_TAGS.KINETIC)) mbtiScore += 20;
                if (tags.includes(SKILL_TAGS.BIND)) mbtiScore += 25; // 끌어당기기 스킬 선호
                if (skillData.type === 'DEBUFF') mbtiScore += 15;
            }

            // ✨ [신규] ENFP 성향 보너스
            if (mbtiString === 'ENFP') {
                const tags = skillData.tags || [];
                if (tags.includes(SKILL_TAGS.FIXED)) mbtiScore += 30; // 확정 스킬 매우 선호
                if (tags.includes(SKILL_TAGS.COMBO)) mbtiScore += 25; // 콤보 스킬 선호
                if (tags.includes(SKILL_TAGS.CHARGE)) mbtiScore += 20; // 돌진 스킬도 선호
                if (tags.includes(SKILL_TAGS.KINETIC)) mbtiScore += 15; // 관성(넉백) 스킬 선호
            }
            // ✨ [신규] ISTJ 성향 보너스
            if (mbtiString === 'ISTJ') {
                const tags = skillData.tags || [];
                if (tags.includes(SKILL_TAGS.WILL_GUARD)) mbtiScore += 40; // 의지 방패 매우 선호
                if (skillData.type === 'BUFF') mbtiScore += 30; // 버프 스킬 선호
                if (tags.includes(SKILL_TAGS.AURA)) mbtiScore += 25; // 오라 스킬 선호
            }
            // ✨ [신규] ISFJ 성향 보너스
            if (mbtiString === 'ISFJ') {
                const tags = skillData.tags || [];
                if (tags.includes(SKILL_TAGS.HEAL)) mbtiScore += 50; // 치유가 최우선
                if (tags.includes(SKILL_TAGS.AID)) mbtiScore += 40; // 지원 스킬도 매우 선호
                if (tags.includes(SKILL_TAGS.WILL_GUARD)) mbtiScore += 30; // 보호막 스킬 선호
            }
            // ✨ [신규] ESTJ 성향 보너스
            if (mbtiString === 'ESTJ') {
                const tags = skillData.tags || [];
                if (skillData.type === 'DEBUFF') mbtiScore += 50; // 디버프가 최우선
                if (tags.includes(SKILL_TAGS.CHARGE)) mbtiScore += 30; // 돌진 선호
                if (tags.includes(SKILL_TAGS.MELEE)) mbtiScore += 15;
            }
            // ✨ [신규] ESFJ 성향 보너스
            if (mbtiString === 'ESFJ') {
                const tags = skillData.tags || [];
                if (tags.includes(SKILL_TAGS.AURA)) mbtiScore += 50; // 오라 스킬 최우선
                if (skillData.type === 'BUFF') mbtiScore += 40; // 버프 스킬 선호
                if (skillData.type === 'AID') mbtiScore += 30; // 지원 스킬 선호
            }
            // --- ▼ [신규] ESTP 성향 보너스 ▼ ---
            if (mbtiString === 'ESTP') {
                const tags = skillData.tags || [];
                if (tags.includes(SKILL_TAGS.CHARGE)) mbtiScore += 40; // 돌진 매우 선호
                if (tags.includes(SKILL_TAGS.COMBO)) mbtiScore += 30; // 콤보 선호
                if (tags.includes(SKILL_TAGS.SACRIFICE)) mbtiScore += 50; // 희생 스킬 최우선
                if (tags.includes(SKILL_TAGS.WILL_GUARD)) mbtiScore -= 30; // 방어 스킬 비선호
                if (skillData.type === 'BUFF' && skillData.targetType === 'self') mbtiScore -= 20; // 자기 대상 버프 비선호
            }
            // --- ▲ [신규] ESTP 성향 보너스 ▲ ---

            // --- ▼ [신규] ESFP 성향 보너스 ▼ ---
            if (mbtiString === 'ESFP') {
                const tags = skillData.tags || [];
                if (tags.includes(SKILL_TAGS.AURA)) mbtiScore += 60; // 오라 스킬 최우선
                if (skillData.type === 'DEBUFF') mbtiScore += 40; // 광역 디버프 선호
                if (tags.includes(SKILL_TAGS.KINETIC)) mbtiScore += 20; // 관성(밀치기) 선호
                if (tags.includes(SKILL_TAGS.CHARGE)) mbtiScore += 25; // 돌진 선호
            }
            // --- ▲ [신규] ESFP 성향 보너스 ▲ ---
        }

        // ✨ 3. 음양 시스템 점수 계산 로직 추가
        if (target && skillData.yinYangValue) {
            const targetBalance = yinYangEngine.getBalance(target.uniqueId);
            const skillValue = skillData.yinYangValue;
            let efficiency = 0;

            if (Math.sign(targetBalance) !== Math.sign(skillValue) && targetBalance !== 0) {
                const currentImbalance = Math.abs(targetBalance);
                const potentialFutureImbalance = Math.abs(targetBalance + skillValue);
                efficiency = currentImbalance - potentialFutureImbalance;
            }

            if (efficiency > 0) {
                yinYangBonus = efficiency * 2;
                situationLogs.push(`음양 균형(${yinYangBonus.toFixed(0)})`);
            }
        }

        // ✨ --- [핵심 로직 수정] 열망이 낮을수록 역할에 맞는 행동을 선호합니다 --- ✨
        const aspirationData = aspirationEngine.getAspirationData(unit.uniqueId);
        if (aspirationData.state === ASPIRATION_STATE.NORMAL && aspirationData.aspiration < 40) {
            const aggressionFactor = (40 - aspirationData.aspiration) / 40.0;
            const bonus = 30 * aggressionFactor;

            const coreRoleTags = {
                medic: [SKILL_TAGS.HEAL, SKILL_TAGS.AID],
                paladin: [SKILL_TAGS.AURA, SKILL_TAGS.BUFF],
                sentinel: [SKILL_TAGS.WILL_GUARD, SKILL_TAGS.GUARDIAN],
                // 다른 지원 클래스 추가 가능
            };

            const unitRoleTags = coreRoleTags[unit.id] || [];
            const isCoreRoleSkill = skillData.tags?.some(tag => unitRoleTags.includes(tag));
            const isOffensiveSkill = skillData.type === 'ACTIVE' || skillData.type === 'DEBUFF';

            if (isCoreRoleSkill) {
                aspirationBonus = bonus * 1.5; // 150%
                situationLogs.push(`낮은 열망(역할):+${aspirationBonus.toFixed(0)}`);
            } else if (isOffensiveSkill) {
                aspirationBonus = bonus;
                situationLogs.push(`낮은 열망(공격):+${aspirationBonus.toFixed(0)}`);
            }
        }
        // ✨ --- 수정 완료 --- ✨

        // --- ▼ [신규] 스탯 시너지 점수 계산 로직 ▼ ---
        const tags = skillData.tags || [];
        const unitStats = unit.finalStats || {};

        if (tags.includes(SKILL_TAGS.PHYSICAL)) {
            // 물리 스킬일 경우, 힘(strength) 수치에 비례하여 점수 추가
            statSynergyScore += (unitStats.strength || 0) * 1.5;
        } else if (tags.includes(SKILL_TAGS.MAGIC)) {
            // 마법 스킬일 경우, 지능(intelligence) 수치에 비례하여 점수 추가
            statSynergyScore += (unitStats.intelligence || 0) * 1.5;
        }

        if (tags.includes(SKILL_TAGS.HEAL) || tags.includes(SKILL_TAGS.WILL_GUARD)) {
            // 치유 및 보호막 스킬은 지혜(wisdom)에 비례하여 점수 추가
            statSynergyScore += (unitStats.wisdom || 0) * 1.2;
        }
        // --- ▲ [신규] 스탯 시너지 점수 계산 로직 ▲ ---

        // ✨ 4. 최종 점수 계산에 음양 보너스 합산
        // ✨ 최종 점수 계산에 MBTI 보너스 합산
        // ✨ 최종 점수에 열망 보너스 합산
        // 커스텀 스코어러들이 부여하는 추가 점수를 계산합니다.
        let customScore = 0;
        for (const scorer of this.scorers) {
            try {
                const val = scorer.logic(unit, skillData, target, allies, enemies) || 0;
                customScore += (scorer.weight || 1) * val;
            } catch (e) {
                // scorer 실패는 무시하고 진행합니다.
            }
        }

        // ✨ 최종 점수 계산에 역할군 보너스 합산
        const calculatedScore = baseScore + tagScore + situationScore + yinYangBonus + mbtiScore + aspirationBonus + customScore + roleScore + statSynergyScore;

        // ✨ AI 기억 가중치 적용 로직을 수정합니다.
        let finalScore = calculatedScore;
        if (target && target.team !== unit.team) {
            const attackType = this.getAttackTypeFromSkillTags(skillData.tags);
            if (attackType) {
                // 1. 개인의 직접 경험(AIMemoryEngine)을 먼저 조회합니다.
                const personalMemory = await aiMemoryEngine.getMemory(unit.uniqueId);
                const targetPersonalMemory = personalMemory[`target_${target.uniqueId}`];
                let weight = 1.0;
                let memorySource = '기본';

                if (targetPersonalMemory && targetPersonalMemory[`${attackType}_weight`] !== undefined) {
                    weight = targetPersonalMemory[`${attackType}_weight`];
                    memorySource = '개인 기억';
                } else {
                    // 2. 개인 경험이 없다면, 아키타입의 집단 지성(ArchetypeMemoryEngine)을 조회합니다.
                    const mbtiString = this._getMBTIString(unit); // MBTI 문자열을 가져오는 헬퍼 함수
                    if (mbtiString) {
                        const archetypeMemory = await archetypeMemoryEngine.getMemory(mbtiString);
                        const targetArchetypeMemory = archetypeMemory[`target_${target.id}`]; // 상대의 클래스 ID 기준
                        if (targetArchetypeMemory && targetArchetypeMemory[`${attackType}_weight`] !== undefined) {
                            weight = targetArchetypeMemory[`${attackType}_weight`];
                            memorySource = '아키타입 기억';
                        }
                    }
                }

                if (weight !== 1.0) {
                    finalScore *= weight;
                    // 디버그 로그를 수정하여 어떤 기억을 참조했는지 표시
                    debugAIMemoryManager.logScoreModification(
                        `[${memorySource}] ${skillData.name}`,
                        calculatedScore,
                        weight,
                        finalScore
                    );
                }
            }
        }

        debugYinYangManager.logScoreModification(
            skillData.name,
            baseScore + tagScore + situationScore + mbtiScore + roleScore + aspirationBonus + customScore + statSynergyScore,
            yinYangBonus,
            finalScore
        );

        debugLogEngine.log(
            this.name,
            `[${unit.instanceName}] 스킬 [${skillData.name}] 점수: ` +
                `기본(${baseScore}) + 태그(${tagScore}) + 상황(${situationScore}) + 음양(${yinYangBonus.toFixed(2)}) + MBTI(${mbtiScore}) + 역할(${roleScore}) + 열망(${aspirationBonus.toFixed(2)}) + 커스텀(${customScore.toFixed(2)}) + 시너지(${statSynergyScore.toFixed(0)}) = 최종 ${finalScore.toFixed(2)}` +
                (situationLogs.length > 0 ? ` (${situationLogs.join(', ')})` : '')
        );

        this._cache.set(cacheKey, finalScore);
        return finalScore;
    }

    // 스킬, 대상, 유닛의 현재 상태를 기반으로 캐시 키를 생성합니다.
    _createCacheKey(unit, skill, target) {
        const unitId = unit?.uniqueId ?? unit?.id ?? unit?.instanceName;
        const targetId = target?.uniqueId ?? target?.id ?? 'none';
        const unitHp = unit?.currentHp ?? 0;
        const targetHp = target?.currentHp ?? 'none';
        const skillId = skill?.id ?? skill?.name;
        return `${unitId}:${unitHp}:${targetId}:${targetHp}:${skillId}`;
    }

    // ✨ MBTI 문자열을 가져오는 헬퍼 함수를 추가합니다.
    _getMBTIString(unit) {
        if (!unit.mbti) return null;
        const m = unit.mbti;
        return (m.E > m.I ? 'E' : 'I') +
               (m.S > m.N ? 'S' : 'N') +
               (m.T > m.F ? 'T' : 'F') +
               (m.J > m.P ? 'J' : 'P');
    }

    // ✨ 스킬 태그로부터 공격 타입을 알아내는 헬퍼 함수
    getAttackTypeFromSkillTags(tags = []) {
        if (tags.includes(SKILL_TAGS.MELEE)) return 'melee';
        if (tags.includes(SKILL_TAGS.RANGED)) return 'ranged';
        if (tags.includes(SKILL_TAGS.MAGIC)) return 'magic';
        return null;
    }
}

export const skillScoreEngine = new SkillScoreEngine();
