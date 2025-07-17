// js/managers/HeroManager.js

import { ATTACK_TYPES, GAME_DEBUG_MODE } from '../constants.js';
import { UNITS } from '../../data/unit.js';
import { CLASSES } from '../../data/class.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class HeroManager {
    constructor(idManager, diceEngine, assetLoaderManager, battleSimulationManager, unitSpriteEngine, diceBotEngine, birthReportManager, heroEngine) {
        if (GAME_DEBUG_MODE) console.log("\u2728 HeroManager initialized. Ready to create legendary heroes. \u2728");
        this.idManager = idManager;
        this.diceEngine = diceEngine;
        this.assetLoaderManager = assetLoaderManager;
        this.battleSimulationManager = battleSimulationManager;
        this.unitSpriteEngine = unitSpriteEngine;
        this.diceBotEngine = diceBotEngine;
        this.birthReportManager = birthReportManager;
        this.heroEngine = heroEngine;
        this.heroNameList = [
            '레오닉', '아서스', '가로쉬', '스랄', '제이나', '안두인',
            '바리안', '실바나스', '그롬마쉬', '렉사르', '알렉스트라자', '이렐리아'
        ];
    }

    /**
     * 지정된 수만큼의 전사 클래스 영웅 데이터를 생성하여 반환합니다.
     * @param {number} count - 생성할 영웅의 수
     * @returns {Promise<object[]>} 생성된 영웅 데이터 배열
     */
    async createWarriors(count) {
        if (GAME_DEBUG_MODE) console.log(`[HeroManager] Creating data for ${count} new warriors...`);
        const warriorClassData = await this.idManager.get(CLASSES.WARRIOR.id);
        const warriorImage = this.assetLoaderManager.getImage(UNITS.WARRIOR.spriteId);

        const allWarriorSkillIds = Object.values(WARRIOR_SKILLS).map(skill => skill.id);

        if (!warriorClassData || !warriorImage) {
            console.error('[HeroManager] Warrior class data or image not found. Cannot create warriors.');
            return [];
        }

        const createdHeroes = [];

        for (let i = 0; i < count; i++) {
            const unitId = `hero_warrior_${Date.now()}_${i}`;
            const randomName = this.diceBotEngine.pickUniqueItems(this.heroNameList, 1)[0];

            const randomSkills = this.diceBotEngine.pickUniqueItems(allWarriorSkillIds, 3);
            if (GAME_DEBUG_MODE) console.log(`[HeroManager Debug] Warrior ${i+1} (${randomName}) skills:`, randomSkills.join(", "));

            const heroUnitData = {
                id: unitId,
                name: randomName,
                classId: CLASSES.WARRIOR.id,
                type: ATTACK_TYPES.MERCENARY,
                spriteId: UNITS.WARRIOR.spriteId,
                gridX: 0,
                gridY: 0,
                baseStats: {
                    ...UNITS.WARRIOR.baseStats,
                    moveRange: warriorClassData.moveRange || 1
                },
                currentHp: UNITS.WARRIOR.baseStats.hp,
                skillSlots: [...randomSkills],
                tags: [...CLASSES.WARRIOR.tags]
            };

            await this.idManager.addOrUpdateId(unitId, heroUnitData);
            await this.unitSpriteEngine.registerUnitSprites(unitId, {
                idle: 'assets/images/warrior.png',
                attack: 'assets/images/warrior-attack.png',
                hitted: 'assets/images/warrior-hitted.png',
                finish: 'assets/images/warrior-finish.png',
                status: 'assets/images/warrior-status-effects.png'
            });

            if (this.birthReportManager) {
                this.birthReportManager.report(heroUnitData);
            }

            if (this.heroEngine) {
                await this.heroEngine.addHero(heroUnitData);
            }

            createdHeroes.push(heroUnitData);
            if (GAME_DEBUG_MODE) console.log(`[HeroManager] Created data for warrior: ${heroUnitData.name}`);
        }
        return createdHeroes;
    }
}
