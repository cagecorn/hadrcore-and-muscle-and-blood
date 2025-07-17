// js/managers/ButtonEngine.js

export class ButtonEngine {
    constructor() {
        console.log("\u2B1B ButtonEngine initialized. Ready to manage all in-game buttons. \u2B1B");
        this.buttons = new Map(); // { buttonId: { x, y, width, height, callback } }
    }

    /**
     * 클릭 가능한 버튼 영역을 등록합니다.
     * @param {string} id - 버튼의 고유 ID
     * @param {number} x - 버튼의 X 좌표 (캔버스 논리적 픽셀)
     * @param {number} y - 버튼의 Y 좌표 (캔버스 논리적 픽셀)
     * @param {number} width - 버튼의 너비 (캔버스 논리적 픽셀)
     * @param {number} height - 버튼의 높이 (캔버스 논리적 픽셀)
     * @param {Function} callback - 버튼 클릭 시 실행될 함수
     */
    registerButton(id, x, y, width, height, callback) {
        if (typeof callback !== 'function') {
            console.error(`[ButtonEngine] Cannot register button '${id}'. Callback must be a function.`);
            return;
        }
        this.buttons.set(id, { x, y, width, height, callback });
        console.log(`[ButtonEngine] Registered button: '${id}' at (${x},${y}) size ${width}x${height}.`);
    }

    /**
     * 등록된 버튼의 위치와 크기 정보를 업데이트합니다.
     * 주로 캔버스 리사이즈 후 버튼 위치 재계산 시 사용됩니다.
     * @param {string} id - 버튼의 고유 ID
     * @param {number} x - 새로운 X 좌표
     * @param {number} y - 새로운 Y 좌표
     * @param {number} width - 새로운 너비
     * @param {number} height - 새로운 높이
     */
    updateButtonRect(id, x, y, width, height) {
        const button = this.buttons.get(id);
        if (button) {
            button.x = x;
            button.y = y;
            button.width = width;
            button.height = height;
            console.log(`[ButtonEngine] Updated rect for button: '${id}' to (${x},${y}) size ${width}x${height}.`);
        } else {
            console.warn(`[ButtonEngine] Button '${id}' not found for update.`);
        }
    }

    /**
     * 특정 ID의 버튼 정보를 가져옵니다. (주로 UIEngine이 그리기 위해 사용)
     * @param {string} id - 버튼의 고유 ID
     * @returns {{x: number, y: number, width: number, height: number} | undefined}
     */
    getButtonRect(id) {
        const button = this.buttons.get(id);
        return button ? { x: button.x, y: button.y, width: button.width, height: button.height } : undefined;
    }

    /**
     * 캔버스 클릭 좌표를 기반으로 어떤 버튼이 클릭되었는지 확인하고 해당 콜백을 실행합니다.
     * @param {number} mouseX - 클릭된 X 좌표 (캔버스 논리적 픽셀)
     * @param {number} mouseY - 클릭된 Y 좌표 (캔버스 논리적 픽셀)
     * @returns {string | null} 클릭된 버튼의 ID 또는 null
     */
    handleCanvasClick(mouseX, mouseY) {
        for (const [id, button] of this.buttons.entries()) {
            if (
                mouseX >= button.x && mouseX <= button.x + button.width &&
                mouseY >= button.y && mouseY <= button.y + button.height
            ) {
                console.log(`[ButtonEngine] Click detected on button: '${id}'.`);
                button.callback();
                return id;
            }
        }
        return null;
    }
}
