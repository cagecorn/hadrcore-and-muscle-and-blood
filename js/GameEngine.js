// js/GameEngine.js
import { Renderer } from './Renderer.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { GuardianManager } from './managers/GuardianManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { MapManager } from './managers/MapManager.js';
import { UIEngine } from './managers/UIEngine.js';
import { LayerEngine } from './managers/LayerEngine.js';
import { SceneEngine } from './managers/SceneEngine.js';
import { CameraEngine } from './managers/CameraEngine.js';
import { InputManager } from './managers/InputManager.js';
import { LogicManager } from './managers/LogicManager.js';
import { CompatibilityManager } from './managers/CompatibilityManager.js';
import { IdManager } from './managers/IdManager.js';
import { AssetLoaderManager } from './managers/AssetLoaderManager.js';
import { BattleSimulationManager } from './managers/BattleSimulationManager.js';
import { AnimationManager } from './managers/AnimationManager.js';
import { VFXManager } from './managers/VFXManager.js';
import { ParticleEngine } from './managers/ParticleEngine.js'; // ✨ ParticleEngine 임포트
import { ShadowEngine } from './managers/ShadowEngine.js'; // ✨ ShadowEngine 추가
import { MovingManager } from './managers/MovingManager.js'; // ✨ MovingManager 추가
import { DisarmManager } from './managers/DisarmManager.js'; // ✨ DisarmManager 임포트
import { CanvasBridgeManager } from './managers/CanvasBridgeManager.js'; // ✨ CanvasBridgeManager 추가
import { SkillIconManager } from './managers/SkillIconManager.js'; // ✨ SkillIconManager 추가
import { StatusIconManager } from './managers/StatusIconManager.js'; // ✨ StatusIconManager 추가
import { BindingManager } from './managers/BindingManager.js';
import { BattleCalculationManager } from './managers/BattleCalculationManager.js';
import { MercenaryPanelManager } from './managers/MercenaryPanelManager.js'; // ✨ MercenaryPanelManager 추가
import { PanelEngine } from './managers/PanelEngine.js'; // ✨ PanelEngine 추가
import { RuleManager } from './managers/RuleManager.js'; // ✨ RuleManager 추가

import { TurnEngine } from './managers/TurnEngine.js'; // ✨ TurnEngine 추가
import { DelayEngine } from './managers/DelayEngine.js'; // ✨ DelayEngine 추가
import { TimingEngine } from './managers/TimingEngine.js'; // ✨ TimingEngine 추가
import { BattleLogManager } from './managers/BattleLogManager.js'; // ✨ 새롭게 추가
import { TurnOrderManager } from './managers/TurnOrderManager.js'; // ✨ 새롭게 추가
import { ClassAIManager } from './managers/ClassAIManager.js';   // ✨ 새롭게 추가
import { BasicAIManager } from './managers/BasicAIManager.js'; // ✨ 새롭게 추가
import { TargetingManager } from './managers/TargetingManager.js'; // ✨ TargetingManager 추가
import { PositionManager } from './managers/PositionManager.js'; // ✨ PositionManager 추가
import { JudgementManager } from './managers/JudgementManager.js'; // JudgementManager 임포트
import { ValorEngine } from './managers/ValorEngine.js';   // ✨ ValorEngine 추가
import { WeightEngine } from './managers/WeightEngine.js'; // ✨ WeightEngine 추가
import { StatManager } from './managers/StatManager.js'; // ✨ StatManager 추가
import { DiceEngine } from './managers/DiceEngine.js';
import { DiceRollManager } from './managers/DiceRollManager.js';
import { DiceBotEngine } from './managers/DiceBotEngine.js';
import { TurnCountManager } from './managers/TurnCountManager.js';
import { StatusEffectManager } from './managers/StatusEffectManager.js';
import { WorkflowManager } from './managers/WorkflowManager.js';
import { HeroEngine } from "./managers/HeroEngine.js"; // HeroEngine 추가
import { MicrocosmHeroEngine } from './managers/MicrocosmHeroEngine.js'; // ✨ microcosm hero engine
import { HeroManager } from './managers/HeroManager.js'; // ✨ HeroManager import
import { BirthReportManager } from './managers/BirthReportManager.js';
import { SynergyEngine } from './managers/SynergyEngine.js'; // ✨ SynergyEngine 추가
import { STATUS_EFFECTS } from '../data/statusEffects.js';

import { TerritoryManager } from './managers/TerritoryManager.js';
import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';
import { CoordinateManager } from './managers/CoordinateManager.js';
import { ButtonEngine } from './managers/ButtonEngine.js'; // ✨ ButtonEngine 임포트
import { DetailInfoManager } from './managers/DetailInfoManager.js'; // ✨ DetailInfoManager 추가
import { TagManager } from './managers/TagManager.js'; // ✨ TagManager 추가
import { WarriorSkillsAI } from './managers/warriorSkillsAI.js'; // ✨ WarriorSkillsAI 추가
import { UnitSpriteEngine } from './managers/UnitSpriteEngine.js';
import { UnitActionManager } from './managers/UnitActionManager.js';
import { PassiveSkillManager } from './managers/PassiveSkillManager.js';
import { ReactionSkillManager } from './managers/ReactionSkillManager.js'; // ✨ ReactionSkillManager import
import { ConditionalManager } from './managers/ConditionalManager.js';
import { PassiveIconManager } from './managers/PassiveIconManager.js';
import { BattleFormationManager } from './managers/BattleFormationManager.js';
import { MonsterSpawnManager } from './managers/MonsterSpawnManager.js';
import { UnitStatManager } from './managers/UnitStatManager.js';
import { StageDataManager } from './managers/StageDataManager.js';
import { RangeManager } from './managers/RangeManager.js';
import { MonsterEngine } from './managers/MonsterEngine.js';
import { MonsterAI } from './managers/MonsterAI.js';

// ✨ 상수 파일 임포트
import { GAME_EVENTS, UI_STATES, BUTTON_IDS, ATTACK_TYPES, GAME_DEBUG_MODE } from './constants.js';

import { UNITS } from '../data/unit.js';
import { CLASSES } from '../data/class.js';
import { WARRIOR_SKILLS } from '../data/warriorSkills.js';

export class GameEngine {
    constructor(canvasId) {
        if (GAME_DEBUG_MODE) console.log("\u2699\ufe0f GameEngine initializing... \u2699\ufe0f");

        // ------------------------------------------------------------------
        // 1. Core Systems & Fundamental Managers
        // ------------------------------------------------------------------
        this.renderer = new Renderer(canvasId);
        if (!this.renderer.canvas) {
            console.error("GameEngine: Failed to initialize Renderer. Game cannot proceed.");
            throw new Error("Renderer initialization failed.");
        }

        this.eventManager = new EventManager();
        // ✨ CRITICAL_ERROR 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.CRITICAL_ERROR, this._handleCriticalError.bind(this));
        // JudgementManager는 EventManager 이후 초기화
        this.judgementManager = new JudgementManager(this.eventManager);

        this.guardianManager = new GuardianManager();
        this.measureManager = new MeasureManager();
        this.ruleManager = new RuleManager();

        // ------------------------------------------------------------------
        // 2. Scene & Logic Managers
        // ------------------------------------------------------------------
        this.sceneEngine = new SceneEngine();
        this.logicManager = new LogicManager(this.measureManager, this.sceneEngine);

        // ------------------------------------------------------------------
        // 3. ID & Asset Loading
        // ------------------------------------------------------------------
        this.idManager = new IdManager();
        this.assetLoaderManager = new AssetLoaderManager();
        this.assetLoaderManager.setEventManager(this.eventManager);

        // ✨ SkillIconManager 초기화
        this.skillIconManager = new SkillIconManager(this.assetLoaderManager, this.idManager);

        // ✨ 에셋 로딩 진행 상황 구독
        this.eventManager.subscribe(GAME_EVENTS.ASSET_LOAD_PROGRESS, (data) => {
            if (GAME_DEBUG_MODE) console.log(`[GameEngine] Assets loading: ${data.loaded}/${data.total} (${(data.loaded / data.total * 100).toFixed(1)}%)`);
        });
        this.eventManager.subscribe(GAME_EVENTS.ASSETS_LOADED, () => {
            if (GAME_DEBUG_MODE) console.log("[GameEngine] All initial assets are loaded! Game ready.");
        });

        // ------------------------------------------------------------------
        // 4. Core Game Mechanics Engines
        // ------------------------------------------------------------------
        this.valorEngine = new ValorEngine();
        this.weightEngine = new WeightEngine();
        this.statManager = new StatManager(this.valorEngine, this.weightEngine);

        this.diceEngine = new DiceEngine();
        this.diceBotEngine = new DiceBotEngine(this.diceEngine);

        // ------------------------------------------------------------------
        // 5. Battle Simulation & Related Managers
        // ------------------------------------------------------------------
        // 순환 의존성 해결을 위한 초기화 순서 조정
        // 1. BattleSimulationManager 초기화 (animationManager는 나중에 설정)
        this.battleSimulationManager = new BattleSimulationManager(
            this.measureManager,
            this.assetLoaderManager,
            this.idManager,
            this.logicManager,
            null,
            this.valorEngine
        );

        // Managers that rely on BattleSimulationManager
        this.unitStatManager = new UnitStatManager(this.battleSimulationManager);
        this.stageDataManager = new StageDataManager();
        this.rangeManager = new RangeManager(this.battleSimulationManager);

        // 2. CameraEngine 초기화 (ParticleEngine에서 사용)
        this.cameraEngine = new CameraEngine(this.renderer, this.logicManager, this.sceneEngine);

        // 3. ParticleEngine 초기화 (battleSimulationManager와 cameraEngine 의존)
        this.particleEngine = new ParticleEngine(
            this.measureManager,
            this.cameraEngine,
            this.battleSimulationManager
        );

        // 4. AnimationManager 초기화 (particleEngine 의존, battleSimulationManager는 나중에 설정)
        this.animationManager = new AnimationManager(
            this.measureManager,
            null,
            this.particleEngine
        );

        // 5. 순환 의존성 해결: 상호 참조 설정
        this.battleSimulationManager.animationManager = this.animationManager;
        this.animationManager.battleSimulationManager = this.battleSimulationManager;

        // === 순환 의존성 조정 끝 ===

        // ShadowEngine 초기화 (animationManager가 준비된 후)
        this.shadowEngine = new ShadowEngine(
            this.battleSimulationManager,
            this.animationManager,
            this.measureManager
        );

        // ------------------------------------------------------------------
        // 6. UI, Input, Log & Other Managers
        // ------------------------------------------------------------------
        // MercenaryPanelManager는 별도 캔버스를 사용하지 않고 UIEngine을 통해 그려집니다.
        this.mercenaryPanelManager = new MercenaryPanelManager(
            this.measureManager,
            this.battleSimulationManager,
            this.logicManager,
            this.eventManager
        );

        // ✨ 클릭 가능한 UI 버튼을 관리하는 ButtonEngine 초기화
        this.buttonEngine = new ButtonEngine();

        const combatLogCanvasElement = document.getElementById('combatLogCanvas');
        if (!combatLogCanvasElement) {
            console.error("GameEngine: Combat Log Canvas not found. Game cannot proceed without it.");
            throw new Error("Combat Log Canvas initialization failed.");
        }
        this.battleLogManager = new BattleLogManager(
            combatLogCanvasElement,
            this.eventManager,
            this.measureManager
        );
        // 이벤트 리스너는 명시적으로 설정
        this.battleLogManager._setupEventListeners();

        // PanelEngine 초기화 및 패널 등록
        this.panelEngine = new PanelEngine();
        // mercenaryPanel은 이제 메인 캔버스 위에 UIEngine이 직접 그릴 것이므로 PanelEngine에 등록하지 않습니다.
        this.panelEngine.registerPanel('combatLog', this.battleLogManager);

        // UIEngine과 MapManager를 먼저 초기화
        this.mapManager = new MapManager(this.measureManager);
        // UIEngine 초기화 시 mercenaryPanelManager와 buttonEngine을 함께 전달
        this.uiEngine = new UIEngine(this.renderer, this.measureManager, this.eventManager, this.mercenaryPanelManager, this.buttonEngine);

        // CompatibilityManager 초기화 (필요 매니저들을 모두 전달)
        this.compatibilityManager = new CompatibilityManager(
            this.measureManager,
            this.renderer,
            this.uiEngine,
            this.mapManager,
            this.logicManager,
            null, // mercenaryPanelManager는 이제 별도 캔버스를 갖지 않으므로 null로 전달
            this.battleLogManager
        );

        // ✨ InputManager 초기화 시 buttonEngine과 eventManager를 함께 전달
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine, this.buttonEngine, this.eventManager);

        const mainGameCanvasElement = document.getElementById(canvasId);
        this.canvasBridgeManager = new CanvasBridgeManager(
            mainGameCanvasElement,
            null, // mercenaryPanelCanvasElement는 이제 없습니다.
            combatLogCanvasElement,
            this.eventManager,
            this.measureManager
        );

        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine);

        this.territoryManager = new TerritoryManager();
        this.battleStageManager = new BattleStageManager(this.assetLoaderManager); // ✨ assetLoaderManager 전달
        this.battleGridManager = new BattleGridManager(this.measureManager, this.logicManager);
        // ✨ CoordinateManager 초기화 - BattleSimulationManager 후
        this.coordinateManager = new CoordinateManager(this.battleSimulationManager, this.battleGridManager);

        // ------------------------------------------------------------------
        // 7. Visual Effects & Rendering Helpers
        // ------------------------------------------------------------------
        // VFXManager에 AnimationManager와 ParticleEngine을 전달하여 HP 바 위치를 애니메이션과 동기화합니다.
        this.vfxManager = new VFXManager(
            this.renderer,
            this.measureManager,
            this.cameraEngine,
            this.battleSimulationManager,
            this.animationManager,
            this.eventManager,
            this.particleEngine
        );

        this.bindingManager = new BindingManager();

        // ------------------------------------------------------------------
        // 8. Timing & Movement Engines
        // ------------------------------------------------------------------
        this.delayEngine = new DelayEngine();
        this.timingEngine = new TimingEngine(this.delayEngine);

        // ✨ MovingManager 초기화 - delayEngine이 준비된 이후
        this.movingManager = new MovingManager(
            this.battleSimulationManager,
            this.animationManager,
            this.delayEngine,
            this.coordinateManager
        );

        // ------------------------------------------------------------------
        // 9. Game Content & Feature Engines
        // ------------------------------------------------------------------
        // ✨ 9-1. Microcosm Hero Engine
        this.microcosmHeroEngine = new MicrocosmHeroEngine(this.idManager);

        // HeroEngine 초기화
        this.heroEngine = new HeroEngine(
            this.idManager,
            this.assetLoaderManager,
            this.diceEngine,
            this.diceBotEngine,
            this.microcosmHeroEngine
        );

        // ✨ SynergyEngine 초기화
        this.synergyEngine = new SynergyEngine(this.idManager, this.eventManager);

        // ------------------------------------------------------------------
        // 10. Detail & Shadow Engines
        // ------------------------------------------------------------------
        // ✨ DetailInfoManager 초기화
        this.detailInfoManager = new DetailInfoManager(
            this.eventManager,
            this.measureManager,
            this.battleSimulationManager,
            this.heroEngine,
            this.idManager,
            this.cameraEngine,
            this.skillIconManager
        );

        // ✨ TagManager 초기화
        this.tagManager = new TagManager(this.idManager);

        // ------------------------------------------------------------------
        // 11. Conditional Manager
        // ------------------------------------------------------------------
        this.conditionalManager = new ConditionalManager(this.battleSimulationManager, this.idManager);

        // ------------------------------------------------------------------
        // 12. Combat Flow & AI Managers
        // ------------------------------------------------------------------
        // BattleCalculationManager는 DiceRollManager를 나중에 주입합니다.
        this.battleCalculationManager = new BattleCalculationManager(
            this.eventManager,
            this.battleSimulationManager,
            null,
            this.delayEngine,
            this.conditionalManager,
            this.unitStatManager
        );

        // Status effect 관련 매니저 초기화
        this.turnCountManager = new TurnCountManager();
        this.statusEffectManager = new StatusEffectManager(
            this.eventManager,
            this.idManager,
            this.turnCountManager,
            this.battleCalculationManager
        );

        // 이제 StatusEffectManager가 준비되었으므로 DiceRollManager를 생성
        this.diceRollManager = new DiceRollManager(this.diceEngine, this.valorEngine, this.statusEffectManager);
        this.battleCalculationManager.diceRollManager = this.diceRollManager;
        this.workflowManager = new WorkflowManager(
            this.eventManager,
            this.statusEffectManager,
            this.battleSimulationManager
        );

        // ✨ StatusIconManager 초기화
        this.statusIconManager = new StatusIconManager(
            this.skillIconManager,
            this.battleSimulationManager,
            this.bindingManager,
            this.measureManager,
            this.turnCountManager
        );

        // ✨ DisarmManager 초기화 (StatusEffectManager가 먼저 초기화되어야 함)
        this.disarmManager = new DisarmManager(
            this.eventManager,
            this.statusEffectManager,
            this.battleSimulationManager,
            this.measureManager
        );

        // ✨ 신규 매니저들 초기화 (BattleSimulationManager 이후에)
        this.targetingManager = new TargetingManager(this.battleSimulationManager);
        this.positionManager = new PositionManager(this.battleSimulationManager);

        // ✨ BasicAIManager에 신규 매니저들 주입
        this.basicAIManager = new BasicAIManager(this.targetingManager, this.positionManager);

        // Monster-related managers
        this.monsterAI = new MonsterAI(this.basicAIManager);
        this.monsterEngine = new MonsterEngine(this.monsterAI);

        // AI 와 턴 진행 관련 매니저들
        this.turnOrderManager = new TurnOrderManager(
            this.eventManager,
            this.battleSimulationManager,
            this.weightEngine // ✨ weightEngine 추가
        );

        // ✨ WarriorSkillsAI를 먼저 생성하여 ClassAIManager에 주입
        const commonManagersForSkills = {
            battleSimulationManager: this.battleSimulationManager,
            battleCalculationManager: this.battleCalculationManager,
            eventManager: this.eventManager,
            delayEngine: this.delayEngine,
            statusEffectManager: this.statusEffectManager,
            coordinateManager: this.coordinateManager,
            targetingManager: this.targetingManager,
            vfxManager: this.vfxManager,
            diceEngine: this.diceEngine,
            workflowManager: this.workflowManager,
            animationManager: this.animationManager,
            measureManager: this.measureManager,
            idManager: this.idManager,
            movingManager: this.movingManager
        };
        this.warriorSkillsAI = new WarriorSkillsAI(commonManagersForSkills);

        // ClassAIManager에 추가 매니저 전달
        this.classAIManager = new ClassAIManager(
            this.idManager,
            this.battleSimulationManager,
            this.measureManager,
            this.basicAIManager,
            this.warriorSkillsAI,
            this.diceEngine,
            this.targetingManager,
            this.diceBotEngine,
            this.monsterAI
        );

        // ✨ TurnEngine에 새로운 의존성 전달
        this.turnEngine = new TurnEngine(
            this.eventManager,
            this.battleSimulationManager,
            this.turnOrderManager,
            this.microcosmHeroEngine,
            this.classAIManager,
            this.delayEngine,
            this.timingEngine,
            this.animationManager,
            this.battleCalculationManager,
            this.statusEffectManager,
            this.rangeManager
        );

        // ------------------------------------------------------------------
        // 12. Sprite & Action Managers
        // ------------------------------------------------------------------
        this.unitSpriteEngine = new UnitSpriteEngine(this.assetLoaderManager, this.battleSimulationManager);
        this.unitActionManager = new UnitActionManager(
            this.eventManager,
            this.unitSpriteEngine,
            this.delayEngine,
            this.battleSimulationManager
        );
        this.passiveSkillManager = new PassiveSkillManager(
            this.eventManager,
            this.idManager,
            this.diceEngine,
            this.battleSimulationManager,
            this.workflowManager
        );
        this.reactionSkillManager = new ReactionSkillManager(
            this.eventManager,
            this.idManager,
            this.diceEngine,
            this.battleSimulationManager,
            this.battleCalculationManager,
            this.delayEngine
        );

        // HeroManager는 UnitSpriteEngine이 준비된 이후 생성한다
        this.birthReportManager = new BirthReportManager();
        this.heroManager = new HeroManager(
            this.idManager,
            this.diceEngine,
            this.assetLoaderManager,
            this.battleSimulationManager,
            this.unitSpriteEngine,
            this.diceBotEngine,
            this.birthReportManager
        );

        this.battleFormationManager = new BattleFormationManager(this.battleSimulationManager);
        this.monsterSpawnManager = new MonsterSpawnManager(this.idManager, this.assetLoaderManager, this.battleSimulationManager, this.stageDataManager);

        // ------------------------------------------------------------------
        // 13. Conditional & Passive Visual Managers
        // ------------------------------------------------------------------
        this.passiveIconManager = new PassiveIconManager(this.battleSimulationManager, this.idManager, this.skillIconManager);

        // ------------------------------------------------------------------
        // 13. Scene Registrations & Layer Engine Setup
        // ------------------------------------------------------------------
        // ✨ sceneEngine에 UI_STATES 상수 사용
        this.sceneEngine.registerScene(UI_STATES.MAP_SCREEN, [this.territoryManager]);
        this.sceneEngine.registerScene(UI_STATES.COMBAT_SCREEN, [
            this.battleStageManager,    // 배경 그리기
            this.battleGridManager,     // 그리드 그리기
            (ctx) => { this.shadowEngine.draw(ctx); }, // ✨ 그림자 그리기 (배경/그리드 위, 유닛 아래)
            this.battleSimulationManager, // 유닛 그리기
            this.vfxManager             // VFX 그리기 (HP 바, 데미지 숫자 등)
        ]);

        // ✨ sceneEngine 초기 상태 설정에 UI_STATES 상수 사용
        this.sceneEngine.setCurrentScene(UI_STATES.MAP_SCREEN);

        this.layerEngine.registerLayer('sceneLayer', (ctx) => {
            this.renderer.ctx.save();
            this.cameraEngine.applyTransform(this.renderer.ctx); // 카메라 변환 적용
            this.sceneEngine.draw(ctx);

            // ✨ 같은 변환을 사용하는 레이어들을 여기에 추가
            this.statusIconManager.draw(ctx);
            this.passiveIconManager.draw(ctx);

            this.renderer.ctx.restore();
        }, 10);

        // 개별 레이어 등록 제거
        // this.layerEngine.registerLayer('statusIconLayer', ...);
        // this.layerEngine.registerLayer('passiveIconLayer', ...);

        this.layerEngine.registerLayer('uiLayer', (ctx) => {
            this.uiEngine.draw(ctx);
        }, 100);

        // ✨ DetailInfoManager의 draw 메서드를 별도의 레이어로 등록 (가장 위에 오도록 높은 Z-Index)
        this.layerEngine.registerLayer('detailInfoLayer', (ctx) => {
            this.detailInfoManager.draw(ctx);
        }, 200); // 100보다 높게 설정


        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);

        this.gameLoop = new GameLoop(this._update, this._draw);

        // ✨ _initAsyncManagers에서 로드할 총 에셋 및 데이터 수를 수동으로 계산
        const expectedDataAndAssetCount = 9 + Object.keys(WARRIOR_SKILLS).length + 5 + 5 + 4; // 9(기존) + 5(워리어 스킬) + 5(기본 상태 아이콘) + 5(워리어 스킬 아이콘) + 4(전사 상태 스프라이트)
        this.assetLoaderManager.setTotalAssetsToLoad(expectedDataAndAssetCount);

        // 초기화 과정의 비동기 처리
        this._initAsyncManagers().then(() => {
            const initialGameData = {
                units: [
                    { id: 'u1', name: 'Knight', hp: 100 },
                    { id: 'u2', name: 'Archer', hp: 70 }
                ],
                config: {
                    resolution: this.measureManager.get('gameResolution'),
                    difficulty: 'normal'
                }
            };

            try {
                this.guardianManager.enforceRules(initialGameData);
                if (GAME_DEBUG_MODE) console.log("[GameEngine] Initial game data passed GuardianManager rules. \u2728");
            } catch (e) {
                if (e.name === "ImmutableRuleViolationError") {
                    console.error("[GameEngine] CRITICAL ERROR: Game initialization failed due to immutable rule violation!", e.message);
                    throw e;
                } else {
                    console.error("[GameEngine] An unexpected error occurred during rule enforcement:", e);
                    throw e;
                }
            }

            // 초기 카메라 위치와 줌을 설정하여 모든 콘텐츠가 화면에 들어오도록 합니다.
            this.cameraEngine.reset();
            // ✨ 추가: 카메라 엔진의 초기 상태 확인
            if (GAME_DEBUG_MODE) console.log(`[GameEngine Debug] Camera Initial State: X=${this.cameraEngine.x}, Y=${this.cameraEngine.y}, Zoom=${this.cameraEngine.zoom}`);

            // ✨ 이벤트 구독에 GAME_EVENTS 상수 사용
            this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, (data) => {
                if (GAME_DEBUG_MODE) console.log(`[GameEngine] Notification: Unit ${data.unitId} (${data.unitName}) has died.`);
            });
            this.eventManager.subscribe(GAME_EVENTS.SKILL_EXECUTED, async (data) => {
                // data.skillName이 있으면 바로 사용, 없으면 data.skillId를 기반으로 경고
                if (data.skillName) {
                    if (GAME_DEBUG_MODE) console.log(`[GameEngine] Notification: Skill '${data.skillName}' was executed by ${data.userId}.`);
                } else {
                    if (GAME_DEBUG_MODE) console.warn(`[GameEngine] Notification: Skill with ID '${data.skillId}' was executed, but skillName was not provided in the event data.`);
                    const skillData = await this.idManager.get(data.skillId);
                    const resolvedName = skillData ? skillData.name : 'Unknown Skill';
                    if (GAME_DEBUG_MODE) console.log(`[GameEngine] Notification: Skill '${resolvedName}' was executed by ${data.userId}.`);
                }
            });
            this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, async (data) => {
                if (GAME_DEBUG_MODE) console.log(`[GameEngine] Battle started for map: ${data.mapId}, difficulty: ${data.difficulty}`);
                this.sceneEngine.setCurrentScene(UI_STATES.COMBAT_SCREEN); // ✨ UI_STATES 상수 사용
                this.uiEngine.setUIState(UI_STATES.COMBAT_SCREEN); // ✨ UI_STATES 상수 사용
                this.cameraEngine.reset();

                // 전투 시작 후 TurnEngine 구동
                await this.turnEngine.startBattleTurns();
            });

            if (GAME_DEBUG_MODE) console.log("\u2699\ufe0f GameEngine initialized successfully. \u2699\ufe0f");
        }).catch(error => {
            console.error("Fatal Error: Async manager initialization failed.", error);
            alert("\uAC8C\uC784 \uC2DC\uC791 \uC911 \uCE58\uBA85\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uCF58\uC194\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
        });

        this._setupEventListeners();
    }

    /**
     * \ube44\ub3d9\uae30\ub85c \ucd08\uae30\ud654\ub418\uc5b4\uc57c \ud558\ub294 \ub9e4\ub2c8\uc800\ub97c \ucc98\ub9ac\ud569\ub2c8\ub2e4.
     */
    async _initAsyncManagers() {
        await this.idManager.initialize();

        // 1. IdManager에 전사 유닛과 클래스 ID 등록
        await this.idManager.addOrUpdateId(UNITS.WARRIOR.id, UNITS.WARRIOR);
        await this.idManager.addOrUpdateId(CLASSES.WARRIOR.id, CLASSES.WARRIOR);
        // ✨ 새롭게 추가된 해골 클래스도 등록
        await this.idManager.addOrUpdateId(CLASSES.SKELETON.id, CLASSES.SKELETON);
        await this.idManager.addOrUpdateId(CLASSES.ZOMBIE.id, CLASSES.ZOMBIE);
        await this.idManager.addOrUpdateId(CLASSES.WARRIOR_VALIANT.id, CLASSES.WARRIOR_VALIANT);

        // ✨ IdManager에 WARRIOR_SKILLS 데이터 등록
        for (const skillKey in WARRIOR_SKILLS) {
            const skill = WARRIOR_SKILLS[skillKey];
            await this.idManager.addOrUpdateId(skill.id, skill);
        }
        if (GAME_DEBUG_MODE) console.log(`[GameEngine] Registered ${Object.keys(WARRIOR_SKILLS).length} warrior skills.`);

        // ✨ SkillIconManager의 기본 아이콘 로드를 시작
        await this.skillIconManager._loadDefaultSkillIcons();
        if (GAME_DEBUG_MODE) console.log("[GameEngine] All initial icons have been queued for loading by SkillIconManager.");

        // 2. AssetLoaderManager로 전사 스프라이트 로드
        await this.assetLoaderManager.loadImage(
            UNITS.WARRIOR.spriteId,
            'assets/images/warrior.png'
        );
        await this.assetLoaderManager.loadImage(
            'sprite_warrior_attack',
            'assets/images/warrior-attack.png'
        );
        await this.assetLoaderManager.loadImage(
            'sprite_warrior_hitted',
            'assets/images/warrior-hitted.png'
        );
        await this.assetLoaderManager.loadImage(
            'sprite_warrior_finish',
            'assets/images/warrior-finish.png'
        );
        await this.assetLoaderManager.loadImage(
            'sprite_warrior_status',
            'assets/images/warrior-status-effects.png'
        );
        // ✨ 전사 패널 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_warrior_panel', 'assets/images/warrior-panel-1.png');
        // ✨ 전투 배경 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_battle_stage_forest', 'assets/images/battle-stage-forest.png');

        console.log(`[GameEngine] Registered unit ID: ${UNITS.WARRIOR.id}`);
        console.log(`[GameEngine] Loaded warrior sprite: ${UNITS.WARRIOR.spriteId}`);

        const mockEnemyUnitData = {
            id: 'unit_zombie_001', // ID 변경
            name: '좀비', // 이름 변경
            classId: 'class_skeleton', // 기존 해골 클래스 재사용
            type: ATTACK_TYPES.ENEMY, // ✨ ATTACK_TYPES 상수 사용
            baseStats: {
                hp: 80,
                attack: 15,
                defense: 5,
                speed: 30,
                valor: 10,
                strength: 10,
                endurance: 8,
                agility: 12,
                intelligence: 5,
                wisdom: 5,
                luck: 15,
                weight: 10
            },
            spriteId: 'sprite_zombie_default'
        };
        await this.idManager.addOrUpdateId(mockEnemyUnitData.id, mockEnemyUnitData);
        // ✨ 좀비 기본 이미지 로드
        await this.assetLoaderManager.loadImage(mockEnemyUnitData.spriteId, 'assets/images/zombie.png');
        // ✨ 무장해제 상태의 좀비 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_zombie_empty_default', 'assets/images/zombie-empty.png');
        // ✨ 좀비 무기 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_zombie_weapon_default', 'assets/images/zombie-weapon.png');

        await this._initBattleGrid();
    }

    async _initBattleGrid() {
        // 영웅은 이제 자동으로 생성되지 않습니다. 필요 시 recruitNewWarrior를 통해 고용하세요.
        await this.monsterSpawnManager.spawnMonstersForStage('stage1');
    }

    _update(deltaTime) {
        this.conditionalManager.update(); // ✨ 업데이트 루프에 추가
        this.sceneEngine.update(deltaTime);
        this.animationManager.update(deltaTime);
        this.vfxManager.update(deltaTime);
        this.particleEngine.update(deltaTime); // ✨ ParticleEngine 업데이트 호출
        // ✨ DetailInfoManager 업데이트 호출
        this.detailInfoManager.update(deltaTime);

        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );
            this.bindingManager.bindUnit(unit.id, {
                renderX: drawX,
                renderY: drawY
            });
        }
    }

    _draw() {
        this.layerEngine.draw();
        // mercenaryPanelManager는 이제 UIEngine이 직접 그립니다.
        // combatLogManager만 PanelEngine을 통해 그립니다.
        if (this.panelEngine) {
            this.panelEngine.drawPanel('combatLog', this.battleLogManager.ctx);
        }
    }

    start() {
        if (GAME_DEBUG_MODE) console.log("\ud83d\ude80 GameEngine starting game loop... \ud83d\ude80");
        this.gameLoop.start();
    }

    _setupEventListeners() {
        const recruitButton = document.getElementById('recruitWarriorBtn');
        if (recruitButton) {
            recruitButton.addEventListener('click', () => this.recruitNewWarrior());
        }

        const toggleHeroPanelBtn = document.getElementById(BUTTON_IDS.TOGGLE_HERO_PANEL);
        if (toggleHeroPanelBtn) {
            toggleHeroPanelBtn.addEventListener('click', () => this.uiEngine.toggleHeroPanel());
        }

        const battleStartHtmlBtn = document.getElementById(BUTTON_IDS.BATTLE_START_HTML);
        if (battleStartHtmlBtn) {
            battleStartHtmlBtn.addEventListener('click', () => this.uiEngine.handleBattleStartClick());
        }
    }

    async recruitNewWarrior() {
        if (GAME_DEBUG_MODE) console.log("[GameEngine] '전사 고용' 버튼 클릭됨. 새로운 전사를 생성합니다...");
        const newHeroes = await this.heroManager.createWarriors(1);
        if (newHeroes && newHeroes.length > 0) {
            const newWarrior = newHeroes[0];
            this.battleFormationManager.placeAllies(newHeroes);
            console.log(`%c${newWarrior.name}이(가) 당신의 부대에 합류했습니다!`, "color: #7289DA; font-weight: bold;");
        }
    }

    /**
     * ✨ 심각한 오류 발생 시 게임을 처리합니다.
     * @param {object} errorData - 오류 데이터 (source, message, errorObject 포함)
     * @private
     */
    _handleCriticalError(errorData) {
        console.error("[GameEngine] CRITICAL ERROR DETECTED!", errorData);
        this.eventManager.setGameRunningState(false); // 게임 루프 정지
        alert(`치명적인 게임 오류 발생! (${errorData.source}):\n${errorData.message}\n게임을 일시 정지합니다. 콘솔을 확인해주세요.`);
    }

    getRenderer() { return this.renderer; }
    getEventManager() { return this.eventManager; }
    getGuardianManager() { return this.guardianManager; }
    getRuleManager() { return this.ruleManager; }
    getMeasureManager() { return this.measureManager; }
    getMapManager() { return this.mapManager; }
    getUIEngine() { return this.uiEngine; }
    getLayerEngine() { return this.layerEngine; }
    getSceneEngine() { return this.sceneEngine; }
    getCameraEngine() { return this.cameraEngine; }
    getInputManager() { return this.inputManager; }
    getLogicManager() { return this.logicManager; }
    getCompatibilityManager() { return this.compatibilityManager; }
    getIdManager() { return this.idManager; }
    getAssetLoaderManager() { return this.assetLoaderManager; }
    getBattleSimulationManager() { return this.battleSimulationManager; }
    getBattleCalculationManager() { return this.battleCalculationManager; }
    getMercenaryPanelManager() { return this.mercenaryPanelManager; }
    getPanelEngine() { return this.panelEngine; }
    getBattleLogManager() { return this.battleLogManager; }
    getBindingManager() { return this.bindingManager; }

    // 새로운 엔진들에 대한 getter 메서드
    getDelayEngine() { return this.delayEngine; }
    getTimingEngine() { return this.timingEngine; }
    getValorEngine() { return this.valorEngine; }
    getWeightEngine() { return this.weightEngine; }
    getStatManager() { return this.statManager; }
    getTurnEngine() { return this.turnEngine; }
    getTurnOrderManager() { return this.turnOrderManager; }
    getBasicAIManager() { return this.basicAIManager; }
    getClassAIManager() { return this.classAIManager; }
    getAnimationManager() { return this.animationManager; }
    getCanvasBridgeManager() { return this.canvasBridgeManager; }
    getTurnCountManager() { return this.turnCountManager; }
    getStatusEffectManager() { return this.statusEffectManager; }
    getWorkflowManager() { return this.workflowManager; }
    getDisarmManager() { return this.disarmManager; }
    getParticleEngine() { return this.particleEngine; } // ✨ ParticleEngine getter 추가
    getMovingManager() { return this.movingManager; } // ✨ MovingManager getter 추가

    getButtonEngine() { return this.buttonEngine; }

    // Dice 관련 엔진/매니저에 대한 getter
    getDiceEngine() { return this.diceEngine; }
    getDiceRollManager() { return this.diceRollManager; }
    getHeroEngine() { return this.heroEngine; }
    getMicrocosmHeroEngine() { return this.microcosmHeroEngine; }
    // ✨ HeroManager getter 추가
    getHeroManager() { return this.heroManager; }
    // ✨ SynergyEngine getter 추가
    getSynergyEngine() { return this.synergyEngine; }
    // ✨ DetailInfoManager getter 추가
    getDetailInfoManager() { return this.detailInfoManager; }
    getDiceBotEngine() { return this.diceBotEngine; }
    // ✨ CoordinateManager getter 추가
    getCoordinateManager() { return this.coordinateManager; }
    // ✨ TargetingManager getter 추가
    getTargetingManager() { return this.targetingManager; }
    // ✨ TagManager getter 추가
    getTagManager() { return this.tagManager; }
    // ✨ 워리어 스킬 AI getter 추가
    getWarriorSkillsAI() { return this.warriorSkillsAI; }
    // ✨ SkillIconManager getter 추가
    getSkillIconManager() { return this.skillIconManager; }
    // ✨ StatusIconManager getter 추가
    getStatusIconManager() { return this.statusIconManager; }
    getBattleFormationManager() { return this.battleFormationManager; }
    getMonsterSpawnManager() { return this.monsterSpawnManager; }
    getShadowEngine() { return this.shadowEngine; } // ✨ ShadowEngine getter 추가
    getUnitSpriteEngine() { return this.unitSpriteEngine; }
    getUnitActionManager() { return this.unitActionManager; }
    getPassiveSkillManager() { return this.passiveSkillManager; }
    getReactionSkillManager() { return this.reactionSkillManager; }
    getConditionalManager() { return this.conditionalManager; }
    getPassiveIconManager() { return this.passiveIconManager; }
    getUnitStatManager() { return this.unitStatManager; }
    getStageDataManager() { return this.stageDataManager; }
    getRangeManager() { return this.rangeManager; }
    getMonsterEngine() { return this.monsterEngine; }
    getMonsterAI() { return this.monsterAI; }
}
