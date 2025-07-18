// js/managers/CameraEngine.js

export class CameraEngine {
    constructor(renderer, logicManager, sceneManager) {
        console.log("\ud83d\udcf8 CameraEngine initialized. Ready to control the view. \ud83d\udcf8");
        this.renderer = renderer;
        this.logicManager = logicManager;
        this.sceneManager = sceneManager;

        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }

    applyTransform(ctx) {
        ctx.translate(this.x, this.y);
        ctx.scale(this.zoom, this.zoom);
    }

    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
    }

    zoomAt(zoomAmount, mouseX, mouseY) {
        const oldZoom = this.zoom;
        let newZoom = this.zoom + zoomAmount;
        const zoomLimits = this.logicManager.getZoomLimits();
        newZoom = Math.max(zoomLimits.minZoom, Math.min(newZoom, zoomLimits.maxZoom));
        if (newZoom === oldZoom) return;

        const worldX = (mouseX - this.x) / oldZoom;
        const worldY = (mouseY - this.y) / oldZoom;

        this.x -= worldX * (newZoom - oldZoom);
        this.y -= worldY * (newZoom - oldZoom);
        this.zoom = newZoom;

        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        // 화면에 콘텐츠 전체가 보이도록 최소 줌 값을 가져와 적용합니다.
        const { minZoom } = this.logicManager.getZoomLimits();
        this.zoom = minZoom;
        // ✨ 추가: reset 후 Pan Constraints 적용 전 값 확인
        console.log(`[CameraEngine Debug] Resetting camera: initial X=${this.x}, Y=${this.y}, calculated Zoom=${this.zoom.toFixed(2)}`);

        const clampedPos = this.logicManager.applyPanConstraints(this.x, this.y, this.zoom);
        this.x = clampedPos.x;
        this.y = clampedPos.y;
        // ✨ 추가: reset 후 Pan Constraints 적용 후 값 확인
        console.log(`[CameraEngine Debug] After clamping: final X=${this.x.toFixed(2)}, Y=${this.y.toFixed(2)}, Zoom=${this.zoom.toFixed(2)}`);
    }

    /**
     * 화면 좌표를 게임 월드 좌표로 변환합니다.
     * @param {number} screenX - 화면상의 마우스 X 좌표
     * @param {number} screenY - 화면상의 마우스 Y 좌표
     * @returns {{x:number, y:number}} 변환된 게임 월드 좌표
     */
    screenToWorld(screenX, screenY) {
        const worldX = (screenX - this.x) / this.zoom;
        const worldY = (screenY - this.y) / this.zoom;
        return { x: worldX, y: worldY };
    }
}
