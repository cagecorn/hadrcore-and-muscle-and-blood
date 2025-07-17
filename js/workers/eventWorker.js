// js/workers/eventWorker.js

// 이벤트 리스너(구독자)를 저장할 맵 (key: 이벤트 이름, value: 리스너 함수 배열)
const listeners = new Map();

// '작은 엔진' - 트리거 스킬 정의 (간단한 예시)
// 실제 게임에서는 더 복잡한 스킬 로직이 여기에 포함될 수 있습니다.
const triggerSkills = {
    // 'unitAttack' 이벤트에 반응하는 가상의 트리거 스킬
    'unitAttack': [
        {
            name: '공격 시 흡혈',
            condition: (eventData) => eventData.damageDealt > 10, // 10 이상의 피해를 입혔을 때
            action: (eventData) => {
                // 메인 스레드에 '흡혈' 효과 적용을 요청
                self.postMessage({
                    type: 'SKILL_TRIGGERED',
                    skillName: '흡혈',
                    targetUnitId: eventData.attackerId,
                    amount: Math.floor(eventData.damageDealt * 0.1) // 피해량의 10%만큼 흡혈
                });
            }
        }
    ],
    // 'unitDeath' 이벤트에 반응하는 가상의 트리거 스킬
    'unitDeath': [
        {
            name: '죽음의 메아리',
            condition: (eventData) => eventData.unitType === 'elite', // 엘리트 유닛이 죽었을 때
            action: (eventData) => {
                // 메인 스레드에 '광역 공포' 효과 적용을 요청
                self.postMessage({
                    type: 'SKILL_TRIGGERED',
                    skillName: '광역 공포',
                    sourceUnitId: eventData.unitId, // 죽은 유닛을 스킬의 원천으로
                    radius: 3 // 특정 반경 내 적들에게 적용
                });
            }
        }
    ]
};


// 메인 스레드로부터 메시지를 받을 때 실행되는 함수
self.onmessage = (event) => {
    const { type, eventName, data } = event.data;

    if (type === 'EMIT_EVENT') {
        // 1. 등록된 리스너들에게 이벤트 전파 (메인 스레드에 다시 전달)
        // worker는 직접 DOM 조작이나 게임 상태를 변경할 수 없으므로,
        // 이벤트를 수신한 메인 스레드의 EventManager가 다시 구독자들에게 전파해야 합니다.
        self.postMessage({
            type: 'EVENT_DISPATCHED',
            eventName: eventName,
            data: data
        });

        // 2. '작은 엔진' - 트리거 스킬 조건 검사 및 실행
        if (triggerSkills[eventName]) {
            triggerSkills[eventName].forEach(skill => {
                if (skill.condition(data)) {
                    console.log(`[Worker] Trigger Skill '${skill.name}' activated by event: ${eventName}`);
                    skill.action(data); // 해당 스킬의 액션 실행
                }
            });
        }
    }
};

console.log("[Worker] EventWorker initialized and small engine ready.");
