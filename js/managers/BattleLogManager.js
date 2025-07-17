// js/managers/BattleLogManager.js

// ✨ 상수 파일 임포트
import { GAME_EVENTS } from '../constants.js';

export class BattleLogManager {
    constructor(canvasElement, eventManager, measureManager) { // ✨ measureManager 추가
        console.log("\uD83D\uDCDC BattleLogManager initialized. Ready to record battle events. \uD83D\uDCDC");
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.eventManager = eventManager;
        this.measureManager = measureManager; // ✨ measureManager 저장

        this.pixelRatio = window.devicePixelRatio || 1;

        this.logMessages = [];
        
        // 초기 내부 해상도 설정 후 로그 치수 재계산
        this.resizeCanvas();
        this.recalculateLogDimensions();

        // ✨ _setupEventListeners는 이제 GameEngine에서 명시적으로 호출됩니다.
        // this._setupEventListeners();
    }

    /**
     * ✨ 로그 패널의 내부 치수를 재계산합니다.
     * 이 메서드는 CompatibilityManager가 캔버스 크기를 조정한 후 호출해야 합니다.
     */
    recalculateLogDimensions() {
        const logicalCanvasHeight = this.measureManager.get('gameResolution.height');
        this.padding = this.measureManager.get('combatLog.padding');
        this.lineHeight = Math.floor(logicalCanvasHeight * this.measureManager.get('combatLog.lineHeightRatio'));
        this.maxLogLines = Math.floor(((this.canvas.height / this.pixelRatio) - 2 * this.padding) / this.lineHeight);
        
        // 최대 줄 수를 초과하는 오래된 메시지 제거
        while (this.logMessages.length > this.maxLogLines) {
            this.logMessages.shift();
        }
        console.log(`[BattleLogManager] Log dimensions recalculated. Canvas size: ${this.canvas.width}x${this.canvas.height}, Max lines: ${this.maxLogLines}`);
        this.resizeCanvas();
    }

    /**
     * 캔버스 내부의 그리기 버퍼 해상도를 실제 표시 크기와 픽셀 비율에 맞춰 조정합니다.
     */
    resizeCanvas() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth * this.pixelRatio ||
            this.canvas.height !== displayHeight * this.pixelRatio) {
            this.canvas.width = displayWidth * this.pixelRatio;
            this.canvas.height = displayHeight * this.pixelRatio;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.scale(this.pixelRatio, this.pixelRatio);
            console.log(`[BattleLogManager] Canvas internal resolution set to: ${this.canvas.width}x${this.canvas.height} (Display: ${displayWidth}x${displayHeight}, Ratio: ${this.pixelRatio})`);
        }
    }

    /**
     * ✨ 이벤트 리스너를 설정하는 메서드. 이제 GameEngine에서 명시적으로 호출됩니다.
     */
    _setupEventListeners() {
        // 전투 관련 이벤트를 구독하여 로그에 추가
        this.eventManager.subscribe(GAME_EVENTS.UNIT_ATTACK_ATTEMPT, (data) => { // ✨ 상수 사용
            this.addLog(`${data.attackerId}가 ${data.targetId}를 공격 시도!`);
        });
        this.eventManager.subscribe(GAME_EVENTS.DAMAGE_CALCULATED, (data) => { // ✨ 상수 사용
            this.addLog(`${data.unitId}가 ${data.hpDamageDealt + data.barrierDamageDealt} 피해를 입고 HP ${data.newHp}가 됨.`);
        });
        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, (data) => { // ✨ 상수 사용
            this.addLog(`${data.unitName} (ID: ${data.unitId})이(가) 쓰러졌습니다!`);
        });
        this.eventManager.subscribe(GAME_EVENTS.TURN_START, (data) => { // ✨ 상수 사용
            this.addLog(`--- 턴 ${data.turn} 시작 ---`);
        });
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, (data) => { // ✨ 상수 사용
            this.addLog(`[전투 시작] 맵: ${data.mapId}, 난이도: ${data.difficulty}`);
        });
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_END, (data) => { // ✨ 상수 사용
            this.addLog(`[전투 종료] 이유: ${data.reason}`);
        });
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.logMessages.push(`[${timestamp}] ${message}`);
        if (this.logMessages.length > this.maxLogLines) {
            this.logMessages.shift();
        }
        console.log(`[BattleLog] ${message}`);
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);

        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(this.lineHeight * 0.8)}px Arial`; // ✨ 폰트 크기 동적 조정 (줄 높이의 80%)
        ctx.textBaseline = 'top';

        for (let i = 0; i < this.logMessages.length; i++) {
            const message = this.logMessages[i];
            const y = this.padding + i * this.lineHeight;
            ctx.fillText(message, this.padding, y);
        }
    }
}
