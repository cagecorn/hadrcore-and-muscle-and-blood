// js/GameEngine.js

import { AssetEngine } from './engines/AssetEngine.js';
import { BattleEngine } from './engines/BattleEngine.js';
import { RenderEngine } from './engines/RenderEngine.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { RuleManager } from './managers/RuleManager.js';
import { SceneEngine } from './managers/SceneEngine.js';
import { LogicManager } from './managers/LogicManager.js';
import { UnitStatManager } from './managers/UnitStatManager.js';
import { GameDataManager } from './managers/GameDataManager.js';
import { GAME_EVENTS } from './constants.js'; // GAME_EVENTS 상수 임포트

export class GameEngine {
    constructor(canvasId) {
        console.log("⚙️ GameEngine initializing...");

        // 1. 핵심 동기 매니저 생성 (순서가 중요하지 않음)
        this.eventManager = new EventManager();
        this.measureManager = new MeasureManager();
        this.ruleManager = new RuleManager();

        // 2. 주요 엔진 생성
        this.assetEngine = new AssetEngine(this.eventManager);
        this.renderEngine = new RenderEngine(canvasId, this.eventManager, this.measureManager);
        this.battleEngine = new BattleEngine(this.eventManager, this.measureManager, this.assetEngine, this.renderEngine);

        // 3. 종속성을 가지는 나머지 매니저들 생성
        this.unitStatManager = new UnitStatManager(this.eventManager, this.battleEngine.getBattleSimulationManager());
        this.sceneEngine = new SceneEngine();
        this.logicManager = new LogicManager(this.measureManager, this.sceneEngine);

        // ✨ UIEngine이 HeroManager 기능을 활용할 수 있도록 연결
        this.renderEngine.uiEngine.heroManager = this.battleEngine.heroManager;
        
        // RenderEngine에 필요한 후반 종속성 주입
        this.renderEngine.injectDependencies(this.battleEngine.getBattleSimulationManager(), this.logicManager, this.sceneEngine);

        // 순환 참조 문제를 방지하기 위해 UIEngine 인스턴스를 ButtonEngine에도 전달
        this.renderEngine.inputManager.buttonEngine.uiEngine = this.renderEngine.uiEngine;

        // 4. 게임 루프 설정
        this.gameLoop = new GameLoop(this._update.bind(this), this._draw.bind(this));

        // 5. 비동기 초기화 실행
        this.initializeGame();
    }

    /**
     * 게임에 필요한 모든 비동기 작업을 순서대로 실행하는 초기화 매니저 역할의 함수.
     * 이 함수가 완료되어야만 게임이 시작됩니다.
     */
    async initializeGame() {
        try {
            console.log("--- Game Initialization Start ---");

        const idManager = this.assetEngine.getIdManager();

        // 단계 1: 데이터베이스 시스템 초기화
        console.log("Initialization Step 1: Initializing IdManager (DB)...");
        await idManager.initialize();
        // 디버그 환경에서 남아 있을 수 있는 이전 세션 데이터를 정리합니다.
        await idManager.clearAllData();
        console.log("✅ IdManager Initialized.");

            // 단계 2: 기본 게임 데이터 등록 (클래스, 아이템 등)
            console.log("Initialization Step 2: Registering base game data...");
            await GameDataManager.registerBaseClasses(idManager);
            console.log("✅ Base game data registered.");

            // 단계 3: 전투 엔진 설정 (유닛 생성 등)
            // 이 단계는 반드시 클래스 데이터가 등록된 후에 실행되어야 합니다.
            console.log("Initialization Step 3: Setting up battle units...");
            await this.battleEngine.setupBattle();
            console.log("✅ Battle setup complete.");
            
            // 단계 4 (예시): 다른 비동기 작업이 있다면 여기에 추가
            // await this.loadSoundAssets();

            console.log("--- ✅ All Initialization Steps Completed ---");

            // 모든 준비가 끝났으므로 게임 시작
            this.start();

        } catch (error) {
            console.error('Fatal Error: Game initialization failed.', error);
            // 사용자에게 오류를 알리는 UI를 표시할 수 있습니다.
        }
    }

    _update(deltaTime) {
        // 게임 루프는 초기화가 완료된 후 시작되므로 이 코드는 안전합니다.
        this.battleEngine.update(deltaTime);
        this.renderEngine.update(deltaTime);
    }

    _draw() {
        this.renderEngine.draw();
    }

    start() {
        console.log("🚀 Starting Game Loop!");
        this.gameLoop.start();
        // 전투 시작 신호를 여기서 보내거나, UI 버튼 클릭 등으로 시작할 수 있습니다.
        this.eventManager.emit(GAME_EVENTS.BATTLE_START, {});
    }

    // --- Getter helpers ---
    getEventManager() { return this.eventManager; }
    getMeasureManager() { return this.measureManager; }
    getRuleManager() { return this.ruleManager; }
    getSceneEngine() { return this.sceneEngine; }
    getLogicManager() { return this.logicManager; }
    getAssetEngine() { return this.assetEngine; }
    getRenderEngine() { return this.renderEngine; }
    getBattleEngine() { return this.battleEngine; }
    getUnitStatManager() { return this.unitStatManager; }
}
