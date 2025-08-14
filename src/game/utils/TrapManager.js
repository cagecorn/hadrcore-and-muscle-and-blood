import { debugLogEngine } from './DebugLogEngine.js';
import { formationEngine } from './FormationEngine.js';

class TrapManager {
    constructor() {
        this.name = 'TrapManager';
        // key: "col,row", value: { ownerId, skillData, sprite }
        this.activeTraps = new Map();
        debugLogEngine.register(this);
    }

    /**
     * 전투 시작 시 모든 함정 데이터를 초기화합니다.
     */
    reset() {
        this.activeTraps.forEach(trap => trap.sprite?.destroy());
        this.activeTraps.clear();
        debugLogEngine.log(this.name, '모든 함정 데이터를 초기화했습니다.');
    }

    /**
     * 특정 타일에 함정을 설치합니다.
     * @param {number} col - 설치할 타일의 열
     * @param {number} row - 설치할 타일의 행
     * @param {object} trapData - { owner, skillData }
     * @param {object} battle - 현재 전투 정보 객체
     */
    addTrap(col, row, trapData, battle) {
        if (!battle || !battle.scene) {
            console.error('addTrap 호출 시 battle 객체가 전달되지 않았습니다.');
            return;
        }

        if (!formationEngine.grid) {
            console.error('TrapManager: formationEngine.grid가 등록되어 있지 않습니다.');
            return;
        }

        const key = `${col},${row}`;
        if (this.activeTraps.has(key)) {
            debugLogEngine.warn(this.name, `[${key}] 타일에는 이미 함정이 존재하여 덮어썼습니다.`);
            this.activeTraps.get(key).sprite?.destroy();
        }

        // formationEngine의 그리드를 사용하여 셀을 조회합니다.
        const cell = formationEngine.grid.getCell(col, row);
        if (cell) {
            const trapSprite = battle.scene.add
                .image(cell.x, cell.y, 'placeholder')
                .setScale(0.1)
                .setAlpha(0.5);

            this.activeTraps.set(key, { ...trapData, sprite: trapSprite });
            debugLogEngine.log(this.name, `[${key}] 타일에 [${trapData.skillData.name}] 함정을 설치했습니다.`);
        } else {
            console.error(`(${col}, ${row}) 위치에 해당하는 셀을 찾을 수 없습니다.`);
        }
    }

    /**
     * 특정 타일에 함정이 있는지 확인합니다.
     * @returns {object|null} 함정 데이터 또는 null
     */
    getTrapAt(col, row) {
        return this.activeTraps.get(`${col},${row}`) || null;
    }

    /**
     * 유닛이 함정을 밟았을 때 효과를 발동시킵니다.
     * @param {object} unit - 함정을 밟은 유닛
     * @param {SkillEffectProcessor} skillEffectProcessor - 효과 처리를 위임할 프로세서
     */
    async triggerTrap(unit, skillEffectProcessor) {
        const key = `${unit.gridX},${unit.gridY}`;
        const trap = this.activeTraps.get(key);

        if (!trap) return;

        console.log(
            `%c[TrapManager] ${unit.instanceName}이(가) [${trap.skillData.name}] 함정을 발동시켰습니다!`,
            'color: #f97316; font-weight: bold;'
        );

        await skillEffectProcessor.process({
            unit: trap.owner,
            target: unit,
            skill: trap.skillData
        });

        this.removeTrap(unit.gridX, unit.gridY);
    }

    /**
     * 특정 타일의 함정을 제거합니다.
     */
    removeTrap(col, row) {
        const key = `${col},${row}`;
        const trap = this.activeTraps.get(key);
        if (trap) {
            trap.sprite?.destroy();
            this.activeTraps.delete(key);
            debugLogEngine.log(this.name, `[${key}] 타일의 함정을 제거했습니다.`);
        }
    }
}

export const trapManager = new TrapManager();
