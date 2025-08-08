import { debugLogEngine } from './DebugLogEngine.js';
import { monsterEngine } from './MonsterEngine.js';
import { formationEngine } from './FormationEngine.js';
import { getMonsterBase } from '../data/monster.js';
import { getSummonBase } from '../data/summon.js';
// AI 매니저와 근접 AI를 불러와 소환된 유닛을 즉시 등록할 수 있도록 합니다.
import { aiManager } from '../../ai/AIManager.js';
// 소환된 유닛을 토큰 시스템에 등록하기 위해 토큰 엔진을 불러옵니다.
import { tokenEngine } from './TokenEngine.js';
// 소환수의 최종 스탯 계산을 위해 스탯 엔진을 불러옵니다.
import { statEngine } from './StatEngine.js';

/**
 * 전투 중 유닛 소환을 담당하는 엔진
 */
class SummoningEngine {
    constructor(scene, battleSimulator) {
        this.scene = scene;
        this.battleSimulator = battleSimulator; // 전투 시뮬레이터 참조
        // 소환사와 소환수의 관계를 추적합니다.
        this.summonerToSummonsMap = new Map();
        debugLogEngine.log('SummoningEngine', '소환 엔진이 초기화되었습니다.');
    }

    /**
     * 전투 시작 시 호출하여 모든 소환 관계를 초기화합니다.
     */
    reset() {
        this.summonerToSummonsMap.clear();
    }

    /**
     * 스킬 효과로 유닛을 소환합니다.
     * @param {object} summoner - 소환을 시전하는 유닛
     * @param {object} summonSkillData - 사용된 소환 스킬의 데이터
     * @returns {object|null} - 성공적으로 소환된 유닛 인스턴스 또는 실패 시 null
     */
    summon(summoner, summonSkillData) {
        if (!summoner || !summonSkillData || !summonSkillData.creatureId) {
            debugLogEngine.warn('SummoningEngine', '소환사 또는 소환 스킬 정보가 유효하지 않습니다.');
            return null;
        }

        // 1. 소환될 위치 찾기 (소환사 주변의 빈 칸)
        const summonCell = this._findBestSummonCell(summoner);
        if (!summonCell) {
            debugLogEngine.warn('SummoningEngine', `${summoner.instanceName} 주변에 소환할 공간이 없습니다.`);
            // 여기에 소환 실패 시 시각 효과를 추가할 수 있습니다 (예: '소환 실패!' 텍스트)
            if (this.battleSimulator.vfxManager) {
                this.battleSimulator.vfxManager.showSkillName(summoner.sprite, "소환 실패", "#ff0000");
            }
            return null;
        }

        // 2. 소환수 데이터 생성
        let monsterBase = getMonsterBase(summonSkillData.creatureId);
        if (!monsterBase) {
            monsterBase = getSummonBase(summonSkillData.creatureId);
        }
        if (!monsterBase) {
            debugLogEngine.error('SummoningEngine', `몬스터 데이터베이스에서 '${summonSkillData.creatureId}'를 찾을 수 없습니다.`);
            return null;
        }
        // 소환수는 소환사와 같은 팀으로 생성됩니다.
        const summonedUnit = monsterEngine.spawnMonster(monsterBase, summoner.team);

        // --- ▼ 메카닉 클래스 패시브: 소환수 스탯 강화 ▼ ---
        if (summoner.classPassive?.id === 'mechanicalEnhancement') {
            const statsToInherit = [
                'hp', 'valor', 'strength', 'endurance', 'agility', 'intelligence', 'wisdom', 'luck',
                'physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'criticalChance',
                'criticalDamageMultiplier'
            ];

            let bonusApplied = false;
            statsToInherit.forEach(stat => {
                if (summoner.finalStats[stat]) {
                    const bonus = summoner.finalStats[stat] * 0.10;
                    summonedUnit.baseStats[stat] = (summonedUnit.baseStats[stat] || 0) + bonus;
                    bonusApplied = true;
                }
            });

            if (bonusApplied) {
                // 강화된 기본 스탯을 기반으로 최종 스탯을 즉시 재계산합니다.
                summonedUnit.finalStats = statEngine.calculateStats(summonedUnit, summonedUnit.baseStats);
                debugLogEngine.log('SummoningEngine', `[기계 강화] 패시브 발동! ${summoner.instanceName}의 능력치 10%를 ${summonedUnit.instanceName}에게 부여합니다.`);
            }
        }
        // --- ▲ 메카닉 클래스 패시브: 소환수 스탯 강화 ▲ ---

        // 강화 적용 후 토큰 엔진에 등록하여 바로 행동할 수 있게 합니다.
        tokenEngine.registerUnit(summonedUnit);

        // 3. 소환수 전장 배치
        formationEngine.placeUnitAt(this.scene, summonedUnit, summonCell.col, summonCell.row);

        // 4. 소환된 유닛의 VFX(이름표, 체력바 등) 설정
        // BattleSimulatorEngine의 유닛 설정 로직을 재활용합니다.
        this.battleSimulator._setupUnits([summonedUnit]);

        // 5. AI 매니저에 새 유닛을 등록하여 즉시 행동 트리를 갖게 합니다.
        aiManager.registerUnit(summonedUnit);
        debugLogEngine.log('SummoningEngine', `${summonedUnit.instanceName} AI 등록`);

        // 6. 소환사에게 체력 페널티 적용
        const penalty = Math.round(summoner.finalStats.hp * (summonSkillData.healthCostPercent || 0.1)); // 기본 10%
        summoner.currentHp -= penalty;

        // ✨ [수정] VFX 및 UI 업데이트 로직 수정
        if (this.battleSimulator) {
            // 데미지 숫자는 VFX 매니저로 생성
            if (this.battleSimulator.vfxManager) {
                this.battleSimulator.vfxManager.createDamageNumber(
                    summoner.sprite.x,
                    summoner.sprite.y,
                    `-${penalty}`,
                    '#9333ea'
                );
            }
            // 체력바 업데이트는 Combat UI 매니저로 수행
            if (this.battleSimulator.combatUI) {
                this.battleSimulator.combatUI.updateHealth(summoner);
            }
        }

        // 7. 전투 턴 큐에 소환수 추가
        this.battleSimulator.turnQueue.push(summonedUnit);
        aiManager.updateBlackboard(this.battleSimulator.turnQueue);

        // 8. 소환 관계 기록
        if (!this.summonerToSummonsMap.has(summoner.uniqueId)) {
            this.summonerToSummonsMap.set(summoner.uniqueId, new Set());
        }
        this.summonerToSummonsMap.get(summoner.uniqueId).add(summonedUnit.uniqueId);

        debugLogEngine.log('SummoningEngine', `${summoner.instanceName}이(가) ${summonedUnit.instanceName}을(를) (${summonCell.col}, ${summonCell.row})에 소환했습니다.`);

        return summonedUnit;
    }

    /**
     * 소환사를 기준으로 소환에 가장 적합한 빈 칸을 찾습니다.
     * @param {object} summoner - 소환사 유닛
     * @returns {object|null} - 최적의 그리드 셀 또는 null
     * @private
     */
    _findBestSummonCell(summoner) {
        const { gridX, gridY } = summoner;
        const directions = [
            { col: 0, row: -1 }, // Up
            { col: 0, row: 1 },  // Down
            { col: -1, row: 0 }, // Left
            { col: 1, row: 0 },  // Right
            { col: -1, row: -1 }, // Up-Left
            { col: 1, row: -1 },  // Up-Right
            { col: -1, row: 1 },  // Down-Left
            { col: 1, row: 1 },   // Down-Right
        ];

        for (const dir of directions) {
            const checkCol = gridX + dir.col;
            const checkRow = gridY + dir.row;
            const cell = formationEngine.grid.getCell(checkCol, checkRow);

            if (cell && !cell.isOccupied) {
                return cell; // 가장 먼저 찾은 빈 칸을 반환
            }
        }

        return null; // 주변에 빈 칸이 없음
    }

    /**
     * 특정 소환사가 소유한 소환수들의 ID 집합을 반환합니다.
     * @param {number} summonerId
     * @returns {Set<number>|undefined}
     */
    getSummons(summonerId) {
        return this.summonerToSummonsMap.get(summonerId);
    }
}

export { SummoningEngine };
