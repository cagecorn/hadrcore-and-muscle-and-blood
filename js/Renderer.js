// js/Renderer.js
export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            // 필수 캔버스가 없으면 더 진행하지 않고 명확한 오류를 던집니다.
            throw new Error(`[Renderer] Canvas with ID "${canvasId}" not found. Cannot initialize Renderer.`);
        }
        this.ctx = this.canvas.getContext('2d');

        // ✨ 고해상도(High-DPI) 디스플레이 지원을 위한 캔버스 해상도 조정
        // devicePixelRatio는 물리적 픽셀과 CSS 픽셀 간의 비율을 나타냅니다.
        // 예를 들어 Retina 디스플레이에서는 이 값이 2 또는 3이 될 수 있습니다.
        this.pixelRatio = window.devicePixelRatio || 1; // 기본값은 1

        // 캔버스 크기 설정은 CompatibilityManager를 통해 동적으로 결정되지만,
        // 여기서는 내부 그리기 버퍼의 초기 해상도를 설정하고 픽셀 스케일을 적용합니다.
        // CompatibilityManager가 CSS width/height를 설정할 때, 이곳의 내부 해상도가 그 배율에 맞게 커지도록 합니다.
        this.resizeCanvas(); // 초기 크기 조정 및 픽셀 비율 적용

        // 윈도우 크기 변경 시 캔버스도 함께 조정되도록 이벤트 리스너 추가
        // 주의: CompatibilityManager에서도 resize 이벤트를 듣고 있으므로,
        // 이 부분은 Renderer의 역할에 따라 조정될 수 있습니다.
        // 현재 구조에서는 CompatibilityManager가 주도하므로, Renderer의 resizeCanvas()를 외부에서 호출하는 것이 좋습니다.
        // GameEngine이나 CompatibilityManager에서 resizeCanvas()를 호출하도록 합니다.

        console.log("Renderer initialized.");
        console.log(`[Renderer] Device Pixel Ratio: ${this.pixelRatio}`);
    }

    /**
     * 캔버스 내부의 그리기 버퍼 해상도를 실제 표시 크기 및 픽셀 비율에 맞춰 조정합니다.
     * 이 메서드는 CompatibilityManager에서 캔버스 크기가 변경될 때 호출되어야 합니다.
     * @param {number} displayWidth - 캔버스의 CSS 표시 너비
     * @param {number} displayHeight - 캔버스의 CSS 표시 높이
     */
    resizeCanvas(displayWidth = this.canvas.clientWidth, displayHeight = this.canvas.clientHeight) {
        // 캔버스의 내부 해상도를 (CSS 표시 크기 * pixelRatio)로 설정합니다.
        // 이렇게 하면 고해상도 디스플레이에서 이미지가 뭉개지지 않고 선명하게 보입니다.
        this.canvas.width = displayWidth * this.pixelRatio;
        this.canvas.height = displayHeight * this.pixelRatio;

        // 모든 그리기 작업에 대해 픽셀 비율만큼 스케일을 적용하여
        // 코드는 기존 CSS 픽셀 단위로 작업하면서도 물리적 픽셀에 맞게 그려지도록 합니다.
        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        console.log(`[Renderer] Canvas internal resolution set to: ${this.canvas.width}x${this.canvas.height} (Display: ${displayWidth}x${displayHeight}, Ratio: ${this.pixelRatio})`);
    }

    /**
     * 캔버스를 지웁니다. 매 프레임마다 새로운 내용을 그리기 전에 호출됩니다.
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 배경을 그립니다.
     */
    drawBackground() {
        this.ctx.fillStyle = '#333'; // 배경 색상 (조절 가능)
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 향후 유닛, 스프라이트 등을 그리는 메서드들이 추가될 예정입니다.
    // 예를 들어, drawImage(image, x, y, width, height) 등.
}
