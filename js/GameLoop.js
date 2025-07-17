// js/GameLoop.js
export class GameLoop {
    constructor(update, draw) {
        this.update = update; // 게임 논리를 업데이트하는 함수
        this.draw = draw;     // 화면을 그리는 함수

        this.lastTime = 0;    // 마지막 프레임이 그려진 시간
        this.deltaTime = 0;   // 프레임 간의 시간 (밀리초)
        this.isRunning = false; // 게임 루프 실행 여부

        // `loop` 메서드의 `this` 컨텍스트를 현재 인스턴스로 바인딩
        // 이렇게 해야 `requestAnimationFrame` 내에서 `this.update` 등을 제대로 호출할 수 있습니다.
        this.loop = this.loop.bind(this);

        console.log("GameLoop initialized.");
    }

    /**
     * 게임 루프를 시작합니다.
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now(); // 현재 시간 기록
            requestAnimationFrame(this.loop); // 다음 프레임 요청
            console.log("GameLoop started.");
        }
    }

    /**
     * 게임 루프를 정지합니다.
     */
    stop() {
        this.isRunning = false;
        console.log("GameLoop stopped.");
    }

    /**
     * 메인 게임 루프 함수입니다.
     * @param {DOMHighResTimeStamp} currentTime - 현재 시간 (requestAnimationFrame에 의해 전달됨)
     */
    loop(currentTime) {
        if (!this.isRunning) {
            return;
        }

        this.deltaTime = currentTime - this.lastTime; // 지난 프레임과의 시간 차이 계산
        this.lastTime = currentTime; // 현재 시간을 다음 프레임의 lastTime으로 설정

        // 게임 논리 업데이트 (예: 유닛 이동, 스킬 쿨다운 등)
        this.update(this.deltaTime);

        // 화면 그리기
        this.draw();

        // 다음 프레임 요청
        requestAnimationFrame(this.loop);
    }
}
