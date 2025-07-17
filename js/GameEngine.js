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

        const mainCanvas = document.getElementById(canvasId);
        injector.register(new AssetEngine(injector));
        injector.register(new RenderEngine(mainCanvas, injector));
        injector.register(new BattleEngine(injector));

        // 장면 구성에 필요한 추가 매니저들 등록
        injector.register(new TerritoryManager());
        injector.register(new BattleStageManager(injector.get('AssetEngine').getAssetLoaderManager()));
        injector.register(new BattleGridManager(injector.get('MeasureManager'), injector.get('LogicManager')));

        const combatLogCanvas = document.getElementById('combatLogCanvas');
        injector.register(new BattleLogManager(combatLogCanvas, injector.get('EventManager'), injector.get('MeasureManager')));

        // --- 3. 게임 루프 설정 ---
        this.gameLoop = new GameLoop(this._update.bind(this), this._draw.bind(this));

        // --- 4. 비동기 초기화 실행 ---
        this.initializeGame();
    }

    // ◀◀◀ 추가된 내용: 장면과 렌더링 레이어를 설정하는 메서드
    _registerScenesAndLayers() {
        const battleSim = this.injector.get('BattleEngine').getBattleSimulationManager();
        const sceneEngine = this.injector.get('SceneEngine');

        sceneEngine.registerScene('territoryScene', [this.injector.get('TerritoryManager')]);
        sceneEngine.registerScene('battleScene', [
            this.injector.get('BattleStageManager'),
            this.injector.get('BattleGridManager'),
            battleSim,
        ]);

        const layerEngine = this.injector.get('RenderEngine').getLayerEngine();
        layerEngine.registerLayer('sceneLayer', (ctx) => sceneEngine.draw(ctx), 10);
        layerEngine.registerLayer('battleLogLayer', (ctx) => this.injector.get('BattleLogManager').draw(ctx), 50);
        layerEngine.registerLayer('uiLayer', (ctx) => this.injector.get('RenderEngine').uiEngine.draw(ctx), 100);
    }

    /**
     * 게임에 필요한 모든 비동기 작업을 순서대로 실행하는 초기화 매니저 역할의 함수.
     * 이 함수가 완료되어야만 게임이 시작됩니다.
     */
    async initializeGame() {
        try {
            console.log("--- Game Initialization Start ---");

            const idManager = this.injector.get('AssetEngine').getIdManager();
            await idManager.initialize();
            await idManager.clearAllData();

            await GameDataManager.registerBaseClasses(idManager);

            await this.injector.get('BattleEngine').setupBattle();

            this.injector.get('BattleLogManager')._setupEventListeners();

            this._registerScenesAndLayers();

            const eventManager = this.injector.get('EventManager');
            const sceneEngine = this.injector.get('SceneEngine');
            const renderEngine = this.injector.get('RenderEngine');

            eventManager.subscribe(GAME_EVENTS.BATTLE_START, () => {
                console.log("Battle Start event received by GameEngine. Changing scene...");
                sceneEngine.setCurrentScene('battleScene');
                renderEngine.uiEngine.setUIState(UI_STATES.COMBAT_SCREEN);
                this.injector.get('BattleEngine').startBattle();
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
        this.injector.get('RenderEngine').draw();
        for (const service of drawableServices) {
            if (service !== this.injector.get('RenderEngine')) {
                service.draw && service.draw();
            }
        }
    }

    start() {
        console.log("🚀 Starting Game Loop!");
        this.gameLoop.start();
    }

    // --- Getter helpers using the injector ---
    getEventManager() { return this.injector.get('EventManager'); }
    getMeasureManager() { return this.injector.get('MeasureManager'); }
    getRuleManager() { return this.injector.get('RuleManager'); }
    getSceneEngine() { return this.injector.get('SceneEngine'); }
    getLogicManager() { return this.injector.get('LogicManager'); }
    getAssetEngine() { return this.injector.get('AssetEngine'); }
    getRenderEngine() { return this.injector.get('RenderEngine'); }
    getBattleEngine() { return this.injector.get('BattleEngine'); }
    getTerritoryManager() { return this.injector.get('TerritoryManager'); }
    getBattleStageManager() { return this.injector.get('BattleStageManager'); }
    getBattleGridManager() { return this.injector.get('BattleGridManager'); }
    getBattleLogManager() { return this.injector.get('BattleLogManager'); }

    getInjector() { return this.injector; }

    // ◀◀◀ 추가된 내용: UIEngine에 직접 접근할 수 있는 getter
    getUIEngine() {
        return this.injector.get('RenderEngine').uiEngine;
    }

    // ◀◀◀ 추가된 내용: BattleSimulationManager에 쉽게 접근하기 위한 getter
    getBattleSimulationManager() {
        return this.injector.get('BattleEngine').getBattleSimulationManager();
    }
}
