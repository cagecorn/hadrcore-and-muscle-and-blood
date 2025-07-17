// js/managers/DisarmManager.js

export class DisarmManager {
    constructor(eventManager, statusEffectManager, battleSimulationManager, measureManager) {
        console.log("\uD83D\uDEE0\uFE0F DisarmManager initialized. Ready to handle disarming events. \uD83D\uDEE0\uFE0F");
        this.eventManager = eventManager;
        this.statusEffectManager = statusEffectManager;
        this.battleSimulationManager = battleSimulationManager;
        this.measureManager = measureManager;

        // 유닛 사망 이벤트 구독
        this.eventManager.subscribe('unitDeath', this._onUnitDeath.bind(this));
        console.log("[DisarmManager] Subscribed to 'unitDeath' event.");
    }

    /**
     * 유닛이 사망했을 때 호출되는 핸들러.
     * @param {{ unitId: string, unitName: string, unitType: string }} data - 사망 유닛 데이터
     */
    _onUnitDeath(data) {
        // 무장해제 시스템이 활성화되어 있는지 확인
        if (!this.measureManager.get('gameConfig.enableDisarmSystem')) {
            console.log("[DisarmManager] Disarm system is currently disabled. Skipping disarm process.");
            return;
        }

        const deadUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === data.unitId);

        // 현재는 '좀비' 유닛에 대해서만 무장해제 로직을 적용
        if (deadUnit && deadUnit.id.includes('zombie')) {
            console.log(`[DisarmManager] Unit '${data.unitName}' (${data.unitId}) has been defeated. Initiating disarm process.`);

            // 1. 유닛 이미지 변경 (zombie -> zombie-empty)
            deadUnit.image = this.battleSimulationManager.assetLoaderManager.getImage('sprite_zombie_empty_default');
            if (!deadUnit.image) {
                console.warn(`[DisarmManager] 'sprite_zombie_empty_default' image not loaded for ${data.unitName}.`);
            } else {
                console.log(`[DisarmManager] Unit '${data.unitName}' image changed to disarmed state.`);
            }

            // 2. '무장해제' 상태 이상 적용
            this.statusEffectManager.applyStatusEffect(data.unitId, 'status_disarmed');

            // 3. 무기 드롭 애니메이션 트리거
            this.eventManager.emit('weaponDropped', { unitId: data.unitId, weaponSpriteId: 'sprite_zombie_weapon_default' });
            console.log(`[DisarmManager] Weapon drop animation triggered for unit '${data.unitId}'.`);

            // TODO: 포획 로직 등 추가
            this.eventManager.emit('unitDisarmed', { unitId: data.unitId, unitName: data.unitName });
        } else {
            console.log(`[DisarmManager] Unit '${data.unitName}' (${data.unitId}) is not a disarmable unit.`);
        }
    }
}
