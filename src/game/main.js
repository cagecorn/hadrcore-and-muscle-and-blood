import { Boot } from './scenes/Boot.js';
import { Game as MainGame } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';
// 영지 화면을 위한 TerritoryScene을 가져옵니다.
import { TerritoryScene } from './scenes/TerritoryScene.js';
// 게임 해상도와 그리드 규격을 관리하는 SurveyEngine을 불러옵니다.
import { surveyEngine } from './utils/SurveyEngine.js';
// phaser 모듈을 직접 불러오면 로컬 서버에서 해석되지 않으므로
// node_modules 경로를 상대 경로로 지정합니다.
// Phaser를 CDN에서 불러와 배포 시 404 오류를 방지합니다.
// ESM 빌드에는 기본 내보내기가 없으므로 전체 네임스페이스를 가져옵니다.
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: Phaser.AUTO,
    // SurveyEngine에서 캔버스 크기를 가져옵니다.
    width: surveyEngine.canvas.width,
    height: surveyEngine.canvas.height,
    parent: 'game-container',
    transparent: true, // 캔버스 자체를 투명하게 설정합니다.
    backgroundColor: 'transparent', // 배경색을 투명하게 만듭니다.
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // --- ✨ 물리 엔진 설정 추가 ---
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // 기본 중력은 0으로 설정, 필요시 객체별로 적용
            debug: false // 물리 디버그 모드 비활성화
        }
    },
    render: {
        pixelArt: false,
        antialias: true, // 안티에일리어싱을 활성화하여 이미지를 부드럽게 표현합니다.
        resolution: window.devicePixelRatio || 1, // 기기의 픽셀 비율에 맞춰 해상도를 설정합니다.
        roundPixels: true,
    },
    // Boot 씬만 초기 설정에 등록합니다.
    // Boot 씬이 실행되면서 나머지 씬들을 동적으로 추가합니다.
    scene: [Boot]
};

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
