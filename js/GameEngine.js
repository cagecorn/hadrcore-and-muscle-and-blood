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
import { GAME_EVENTS, UI_STATES } from './constants.js'; // UI_STATES 추가

// ◀◀◀ 추가된 내용: 영지, 전투 등 각 장면에 필요한 매니저들을 불러옵니다.
import { TerritoryManager } from './managers/TerritoryManager.js';
import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';
import { MercenaryPanelManager } from './managers/MercenaryPanelManager.js';
import { BattleLogManager } from './managers/BattleLogManager.js';
import { CompatibilityManager } from './managers/CompatibilityManager.js';
import { DetailInfoManager } from './managers/DetailInfoManager.js';
import { PassiveIconManager } from './managers/PassiveIconManager.js';
import { ReactionSkillManager } from './managers/ReactionSkillManager.js';
import { ShadowEngine } from './managers/ShadowEngine.js';
import { StatusIconManager } from './managers/StatusIconManager.js';
import { VFXManager } from './managers/VFXManager.js';
import { DisarmManager } from './managers/DisarmManager.js';
import { PassiveSkillManager } from './managers/PassiveSkillManager.js';
import { UnitActionManager } from './managers/UnitActionManager.js';

export class GameEngine {
    constructor(canvasId) {
        console.log("⚙️ GameEngine initializing...");

        // 1. 핵심 동기 매니저 생성
        this.eventManager = new EventManager();
        this.measureManager = new MeasureManager();
        this.ruleManager = new RuleManager();
        this.sceneEngine = new SceneEngine(); // ✨ SceneEngine을 더 일찍 생성합니다.
        this.logicManager = new LogicManager(this.measureManager, this.sceneEngine);

        // 2. 주요 엔진 생성
        const mainCanvas = document.getElementById(canvasId); // ✨ 캔버스 요소를 가져옵니다.
        this.assetEngine = new AssetEngine(this.eventManager);
        this.renderEngine = new RenderEngine(mainCanvas, this.eventManager, this.measureManager, this.logicManager, this.sceneEngine); // ✨ 의존성 주입
        this.battleEngine = new BattleEngine(this.eventManager, this.measureManager, this.assetEngine, this.renderEngine);

        // 3. 종속성을 가지는 나머지 매니저들 생성
        this.unitStatManager = new UnitStatManager(this.eventManager, this.battleEngine.getBattleSimulationManager());

        // ◀◀◀ 추가된 내용: UI 및 다른 매니저들을 여기서 직접 생성합니다.
        this.territoryManager = new TerritoryManager();
        this.battleStageManager = new BattleStageManager(this.assetEngine.getAssetLoaderManager());
        this.battleGridManager = new BattleGridManager(this.measureManager, this.logicManager);

        // RenderEngine에 필요한 후반 종속성 주입
        this.renderEngine.injectDependencies(this.getBattleSimulationManager(), this.battleEngine.heroManager);

        // ✨ MercenaryPanelManager 생성 및 UIEngine에 주입
        const battleSim = this.getBattleSimulationManager();
        this.mercenaryPanelManager = new MercenaryPanelManager(this.measureManager, battleSim, this.logicManager, this.eventManager);
        this.getUIEngine().mercenaryPanelManager = this.mercenaryPanelManager;

        // ✨ BattleLogManager 생성 및 이벤트 리스너 설정
        const combatLogCanvas = document.getElementById('combatLogCanvas');
        this.battleLogManager = new BattleLogManager(combatLogCanvas, this.eventManager, this.measureManager);
        this.battleLogManager._setupEventListeners();

        // ✨ CompatibilityManager 생성
        this.compatibilityManager = new CompatibilityManager(
            this.measureManager,
            this.renderEngine.renderer,
            this.getUIEngine(),
            null,
            this.logicManager,
            this.mercenaryPanelManager,
            this.battleLogManager
        );

        // 4. 게임 루프 설정
        this.gameLoop = new GameLoop(this._update.bind(this), this._draw.bind(this));

        // 5. 비동기 초기화 실행
        this.initializeGame();
    }

    // ◀◀◀ 추가된 내용: 장면과 렌더링 레이어를 설정하는 메서드
    _registerScenesAndLayers() {
        const battleSim = this.getBattleSimulationManager();

        // 각 장면에 필요한 매니저들을 배열로 묶어 등록합니다.
        this.sceneEngine.registerScene('territoryScene', [this.territoryManager]);
        this.sceneEngine.registerScene('battleScene', [
            this.battleStageManager,
            this.battleGridManager,
            this.battleEngine.getBattleSimulationManager(),
        ]);

        // 렌더링 레이어를 zIndex 순서대로 등록합니다.
        const layerEngine = this.renderEngine.getLayerEngine();
        layerEngine.registerLayer('sceneLayer', (ctx) => this.sceneEngine.draw(ctx), 10);
        // ✨ 전투 로그와 UI 레이어를 추가로 등록
        layerEngine.registerLayer('battleLogLayer', (ctx) => this.battleLogManager.draw(ctx), 50);
        layerEngine.registerLayer('uiLayer', (ctx) => this.getUIEngine().draw(ctx), 100);
    }

    /**
     * 게임에 필요한 모든 비동기 작업을 순서대로 실행하는 초기화 매니저 역할의 함수.
     * 이 함수가 완료되어야만 게임이 시작됩니다.
     */
    async initializeGame() {
        try {
            console.log("--- Game Initialization Start ---");

            const idManager = this.assetEngine.getIdManager();

            console.log("Initialization Step 1: Initializing IdManager (DB)...");
            await idManager.initialize();
            await idManager.clearAllData();
            console.log("✅ IdManager Initialized.");

            // 단계 2: 기본 게임 데이터 등록 (클래스, 아이템 등)
            console.log("Initialization Step 2: Registering base game data...");
            await GameDataManager.registerBaseClasses(idManager);
            console.log("✅ Base game data registered.");

            console.log("Initialization Step 3: Setting up battle units...");
            await this.battleEngine.setupBattle();
            console.log("✅ Battle setup complete.");

            // ◀◀◀ 추가된 내용: 장면과 레이어를 등록하고 초기 장면을 설정합니다.
            console.log("Initialization Step 4: Registering scenes and layers...");
            this._registerScenesAndLayers();

            // ✨ BATTLE_START 이벤트 리스너 등록
            this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, () => {
                console.log("Battle Start event received by GameEngine. Changing scene...");
                this.sceneEngine.setCurrentScene('battleScene');
                this.getUIEngine().setUIState(UI_STATES.COMBAT_SCREEN);
                this.battleEngine.startBattle();
            });

            this.sceneEngine.setCurrentScene('territoryScene');
            this.getUIEngine().setUIState(UI_STATES.MAP_SCREEN);
            console.log("✅ Scenes and layers registered. Initial scene set to 'territoryScene'.");

            console.log("--- ✅ All Initialization Steps Completed ---");

            this.start();

        } catch (error) {
            console.error('Fatal Error: Game initialization failed.', error);
            // 사용자에게 오류를 알리는 UI를 표시할 수 있습니다.
        }
    }

    _update(deltaTime) {
        // ✨ 현재 활성화된 Scene의 매니저들만 업데이트하도록 변경
        this.sceneEngine.update(deltaTime);
        this.renderEngine.update(deltaTime);
        this.battleEngine.update(deltaTime);
        this.getUIEngine().update(deltaTime); // UI도 업데이트
    }

    _draw() {
        this.renderEngine.draw();
    }

    start() {
        console.log("🚀 Starting Game Loop!");
        this.gameLoop.start();
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

    // ◀◀◀ 추가된 내용: UIEngine에 직접 접근할 수 있는 getter
    getUIEngine() {
        return this.renderEngine.uiEngine;
    }

    // ◀◀◀ 추가된 내용: BattleSimulationManager에 쉽게 접근하기 위한 getter
    getBattleSimulationManager() {
        return this.battleEngine.getBattleSimulationManager();
    }
}
