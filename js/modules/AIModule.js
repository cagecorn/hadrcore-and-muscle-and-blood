import { AIEngine } from '../managers/AIEngine.js';
import { BasicAIManager } from '../managers/BasicAIManager.js';
import { ClassAIManager } from '../managers/ClassAIManager.js';
import { MetaAIManager } from '../managers/MetaAIManager.js';
import { MonsterAI } from '../managers/MonsterAI.js';
import { SkillAIManager } from '../managers/SkillAIManager.js';
import { WarriorSkillsAI } from '../managers/warriormanager.js';

/**
 * Groups all AI related managers so they can be created and accessed together.
 */
export class AIModule {
    constructor({
        idManager,
        battleSimulationManager,
        eventManager,
        slotMachineManager,
        targetingManager,
        positionManager,
        commonManagersForSkills
    }) {
        // Managers that often change together are instantiated here
        this.basicAIManager = new BasicAIManager(targetingManager, positionManager);
        this.monsterAI = new MonsterAI(this.basicAIManager);
        this.warriorSkillsAI = new WarriorSkillsAI(commonManagersForSkills);
        this.classAIManager = new ClassAIManager(
            idManager,
            battleSimulationManager,
            this.basicAIManager,
            this.warriorSkillsAI,
            targetingManager,
            this.monsterAI,
            slotMachineManager,
            eventManager
        );

        // Less frequently used AI helpers
        this.aiEngine = new AIEngine();
        this.metaAIManager = new MetaAIManager();
        this.skillAIManager = new SkillAIManager();
    }
}

export {
    AIEngine,
    BasicAIManager,
    ClassAIManager,
    MetaAIManager,
    MonsterAI,
    SkillAIManager,
    WarriorSkillsAI
};
