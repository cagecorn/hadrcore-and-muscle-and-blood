// data/warriorSkills.js

// 스킬 타입 상수는 constants.js에서 가져옵니다
import { SKILL_TYPES } from '../js/constants.js';

export const WARRIOR_SKILLS = {
    // 액티브 스킬 (첫 번째 슬롯에 있으면 좋은 스킬 예시)
    CHARGE: {
        id: 'skill_warrior_charge',
        name: '돌격',
        type: SKILL_TYPES.ACTIVE,
        aiFunction: 'charge',
        probability: 40, // 이 확률은 RuleManager에 정의된 슬롯 확률에 따라 재조정될 수 있습니다.
        description: '적에게 돌진하여 물리 피해를 입힙니다. 이동과 공격을 동시에 수행합니다.',
        requiredUserTags: ['근접'], // 근접 태그를 가진 유닛만 사용 가능
        effect: {
            dice: { num: 1, sides: 8 },
            damageMultiplier: 1.5,
            stunChance: 0.2 // 20% 확률로 기절
        }
    },
    // 버프 스킬 (한 턴에 스킬 + 일반 공격 예시)
    BATTLE_CRY: {
        id: 'skill_warrior_battle_cry',
        name: '전투의 외침',
        type: SKILL_TYPES.BUFF,
        aiFunction: 'battleCry',
        probability: 30,
        description: '자신의 공격력을 일시적으로 증가시키고 일반 공격을 수행합니다.',
        requiredUserTags: ['전사_클래스'],
        effect: {
            dice: { num: 1, sides: 6 },
            statusEffectId: 'status_battle_cry', // 적용할 상태이상 ID
            allowAdditionalAttack: true // 버프 후 추가 공격 가능 플래그
        }
    },
    // 디버프 스킬 (일반 공격 시 묻어남 예시)
    RENDING_STRIKE: {
        id: 'skill_warrior_rending_strike',
        name: '찢어발기기',
        type: SKILL_TYPES.DEBUFF,
        probability: 0, // 평타에 묻어나는 스킬이라 자체 발동 확률은 0
        description: '일반 공격 시 50% 확률로 적에게 출혈 디버프를 부여합니다.',
        requiredUserTags: ['근접'],
        effect: {
            statusEffectId: 'status_bleed', // 적용할 출혈 상태이상 ID
            applyChance: 0.5 // 기본 적용 확률 50%
        }
    },
    // 리액션 스킬 (공격 받을 시 발동 예시)
    RETALIATE: {
        id: 'skill_warrior_retaliate',
        name: '반격',
        type: SKILL_TYPES.REACTION,
        description: '공격을 받을 시 일정 확률로 즉시 80%의 피해로 반격합니다.',
        requiredUserTags: ['방어'],
        effect: {
            probability: 0.4, // 기본 발동 확률 40% (슬롯에 따라 조정될 수 있음)
            damageModifier: 0.8, // 반격 시 피해량 80%
            tags: ['일반공격'] // 이 공격이 평타 판정임을 명시
        }
    },
    // 패시브 스킬 (상시 발동 예시)
    IRON_WILL: {
        id: 'skill_warrior_iron_will',
        name: '강철 의지',
        type: SKILL_TYPES.PASSIVE,
        description: '잃은 체력에 비례하여 받는 피해량이 최대 30%까지 감소합니다.',
        requiredUserTags: ['방어'],
        effect: {
            // 이 효과는 ConditionalManager가 실시간으로 계산하므로
            // 여기에는 패시브 식별용 정보만 남겨둡니다.
            type: 'damage_reduction_on_lost_hp',
            maxReduction: 0.3 // 최대 30% 감소
        }
    }
};
