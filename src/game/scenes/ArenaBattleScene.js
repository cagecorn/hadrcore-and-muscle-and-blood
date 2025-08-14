import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { BattleStageManager } from '../utils/BattleStageManager.js';
import { CameraControlEngine } from '../utils/CameraControlEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { BattleSimulatorEngine } from '../utils/BattleSimulatorEngine.js';
import { arenaManager } from '../utils/ArenaManager.js';
import { logDownloader } from '../utils/LogDownloader.js'; // logDownloader import 추가

export class ArenaBattleScene extends Scene {
    constructor() {
        super('ArenaBattleScene');
        this.stageManager = null;
        this.cameraControl = null;
        this.battleSimulator = null;
    }

    create() {
        // 다른 DOM 컨테이너 숨기기
        ['dungeon-container', 'territory-container', 'formation-container'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const stageConfig = {
            background: 'battle-stage-arena',
        };

        this.stageManager = new BattleStageManager(this);
        this.stageManager.createStage(stageConfig.background);
        this.cameraControl = new CameraControlEngine(this);
        this.cameras.main.setZoom(2);

        this.battleSimulator = new BattleSimulatorEngine(this);

        const partyUnits = partyEngine.getDeployedMercenaries();
        const enemyUnits = arenaManager.getEnemyTeam();

        this.battleSimulator.start(partyUnits, enemyUnits);

        // ✨ 'L' 키를 누르면 로그를 다운로드하는 이벤트 리스너를 추가합니다.
        this.input.keyboard.on('keydown-L', () => {
            console.log("'L' 키가 눌렸습니다. 로그 다운로드를 시작합니다...");
            logDownloader.download();
        });

        this.events.on('shutdown', () => {
            // 'keydown-L' 이벤트 리스너를 해제합니다.
            this.input.keyboard.off('keydown-L');
            if (this.stageManager) this.stageManager.destroy();
            if (this.cameraControl) this.cameraControl.destroy();
            if (this.battleSimulator) this.battleSimulator.shutdown();
        });
    }
}
