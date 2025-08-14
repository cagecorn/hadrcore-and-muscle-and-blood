import { debugLogEngine } from './DebugLogEngine.js';
import { formationEngine } from './FormationEngine.js';
import { aspirationEngine } from './AspirationEngine.js'; // ✨ AspirationEngine import
// statusEffectManager와 EFFECT_TYPES를 가져옵니다.
import { statusEffectManager } from './StatusEffectManager.js';
import { EFFECT_TYPES } from './EffectTypes.js';

/**
 * 유닛 사망 등 특정 로직의 '종료'와 관련된 후처리를 담당하는 매니저
 */
class TerminationManager {
    constructor(scene, summoningEngine, battleSimulator) {
        this.scene = scene;
        this.summoningEngine = summoningEngine;
        this.battleSimulator = battleSimulator;
        debugLogEngine.log('TerminationManager', '종료 매니저가 초기화되었습니다.');
    }

    /**
     * 유닛의 사망 처리를 수행합니다.
     * @param {object} deadUnit - 사망한 유닛
     * @param {object} [attacker=null] - 사망시킨 유닛
     */
    handleUnitDeath(deadUnit, attacker = null) {
        if (!deadUnit || !deadUnit.sprite || !deadUnit.sprite.active) return; // 이미 처리 중이면 중복 실행 방지

        debugLogEngine.log('TerminationManager', `${deadUnit.instanceName}의 사망 처리를 시작합니다.`);

        // 1. 논리적 데이터 처리 (즉시 실행)
        // 그리드에서 유닛을 제거하여 길막 현상을 방지합니다.
        const cell = formationEngine.grid.getCell(deadUnit.gridX, deadUnit.gridY);
        if (cell) {
            cell.isOccupied = false;
            cell.sprite = null;
            debugLogEngine.log('TerminationManager', `그리드 (${deadUnit.gridX}, ${deadUnit.gridY})의 점유 상태를 해제했습니다.`);
        }

        // 소환사가 사망한 경우 해당 소환수들도 정리합니다.
        const summons = this.summoningEngine.getSummons(deadUnit.uniqueId);
        if (summons && summons.size > 0) {
            debugLogEngine.log('TerminationManager', `${deadUnit.instanceName}의 소환수들을 함께 제거합니다.`);
            summons.forEach(id => {
                const summon = this.battleSimulator.turnQueue.find(u => u.uniqueId === id);
                if (summon && summon.currentHp > 0) {
                    this.handleUnitDeath(summon);
                }
            });
        }

        // ✨ 열망 시스템 연동
        if (this.battleSimulator) {
            this.battleSimulator.turnQueue.forEach(unit => {
                if (unit.currentHp > 0) {
                    if (unit.team === deadUnit.team) {
                        aspirationEngine.addAspiration(unit.uniqueId, -20, '아군 사망');
                        // ✨ 아군 사망 시 '강화 학습' 패시브 발동
                        this.battleSimulator.triggerReinforcementLearning(unit, '아군 사망');
                    } else {
                        aspirationEngine.addAspiration(unit.uniqueId, 20, '적군 처치');
                    }
                }
            });
        }

        // ✨ --- ▼ [신규] 거너 '회피 기동' 패시브 발동 로직 ▼ --- ✨
        if (attacker && attacker.currentHp > 0 && attacker.classPassive?.id === 'evasiveManeuver') {
            const buffId = 'evasiveManeuverBuff';
            const effects = statusEffectManager.activeEffects.get(attacker.uniqueId) || [];
            let existingBuff = effects.find(e => e.id === buffId);

            if (existingBuff) {
                // 이미 버프가 있다면 스택을 쌓고 지속시간을 초기화합니다.
                if ((existingBuff.stack || 1) < 3) {
                    existingBuff.stack = (existingBuff.stack || 1) + 1;
                    existingBuff.duration = 3; // 갱신될 때마다 지속시간 초기화
                    debugLogEngine.log(this.constructor.name, `[회피 기동] ${attacker.instanceName} 버프 스택 증가: ${existingBuff.stack}`);
                }
            } else {
                // 버프가 없다면 새로 추가합니다.
                const buffEffect = {
                    id: buffId,
                    type: EFFECT_TYPES.BUFF,
                    duration: 3,
                    stack: 1,
                    sourceSkillName: '회피 기동', // 툴팁 등에 표시될 이름
                    modifiers: { stat: 'physicalEvadeChance', type: 'percentage', value: 0.08 }
                };
                statusEffectManager.addEffect(attacker, { name: '회피 기동', effect: buffEffect }, attacker);
                debugLogEngine.log(this.constructor.name, `[회피 기동] ${attacker.instanceName} 버프 획득`);
            }
            // 버프 획득 시 시각 효과를 표시합니다.
            if (this.battleSimulator.vfxManager) {
                this.battleSimulator.vfxManager.showEffectName(attacker.sprite, '회피 기동', '#22c55e');
            }
        }
        // ✨ --- ▲ [신규] 거너 '회피 기동' 패시브 발동 로직 ▲ --- ✨
        
        // 2. 시각적 처리 (애니메이션)
        // 유닛 스프라이트를 서서히 투명하게 만들어 사라지게 합니다.
        this.scene.tweens.add({
            targets: deadUnit.sprite,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // 3. 최종 비활성화 처리
                // 트윈이 끝난 후 스프라이트를 비활성화하여 UI(체력바, 이름표)가 완전히 사라지게 합니다.
                // BindingManager가 이 상태를 감지하고 종속된 요소들을 숨깁니다.
                deadUnit.sprite.setActive(false);
                deadUnit.sprite.setVisible(false); // 만약을 위해 보이지 않게 처리
                debugLogEngine.log('TerminationManager', `${deadUnit.instanceName}의 모든 객체가 비활성화되었습니다.`);
            }
        });
    }
}

// 이 엔진은 Scene에 종속적이므로, new 키워드를 통해 생성하여 사용합니다.
export { TerminationManager };
