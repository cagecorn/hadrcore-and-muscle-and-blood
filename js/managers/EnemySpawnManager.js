import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 전투 시작 시 적군 영웅들을 스폰하는 매니저입니다.
 */
export class EnemySpawnManager {
    constructor(heroManager, enemyEngine, battleSimulationManager, idManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\udd25 EnemySpawnManager initialized. Spawning elite enemies. \uD83D\udd25");
        this.heroManager = heroManager;
        this.enemyEngine = enemyEngine;
        this.battleSimulationManager = battleSimulationManager;
        this.idManager = idManager;
    }

    /**
     * 지정된 수만큼의 적 전사 유닛을 생성하고 배치합니다.
     * @param {number} count - 스폰할 적 전사의 수
     */
    async spawnEnemyWarriors(count) {
        const heroWarriors = await this.heroManager.createWarriors(count);

        const formation = [
            { x: 13, y: 4 }, { x: 12, y: 2 }, { x: 12, y: 6 },
            { x: 14, y: 3 }, { x: 14, y: 5 }
        ];

        for (let i = 0; i < heroWarriors.length; i++) {
            const heroData = heroWarriors[i];
            const enemyData = await this.enemyEngine.convertHeroToEnemy(heroData);

            if (enemyData) {
                const pos = formation[i] || { x: 13 + i, y: 4 };
                enemyData.gridX = pos.x;
                enemyData.gridY = pos.y;

                await this.idManager.addOrUpdateId(enemyData.id, enemyData);

                const spriteMap = this.enemyEngine.unitSpriteEngine.unitSpriteMap.get(enemyData.id);
                const enemyImage = spriteMap ? spriteMap.get('idle') : null;
                this.battleSimulationManager.addUnit(enemyData, enemyImage, pos.x, pos.y);
            }
        }
        if (GAME_DEBUG_MODE) console.log(`[EnemySpawnManager] Spawned ${count} enemy warriors.`);
    }
}
