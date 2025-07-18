import { ATTACK_TYPES, GAME_DEBUG_MODE } from '../constants.js';

/**
 * HeroEngine을 통해 생성된 영웅 유닛을 적군 버전으로 변환하는 엔진입니다.
 */
export class EnemyEngine {
    /**
     * @param {UnitSpriteEngine} unitSpriteEngine - 유닛 스프라이트(이미지)를 관리하는 엔진
     */
    constructor(unitSpriteEngine) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDC79 EnemyEngine initialized. Ready to turn heroes into foes. \uD83D\uDC79");
        this.unitSpriteEngine = unitSpriteEngine;
    }

    /**
     * 주어진 영웅 데이터를 적군 유닛 데이터로 변환합니다.
     * @param {object} heroData - HeroManager가 생성한 원본 영웅 데이터
     * @returns {Promise<object>} 적군으로 변환된 유닛 데이터
     */
    async convertHeroToEnemy(heroData) {
        if (!heroData) {
            console.error("[EnemyEngine] Cannot convert null hero data.");
            return null;
        }

        const enemyData = JSON.parse(JSON.stringify(heroData)); // 깊은 복사

        enemyData.type = ATTACK_TYPES.ENEMY;
        enemyData.id = `enemy_${heroData.id}`;

        const unitSprites = this.unitSpriteEngine.unitSpriteMap.get(heroData.id);
        if (unitSprites) {
            const flippedSpriteStates = {};
            for (const [state, image] of unitSprites.entries()) {
                const flippedImage = await this.unitSpriteEngine.getFlippedImage(image);
                flippedSpriteStates[state] = flippedImage.src;
            }
            await this.unitSpriteEngine.registerUnitSprites(enemyData.id, flippedSpriteStates);
        }

        if (GAME_DEBUG_MODE) console.log(`[EnemyEngine] Converted ${heroData.name} to an enemy unit.`);
        return enemyData;
    }
}
