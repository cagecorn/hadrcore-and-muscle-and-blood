import StartGame from './game/main.js';
import { archetypeMemoryEngine } from './game/utils/ArchetypeMemoryEngine.js';
import './ai/patches/registerMBTISituationScorer.js';

// [6차 강화학습 데이터] - 2025-08-10 로그 기반
const learnedData_v6 = {
    // 기존 학습 데이터 유지
    'ESTJ': {
        'target_medic': { 'melee_weight': 1.4 }, 'target_gunner': { 'melee_weight': 1.3 },
        'target_warrior': { 'melee_weight': 1.1 }, 'target_darkKnight': { 'melee_weight': 1.1 }
    },
    'ESFJ': {
        'target_sentinel': { 'melee_weight': 0.8 }, 'target_warrior': { 'melee_weight': 0.85 },
        'target_medic': { 'melee_weight': 1.2 }, 'target_plagueDoctor': { 'melee_weight': 1.2 }
    },
    'INFP': {
        'target_warrior': { 'magic_weight': 1.25 }, 'target_medic': { 'magic_weight': 1.5 },
        'target_paladin': { 'magic_weight': 1.4 }
    },
    'INTP': { // INTP: 콤보 공격을 탱커(warrior, sentinel)에게 사용하는 것을 기피하도록 학습
        'target_warrior': { 'magic_weight': 0.80, 'melee_weight': 0.80 },
        'target_sentinel': { 'magic_weight': 0.75, 'melee_weight': 0.75 },
        'target_zombie': { 'melee_weight': 1.15 }
    },
    'INFJ': {
        'target_gunner': { 'melee_weight': 1.3 }, 'target_nanomancer': { 'melee_weight': 1.3 },
        'target_sentinel': { 'melee_weight': 0.8 }
    },

    // 신규 아키타입 학습 데이터
    'ESTP': { // ESTP: 희생 공격을 탱커형 적에게는 덜 사용하도록 가중치 조정
        'target_sentinel': { 'melee_weight': 0.85 },
        'target_paladin': { 'melee_weight': 0.9 }
    },
    'ISFP': { // ISFP: 처형 각이 안 나올 때, '고스트'나 '해커' 같은 기동성 좋은 적을 우선 공격하도록 학습
        'target_ghost': { 'melee_weight': 1.25 },
        'target_hacker': { 'melee_weight': 1.20 }
    },

    // 2025-08-10 추가 학습 데이터
    'ENTJ': { // ENTJ(통솔관)는 적 딜러를 보면 공격보다 아군 버프를 우선하도록 학습
        'target_gunner': { 'attack_weight': 0.7 }, // 거너 상대 시, 일반 공격 선호도 -30%
        'target_nanomancer': { 'attack_weight': 0.7 } // 나노맨서 상대 시, 일반 공격 선호도 -30%
    },
    'ISTP': { // ISTP(해커)는 근접 유닛이 접근하면 반격/함정 스킬을 최우선으로 고려하도록 학습
        'target_warrior': { 'counter_weight': 1.6 }, // 전사 상대 시, 반격 스킬 가중치 +60%
        'target_flyingmen': { 'trap_weight': 1.5 }  // 플라잉맨 상대 시, 함정 스킬 가중치 +50%
    },
    'ISFJ': { // ISFJ(메딕)는 공격적인 적을 만나면 공격보다 디버프를 걸어 아군을 보호하는 것을 선호하도록 학습
        'target_warrior': { 'magic_weight': 1.3 } // 전사 상대 시, 마법(디버프) 가중치 +30%
    }
};

// 학습 데이터 적용 함수 (기존과 동일)
async function applyLearnedData() {
    console.log('AI 강화학습 v6 데이터를 적용합니다...');
    for (const [mbti, memory] of Object.entries(learnedData_v6)) {
        await archetypeMemoryEngine.updateMemory(mbti, memory);
    }
    console.log('모든 아키타입의 집단 기억이 성공적으로 업데이트되었습니다!');
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyLearnedData();
    StartGame('game-container');
});

