import assert from 'assert';
import { itemFactory } from '../src/game/utils/ItemFactory.js';
import { itemBaseData, itemAffixes } from '../src/game/data/items.js';

const prefixNames = itemAffixes.prefixes.map(p => p.name);
const suffixNames = itemAffixes.suffixes.map(s => s.name);
const baseRange = itemBaseData.baseballBat.baseStats.physicalAttack;

for (let i = 0; i < 5; i++) {
    const item = itemFactory.createItem('baseballBat');

    const cleanedName = item.name.replace(/^\[[^\]]+\]\s*/, '');
    const hasPrefix = prefixNames.some(name => cleanedName.startsWith(name));
    const hasSuffix = suffixNames.some(name => cleanedName.endsWith(name));

    // 기본 스탯 범위 검증
    assert(item.stats.physicalAttack >= baseRange.min && item.stats.physicalAttack <= baseRange.max,
        'Base stat out of range');

    const optionCount =
        (hasPrefix ? 1 : 0) +
        (hasSuffix ? 1 : 0) +
        (item.mbtiEffects.length > 0 ? 1 : 0) +
        (item.sockets.length > 0 ? 1 : 0);

    // NORMAL 등급은 정확히 하나의 랜덤 옵션만 가진다
    assert.strictEqual(optionCount, 1, 'Incorrect number of options for NORMAL grade');

    if (hasPrefix) {
        const prefixData = itemAffixes.prefixes.find(p => cleanedName.startsWith(p.name));
        const statKey = prefixData.isPercentage ? `${prefixData.stat}Percentage` : prefixData.stat;
        assert(item.stats[statKey] >= prefixData.value.min && item.stats[statKey] <= prefixData.value.max,
            'Prefix stat out of range');
    }

    if (hasSuffix) {
        const suffixData = itemAffixes.suffixes.find(s => cleanedName.endsWith(s.name));
        const statKey = suffixData.isPercentage ? `${suffixData.stat}Percentage` : suffixData.stat;
        assert(item.stats[statKey] >= suffixData.value.min && item.stats[statKey] <= suffixData.value.max,
            'Suffix stat out of range');
    }

    if (item.mbtiEffects.length > 0) {
        assert(item.mbtiEffects.length === 1, 'Unexpected number of MBTI effects');
    }

    if (item.sockets.length > 0) {
        assert(item.sockets.length >= 1 && item.sockets.length <= 3, 'Socket count out of range');
    }

    assert.strictEqual(item.grade, 'NORMAL');
}

console.log('Item factory tests passed.');
