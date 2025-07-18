// js/managers/BattleLogManager.js

import { GAME_EVENTS } from '../constants.js';

export class BattleLogManager {
    constructor(panelElement, eventManager, measureManager) {
        console.log("\uD83D\uDCDC BattleLogManager initialized. Ready to record battle events. \uD83D\uDCDC");
        this.panel = document.getElementById('battle-log-panel');
        this.eventManager = eventManager;
        this.measureManager = measureManager;
        this.maxLogLines = 50;
        this.logMessages = [];
    }

    recalculateLogDimensions() {
        // DOM 기반 패널은 특별한 해상도 조정이 필요하지 않으므로 비워 둡니다.
    }

    _setupEventListeners() {
        this.eventManager.subscribe(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, (data) => {
            this.addLog(`${data.attackerId}가 ${data.targetId}를 공격 시도!`);
        });
        this.eventManager.subscribe(GAME_EVENTS.DAMAGE_CALCULATED, (data) => {
            this.addLog(`${data.unitId}가 ${data.hpDamageDealt + data.barrierDamageDealt} 피해를 입고 HP ${data.newHp}가 됨.`);
        });
        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, (data) => {
            this.addLog(`${data.unitName} (ID: ${data.unitId})이(가) 쓰러졌습니다!`);
        });
        this.eventManager.subscribe(GAME_EVENTS.TURN_START, (data) => {
            this.addLog(`--- 턴 ${data.turn} 시작 ---`);
        });
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, (data) => {
            this.addLog(`[전투 시작] 맵: ${data.mapId}, 난이도: ${data.difficulty}`);
        });
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_END, (data) => {
            this.addLog(`[전투 종료] 이유: ${data.reason}`);
        });
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('p');
        entry.style.margin = '0 0 5px 0';
        entry.textContent = `[${timestamp}] ${message}`;
        this.panel.appendChild(entry);

        if (this.panel.children.length > this.maxLogLines) {
            this.panel.removeChild(this.panel.firstChild);
        }
        this.panel.scrollTop = this.panel.scrollHeight;
        console.log(`[BattleLog] ${message}`);
    }

    clearLog() {
        this.panel.innerHTML = '';
        console.log('[BattleLogManager] Log messages cleared.');
    }
}
