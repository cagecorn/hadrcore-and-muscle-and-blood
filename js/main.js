// js/main.js
import { GameEngine } from './GameEngine.js';
// ✨ 상수 파일 임포트
import { BUTTON_IDS } from './constants.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const gameEngine = new GameEngine('gameCanvas');
        gameEngine.eventManager.setGameRunningState(true); // ✨ 게임 시작 시 상태 설정
        gameEngine.start();

        // 영웅 패널 버튼 클릭 이벤트 리스너 추가
        const toggleHeroPanelBtn = document.getElementById(BUTTON_IDS.TOGGLE_HERO_PANEL); // ✨ 상수 사용
        if (toggleHeroPanelBtn) {
            toggleHeroPanelBtn.addEventListener('click', () => {
                gameEngine.getUIEngine().toggleHeroPanel();
            });
        } else {
            console.warn("Hero Panel toggle button not found in main.js.");
        }

        // ✨ 별도의 HTML 전투 시작 버튼 리스너
        const battleStartHtmlBtn = document.getElementById(BUTTON_IDS.BATTLE_START_HTML);
        if (battleStartHtmlBtn) {
            battleStartHtmlBtn.addEventListener('click', () => {
                gameEngine.getUIEngine().handleBattleStartClick();
            });
        }
    } catch (error) {
        console.error("Fatal Error: Game Engine failed to start.", error);
        alert("\uAC8C\uC784 \uC2DC\uC791 \uC911 \uCE58\uBA85\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uCF58\uC194\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    }
});
