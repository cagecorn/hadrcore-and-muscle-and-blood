import { mercenaryEngine } from './MercenaryEngine.js';
import { mercenaryData } from '../data/mercenaries.js';
import { skillInventoryManager } from './SkillInventoryManager.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
import { mercenaryCardSelector } from './MercenaryCardSelector.js';
import { formationEngine } from './FormationEngine.js';
import { mbtiPositioningEngine } from './MBTIPositioningEngine.js';
// 장비 자동 장착 엔진 및 인벤토리 매니저를 가져옵니다.
import { mercenaryEquipmentSelector } from './MercenaryEquipmentSelector.js';
import { itemInventoryManager } from './ItemInventoryManager.js';

/**
 * 아레나 컨텐츠와 관련된 로직(적 생성, 보상 등)을 관리하는 엔진
 */
class ArenaManager {
    constructor() {
        this.name = 'ArenaManager';
        this.enemyTeam = [];
    }

    /**
     * 12명의 랜덤한 적 용병 팀을 생성하고, 스킬과 위치를 MBTI에 따라 결정합니다.
     */
    generateEnemyTeam() {
        this.enemyTeam = [];
        let availableCards = [...skillInventoryManager.getInventory()];
        // 아레나 적들을 위한 임시 장비 인벤토리 풀
        let availableItems = [...itemInventoryManager.getInventory()];
        const mercenaryTypes = Object.values(mercenaryData);

        // --- \u2728 아레나 '적' 진영의 모든 빈 셀 목록을 준비 ---
        const ENEMY_START_COL = 8; // 적 진영 시작 열
        const TOTAL_COLS = 16;
        const TOTAL_ROWS = 9;
        let availableCells = [];
        for (let r = 0; r < TOTAL_ROWS; r++) {
            // 8열부터 15열까지를 적 진영으로 설정합니다.
            for (let c = ENEMY_START_COL; c < TOTAL_COLS; c++) {
                availableCells.push({ col: c, row: r, isOccupied: false });
            }
        }

        const placedEnemies = [];

        for (let i = 0; i < 12; i++) {
            if (availableCells.length === 0) break; 

            // 1. 랜덤 클래스의 적 용병 생성
            const randomType = mercenaryTypes[Math.floor(Math.random() * mercenaryTypes.length)];
            const enemyMercenary = mercenaryEngine.hireMercenary(randomType, 'enemy');

            // 2. MBTI에 따라 스킬 선택
            const { selectedCards, remainingCards } = mercenaryCardSelector.selectCardsForMercenary(enemyMercenary, availableCards);
            selectedCards.forEach((cardInstance, index) => {
                ownedSkillsManager.equipSkill(enemyMercenary.uniqueId, index, cardInstance.instanceId);
            });
            availableCards = remainingCards;

            // 3. MBTI에 따라 장비 선택
            availableItems = mercenaryEquipmentSelector._selectAndEquipBestItemsForMerc(enemyMercenary, availableItems);

            // 4. MBTI에 따라 위치 결정
            const chosenCell = mbtiPositioningEngine.determinePosition(enemyMercenary, availableCells, placedEnemies, 'enemy');

            if (chosenCell) {
                // 5. 결정된 위치 정보 저장
                enemyMercenary.gridX = chosenCell.col;
                enemyMercenary.gridY = chosenCell.row;
                // formationEngine에 DOM이 아닌 논리적 위치를 저장합니다.
                // ArenaDOMEngine은 이 정보를 사용하게 됩니다.
                const cellIndex = (chosenCell.row * TOTAL_COLS) + chosenCell.col;
                formationEngine.setPosition(enemyMercenary.uniqueId, cellIndex);

                placedEnemies.push(enemyMercenary);
                // 사용된 셀은 후보에서 제거
                availableCells = availableCells.filter(c => c.col !== chosenCell.col || c.row !== chosenCell.row);
            }

            this.enemyTeam.push(enemyMercenary);
        }

        console.log('[ArenaManager] 아레나 적 팀 생성 및 자동 장비/스킬/배치가 완료되었습니다.');
        return this.enemyTeam;
    }

    getEnemyTeam() {
        return this.enemyTeam;
    }
}

export const arenaManager = new ArenaManager();
