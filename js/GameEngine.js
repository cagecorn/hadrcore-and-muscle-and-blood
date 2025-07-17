// js/GameEngine.js

import { AssetEngine } from './engines/AssetEngine.js';
import { BattleEngine } from './engines/BattleEngine.js';
import { RenderEngine } from './engines/RenderEngine.js';
import { GameLoop } from './GameLoop.js';
import { DependencyInjector } from './managers/DependencyInjector.js';
import { EventManager } from './managers/EventManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { RuleManager } from './managers/RuleManager.js';
import { SceneEngine } from './managers/SceneEngine.js';
import { LogicManager } from './managers/LogicManager.js';
import { GameDataManager } from './managers/GameDataManager.js';
import { GAME_EVENTS, UI_STATES } from './constants.js'; // UI_STATES 추가

// ◀◀◀ 추가된 내용: 영지, 전투 등 각 장면에 필요한 매니저들을 불러옵니다.
import { TerritoryManager } from './managers/TerritoryManager.js';
import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';
import { BattleLogManager } from './managers/BattleLogManager.js';
import { MercenaryPanelManager } from './managers/MercenaryPanelManager.js';
import { CompatibilityManager } from './managers/CompatibilityManager.js';

export class GameEngine {
    constructor(canvasId) {
        console.log("⚙️ GameEngine initializing...");

        // --- 1. ✨ 핵심 안전장치 생성 ---
        const injector = new DependencyInjector();
        this.injector = injector;

        // --- 2. 모든 관리자 생성 및 자동 등록 ---
        injector.register(new EventManager(injector));
        injector.register(new MeasureManager(injector));
        injector.register(new RuleManager(injector));
        injector.register(new SceneEngine(injector));
        injector.register(new LogicManager(injector));

        // 주요 매니저 참조 저장
        this.eventManager = injector.get('EventManager');
        this.measureManager = injector.get('MeasureManager');
        this.ruleManager = injector.get('RuleManager');
        this.sceneEngine = injector.get('SceneEngine');
        this.logicManager = injector.get('LogicManager');

        const mainCanvas = document.getElementById(canvasId);
        injector.register(new AssetEngine(injector));
        injector.register(new RenderEngine(mainCanvas, injector));
        injector.register(new BattleEngine(injector));

        this.assetEngine = injector.get('AssetEngine');
        this.renderEngine = injector.get('RenderEngine');
        this.battleEngine = injector.get('BattleEngine');

        // 장면 구성에 필요한 추가 매니저들 등록
        injector.register(new TerritoryManager());
        injector.register(new BattleStageManager(this.assetEngine.getAssetLoaderManager()));
        injector.register(new BattleGridManager(this.measureManager, this.logicManager));

        const battleSim = this.battleEngine.getBattleSimulationManager();
        this.mercenaryPanelManager = new MercenaryPanelManager(this.measureManager, battleSim, this.logicManager, this.eventManager);
        injector.register(this.mercenaryPanelManager);

        const combatLogCanvas = document.getElementById('combatLogCanvas');
        this.battleLogManager = new BattleLogManager(combatLogCanvas, this.eventManager, this.measureManager);
        injector.register(this.battleLogManager);

        this.compatibilityManager = new CompatibilityManager(
            this.measureManager,
            this.renderEngine.renderer,
            this.getUIEngine(),
            null,
            this.logicManager,
            this.mercenaryPanelManager,
            this.battleLogManager
        );
        injector.register(this.compatibilityManager);

        // --- 3. 게임 루프 설정 ---
        this.gameLoop = new GameLoop(this._update.bind(this), this._draw.bind(this));

        // --- 4. 비동기 초기화 실행 ---
        this.initializeGame();
    }

    // ◀◀◀ 추가된 내용: 장면과 렌더링 레이어를 설정하는 메서드
    _registerScenesAndLayers() {
        const battleSim = this.battleEngine.getBattleSimulationManager();
        const sceneEngine = this.sceneEngine;

        sceneEngine.registerScene('territoryScene', [this.injector.get('TerritoryManager')]);
        sceneEngine.registerScene('battleScene', [
            this.injector.get('BattleStageManager'),
            this.injector.get('BattleGridManager'),
            battleSim,
        ]);

        const layerEngine = this.renderEngine.getLayerEngine();
        layerEngine.registerLayer('sceneLayer', (ctx) => sceneEngine.draw(ctx), 10);
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
            const assetLoaderManager = this.assetEngine.getAssetLoaderManager();

            console.log("Initialization Step 1: Preloading essential assets...");
            const assetsToLoad = {
                'sprite_battle_stage_forest': 'assets/images/battle-stage-forest.png',
                'sprite_warrior_default': 'assets/images/warrior.png',
                'sprite_zombie_default': 'assets/images/zombie.png'
            };
            const assetPromises = [];
            for (const [id, path] of Object.entries(assetsToLoad)) {
                assetPromises.push(assetLoaderManager.loadImage(id, path));
            }
            await Promise.all(assetPromises);
            console.log("✅ Essential assets preloaded.");


            console.log("Initialization Step 2: Initializing IdManager (DB)...");
            await idManager.initialize();
            await idManager.clearAllData();
            console.log("✅ IdManager Initialized.");

            console.log("Initialization Step 3: Registering base game data...");
            await GameDataManager.registerBaseClasses(idManager);
            console.log("✅ Base game data registered.");

            console.log("Initialization Step 4: Setting up battle units...");
            await this.battleEngine.setupBattle();
            console.log("✅ Battle setup complete.");

            console.log("Initialization Step 5: Registering scenes and layers...");
            this._registerScenesAndLayers();

            this.battleLogManager._setupEventListeners();

            const eventManager = this.eventManager;
            const sceneEngine = this.sceneEngine;
            const renderEngine = this.renderEngine;

            eventManager.subscribe(GAME_EVENTS.BATTLE_START, () => {
                console.log("Battle Start event received by GameEngine. Changing scene...");
                sceneEngine.setCurrentScene('battleScene');
                renderEngine.uiEngine.setUIState(UI_STATES.COMBAT_SCREEN);
                this.battleEngine.startBattle();
            });

            sceneEngine.setCurrentScene('territoryScene');
            renderEngine.uiEngine.setUIState(UI_STATES.MAP_SCREEN);

            console.log("--- ✅ All Initialization Steps Completed ---");

            this.start();
        } catch (error) {
            console.error('Fatal Error: Game initialization failed.', error);
        }
    }

    _update(deltaTime) {
        const updateableServices = this.injector.getAllUpdateable();
        for (const service of updateableServices) {
            service.update(deltaTime);
        }
    }

    _draw() {
        const drawableServices = this.injector.getAllDrawable();
        this.renderEngine.draw();
        for (const service of drawableServices) {
            if (service !== this.renderEngine) {
                service.draw && service.draw();
            }
        }
    }

    start() {
        console.log("🚀 Starting Game Loop!");
        this.gameLoop.start();
    }

    // --- Getter helpers using the injector ---
    getEventManager() { return this.eventManager; }
    getMeasureManager() { return this.measureManager; }
    getRuleManager() { return this.ruleManager; }
    getSceneEngine() { return this.sceneEngine; }
    getLogicManager() { return this.logicManager; }
    getAssetEngine() { return this.assetEngine; }
    getRenderEngine() { return this.renderEngine; }
    getBattleEngine() { return this.battleEngine; }
    getTerritoryManager() { return this.injector.get('TerritoryManager'); }
    getBattleStageManager() { return this.injector.get('BattleStageManager'); }
    getBattleGridManager() { return this.injector.get('BattleGridManager'); }
    getBattleLogManager() { return this.battleLogManager; }
    getCompatibilityManager() { return this.compatibilityManager; }

    getInjector() { return this.injector; }

    // ◀◀◀ 추가된 내용: UIEngine에 직접 접근할 수 있는 getter
    getUIEngine() {
        return this.renderEngine.uiEngine;
    }

    // ◀◀◀ 추가된 내용: BattleSimulationManager에 쉽게 접근하기 위한 getter
    getBattleSimulationManager() {
        return this.battleEngine.getBattleSimulationManager();
    }
}
