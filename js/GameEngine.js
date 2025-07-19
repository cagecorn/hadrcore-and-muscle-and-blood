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
import { EraserEngine } from './managers/EraserEngine.js';
import { HideAndSeekManager } from './managers/HideAndSeekManager.js';
import { BattleSimulationManager } from './managers/BattleSimulationManager.js';
import { AnimationManager } from './managers/AnimationManager.js';
import { VFXManager } from './managers/VFXManager.js';
import { ParticleEngine } from './managers/ParticleEngine.js';
import { ShadowEngine } from './managers/ShadowEngine.js';
import { MovingManager } from './managers/MovingManager.js';
import { DisarmManager } from './managers/DisarmManager.js';
import { CanvasBridgeManager } from './managers/CanvasBridgeManager.js';
import { SkillIconManager } from './managers/SkillIconManager.js';
import { StatusIconManager } from './managers/StatusIconManager.js';
import { BindingManager } from './managers/BindingManager.js';
import { BattleCalculationManager } from './managers/BattleCalculationManager.js';
import { MercenaryPanelManager } from './managers/MercenaryPanelManager.js';
import { RuleManager } from './managers/RuleManager.js';

import { TurnEngine } from './managers/TurnEngine.js';
import { DelayEngine } from './managers/DelayEngine.js';
import { TimingEngine } from './managers/TimingEngine.js';
import { BattleLogManager } from './managers/BattleLogManager.js';
import { TurnOrderManager } from './managers/TurnOrderManager.js';
import { ClassAIManager } from './managers/ClassAIManager.js';
import { BasicAIManager } from './managers/BasicAIManager.js';
import { TargetingManager } from './managers/TargetingManager.js';
import { SoundEngine } from './managers/SoundEngine.js';
import { PositionManager } from './managers/PositionManager.js';
import { JudgementManager } from './managers/JudgementManager.js';
import { ValorEngine } from './managers/ValorEngine.js';
import { WeightEngine } from './managers/WeightEngine.js';
import { StatManager } from './managers/StatManager.js';
import { DiceEngine } from './managers/DiceEngine.js';
import { DiceRollManager } from './managers/DiceRollManager.js';
import { DiceBotEngine } from './managers/DiceBotEngine.js';
import { TurnCountManager } from './managers/TurnCountManager.js';
import { StatusEffectManager } from './managers/StatusEffectManager.js';
import { WorkflowManager } from './managers/WorkflowManager.js';
import { HeroEngine } from "./managers/HeroEngine.js";
import { MicrocosmHeroEngine } from './managers/MicrocosmHeroEngine.js';
import { HeroManager } from './managers/HeroManager.js';
import { BirthReportManager } from './managers/BirthReportManager.js';
import { SynergyEngine } from './managers/SynergyEngine.js';
import { STATUS_EFFECTS } from '../data/statusEffects.js';

import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';
import { CoordinateManager } from './managers/CoordinateManager.js';
import { ButtonEngine } from './managers/ButtonEngine.js';
import { DetailInfoManager } from './managers/DetailInfoManager.js';
import { TagManager } from './managers/TagManager.js';
import { WarriorSkillsAI } from './managers/warriorSkillsAI.js';
import { UnitSpriteEngine } from './managers/UnitSpriteEngine.js';
import { UnitActionManager } from './managers/UnitActionManager.js';
import { PassiveSkillManager } from './managers/PassiveSkillManager.js';
import { ReactionSkillManager } from './managers/ReactionSkillManager.js';
import { ConditionalManager } from './managers/ConditionalManager.js';
import { PassiveIconManager } from './managers/PassiveIconManager.js';
import { AttackManager } from './managers/AttackManager.js';
import { BattleFormationManager } from './managers/BattleFormationManager.js';
import { MonsterSpawnManager } from './managers/MonsterSpawnManager.js';
import { EnemyEngine } from './managers/EnemyEngine.js';
import { EnemySpawnManager } from './managers/EnemySpawnManager.js';
import { UnitStatManager } from './managers/UnitStatManager.js';
import { StageDataManager } from './managers/StageDataManager.js';
import { RangeManager } from './managers/RangeManager.js';
import { MonsterEngine } from './managers/MonsterEngine.js';
import { MonsterAI } from './managers/MonsterAI.js';
import { SlotMachineManager } from './managers/SlotMachineManager.js';
import { BuffManager } from './managers/BuffManager.js';
import { StackEngine } from './managers/StackEngine.js';

import { OneTwoThreeManager } from './managers/OneTwoThreeManager.js';
import { PassiveIsAlsoASkillManager } from './managers/PassiveIsAlsoASkillManager.js';
import { ModifierEngine } from './managers/ModifierEngine.js';
import { ModifierLogManager } from './managers/ModifierLogManager.js';
import { DOMEngine } from './managers/DOMEngine.js';
import { DOMVFXEngine } from './managers/DOMVFXEngine.js';
import { DOMAnimationManager } from './managers/DOMAnimationManager.js';
import { TerritoryEngine } from './managers/TerritoryEngine.js';
import { TerritoryBackgroundManager } from './managers/TerritoryBackgroundManager.js';
import { TerritoryUIManager } from './managers/TerritoryUIManager.js';
import { TerritorySceneManager } from './managers/TerritorySceneManager.js';
import { TerritoryGridManager } from './managers/TerritoryGridManager.js';
import { TavernManager } from './managers/TavernManager.js';
import { GAME_EVENTS, UI_STATES, BUTTON_IDS, ATTACK_TYPES, GAME_DEBUG_MODE } from './constants.js';

import { UNITS } from '../data/unit.js';
import { CLASSES } from '../data/class.js';
import { MONSTER_CLASSES } from '../data/monsterClass.js';
import { WARRIOR_SKILLS } from '../data/warriorSkills.js';

export class GameEngine {
    constructor(canvasId) {
        if (GAME_DEBUG_MODE) console.log("⚙️ GameEngine initializing... ⚙️");

        // 1. Core Systems & Fundamental Managers
        this.renderer = new Renderer(canvasId);
        if (!this.renderer.canvas) {
            console.error("GameEngine: Failed to initialize Renderer. Game cannot proceed.");
            throw new Error("Renderer initialization failed.");
        }

        this.eventManager = new EventManager();
        this.eventManager.subscribe(GAME_EVENTS.CRITICAL_ERROR, this._handleCriticalError.bind(this));

        this.domEngine = new DOMEngine(this.eventManager);
        this.judgementManager = new JudgementManager(this.eventManager);
        this.stackEngine = new StackEngine(this.eventManager);
        this.guardianManager = new GuardianManager();
        this.measureManager = new MeasureManager();
        this.ruleManager = new RuleManager();
        this.soundEngine = new SoundEngine();
        this.eraserEngine = new EraserEngine();
        this.hideAndSeekManager = new HideAndSeekManager(this);
        this.modifierLogManager = new ModifierLogManager();

        // 2. Scene & Logic Managers
        this.sceneEngine = new SceneEngine(this.eraserEngine, this.hideAndSeekManager);
        this.logicManager = new LogicManager(this.measureManager, this.sceneEngine);
        this.territorySceneManager = new TerritorySceneManager(this.sceneEngine);

        // 3. ID & Asset Loading
        this.idManager = new IdManager();
        this.assetLoaderManager = new AssetLoaderManager();
        this.assetLoaderManager.setEventManager(this.eventManager);
        this.skillIconManager = new SkillIconManager(this.assetLoaderManager, this.idManager);
        this.eventManager.subscribe(GAME_EVENTS.ASSET_LOAD_PROGRESS, (data) => {
            if (GAME_DEBUG_MODE) console.log(`[GameEngine] Assets loading: ${data.loaded}/${data.total} (${(data.loaded / data.total * 100).toFixed(1)}%)`);
        });
        this.eventManager.subscribe(GAME_EVENTS.ASSETS_LOADED, () => {
            if (GAME_DEBUG_MODE) console.log("[GameEngine] All initial assets are loaded! Game ready.");
            this.vfxManager.loadVisualEffects();
        });

        // 4. Core Game Mechanics Engines
        this.valorEngine = new ValorEngine();
        this.weightEngine = new WeightEngine();
        this.statManager = new StatManager(this.valorEngine, this.weightEngine);
        this.diceEngine = new DiceEngine();
        this.diceBotEngine = new DiceBotEngine(this.diceEngine);

        // 5. Battle Simulation & Related Managers
        this.battleSimulationManager = new BattleSimulationManager(this.measureManager, this.assetLoaderManager, this.idManager, this.logicManager, null, this.valorEngine);
        this.unitStatManager = new UnitStatManager(this.battleSimulationManager);
        this.stageDataManager = new StageDataManager();
        this.rangeManager = new RangeManager(this.battleSimulationManager);
        this.cameraEngine = new CameraEngine(this.renderer, this.logicManager, this.sceneEngine);
        this.particleEngine = new ParticleEngine(this.measureManager, this.cameraEngine, this.battleSimulationManager);
        this.animationManager = new AnimationManager(this.measureManager, null, this.particleEngine);
        this.battleSimulationManager.animationManager = this.animationManager;
        this.animationManager.battleSimulationManager = this.battleSimulationManager;
        this.shadowEngine = new ShadowEngine(this.battleSimulationManager, this.animationManager, this.measureManager);

        // 6. UI, Input, Log & Other Managers
        this.mercenaryPanelManager = new MercenaryPanelManager(this.measureManager, this.battleSimulationManager, this.logicManager, this.eventManager);
        this.buttonEngine = new ButtonEngine();
        const combatLogPanelElement = document.getElementById('battle-log-panel');
        if (!combatLogPanelElement) {
            console.error("GameEngine: Battle Log panel not found. Game cannot proceed without it.");
            throw new Error("Battle Log panel initialization failed.");
        }
        this.battleLogManager = new BattleLogManager(combatLogPanelElement, this.eventManager, this.measureManager);
        this.battleLogManager._setupEventListeners();
        this.mapManager = new MapManager(this.measureManager);
        this.uiEngine = new UIEngine(this.renderer, this.measureManager, this.eventManager, this.mercenaryPanelManager, this.buttonEngine);
        this.compatibilityManager = new CompatibilityManager(this.measureManager, this.renderer, this.uiEngine, this.mapManager, this.logicManager, null, this.battleLogManager);
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine, this.buttonEngine, this.eventManager);
        const mainGameCanvasElement = document.getElementById(canvasId);
        this.canvasBridgeManager = new CanvasBridgeManager(mainGameCanvasElement, null, null, this.eventManager, this.measureManager);
        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine);
        this.battleStageManager = new BattleStageManager(this.assetLoaderManager);
        this.battleGridManager = new BattleGridManager(this.measureManager, this.logicManager);
        this.coordinateManager = new CoordinateManager(this.battleSimulationManager, this.battleGridManager);

        // 7. Visual Effects & Rendering Helpers
        this.vfxManager = new VFXManager(this.renderer, this.measureManager, this.cameraEngine, this.battleSimulationManager, this.animationManager, this.eventManager, this.particleEngine);
        this.vfxManager.assetLoaderManager = this.assetLoaderManager;
        this.vfxManager.statusEffectManager = this.statusEffectManager;
        this.domAnimationManager = new DOMAnimationManager('dom-vfx-container', this.battleSimulationManager);
        this.domVFXEngine = new DOMVFXEngine(this.battleSimulationManager, this.cameraEngine, this.eventManager, this.domAnimationManager);
        this.bindingManager = new BindingManager();

        // 8. Timing & Movement Engines
        this.delayEngine = new DelayEngine();
        this.timingEngine = new TimingEngine(this.delayEngine);
        this.movingManager = new MovingManager(this.battleSimulationManager, this.animationManager, this.delayEngine, this.coordinateManager, null);

        // 9. Game Content & Feature Engines
        this.microcosmHeroEngine = new MicrocosmHeroEngine(this.idManager);
        this.heroEngine = new HeroEngine(this.idManager, this.assetLoaderManager, this.diceEngine, this.diceBotEngine, this.microcosmHeroEngine);
        this.synergyEngine = new SynergyEngine(this.idManager, this.eventManager);

        // 10. Detail & Shadow Engines
        this.detailInfoManager = new DetailInfoManager(this.renderer, this.cameraEngine, this.battleSimulationManager, this.eventManager, this.assetLoaderManager);
        this.tagManager = new TagManager(this.idManager);

        // 11. Conditional Manager
        this.conditionalManager = new ConditionalManager(this.battleSimulationManager, this.idManager);
        this.modifierEngine = new ModifierEngine(this.statusEffectManager, this.conditionalManager, this.modifierLogManager);

        // 12. Combat Flow & AI Managers
        this.battleCalculationManager = new BattleCalculationManager(this.eventManager, this.battleSimulationManager, null, this.delayEngine, this.conditionalManager, this.unitStatManager, null, this.modifierEngine);
        this.turnCountManager = new TurnCountManager();
        this.statusEffectManager = new StatusEffectManager(this.eventManager, this.idManager, this.turnCountManager, this.battleCalculationManager, this.stackEngine);
        this.battleCalculationManager.statusEffectManager = this.statusEffectManager;
        this.modifierEngine.statusEffectManager = this.statusEffectManager;
        this.diceRollManager = new DiceRollManager(this.diceEngine, this.valorEngine, this.statusEffectManager, this.modifierEngine, this.modifierLogManager);
        this.battleCalculationManager.diceRollManager = this.diceRollManager;
        this.battleCalculationManager.modifierEngine = this.modifierEngine;
        this.battleCalculationManager.modifierLogManager = this.modifierLogManager;
        this.workflowManager = new WorkflowManager(this.eventManager, this.statusEffectManager, this.battleSimulationManager);
        this.statusIconManager = new StatusIconManager(this.skillIconManager, this.battleSimulationManager, this.bindingManager, this.measureManager, this.turnCountManager);
        this.disarmManager = new DisarmManager(this.eventManager, this.statusEffectManager, this.battleSimulationManager, this.measureManager);
        this.targetingManager = new TargetingManager(this.battleSimulationManager);
        this.positionManager = new PositionManager(this.battleSimulationManager);
        this.movingManager.positionManager = this.positionManager;
        this.basicAIManager = new BasicAIManager(this.targetingManager, this.positionManager);
        this.monsterAI = new MonsterAI(this.basicAIManager);
        this.monsterEngine = new MonsterEngine(this.monsterAI);
        this.turnOrderManager = new TurnOrderManager(this.eventManager, this.battleSimulationManager, this.weightEngine);
        const commonManagersForSkills = { battleSimulationManager: this.battleSimulationManager, battleCalculationManager: this.battleCalculationManager, eventManager: this.eventManager, delayEngine: this.delayEngine, statusEffectManager: this.statusEffectManager, coordinateManager: this.coordinateManager, targetingManager: this.targetingManager, vfxManager: this.vfxManager, diceEngine: this.diceEngine, workflowManager: this.workflowManager, animationManager: this.animationManager, measureManager: this.measureManager, idManager: this.idManager, movingManager: this.movingManager, rangeManager: this.rangeManager, positionManager: this.positionManager };
        this.warriorSkillsAI = new WarriorSkillsAI(commonManagersForSkills);
        this.slotMachineManager = new SlotMachineManager(this.idManager, this.diceEngine);
        this.buffManager = new BuffManager(this.idManager, this.diceEngine);
        this.classAIManager = new ClassAIManager(this.idManager, this.battleSimulationManager, this.basicAIManager, this.warriorSkillsAI, this.targetingManager, this.monsterAI, this.slotMachineManager, this.eventManager, this.buffManager);
        this.oneTwoThreeManager = new OneTwoThreeManager(this.eventManager, this.battleSimulationManager);
        this.passiveIsAlsoASkillManager = new PassiveIsAlsoASkillManager(this.eventManager, this.battleSimulationManager, this.idManager);
        this.turnEngine = new TurnEngine(this.eventManager, this.battleSimulationManager, this.turnOrderManager, this.microcosmHeroEngine, this.classAIManager, this.delayEngine, this.timingEngine, this.animationManager, this.battleCalculationManager, this.statusEffectManager, this.rangeManager);

        // 12. Sprite & Action Managers
        this.unitSpriteEngine = new UnitSpriteEngine(this.assetLoaderManager, this.battleSimulationManager);
        this.enemyEngine = new EnemyEngine(this.unitSpriteEngine);
        this.unitActionManager = new UnitActionManager(this.eventManager, this.unitSpriteEngine, this.delayEngine, this.battleSimulationManager);
        this.passiveSkillManager = new PassiveSkillManager(this.eventManager, this.idManager, this.diceEngine, this.battleSimulationManager, this.workflowManager);
        this.reactionSkillManager = new ReactionSkillManager(this.eventManager, this.idManager, this.diceEngine, this.battleSimulationManager, this.battleCalculationManager, this.delayEngine, this.unitStatManager);
        this.birthReportManager = new BirthReportManager();
        this.heroManager = new HeroManager(this.idManager, this.diceEngine, this.assetLoaderManager, this.battleSimulationManager, this.unitSpriteEngine, this.diceBotEngine, this.birthReportManager, this.heroEngine);
        this.battleFormationManager = new BattleFormationManager(this.battleSimulationManager);
        this.monsterSpawnManager = new MonsterSpawnManager(this.idManager, this.assetLoaderManager, this.battleSimulationManager, this.stageDataManager);
        this.enemySpawnManager = new EnemySpawnManager(this.heroManager, this.enemyEngine, this.battleSimulationManager, this.idManager);

        // 13. Conditional & Passive Visual Managers
        this.passiveIconManager = new PassiveIconManager(this.battleSimulationManager, this.idManager, this.skillIconManager, this.statusEffectManager);
        this.attackManager = new AttackManager(this.eventManager, this.idManager);

        // 13. Scene Registrations & Layer Engine Setup
        // this.sceneEngine.registerScene(UI_STATES.MAP_SCREEN, []); // TerritorySceneManager handles this scene
        this.sceneEngine.registerScene(UI_STATES.COMBAT_SCREEN, [this.battleStageManager, this.battleGridManager, (ctx) => { this.shadowEngine.draw(ctx); }, this.battleSimulationManager, this.vfxManager]);
        this.sceneEngine.registerScene(UI_STATES.TAVERN_SCREEN, []);
        this.sceneEngine.setCurrentScene(UI_STATES.MAP_SCREEN);

        // Initialize territory-related managers
        this.territoryEngine = new TerritoryEngine(this.eventManager, this.domEngine);
        this.territoryBackgroundManager = new TerritoryBackgroundManager(this.domEngine);
        this.territoryUIManager = new TerritoryUIManager(this.eventManager, this.domEngine);
        this.territoryGridManager = new TerritoryGridManager(this.domEngine);
        this.tavernManager = new TavernManager(this.domEngine, this.sceneEngine, this.uiEngine, this.heroManager);

        // --- LAYER REGISTRATION ---
        this.layerEngine.registerLayer('combatScene', (ctx) => {
            if (this.sceneEngine.getCurrentSceneName() === UI_STATES.COMBAT_SCREEN) {
                this.sceneEngine.draw(ctx);
            }
        }, 10, true);
        this.layerEngine.registerLayer('statusIconLayer', (ctx) => {
            if (this.sceneEngine.getCurrentSceneName() === UI_STATES.COMBAT_SCREEN) {
                this.statusIconManager.draw(ctx);
                this.passiveIconManager.draw(ctx);
            }
        }, 20, true);
        this.layerEngine.registerLayer('uiLayer', (ctx) => {
            this.uiEngine.draw(ctx);
        }, 100, false);
        this.layerEngine.registerLayer('detailInfoLayer', (ctx) => {
            this.detailInfoManager.draw(ctx);
        }, 200, false);

        this._registerCleanupTasks();
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this.gameLoop = new GameLoop(this._update, this._draw);
        const expectedDataAndAssetCount = 10 + Object.keys(WARRIOR_SKILLS).length + 5 + 5 + 4;
        this.assetLoaderManager.setTotalAssetsToLoad(expectedDataAndAssetCount);
    }

    async init() {
        await this._initAsyncManagers();
        const initialGameData = {
            units: [{ id: 'u1', name: 'Knight', hp: 100 }, { id: 'u2', name: 'Archer', hp: 70 }],
            config: { resolution: this.measureManager.get('gameResolution'), difficulty: 'normal' }
        };
        try {
            this.guardianManager.enforceRules(initialGameData);
            if (GAME_DEBUG_MODE) console.log("[GameEngine] Initial game data passed GuardianManager rules. ✨");
        } catch (e) {
            if (e.name === "ImmutableRuleViolationError") {
                console.error("[GameEngine] CRITICAL ERROR: Game initialization failed due to immutable rule violation!", e.message);
                throw e;
            } else {
                console.error("[GameEngine] An unexpected error occurred during rule enforcement:", e);
                throw e;
            }
        }
        this.cameraEngine.reset();
        if (GAME_DEBUG_MODE) console.log(`[GameEngine Debug] Camera Initial State: X=${this.cameraEngine.x}, Y=${this.cameraEngine.y}, Zoom=${this.cameraEngine.zoom}`);
        this.eventManager.subscribe(GAME_EVENTS.UNIT_DEATH, (data) => {
            if (GAME_DEBUG_MODE) console.log(`[GameEngine] Notification: Unit ${data.unitId} (${data.unitName}) has died.`);
        });
        this.eventManager.subscribe(GAME_EVENTS.SKILL_EXECUTED, async (data) => {
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
            this.sceneEngine.setCurrentScene(UI_STATES.COMBAT_SCREEN);
            this.uiEngine.setUIState(UI_STATES.COMBAT_SCREEN);
            this.domEngine.updateUIForScene(UI_STATES.COMBAT_SCREEN);
            this.cameraEngine.setControlsEnabled(false); // ✨ 카메라 제어 비활성화
            this.cameraEngine.reset();
            await this.turnEngine.startBattleTurns();
        });
        this.eventManager.subscribe(GAME_EVENTS.BATTLE_END, (data) => {
            this.domEngine.updateUIForScene(UI_STATES.MAP_SCREEN);
            this.cameraEngine.setControlsEnabled(true); // ✨ 카메라 제어 활성화
        });
        if (GAME_DEBUG_MODE) console.log("⚙️ GameEngine initialized successfully. ⚙️");
        this._setupEventListeners();
        this.domEngine.updateUIForScene(UI_STATES.MAP_SCREEN);
    }

    async _initAsyncManagers() {
        await this.idManager.initialize();
        await this.idManager.addOrUpdateId(UNITS.WARRIOR.id, UNITS.WARRIOR);
        await this.idManager.addOrUpdateId(CLASSES.WARRIOR.id, CLASSES.WARRIOR);
        await this.idManager.addOrUpdateId(MONSTER_CLASSES.SKELETON.id, MONSTER_CLASSES.SKELETON);
        await this.idManager.addOrUpdateId(MONSTER_CLASSES.ZOMBIE.id, MONSTER_CLASSES.ZOMBIE);
        await this.idManager.addOrUpdateId(CLASSES.WARRIOR_VALIANT.id, CLASSES.WARRIOR_VALIANT);
        for (const skillKey in WARRIOR_SKILLS) {
            const skill = WARRIOR_SKILLS[skillKey];
            await this.idManager.addOrUpdateId(skill.id, skill);
        }
        if (GAME_DEBUG_MODE) console.log(`[GameEngine] Registered ${Object.keys(WARRIOR_SKILLS).length} warrior skills.`);
        await this.skillIconManager._loadAllIcons();
        if (GAME_DEBUG_MODE) console.log("[GameEngine] All initial icons have been queued for loading by SkillIconManager.");
        await this.assetLoaderManager.loadImage(UNITS.WARRIOR.spriteId, 'assets/images/warrior.png');
        await this.assetLoaderManager.loadImage('sprite_warrior_attack', 'assets/images/warrior-attack.png');
        await this.assetLoaderManager.loadImage('sprite_warrior_hitted', 'assets/images/warrior-hitted.png');
        await this.assetLoaderManager.loadImage('sprite_warrior_finish', 'assets/images/warrior-finish.png');
        await this.assetLoaderManager.loadImage('sprite_warrior_status', 'assets/images/warrior-status-effects.png');
        await this.assetLoaderManager.loadImage('sprite_warrior_panel', 'assets/images/warrior-panel-1.png');
        await this.assetLoaderManager.loadImage('sprite_battle_stage_forest', 'assets/images/battle-stage-forest.png');
        console.log(`[GameEngine] Registered unit ID: ${UNITS.WARRIOR.id}`);
        console.log(`[GameEngine] Loaded warrior sprite: ${UNITS.WARRIOR.spriteId}`);
        const mockEnemyUnitData = {
            id: 'unit_zombie_001',
            name: '좀비',
            classId: 'class_skeleton',
            type: ATTACK_TYPES.ENEMY,
            baseStats: { hp: 80, attack: 15, defense: 5, speed: 30, valor: 10, strength: 10, endurance: 8, agility: 12, intelligence: 5, wisdom: 5, luck: 15, weight: 10 },
            spriteId: 'sprite_zombie_default'
        };
        await this.idManager.addOrUpdateId(mockEnemyUnitData.id, mockEnemyUnitData);
        await this.assetLoaderManager.loadImage(mockEnemyUnitData.spriteId, 'assets/images/zombie.png');
        await this.assetLoaderManager.loadImage('sprite_zombie_empty_default', 'assets/images/zombie-empty.png');
        await this.assetLoaderManager.loadImage('sprite_zombie_weapon_default', 'assets/images/zombie-weapon.png');
        await this.assetLoaderManager.loadImage('bleed', 'assets/icons/status_effects/bleed.png');
        await this.assetLoaderManager.loadImage('icon_status_shield_break', 'assets/icons/status_effects/shield-break.png');
        await this._initBattleGrid();
    }

    async _initBattleGrid() {
        await this.enemySpawnManager.spawnEnemyWarriors(5);
    }

    _update(deltaTime) {
        this.conditionalManager.update();
        this.sceneEngine.update(deltaTime);
        this.animationManager.update(deltaTime);
        this.statusEffectManager.update(deltaTime);
        this.vfxManager.update(deltaTime);
        this.particleEngine.update(deltaTime);
        this.domVFXEngine.update();
        this.domAnimationManager.update();
        this.detailInfoManager.update(deltaTime);
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();
        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            const { drawX, drawY } = this.animationManager.getRenderPosition(unit.id, unit.gridX, unit.gridY, effectiveTileSize, gridOffsetX, gridOffsetY);
            this.bindingManager.bindUnit(unit.id, { renderX: drawX, renderY: drawY });
        }
    }

    _draw() {
        this.layerEngine.draw();
    }

    start() {
        if (GAME_DEBUG_MODE) console.log("🚀 GameEngine starting game loop... 🚀");
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

    _registerCleanupTasks() {
        this.eraserEngine.registerCleanupTask(UI_STATES.COMBAT_SCREEN, () => {
            this.battleSimulationManager.clearBattleState();
            this.battleLogManager.clearLog();
            this.vfxManager.clearEffects();
            this.turnCountManager.clearAllEffects();
        });
        this.eraserEngine.registerCleanupTask(UI_STATES.MAP_SCREEN, () => {
            // No cleanup needed for DOM-based territory
        });
    }

    _handleCriticalError(errorData) {
        console.error("[GameEngine] CRITICAL ERROR DETECTED!", errorData);
        this.eventManager.setGameRunningState(false);
        alert(`치명적인 게임 오류 발생! (${errorData.source}):\n${errorData.message}\n게임을 일시 정지합니다. 콘솔을 확인해주세요.`);
    }

    // Getters for all managers...
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
    getBattleLogManager() { return this.battleLogManager; }
    getVFXManager() { return this.vfxManager; }
    getBindingManager() { return this.bindingManager; }
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
    getParticleEngine() { return this.particleEngine; }
    getMovingManager() { return this.movingManager; }
    getButtonEngine() { return this.buttonEngine; }
    getDiceEngine() { return this.diceEngine; }
    getDiceRollManager() { return this.diceRollManager; }
    getHeroEngine() { return this.heroEngine; }
    getMicrocosmHeroEngine() { return this.microcosmHeroEngine; }
    getHeroManager() { return this.heroManager; }
    getSynergyEngine() { return this.synergyEngine; }
    getDetailInfoManager() { return this.detailInfoManager; }
    getDiceBotEngine() { return this.diceBotEngine; }
    getCoordinateManager() { return this.coordinateManager; }
    getTargetingManager() { return this.targetingManager; }
    getTagManager() { return this.tagManager; }
    getWarriorSkillsAI() { return this.warriorSkillsAI; }
    getSkillIconManager() { return this.skillIconManager; }
    getStatusIconManager() { return this.statusIconManager; }
    getBattleFormationManager() { return this.battleFormationManager; }
    getMonsterSpawnManager() { return this.monsterSpawnManager; }
    getEnemyEngine() { return this.enemyEngine; }
    getEnemySpawnManager() { return this.enemySpawnManager; }
    getShadowEngine() { return this.shadowEngine; }
    getUnitSpriteEngine() { return this.unitSpriteEngine; }
    getUnitActionManager() { return this.unitActionManager; }
    getPassiveSkillManager() { return this.passiveSkillManager; }
    getReactionSkillManager() { return this.reactionSkillManager; }
    getConditionalManager() { return this.conditionalManager; }
    getPassiveIconManager() { return this.passiveIconManager; }
    getAttackManager() { return this.attackManager; }
    getUnitStatManager() { return this.unitStatManager; }
    getStageDataManager() { return this.stageDataManager; }
    getRangeManager() { return this.rangeManager; }
    getMonsterEngine() { return this.monsterEngine; }
    getMonsterAI() { return this.monsterAI; }
    getSlotMachineManager() { return this.slotMachineManager; }
    getBuffManager() { return this.buffManager; }
    getSoundEngine() { return this.soundEngine; }
    getOneTwoThreeManager() { return this.oneTwoThreeManager; }
    getPassiveIsAlsoASkillManager() { return this.passiveIsAlsoASkillManager; }
    getModifierEngine() { return this.modifierEngine; }
    getModifierLogManager() { return this.modifierLogManager; }
    getStackEngine() { return this.stackEngine; }
    getHideAndSeekManager() { return this.hideAndSeekManager; }
    getDOMEngine() { return this.domEngine; }
    getTavernManager() { return this.tavernManager; }
}
