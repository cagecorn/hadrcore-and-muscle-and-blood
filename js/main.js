// js/main.js
import { GameEngine } from './GameEngine.js';
// ✨ 상수 파일 임포트

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const gameEngine = new GameEngine('gameCanvas');

        // ✨ gameEngine의 비동기 초기화가 끝날 때까지 기다립니다.
        await gameEngine.init();

        gameEngine.eventManager.setGameRunningState(true);
        gameEngine.start();

        // 버튼 리스너는 GameEngine에서 처리합니다.
    } catch (error) {
        console.error("Fatal Error: Game Engine failed to start.", error);
        alert("게임 시작 중 치명적인 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
});
