// js/managers/MonsterSpawnManager.js

import { ATTACK_TYPES } from '../constants.js';

// StageDataManager will provide monster layouts

export class MonsterSpawnManager {
    constructor(idManager, assetLoaderManager, battleSimulationManager, stageDataManager) {
        console.log("\uD83D\uDC79 MonsterSpawnManager initialized. Spawning creatures of the dark. \uD83D\uDC79");
        this.idManager = idManager;
        this.assetLoaderManager = assetLoaderManager;
        this.battleSimulationManager = battleSimulationManager;
        this.stageDataManager = stageDataManager;
    }

    /**
     * 스테이지 ID에 따라 몬스터를 스폰합니다.
     * @param {string} stageId - 몬스터를 스폰할 스테이지의 ID
     */
    async spawnMonstersForStage(stageId) {
        if (!this.stageDataManager) {
            console.error('[MonsterSpawnManager] StageDataManager not provided.');
            return;
        }

        const currentStage = this.stageDataManager.getStageData(stageId);
        if (!currentStage) {
            console.error(`[MonsterSpawnManager] Stage data for '${stageId}' not found.`);
            return;
        }

        const zombieClassData = await this.idManager.get('class_zombie');
        const zombieImage = this.assetLoaderManager.getImage('sprite_zombie_default');

        const zombieData = currentStage.monsters.find(m => m.classId === 'class_zombie');
        if (zombieData) {
            const formation = currentStage.formations[zombieData.formation] || [];
            for (let i = 0; i < zombieData.count; i++) {
                const pos = formation[i] || { x: 13 + i, y: 4 };
                const unitId = `unit_zombie_${Date.now()}_${i}`;

                const zombieUnit = {
                    id: unitId,
                    name: '좀비',
                    classId: 'class_zombie',
                    type: ATTACK_TYPES.ENEMY,
                    spriteId: 'sprite_zombie_default',
                    gridX: pos.x,
                    gridY: pos.y,
                    baseStats: { ...(zombieClassData.baseStats || {}) },
                    currentHp: zombieClassData.baseStats.hp,
                };

                await this.idManager.addOrUpdateId(unitId, zombieUnit);
                this.battleSimulationManager.addUnit(zombieUnit, zombieImage, pos.x, pos.y);
            }
        }
        console.log(`[MonsterSpawnManager] Spawned monsters for stage: ${stageId}`);
    }
}
