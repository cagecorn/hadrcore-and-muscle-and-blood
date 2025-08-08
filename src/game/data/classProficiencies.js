import { SKILL_TAGS } from '../utils/SkillTagManager.js';

/**
 * 각 클래스별 숙련된 스킬 태그 목록입니다.
 * 여기에 포함된 태그와 일치하는 스킬을 사용할 때
 * 향후 구현될 '숙련도 보너스'를 받게 됩니다.
 */
export const classProficiencies = {
    warrior: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.CHARGE,
        SKILL_TAGS.WILL,
    ],
    gunner: [
        SKILL_TAGS.RANGED,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.KINETIC,
        SKILL_TAGS.FIXED,
    ],
    mechanic: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.SUMMON,
        SKILL_TAGS.AID,
        SKILL_TAGS.BUFF,
    ],
    medic: [
        SKILL_TAGS.AID,
        SKILL_TAGS.HEAL,
        SKILL_TAGS.BUFF,
        SKILL_TAGS.WILL_GUARD,
    ],
    nanomancer: [
        SKILL_TAGS.MAGIC,
        SKILL_TAGS.RANGED,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.PRODUCTION,
    ],
    flyingmen: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.CHARGE,
        SKILL_TAGS.THROWING,
    ],
    esper: [
        SKILL_TAGS.MAGIC,
        SKILL_TAGS.RANGED,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.PROHIBITION,
        SKILL_TAGS.MIND,
    ],
    // ✨ [신규] 커맨더 숙련도 태그 추가
    commander: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.WILL,
        SKILL_TAGS.STRATEGY,
    ],
    clown: [
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.MELEE,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.KINETIC,
        SKILL_TAGS.DELAY,
        SKILL_TAGS.BIND,
    ],
    android: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.WILL,
        SKILL_TAGS.WILL_GUARD,
        SKILL_TAGS.SACRIFICE,
    ],
    // --- ▼ [신규] 역병 의사 숙련도 태그 추가 ▼ ---
    plagueDoctor: [
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.MELEE,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.PROHIBITION,
        SKILL_TAGS.AID,
        SKILL_TAGS.HEAL,
    ],
    // --- ▲ [신규] 역병 의사 숙련도 태그 추가 ▲ ---

    // --- ▼ [신규] 팔라딘 숙련도 태그 추가 ▼ ---
    paladin: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.WILL,
        SKILL_TAGS.AID,
        SKILL_TAGS.AURA,
    ],
    // --- ▲ [신규] 팔라딘 숙련도 태그 추가 ▲ ---

    // --- ▼ [신규] 센티넬 숙련도 태그 추가 ▼ ---
    sentinel: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.WILL,
        SKILL_TAGS.WILL_GUARD,
        SKILL_TAGS.GUARDIAN,
    ],
    // --- ▲ [신규] 센티넬 숙련도 태그 추가 ▲ ---

    // --- ▼ [신규] 해커 숙련도 태그 추가 ▼ ---
    hacker: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.MAGIC,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.PROHIBITION,
        SKILL_TAGS.DELAY,
    ],
    // --- ▲ [신규] 해커 숙련도 태그 추가 ▲ ---

    // --- ▼ [신규] 고스트 숙련도 태그 추가 ▼ ---
    ghost: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.FIXED,
        SKILL_TAGS.COMBO,
        SKILL_TAGS.EXECUTE,
    ],
    // --- ▲ [신규] 고스트 숙련도 태그 추가 ▲ ---
    // --- ▼ [신규] 다크나이트 숙련도 태그 추가 ▼ ---
    darkKnight: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.AURA,
        SKILL_TAGS.DARK,
    ],
    // --- ▲ [신규] 다크나이트 숙련도 태그 추가 ▲ ---
    // '좀비'와 같은 몬스터는 숙련도 보너스를 받지 않으므로 정의하지 않습니다.
};
