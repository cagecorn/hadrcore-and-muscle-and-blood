import { dreadnoughtArchetype } from './dreadnought.js';
import { frostweaverArchetype } from './frostweaver.js';
import { aquiliferArchetype } from './aquilifer.js';

/**
 * 모든 아키타입 정의를 하나의 객체로 통합하여 관리합니다.
 * 새로운 아키타입을 추가할 때마다 이 파일에도 등록해야 합니다.
 */
export const archetypes = {
    Dreadnought: dreadnoughtArchetype,
    Frostweaver: frostweaverArchetype,
    Aquilifer: aquiliferArchetype,
    // ... 향후 추가될 아키타입들
};

