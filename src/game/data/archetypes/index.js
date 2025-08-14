import { dreadnoughtArchetype } from './dreadnought.js';
import { frostweaverArchetype } from './frostweaver.js';
import { aquiliferArchetype } from './aquilifer.js';
import { executionerArchetype } from './executioner.js'; // ✨ [추가]
import { arcaneBladeArchetype } from './arcane_blade.js'; // ✨ [신규]
import { forceMajorArchetype } from './force_major.js'; // ✨ [신규]
import { berserkerArchetype } from './berserker.js'; // ✨ [신규]
import { spellbreakerArchetype } from './spellbreaker.js'; // ✨ [신규]

/**
 * 모든 아키타입 정의를 하나의 객체로 통합하여 관리합니다.
 * 새로운 아키타입을 추가할 때마다 이 파일에도 등록해야 합니다.
 */
export const archetypes = {
    Dreadnought: dreadnoughtArchetype,
    Frostweaver: frostweaverArchetype,
    Aquilifer: aquiliferArchetype,
    Executioner: executionerArchetype, // ✨ [추가]
    ArcaneBlade: arcaneBladeArchetype, // ✨ [신규]
    ForceMajor: forceMajorArchetype, // ✨ [신규]
    Berserker: berserkerArchetype, // ✨ [신규]
    Spellbreaker: spellbreakerArchetype, // ✨ [신규]
    // ... 향후 추가될 아키타입들
};

