// js/engines/BattleEngine.js

import { BattleSimulationManager } from '../managers/BattleSimulationManager.js';
import { ValorEngine } from '../managers/ValorEngine.js';
import { WeightEngine } from '../managers/WeightEngine.js';
import { StatManager } from '../managers/StatManager.js';
import { DiceEngine } from '../managers/DiceEngine.js';
import { DiceBotManager } from '../managers/DiceBotManager.js';
import { BattleFormationManager } from '../managers/BattleFormationManager.js';
import { DelayEngine } from '../managers/DelayEngine.js';
import { TimingEngine } from '../managers/TimingEngine.js';
import { CoordinateManager } from '../managers/CoordinateManager.js';
import { TurnOrderManager } from '../managers/TurnOrderManager.js';
import { BasicAIManager } from '../managers/BasicAIManager.js';
import { ClassAIManager } from '../managers/ClassAIManager.js';
import { TargetingManager } from '../managers/TargetingManager.js';
import { TurnEngine } from '../managers/TurnEngine.js';
import { ConditionalManager } from '../managers/ConditionalManager.js';
import { DiceRollManager } from '../managers/DiceRollManager.js';
import { BattleCalculationManager } from '../managers/BattleCalculationManager.js';
import { TurnCountManager } from '../managers/TurnCountManager.js';
import { StatusEffectManager } from '../managers/StatusEffectManager.js';
import { CLASSES } from '../../data/class.js'; // ◀◀◀ **이 부분을 추가해주세요!**

/**
 * 전투 시뮬레이션과 턴 진행을 담당하는 엔진입니다.
 */
export class BattleEngine {
    // DependencyInjector를 통해 필요한 매니저를 획득합니다.
    constructor(injector) {
        console.log("⚔️ BattleEngine initialized.");
        this.injector = injector;

        const eventManager = injector.get('EventManager');
        const measureManager = injector.get('MeasureManager');
        const assetEngine = injector.get('AssetEngine');
        const renderEngine = injector.get('RenderEngine');

        const idManager = assetEngine.getIdManager();
        const assetLoaderManager = assetEngine.getAssetLoaderManager();
        this.assetLoaderManager = assetLoaderManager;
        const animationManager = renderEngine.getAnimationManager();

        this.valorEngine = new ValorEngine();
        this.weightEngine = new WeightEngine();
        this.statManager = new StatManager(this.valorEngine, this.weightEngine);
        this.diceEngine = new DiceEngine();
        this.diceBotManager = new DiceBotManager(this.diceEngine);

        this.battleSimulationManager = new BattleSimulationManager(
            measureManager,
            assetLoaderManager,
            idManager,
            null,
            animationManager,
            this.valorEngine
        );
        assetEngine.getUnitSpriteEngine().battleSimulationManager = this.battleSimulationManager;

        this.turnCountManager = new TurnCountManager();
        this.diceRollManager = new DiceRollManager(this.diceEngine, this.valorEngine, null);

        this.delayEngine = new DelayEngine();
        this.timingEngine = new TimingEngine(this.delayEngine);
        this.coordinateManager = new CoordinateManager(this.battleSimulationManager, null);
        this.turnOrderManager = new TurnOrderManager(eventManager, this.battleSimulationManager, this.weightEngine);

        this.conditionalManager = new ConditionalManager(this.battleSimulationManager, idManager);
        this.battleCalculationManager = new BattleCalculationManager(
            eventManager,
            this.battleSimulationManager,
            this.diceRollManager,
            this.delayEngine,
            this.conditionalManager
        );
        this.statusEffectManager = new StatusEffectManager(
            eventManager,
            idManager,
            this.turnCountManager,
            this.battleCalculationManager
        );
        this.diceRollManager.statusEffectManager = this.statusEffectManager;

        this.basicAIManager = new BasicAIManager(this.battleSimulationManager);
        this.targetingManager = new TargetingManager(this.battleSimulationManager);
        this.classAIManager = new ClassAIManager(idManager, this.battleSimulationManager, measureManager, this.basicAIManager, null, this.diceEngine, this.targetingManager);

        this.turnEngine = new TurnEngine(
            eventManager,
            this.battleSimulationManager,
            this.turnOrderManager,
            this.classAIManager,
            this.delayEngine,
            this.timingEngine,
            measureManager,
            animationManager,
            this.battleCalculationManager,
            this.statusEffectManager
        );

        this.battleFormationManager = new BattleFormationManager(this.battleSimulationManager);
    }

    async setupBattle() {
        await this.assetLoaderManager.loadImage('sprite_warrior_default', 'assets/images/warrior.png');
        await this.assetLoaderManager.loadImage('sprite_zombie_default', 'assets/images/zombie.png');

        // 초기 전투 설정 시에는 영웅을 자동 생성하지 않습니다. 필요 시 UI에서 고용하도록 합니다.
    }

    async startBattle() {
        await this.turnEngine.startBattleTurns();
    }

    update(deltaTime) {
        this.conditionalManager.update();
        this.turnEngine.update();
    }

    getBattleSimulationManager() { return this.battleSimulationManager; }
}
