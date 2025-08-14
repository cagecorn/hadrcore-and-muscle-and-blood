import { debugLogEngine } from './DebugLogEngine.js';
import { statusEffectManager } from './StatusEffectManager.js';
// 새로 만든 디버그 매니저를 import 합니다.
import { debugAspirationManager } from '../debug/DebugAspirationManager.js';

// 열망 상태를 나타내는 상수
export const ASPIRATION_STATE = {
    COLLAPSED: 'COLLAPSED', // 붕괴 (MBTI 행동)
    NORMAL: 'NORMAL',       // 평온 (합리적 행동)
    EXALTED: 'EXALTED',     // 각성 (MBTI 기반 버프)
};

// MBTI 성향별 '각성' 버프 효과 정의
const EXALTED_BUFFS = {
    E: { id: 'exaltedE', name: '선봉장', description: '이동력 +1', effect: { modifiers: { stat: 'movement', type: 'flat', value: 1 } } },
    I: { id: 'exaltedI', name: '심안', description: '원거리/마법 방어력 +15%', effect: { modifiers: [{ stat: 'rangedDefense', type: 'percentage', value: 0.15 }, { stat: 'magicDefense', type: 'percentage', value: 0.15 }] } },
    S: { id: 'exaltedS', name: '강골', description: '물리 공격력/방어력 +10%', effect: { modifiers: [{ stat: 'physicalAttack', type: 'percentage', value: 0.10 }, { stat: 'physicalDefense', type: 'percentage', value: 0.10 }] } },
    N: { id: 'exaltedN', name: '통찰', description: '모든 스킬 사거리 +1', effect: { modifiers: { stat: 'attackRange', type: 'flat', value: 1 } } },
    T: { id: 'exaltedT', name: '냉철', description: '치명타 확률/데미지 +10%', effect: { modifiers: [{ stat: 'criticalChance', type: 'percentage', value: 0.10 }, { stat: 'criticalDamageMultiplier', type: 'percentage', value: 0.10 }] } },
    F: { id: 'exaltedF', name: '동료애', description: '턴 시작 시 주변 2칸 내 아군 체력 5% 회복', effect: { id: 'exaltedFBuff' } },
    J: { id: 'exaltedJ', name: '숙련', description: '턴 종료 시 사용한 스킬 쿨타임 1턴 추가 감소', effect: { id: 'exaltedJBuff' } },
    P: { id: 'exaltedP', name: '임기응변', description: '턴 시작 시 50% 확률로 토큰 1개 추가 획득', effect: { id: 'exaltedPBuff' } }
};

class AspirationEngine {
    constructor() {
        this.name = 'AspirationEngine';
        // key: unitId, value: { aspiration: number, state: ASPIRATION_STATE }
        this.unitAspirations = new Map();
        debugLogEngine.register(this);
    }

    initializeUnits(units) {
        this.unitAspirations.clear();
        units.forEach(unit => {
            this.unitAspirations.set(unit.uniqueId, { aspiration: 50, state: ASPIRATION_STATE.NORMAL });
        });
        debugLogEngine.log(this.name, `${units.length}명 유닛의 열망 지수를 50으로 초기화했습니다.`);
    }

    addAspiration(unitId, amount, reason = '전투 결과') {
        if (!this.unitAspirations.has(unitId)) return;

        const data = this.unitAspirations.get(unitId);
        // 이미 붕괴 또는 각성 상태이면 열망 수치는 더 이상 변하지 않습니다.
        if (data.state !== ASPIRATION_STATE.NORMAL) return;

        const oldAspiration = data.aspiration;
        const newAspiration = Math.max(0, Math.min(100, oldAspiration + amount));

        // 수치가 실제로 변한 경우에만 기록합니다.
        if (oldAspiration !== newAspiration) {
            data.aspiration = newAspiration;
            const unit = this.battleSimulator.turnQueue.find(u => u.uniqueId === unitId);
            const unitName = unit ? unit.instanceName : `ID ${unitId}`;
            debugAspirationManager.logAspirationChange(unitId, unitName, oldAspiration, newAspiration, amount, reason);
        }

        // 상태 변화 체크
        if (data.aspiration >= 100) {
            data.state = ASPIRATION_STATE.EXALTED;
            const unit = this.battleSimulator.turnQueue.find(u => u.uniqueId === unitId);
            if (unit) {
                this._applyExaltedBuffs(unit);
                debugAspirationManager.logStateChange(unit.instanceName, ASPIRATION_STATE.EXALTED);
            }
        }
        // ✨ [수정] 열망 붕괴 로직을 삭제했습니다.
    }

    _applyExaltedBuffs(unit) {
        if (!unit.mbti) return;

        let mbtiString = '';
        const m = unit.mbti;
        mbtiString += m.E > m.I ? 'E' : 'I';
        mbtiString += m.S > m.N ? 'S' : 'N';
        mbtiString += m.T > m.F ? 'T' : 'F';
        mbtiString += m.J > m.P ? 'J' : 'P';

        debugLogEngine.log(this.name, `${unit.instanceName} (${mbtiString}) 각성 버프 적용 시도...`);

        for (const trait of mbtiString) {
            const buffData = EXALTED_BUFFS[trait];
            if (buffData && buffData.effect) {
                // 버프 효과를 영구적으로(혹은 매우 길게) 적용
                const skillForBuff = { name: buffData.name, effect: { ...buffData.effect, duration: 99 } };
                statusEffectManager.addEffect(unit, skillForBuff, unit);
            }
        }
    }

    getAspirationData(unitId) {
        return this.unitAspirations.get(unitId) || { aspiration: 50, state: ASPIRATION_STATE.NORMAL };
    }

    setBattleSimulator(simulator) {
        this.battleSimulator = simulator;
    }
}

export const aspirationEngine = new AspirationEngine();
