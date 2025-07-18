// js/workers/battleCalculationWorker.js

self.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'CALCULATE_DAMAGE': {
            // ✨ payload에서 defender's damage reduction 값을 추가로 받음
            // attackerUnitId도 함께 전달받아야 메인 스레드에서 사용 가능
            const { attackerStats, targetStats, skillData, currentTargetHp, currentTargetBarrier, maxBarrier, preCalculatedDamageRoll, damageReduction, damageTakenMultiplier = 1, attackerUnitId } = payload; // attackerUnitId 추가

            // 방어력 적용
            let afterDefense = preCalculatedDamageRoll - targetStats.defense;
            let finalDamage = afterDefense;
            if (finalDamage < 0) finalDamage = 0;

            // ✨ '강철 의지' 같은 패시브 스킬로 인한 최종 피해 감소 적용
            if (damageReduction > 0) {
                finalDamage *= (1 - damageReduction);
            }

            // ✨ 받는 피해량 증폭(디버프) 적용
            finalDamage *= damageTakenMultiplier;

            console.log(`[BattleCalculationWorker] after defense: ${afterDefense}, reduction ${(damageReduction * 100).toFixed(1)}%, taken mult ${damageTakenMultiplier}. Final damage: ${finalDamage.toFixed(0)}`);

            finalDamage = Math.floor(finalDamage); // 최종 데미지는 정수로
            let finalDamageToApply = finalDamage;

            let barrierDamageDealt = 0; // 배리어로 흡수된 데미지
            let hpDamageDealt = 0;      // HP로 들어간 데미지
            let newBarrier = currentTargetBarrier;
            let newHp = currentTargetHp;

            if (finalDamageToApply > 0) {
                if (newBarrier >= finalDamageToApply) {
                    // 배리어가 모든 데미지를 흡수
                    barrierDamageDealt = finalDamageToApply;
                    newBarrier -= finalDamageToApply;
                } else {
                    // 배리어가 일부를 흡수하고, 남은 데미지는 HP로
                    barrierDamageDealt = newBarrier; // 배리어가 흡수한 양
                    hpDamageDealt = finalDamageToApply - newBarrier; // HP로 들어갈 양
                    newBarrier = 0; // 배리어 소진
                    newHp -= hpDamageDealt;
                }
            }
            newHp = Math.max(0, newHp); // HP는 0 미만이 될 수 없음

            self.postMessage({
                type: 'DAMAGE_CALCULATED',
                unitId: payload.targetUnitId,
                attackerId: attackerUnitId, // 공격자 ID를 함께 전송
                newHp: newHp,
                newBarrier: newBarrier,          // ✨ 업데이트된 배리어 값 반환
                hpDamageDealt: hpDamageDealt,    // ✨ HP로 들어간 데미지 반환
                barrierDamageDealt: barrierDamageDealt // ✨ 배리어로 흡수된 데미지 반환
            });
            break;
        }
        default:
            console.warn(`[BattleCalculationWorker] Unknown message type received: ${type}`);
    }
};

console.log("[Worker] BattleCalculationWorker initialized. Ready for heavy calculations.");
