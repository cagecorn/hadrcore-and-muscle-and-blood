// js/workers/heroWorker.js

/**
 * 개별 영웅의 AI 로직을 처리하는 워커입니다.
 * 이 워커는 자신만의 '작은 엔진'을 가집니다.
 */

// 이 워커의 '작은 엔진': 스킬 사용 결정 로직
function decideSkillToUse(heroState) {
    const skillRoll = Math.random();
    if (skillRoll < 0.4 && heroState.skillSlots[0]) {
        return heroState.skillSlots[0];
    } else if (skillRoll < 0.7 && heroState.skillSlots[1]) {
        return heroState.skillSlots[1];
    } else if (skillRoll < 0.9 && heroState.skillSlots[2]) {
        return heroState.skillSlots[2];
    }
    return null;
}

self.onmessage = (event) => {
    const { type, heroState, battleState } = event.data;

    if (type === 'DETERMINE_ACTION') {
        let action = null;

        const skillToUse = decideSkillToUse(heroState);

        if (skillToUse) {
            const targetId = battleState.enemies[0]?.id;
            action = {
                actionType: 'skill',
                skillId: skillToUse,
                targetId: targetId,
                logMessage: `${heroState.name}\uAC00 \uC790\uC2E0\uC758 \uC2A4\uD0AC '${skillToUse}'(\uC744) \uC0AC\uC6A9\uD588\uB2E4!`
            };
        } else {
            const targetId = battleState.enemies[0]?.id;
            action = {
                actionType: 'attack',
                targetId: targetId,
                logMessage: `${heroState.name}\uAC00 ${targetId}\uC5D0\uAC8C \uC77C\uBC18 \uACF5\uACA9\uC744 \uAC00\uD588\uB2E4!`
            };
        }

        self.postMessage({
            type: 'ACTION_DECIDED',
            action: action
        });
    }
};
