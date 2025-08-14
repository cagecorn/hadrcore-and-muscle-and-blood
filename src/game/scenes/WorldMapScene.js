import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { WorldMapEngine } from '../utils/WorldMapEngine.js';
import { LeaderEngine } from '../utils/LeaderEngine.js';
import { WorldMapTurnEngine } from '../utils/WorldMapTurnEngine.js';
import { CameraControlEngine } from '../utils/CameraControlEngine.js';

export class WorldMapScene extends Scene {
    constructor() {
        super('WorldMapScene');
    }

    create() {
        // 다른 DOM 컨테이너 숨기기
        const territoryContainer = document.getElementById('territory-container');
        if (territoryContainer) {
            territoryContainer.style.display = 'none';
        }

        // 1. 월드맵 엔진을 생성하고 맵을 만듭니다.
        const mapEngine = new WorldMapEngine(this);
        mapEngine.create();

        // 2. 리더 엔진을 생성하고 플레이어 캐릭터를 만듭니다.
        const leaderEngine = new LeaderEngine(this, mapEngine);
        leaderEngine.create();
        
        // 3. 턴 엔진을 생성하여 키보드 입력을 처리합니다.
        new WorldMapTurnEngine(this, leaderEngine);

        // 4. 카메라 드래그 및 줌 기능을 활성화합니다.
        new CameraControlEngine(this);

        // 'T' 키를 누르면 영지 씬으로 돌아가는 기능을 추가합니다.
        this.input.keyboard.on('keydown-T', () => {
            this.scene.start('TerritoryScene');
        });
        
        // 씬이 종료될 때 DOM 요소를 정리하도록 이벤트를 설정합니다.
        this.events.on('shutdown', () => {
            if (territoryContainer) {
                territoryContainer.style.display = 'block';
            }
        });
    }
}
