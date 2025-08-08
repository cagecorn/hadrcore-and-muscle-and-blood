import StartGame from './game/main.js';
import { archetypeMemoryEngine } from './game/utils/ArchetypeMemoryEngine.js';

// [4차 강화학습 데이터] - 2025-08-07 로그 기반
const learnedData_v4 = {
    // ESTJ, ESFJ, INFP, INTP, INFJ는 이전 학습 데이터 유지
    'ESTJ': {
        'target_medic': { 'melee_weight': 1.4 }, 'target_gunner': { 'melee_weight': 1.3 },
        'target_warrior': { 'melee_weight': 1.1 }, 'target_darkKnight': { 'melee_weight': 1.1 }
    },
    'ESFJ': {
        'target_sentinel': { 'melee_weight': 0.7 }, 'target_warrior': { 'melee_weight': 0.75 },
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
    }
};

// 학습 데이터 적용 함수 (기존과 동일)
async function applyLearnedData() {
    console.log('AI 강화학습 v4 데이터를 적용합니다...');
    for (const [mbti, memory] of Object.entries(learnedData_v4)) {
        await archetypeMemoryEngine.updateMemory(mbti, memory);
    }
    console.log('모든 아키타입의 집단 기억이 성공적으로 업데이트되었습니다!');
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyLearnedData();
    StartGame('game-container');
});

