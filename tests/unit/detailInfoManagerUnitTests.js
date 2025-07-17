// tests/unit/detailInfoManagerUnitTests.js

import { DetailInfoManager } from '../../js/managers/DetailInfoManager.js';
import { EventManager } from '../../js/managers/EventManager.js';
import { MeasureManager } from '../../js/managers/MeasureManager.js';
import { BattleSimulationManager } from '../../js/managers/BattleSimulationManager.js';
import { HeroEngine } from '../../js/managers/HeroEngine.js'; // HeroEngine 임포트
import { IdManager } from '../../js/managers/IdManager.js'; // IdManager 임포트
import { AnimationManager } from '../../js/managers/AnimationManager.js'; // AnimationManager도 필요

export function runDetailInfoManagerUnitTests() {
    console.log("--- DetailInfoManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // Mock Dependencies
    const mockEventManager = new EventManager();
    // emit을 목업하여 이벤트 발행 여부 확인
    let emittedEvents = [];
    const originalEmit = mockEventManager.emit;
    mockEventManager.emit = (eventName, data) => {
        emittedEvents.push({ eventName, data });
        originalEmit.call(mockEventManager, eventName, data);
    };

    const mockMeasureManager = new MeasureManager();
    const mockAnimationManager = new AnimationManager(mockMeasureManager); // AnimationManager 필요
    const mockBattleSimulationManager = {
        unitsOnGrid: [],
        animationManager: mockAnimationManager, // BattleSimulationManager가 AnimationManager를 가지고 있다고 가정
        getGridRenderParameters: () => ({ effectiveTileSize: 100, gridOffsetX: 0, gridOffsetY: 0 })
    };
    const mockCameraEngine = {
        screenToWorld: (x, y) => ({ x, y })
    };
    const mockHeroEngine = {
        heroes: new Map(),
        getHero: async (heroId) => {
            if (heroId === 'hero_warrior_001') {
                return {
                    id: 'hero_warrior_001',
                    name: '테스트 영웅',
                    skills: ['skill_charge', 'skill_cleave', 'skill_passive_toughness'],
                    synergies: ['synergy_warrior', 'synergy_melee']
                };
            }
            return undefined;
        }
    };
    const mockIdManager = {
        get: async (id) => {
            if (id === 'class_warrior') return { id: 'class_warrior', name: '전사', skills: ['skill_default_attack'] };
            if (id === 'class_zombie') return { id: 'class_zombie', name: '좀비' };
            return undefined;
        }
    };

    const mockCtx = {
        save: () => {},
        restore: () => {},
        fillRect: function() { this.fillRectCalled = true; },
        strokeRect: function() { this.strokeRectCalled = true; },
        fillText: function() { this.fillTextCalled = true; },
        clearRect: () => {},
        globalAlpha: 1, fillStyle: '', font: '', textAlign: '', textBaseline: '',
        fillRectCalled: false, strokeRectCalled: false, fillTextCalled: false
    };

    // 테스트 유닛 데이터
    const mockWarriorUnit = {
        id: 'unit_warrior_001', name: '용맹한 전사', type: 'mercenary',
        gridX: 1, gridY: 1, currentHp: 80, baseStats: { hp: 100, attack: 20, defense: 10, speed: 50, valor: 30, strength: 25, endurance: 20, agility: 15, intelligence: 5, wisdom: 10, luck: 10, weight: 30 },
        classId: 'class_warrior', currentBarrier: 60, maxBarrier: 60
    };
    const mockZombieUnit = {
        id: 'unit_zombie_001', name: '끔찍한 좀비', type: 'enemy',
        gridX: 5, gridY: 5, currentHp: 40, baseStats: { hp: 80, attack: 15, defense: 5, speed: 30, valor: 10, strength: 10, endurance: 8, agility: 12, intelligence: 5, wisdom: 5, luck: 15, weight: 10 },
        classId: 'class_zombie', currentBarrier: 20, maxBarrier: 20
    };
    const mockDeadUnit = {
        id: 'unit_dead_001', name: '죽은 유닛', type: 'enemy',
        gridX: 2, gridY: 2, currentHp: 0, baseStats: { hp: 50 },
        classId: 'class_dead', currentBarrier: 0, maxBarrier: 0
    };


    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const dim = new DetailInfoManager(mockEventManager, mockMeasureManager, mockBattleSimulationManager, mockHeroEngine, mockIdManager, mockCameraEngine);
        if (dim.eventManager === mockEventManager && dim.hoveredUnit === null) {
            console.log("DetailInfoManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("DetailInfoManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("DetailInfoManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: _onCanvasMouseMove - 마우스 좌표 업데이트 확인
    testCount++;
    try {
        const dim = new DetailInfoManager(mockEventManager, mockMeasureManager, mockBattleSimulationManager, mockHeroEngine, mockIdManager, mockCameraEngine);
        dim._onCanvasMouseMove({ x: 100, y: 150 });
        if (dim.lastMouseX === 100 && dim.lastMouseY === 150) {
            console.log("DetailInfoManager: _onCanvasMouseMove updated mouse coordinates. [PASS]");
            passCount++;
        } else {
            console.error("DetailInfoManager: _onCanvasMouseMove failed to update coordinates. [FAIL]");
        }
    } catch (e) {
        console.error("DetailInfoManager: Error during _onCanvasMouseMove test. [FAIL]", e);
    }

    // 테스트 3: update - 유닛 호버링 감지 (새로운 유닛)
    testCount++;
    mockBattleSimulationManager.unitsOnGrid = [mockWarriorUnit, mockZombieUnit];
    mockAnimationManager.getRenderPosition = (unitId) => {
        if (unitId === 'unit_warrior_001') return { drawX: 100, drawY: 100 };
        if (unitId === 'unit_zombie_001') return { drawX: 500, drawY: 500 };
        return { drawX: 0, drawY: 0 };
    };
    try {
        const dim = new DetailInfoManager(mockEventManager, mockMeasureManager, mockBattleSimulationManager, mockHeroEngine, mockIdManager, mockCameraEngine);
        dim._onCanvasMouseMove({ x: 120, y: 120 }); // warrior 위에 마우스
        dim.update(16); // 델타 타임

        if (dim.hoveredUnit && dim.hoveredUnit.id === 'unit_warrior_001' && dim.tooltipVisible) {
            console.log("DetailInfoManager: update correctly detected new unit hover. [PASS]");
            passCount++;
        } else {
            console.error("DetailInfoManager: update failed to detect new unit hover. [FAIL]", dim.hoveredUnit);
        }
    } catch (e) {
        console.error("DetailInfoManager: Error during update (new hover) test. [FAIL]", e);
    }

    // 테스트 4: update - 호버링 해제
    testCount++;
    try {
        const dim = new DetailInfoManager(mockEventManager, mockMeasureManager, mockBattleSimulationManager, mockHeroEngine, mockIdManager, mockCameraEngine);
        dim.hoveredUnit = mockWarriorUnit; // 이미 호버링 중
        dim.tooltipVisible = true;
        dim.tooltipAlpha = 1;

        dim._onCanvasMouseMove({ x: 0, y: 0 }); // 유닛 밖으로 마우스 이동
        dim.update(16);

        if (!dim.tooltipVisible && dim.tooltipAlpha < 1) {
            console.log("DetailInfoManager: update correctly initiated hover end (fade out). [PASS]");
            passCount++;
        } else {
            console.error("DetailInfoManager: update failed to end hover. [FAIL]", dim.tooltipVisible, dim.tooltipAlpha);
        }
    } catch (e) {
        console.error("DetailInfoManager: Error during update (hover end) test. [FAIL]", e);
    }

    // 테스트 5: update - 죽은 유닛 호버링 무시
    testCount++;
    mockBattleSimulationManager.unitsOnGrid = [mockDeadUnit];
    mockAnimationManager.getRenderPosition = (unitId) => {
        if (unitId === 'unit_dead_001') return { drawX: 100, drawY: 100 };
        return { drawX: 0, drawY: 0 };
    };
    try {
        const dim = new DetailInfoManager(mockEventManager, mockMeasureManager, mockBattleSimulationManager, mockHeroEngine, mockIdManager, mockCameraEngine);
        dim._onCanvasMouseMove({ x: 120, y: 120 }); // 죽은 유닛 위에 마우스
        dim.update(16);

        if (dim.hoveredUnit === null) {
            console.log("DetailInfoManager: update correctly ignored dead unit hover. [PASS]");
            passCount++;
        } else {
            console.error("DetailInfoManager: update failed to ignore dead unit hover. [FAIL]", dim.hoveredUnit);
        }
    } catch (e) {
        console.error("DetailInfoManager: Error during update (dead unit) test. [FAIL]", e);
    }

    // 테스트 6: draw - 툴팁 그리기 호출 확인 (호버링 중인 유닛이 있을 때)
    testCount++;
    mockBattleSimulationManager.unitsOnGrid = [mockWarriorUnit];
    mockAnimationManager.getRenderPosition = () => ({ drawX: 100, drawY: 100 }); // 목업
    mockCtx.fillRectCalled = false;
    mockCtx.strokeRectCalled = false;
    mockCtx.fillTextCalled = false;
    try {
        const dim = new DetailInfoManager(mockEventManager, mockMeasureManager, mockBattleSimulationManager, mockHeroEngine, mockIdManager, mockCameraEngine);
        dim.hoveredUnit = mockWarriorUnit;
        dim.tooltipVisible = true;
        dim.tooltipAlpha = 1; // 완전 표시 상태
        await dim.draw(mockCtx);

        if (mockCtx.fillRectCalled && mockCtx.strokeRectCalled && mockCtx.fillTextCalled) {
            console.log("DetailInfoManager: draw called drawing operations when unit is hovered. [PASS]");
            passCount++;
        } else {
            console.error("DetailInfoManager: draw failed to call drawing operations. [FAIL]", mockCtx);
        }
    } catch (e) {
        console.error("DetailInfoManager: Error during draw test. [FAIL]", e);
    }

    // 테스트 7: draw - 툴팁 그리기 호출 없음 (호버링 유닛이 없거나 알파가 0일 때)
    testCount++;
    mockCtx.fillRectCalled = false;
    mockCtx.strokeRectCalled = false;
    mockCtx.fillTextCalled = false;
    try {
        const dim = new DetailInfoManager(mockEventManager, mockMeasureManager, mockBattleSimulationManager, mockHeroEngine, mockIdManager, mockCameraEngine);
        dim.hoveredUnit = null;
        dim.tooltipVisible = false;
        dim.tooltipAlpha = 0;
        await dim.draw(mockCtx);

        if (!mockCtx.fillRectCalled && !mockCtx.strokeRectCalled && !mockCtx.fillTextCalled) {
            console.log("DetailInfoManager: draw correctly skipped drawing when no unit is hovered or alpha is 0. [PASS]");
            passCount++;
        } else {
            console.error("DetailInfoManager: draw unexpectedly called drawing operations. [FAIL]", mockCtx);
        }
    } catch (e) {
        console.error("DetailInfoManager: Error during draw (no hover) test. [FAIL]", e);
    }


    console.log(`--- DetailInfoManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
