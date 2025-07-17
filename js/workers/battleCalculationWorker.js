// js/workers/battleCalculationWorker.js

self.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'CALCULATE_DAMAGE': {
            const { attackerStats, targetStats, skillData, currentTargetHp, currentTargetBarrier, maxBarrier, preCalculatedDamageRoll, damageReduction } = payload;

            console.log(`[Calc Worker] --------- 데미지 계산 시작 (Target: ${payload.targetUnitId}) ---------`);
            console.log(`[Calc Worker] 1. 주사위 굴림 데미지 (사전 계산됨): ${preCalculatedDamageRoll}`);

            let finalDamage = preCalculatedDamageRoll - targetStats.defense;
            console.log(`[Calc Worker] 2. 방어력(${targetStats.defense}) 적용 후: ${finalDamage}`);
            if (finalDamage < 0) finalDamage = 0;

            if (damageReduction > 0) {
                const reductionAmount = finalDamage * damageReduction;
                finalDamage -= reductionAmount;
                console.log(`[Calc Worker] 3. 피해 감소(${ (damageReduction * 100).toFixed(1) }%) 적용 후: ${finalDamage} (-${reductionAmount.toFixed(1)})`);
            }

            finalDamage = Math.floor(finalDamage);
            console.log(`[Calc Worker] 4. 최종 데미지 (소수점 제거): ${finalDamage}`);
            let finalDamageToApply = finalDamage;

            let barrierDamageDealt = 0; // 배리어로 흡수된 데미지
            let hpDamageDealt = 0;      // HP로 들어간 데미지
            let newBarrier = currentTargetBarrier;
            let newHp = currentTargetHp;

            if (finalDamageToApply > 0) {
                if (newBarrier > 0) {
                    const absorbed = Math.min(newBarrier, finalDamageToApply);
                    barrierDamageDealt = absorbed;
                    newBarrier -= absorbed;
                    finalDamageToApply -= absorbed;
                    console.log(`[Calc Worker] 5. 보호막으로 ${absorbed} 데미지 흡수. 남은 보호막: ${newBarrier}`);
                }
                if (finalDamageToApply > 0) {
                    hpDamageDealt = finalDamageToApply;
                    newHp -= hpDamageDealt;
                    console.log(`[Calc Worker] 6. 체력으로 ${hpDamageDealt} 데미지 적용. 남은 체력: ${newHp}`);
                }
            }
            newHp = Math.max(0, newHp);
            console.log(`[Calc Worker] ------------------ 계산 종료 ------------------`);

            self.postMessage({
                type: 'DAMAGE_CALCULATED',
                unitId: payload.targetUnitId,
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
