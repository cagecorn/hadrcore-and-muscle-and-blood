export class CanvasBridgeManager {
    constructor(gameCanvas, mercenaryPanelCanvas, combatLogCanvas, eventManager, measureManager) {
        console.log("\ud83c\udf0e CanvasBridgeManager initialized. Ready to bridge canvas interactions. \ud83c\udf0e");
        this.gameCanvas = gameCanvas;
        // mercenaryPanelCanvas는 이제 독립적인 캔버스가 아니므로 참조하지 않습니다.
        // this.mercenaryPanelCanvas = mercenaryPanelCanvas; 
        this.combatLogCanvas = combatLogCanvas;
        this.eventManager = eventManager;
        this.measureManager = measureManager;

        this.isDragging = false;
        this.draggedElement = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // gameCanvas와 combatLogCanvas에만 이벤트 리스너를 추가합니다.
        [this.gameCanvas, this.combatLogCanvas].forEach(canvas => {
            if (canvas) {
                canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
                canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
                canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
                canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
            }
        });
        console.log("[CanvasBridgeManager] Listening for mouse events on all canvases.");
    }

    _onMouseDown(event) {
        // MercenaryPanelCanvas에서의 드래그 시작 로직은 이제 UIEngine이 처리합니다.
        // 이곳에서는 메인 게임 캔버스나 전투 로그 캔버스에서만 드래그를 시작합니다.
        // 예를 들어, 맵 드래그 등.
        // 여기서는 `event.target === this.mercenaryPanelCanvas` 조건문을 제거합니다.
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        console.log(`[CanvasBridgeManager] Dragging started from ${event.target.id}.`);
        this.eventManager.emit('dragStart', { clientX: event.clientX, clientY: event.clientY, sourceCanvas: event.target.id });
    }

    _onMouseMove(event) {
        if (!this.isDragging) return;
        this.eventManager.emit('dragMove', { clientX: event.clientX, clientY: event.clientY, currentCanvas: event.target.id });
    }

    _onMouseUp(event) {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (event.target === this.gameCanvas) {
            console.log("[CanvasBridgeManager] Dragging ended, dropped on Game Canvas.");
            this.eventManager.emit('drop', { clientX: event.clientX, clientY: event.clientY, targetCanvas: event.target.id, droppedElement: this.draggedElement });
        } else {
            console.log("[CanvasBridgeManager] Dragging ended, no valid drop target.");
            this.eventManager.emit('dragCancel', {});
        }
        this.draggedElement = null;
    }
}
