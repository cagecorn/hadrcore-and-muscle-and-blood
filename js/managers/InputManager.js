// js/managers/InputManager.js

// ✨ 상수 파일 임포트
import { GAME_EVENTS, UI_STATES, BUTTON_IDS } from '../constants.js';

export class InputManager {
    constructor(renderer, cameraEngine, uiEngine, buttonEngine, eventManager) { // ✨ buttonEngine 추가
        console.log("🎮 InputManager initialized. Ready to process user input. 🎮");
        if (!renderer || !cameraEngine || !uiEngine || !buttonEngine) {
            // 필수 매니저가 누락되면 즉시 게임을 중단합니다.
            throw new Error("[InputManager] Missing one or more essential dependencies (renderer, cameraEngine, uiEngine, buttonEngine). Cannot initialize InputManager.");
        }
        this.renderer = renderer;
        this.cameraEngine = cameraEngine;
        this.uiEngine = uiEngine;
        this.buttonEngine = buttonEngine; // ✨ ButtonEngine 인스턴스 저장
        this.eventManager = eventManager;

        this.canvas = this.renderer.canvas;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this._addEventListeners();
    }

    _addEventListeners() {
        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this._onMouseWheel.bind(this), { passive: false });
        this.canvas.addEventListener('click', this._onClick.bind(this)); // 클릭 이벤트 리스너
    }

    _onMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // ButtonEngine을 사용하여 클릭된 버튼이 있는지 확인
        // 현재 UI 상태가 'HERO_PANEL_OVERLAY'일 때도 버튼 클릭을 허용
        if (this.uiEngine.getUIState() !== UI_STATES.COMBAT_SCREEN && this.buttonEngine.handleCanvasClick(mouseX, mouseY)) { // ✨ 상수 사용 및 조건 변경
            this.isDragging = false;
            console.log(`[InputManager Debug] MouseDown on Button detected and handled by ButtonEngine.`);
            return;
        }

        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.canvas.style.cursor = 'grabbing';
    }

    _onMouseMove(event) {
        if (this.isDragging) {
            const dx = event.clientX - this.lastMouseX;
            const dy = event.clientY - this.lastMouseY;
            this.cameraEngine.pan(dx, dy);
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }

        // ✨ 캔버스 내 논리적 마우스 좌표 계산
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // ✨ DetailInfoManager가 마우스 이동을 감지할 수 있도록 이벤트 발행
        if (this.eventManager) {
            this.eventManager.emit(GAME_EVENTS.CANVAS_MOUSE_MOVED, { x: mouseX, y: mouseY });
        }
    }

    _onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    _onMouseWheel(event) {
        event.preventDefault();

        const zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.cameraEngine.zoomAt(zoomAmount, mouseX, mouseY);
    }

    _onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // 캔버스 내부 논리적 X 좌표 (이 부분이 올바르게 계산됨)
        const mouseY = event.clientY - rect.top;   // 캔버스 내부 논리적 Y 좌표 (이 부분이 올바르게 계산됨)

        console.log(`[InputManager Debug] Click event received: ClientX=${event.clientX}, ClientY=${event.clientY}`);
        console.log(`[InputManager Debug] Canvas Local Mouse: X=${mouseX}, Y=${mouseY}`);
        console.log(`[InputManager Debug] Current UI State: ${this.uiEngine.getUIState()}`);

        // ✨ ButtonEngine을 사용하여 클릭된 버튼이 있는지 확인하고 처리합니다.
        if (this.buttonEngine && this.buttonEngine.handleCanvasClick(mouseX, mouseY)) {
            console.log(`[InputManager Debug] Click event handled by ButtonEngine.`);
        } else {
            console.log(`[InputManager Debug] No button clicked or handled.`);
        }
    }
}
