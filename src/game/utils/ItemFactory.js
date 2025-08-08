import { itemBaseData, itemAffixes, mbtiGradeEffects } from '../data/items.js';
import { uniqueIDManager } from './UniqueIDManager.js';
import { diceEngine } from './DiceEngine.js';
import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 아이템 데이터를 기반으로 고유한 아이템 인스턴스를 생성하는 공장 클래스
 */
class ItemFactory {
    constructor() {
        this.name = 'ItemFactory';
        // 등급별로 부여할 랜덤 옵션의 개수를 정의합니다.
        this.optionsPerGrade = {
            NORMAL: 1,
            RARE: 2,
            EPIC: 3,
            LEGENDARY: 4 // 레전더리는 모든 옵션을 가집니다.
        };
        debugLogEngine.register(this);
    }

    /**
     * 지정된 ID의 기본 아이템에 무작위 접두사/접미사를 붙여 새로운 아이템을 생성합니다.
     * @param {string} baseItemId - 생성할 아이템의 ID
     * @returns {object|null} - 생성된 아이템 인스턴스 또는 null
     */
    createItem(baseItemId, grade = 'NORMAL') {
        const baseData = itemBaseData[baseItemId];
        if (!baseData) {
            debugLogEngine.error(this.name, `'${baseItemId}'에 해당하는 아이템 기본 데이터를 찾을 수 없습니다.`);
            return null;
        }

        const newItem = {
            instanceId: uniqueIDManager.getNextId(),
            baseId: baseItemId,
            name: `[${grade}] ${baseData.name}`,
            type: baseData.type,
            grade: grade,
            synergy: baseData.synergy || null,
            illustrationPath: baseData.illustrationPath,
            stats: {},
            mbtiEffects: [],
            sockets: [],
            weight: baseData.weight
        };

        // 1. 기본 스탯 적용
        for (const [stat, range] of Object.entries(baseData.baseStats)) {
            newItem.stats[stat] = this._getRandomValue(range.min, range.max);
        }

        // 2. 부여할 수 있는 모든 옵션 풀 생성
        const optionPool = [
            { type: 'prefix', data: diceEngine.getRandomElement(itemAffixes.prefixes) },
            { type: 'suffix', data: diceEngine.getRandomElement(itemAffixes.suffixes) },
            { type: 'mbti', data: this._getRandomMbtiEffect() },
            { type: 'sockets', data: { count: Math.max(1, diceEngine.rollWithAdvantage(0, 3, 1)) } }
        ];

        // 3. 옵션 풀을 무작위로 섞고 등급에 맞는 수만큼 선택
        const shuffledPool = optionPool.sort(() => 0.5 - Math.random());
        const optionsToApply = shuffledPool.slice(0, this.optionsPerGrade[grade]);

        let prefixName = '';
        let suffixName = '';

        optionsToApply.forEach(option => {
            switch (option.type) {
                case 'prefix':
                    prefixName = option.data.name;
                    this._applyAffix(newItem, option.data);
                    break;
                case 'suffix':
                    suffixName = option.data.name;
                    this._applyAffix(newItem, option.data);
                    break;
                case 'mbti':
                    newItem.mbtiEffects.push(option.data);
                    break;
                case 'sockets': {
                    const socketCount = Math.floor(Math.max(0, Math.min(3, option.data.count)));
                    newItem.sockets.push(...Array(socketCount).fill(null));
                    break;
                }
            }
        });

        newItem.name = `[${grade}] ${prefixName} ${baseData.name} ${suffixName}`.replace(/\s+/g, ' ').trim();

        debugLogEngine.log(this.name, `새 아이템 생성: [${newItem.name}] (ID: ${newItem.instanceId})`);
        console.log(newItem);
        return newItem;
    }

    _applyAffix(item, affixData) {
        const value = this._getRandomValue(affixData.value.min, affixData.value.max);
        const statKey = affixData.isPercentage ? `${affixData.stat}Percentage` : affixData.stat;
        item.stats[statKey] = (item.stats[statKey] || 0) + value;
    }

    _getRandomMbtiEffect() {
        const allTraits = Object.keys(mbtiGradeEffects);
        const randomTrait = diceEngine.getRandomElement(allTraits);
        const effectPool = mbtiGradeEffects[randomTrait];
        const selectedEffect = diceEngine.getRandomElement(effectPool);

        const finalEffect = { ...selectedEffect };
        finalEffect.value = this._getRandomValue(selectedEffect.value.min, selectedEffect.value.max);
        return finalEffect;
    }

    /**
     * 최소값과 최대값 사이의 랜덤 정수를 반환하는 헬퍼 함수
     * @private
     */
    _getRandomValue(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export const itemFactory = new ItemFactory();
