import { Math as PhaserMath } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

/**
 * 간단한 카메라 드래그 및 줌 제어 엔진
 */
export class CameraControlEngine {
    /**
     * @param {Phaser.Scene} scene - 제어할 씬
     */
    constructor(scene) {
        /** @type {Phaser.Scene} */
        this.scene = scene;
        /** @type {Phaser.Cameras.Scene2D.Camera} */
        this.camera = scene.cameras.main;
        this.isDragging = false;
        this.prevPointer = { x: 0, y: 0 };

        // 타일이 2배로 보이도록 최대 줌 레벨을 고정합니다.
        this.maxZoom = 2;
        // 기본 줌보다 더 확대하지 못하도록 최소 줌은 1로 설정하여
        // 축소는 가능하지만 확대는 제한합니다.
        this.minZoom = 1;

        scene.input.on('pointerdown', this.onPointerDown, this);
        scene.input.on('pointermove', this.onPointerMove, this);
        scene.input.on('pointerup', this.onPointerUp, this);
        scene.input.on('wheel', this.onWheel, this);
    }

    onPointerDown(pointer) {
        this.isDragging = true;
        this.prevPointer.x = pointer.x;
        this.prevPointer.y = pointer.y;
    }

    onPointerMove(pointer) {
        if (!this.isDragging) return;
        const dx = (pointer.x - this.prevPointer.x) / this.camera.zoom;
        const dy = (pointer.y - this.prevPointer.y) / this.camera.zoom;
        this.camera.scrollX -= dx;
        this.camera.scrollY -= dy;
        this.prevPointer.x = pointer.x;
        this.prevPointer.y = pointer.y;
    }

    onPointerUp() {
        this.isDragging = false;
    }

    onWheel(pointer, gameObjects, deltaX, deltaY) {
        // 휠 스크롤 방향에 관계없이 확대/축소합니다.
        // Clamp로 minZoom(1)과 maxZoom(2) 사이를 유지합니다.
        const newZoom = PhaserMath.Clamp(
            this.camera.zoom - deltaY * 0.001,
            this.minZoom,
            this.maxZoom
        );
        this.camera.setZoom(newZoom);
    }

    /**
     * 지정된 좌표로 카메라를 부드럽게 이동시킵니다.
     * @param {number} x 목표 x 좌표
     * @param {number} y 목표 y 좌표
     * @param {number} duration 이동 시간(ms)
     */
    panTo(x, y, duration = 500) {
        this.camera.pan(x, y, duration, 'Sine.easeInOut');
    }

    /**
     * 이벤트 리스너를 해제합니다.
     */
    destroy() {
        this.scene.input.off('pointerdown', this.onPointerDown, this);
        this.scene.input.off('pointermove', this.onPointerMove, this);
        this.scene.input.off('pointerup', this.onPointerUp, this);
        this.scene.input.off('wheel', this.onWheel, this);
    }
}
