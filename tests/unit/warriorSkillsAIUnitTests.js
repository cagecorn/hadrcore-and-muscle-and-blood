// tests/unit/warriorSkillsAIUnitTests.js

import { WarriorSkillsAI } from '../../js/managers/warriorSkillsAI.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';
import { GAME_EVENTS, ATTACK_TYPES, GAME_DEBUG_MODE } from '../../js/constants.js'; // ✨ GAME_DEBUG_MODE 임포트

export function runWarriorSkillsAIUnitTests() {
    if (GAME_DEBUG_MODE) console.log("--- WarriorSkillsAI Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockUserUnit = {
        id: 'w1', name: 'Test Warrior', currentHp: 100, baseStats: { attack: 20 }, classId: 'class_warrior', gridX: 0, gridY: 0
    };
    const mockTargetUnit = {
        id: 'e1', name: 'Test Enemy', currentHp: 50, baseStats: { defense: 10 }, classId: 'class_goblin', gridX: 3, gridY: 0
    };

    const mockManagers = {
        battleSimulationManager: {
            unitsOnGrid: [mockUserUnit, mockTargetUnit],
            moveUnit: (unitId, x, y) => {
                const unit = mockManagers.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
                if (unit) { unit.gridX = x; unit.gridY = y; return true; } return false;
            },
            getGridRenderParameters: () => ({ effectiveTileSize: 100, gridOffsetX: 0, gridOffsetY: 0 })
        },
        battleCalculationManager: {
            requestDamageCalculation: (attackerId, targetId, skillData) => {
                if (GAME_DEBUG_MODE) console.log(`[MockBattleCalculationManager] Damage requested: ${attackerId} -> ${targetId}`);
            }
        },
        eventManager: {
            emit: (eventName, data) => {
                if (GAME_DEBUG_MODE) console.log(`[MockEventManager] Emitted: ${eventName}`, data);
            }
        },
        delayEngine: {
            waitFor: async (ms) => {
                await new Promise(resolve => setTimeout(resolve, ms));
                if (GAME_DEBUG_MODE) console.log(`[MockDelayEngine] Waited ${ms}ms.`);
            }
        },
        statusEffectManager: {
            applyStatusEffectCalled: false,
            applyStatusEffect: (unitId, effectId) => {
                mockManagers.statusEffectManager.applyStatusEffectCalled = true;
                if (GAME_DEBUG_MODE) console.log(`[MockStatusEffectManager] Applied ${effectId} to ${unitId}`);
            }
        },
        coordinateManager: {
            isTileOccupied: (x, y, excludeId) => false
        },
        targetingManager: {},
        vfxManager: {},
        diceEngine: { getRandomFloat: () => 0.1 },
        workflowManager: { triggerStatusEffectApplication: (unitId, effectId) => {
            mockManagers.statusEffectManager.applyStatusEffect(unitId, effectId);
        }},
        animationManager: {
            queueMoveAnimation: async (unitId, startX, startY, endX, endY) => {
                if (GAME_DEBUG_MODE) console.log(`[MockAnimationManager] Queued move for ${unitId} from (${startX},${startY}) to (${endX},${endY})`);
            },
            getAnimationDuration: (startX, startY, endX, endY) => 100
        },
        measureManager: {},
        idManager: {
            get: async (id) => {
                if (id === 'class_warrior') return { id: 'class_warrior', name: '전사', moveRange: 3 };
                return undefined;
            }
        },
        movingManager: {
            chargeMove: async (unit, targetX, targetY, moveRange) => {
                const movedX = targetX > unit.gridX ? targetX - 1 : (targetX < unit.gridX ? targetX + 1 : targetX);
                const movedY = targetY > unit.gridY ? targetY - 1 : (targetY < unit.gridY ? targetY + 1 : targetY);
                if (Math.abs(unit.gridX - movedX) + Math.abs(unit.gridY - movedY) <= moveRange) {
                    unit.gridX = movedX;
                    unit.gridY = movedY;
                    if (GAME_DEBUG_MODE) console.log(`[MockMovingManager] Unit ${unit.name} actually moved to (${movedX},${movedY})`);
                    await mockManagers.delayEngine.waitFor(100);
                    return true;
                }
                return false;
            }
        }
    };

    testCount++;
    mockUserUnit.gridX = 0; mockUserUnit.gridY = 0;
    mockTargetUnit.gridX = 3; mockTargetUnit.gridY = 0;
    mockManagers.statusEffectManager.applyStatusEffectCalled = false;
    try {
        const warriorSkillsAI = new WarriorSkillsAI(mockManagers);
        await warriorSkillsAI.charge(mockUserUnit, mockTargetUnit, WARRIOR_SKILLS.CHARGE);

        if (mockUserUnit.gridX === 2 && mockUserUnit.gridY === 0 && mockManagers.statusEffectManager.applyStatusEffectCalled) {
            if (GAME_DEBUG_MODE) console.log("WarriorSkillsAI: Charge skill executed correctly with movement and stun. [PASS]");
            passCount++;
        } else {
            if (GAME_DEBUG_MODE) console.error("WarriorSkillsAI: Charge skill failed movement or stun. [FAIL]", { x: mockUserUnit.gridX, y: mockUserUnit.gridY, stunCalled: mockManagers.statusEffectManager.applyStatusEffectCalled });
        }
    } catch (e) {
        if (GAME_DEBUG_MODE) console.error("WarriorSkillsAI: Error during Charge skill test. [FAIL]", e);
    }

    if (GAME_DEBUG_MODE) console.log(`--- WarriorSkillsAI Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
