/**
 * Phaser 게임 오브젝트와 DOM 요소의 위치 및 크기를 동기화하는 헬퍼 클래스
 */
export class DomSync {
    /**
     * @param {Phaser.Scene} scene 게임 오브젝트가 속한 씬
     * @param {Phaser.GameObjects.GameObject} gameObject 동기화할 Phaser 게임 오브젝트
     * @param {HTMLElement} domElement 동기화할 HTML DOM 요소
     */
    constructor(scene, gameObject, domElement) {
        this.scene = scene;
        this.gameObject = gameObject;
        this.domElement = domElement;
        this.camera = scene.cameras.main;

        // DOM 요소의 스타일을 초기 설정합니다.
        // CSS transform을 사용하기 위해 position을 absolute로 설정합니다.
        this.domElement.style.position = 'absolute';
        this.domElement.style.willChange = 'transform'; // 브라우저에 렌더링 최적화를 알려줍니다.
        this.domElement.style.transformOrigin = 'top left'; // 줌인/아웃 시 왼쪽 상단을 기준으로 크기가 조절되도록 합니다.
    }

    /**
     * 이 메소드는 씬의 update 루프 안에서 계속 호출되어야 합니다.
     */
    update() {
        if (!this.gameObject.scene) {
            // 게임오브젝트가 파괴된 경우, DOM 요소도 제거합니다.
            this.destroy();
            return;
        }
        
        const { x, y } = this.gameObject;
        const { zoom, scrollX, scrollY } = this.camera;

        // 페이지 내에서 캔버스의 절대 위치를 가져옵니다.
        const gameBounds = this.scene.sys.game.canvas.getBoundingClientRect();

        // 카메라의 스크롤과 줌을 고려하여 게임 오브젝트의 화면상 위치를 계산합니다.
        const screenX = (x - scrollX) * zoom;
        const screenY = (y - scrollY) * zoom;

        // DOM 요소가 위치할 최종 좌표입니다.
        const domX = gameBounds.left + screenX;
        const domY = gameBounds.top + screenY;

        // transform 속성을 사용하여 DOM 요소의 위치와 크기를 한 번에 적용합니다.
        // top/left를 직접 바꾸는 것보다 성능상 이점이 있습니다.
        this.domElement.style.transform = `translate(${domX}px, ${domY}px) scale(${zoom})`;
    }

    /**
     * DOM 요소를 제거하고 참조를 정리합니다.
     */
    destroy() {
        if (this.domElement) {
            this.domElement.remove();
        }
        this.domElement = null;
    }
}
