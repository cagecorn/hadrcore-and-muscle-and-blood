// js/managers/GameDataManager.js

import { CLASSES } from '../../data/class.js';

/**
 * GameDataManager seeds the IdManager with static game data
 * such as class definitions. This ensures other managers
 * can safely access class information during initialization.
 */
export class GameDataManager {
    /**
     * Register all base class data into IdManager.
     * @param {IdManager} idManager - IdManager instance
     */
    static async registerBaseClasses(idManager) {
        if (!idManager) {
            console.error('[GameDataManager] IdManager not provided.');
            return;
        }
        for (const key of Object.keys(CLASSES)) {
            const classData = CLASSES[key];
            try {
                await idManager.addOrUpdateId(classData.id, classData);
            } catch (e) {
                console.error(`[GameDataManager] Failed to register class ${classData.id}:`, e);
            }
        }
    }
}
