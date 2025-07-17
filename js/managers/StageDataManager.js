// js/managers/StageDataManager.js

import { STAGE_DATA } from '../../data/stages.js';

export class StageDataManager {
    constructor() {
        console.log("\uD83D\uDCC4 StageDataManager initialized. Loading stage blueprints. \uD83D\uDCC4");
        this.stageData = STAGE_DATA;
    }

    getStageData(stageId) {
        return this.stageData[stageId] || null;
    }
}
