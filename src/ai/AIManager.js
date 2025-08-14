import { debugLogEngine } from '../game/utils/DebugLogEngine.js';
import { tokenEngine } from '../game/utils/TokenEngine.js';
import { skillEngine } from '../game/utils/SkillEngine.js';
import { aspirationEngine } from '../game/utils/AspirationEngine.js';
import { NodeState } from './nodes/Node.js';
import { createMeleeAI } from './behaviors/MeleeAI.js';
import { createRangedAI } from './behaviors/RangedAI.js';
import { createHealerAI } from './behaviors/createHealerAI.js';
import { createFlyingmanAI } from './behaviors/createFlyingmanAI.js';
import { createINTJ_AI } from './behaviors/createINTJ_AI.js';
// ✨ [신규] INTP AI import
import { createINTP_AI } from './behaviors/createINTP_AI.js';
// ✨ [신규] ENTJ AI import
import { createENTJ_AI } from './behaviors/createENTJ_AI.js';
// ✨ [신규] ENTP AI import
import { createENTP_AI } from './behaviors/createENTP_AI.js';
// ✨ [신규] INFJ AI import
import { createINFJ_AI } from './behaviors/createINFJ_AI.js';
// ✨ [추가] INFP AI import
import { createINFP_AI } from './behaviors/createINFP_AI.js';
// ✨ [신규] ENFP AI import
import { createENFP_AI } from './behaviors/createENFP_AI.js';
// ✨ [신규] ISTJ AI import
import { createISTJ_AI } from './behaviors/createISTJ_AI.js';
// ✨ [신규] ISFJ AI import
import { createISFJ_AI } from './behaviors/createISFJ_AI.js';
// ✨ [신규] ESTJ AI import
import { createESTJ_AI } from './behaviors/createESTJ_AI.js';
// ✨ [신규] ESFJ AI import
import { createESFJ_AI } from './behaviors/createESFJ_AI.js';
// ✨ ISTP AI import 추가
import { createISTP_AI } from './behaviors/createISTP_AI.js';
// ✨ ISFP AI import 추가
import { createISFP_AI } from './behaviors/createISFP_AI.js';
// ✨ ESTP AI import 추가
import { createESTP_AI } from './behaviors/createESTP_AI.js';
// ✨ ESFP AI import 추가
import { createESFP_AI } from './behaviors/createESFP_AI.js';
// ✨ [신규] ENFJ AI import
import { createENFJ_AI } from './behaviors/createENFJ_AI.js';
// ✨ 용병 데이터에서 ai_archetype을 참조합니다.
import { mercenaryData } from '../game/data/mercenaries.js';

/**
 * 게임 내 모든 AI 유닛을 관리하고, 각 유닛의 행동 트리를 실행합니다.
 */
class AIManager {
    constructor() {
        // key: unit.uniqueId, value: { instance: unit, behaviorTree: tree }
        this.unitData = new Map();
        // 각 노드에 주입할 엔진 패키지를 보관합니다.
        this.aiEngines = {};
        debugLogEngine.log('AIManager', 'AI 매니저가 초기화되었습니다.');
    }

    /**
     * 등록된 모든 AI 유닛 정보를 초기화합니다.
     */
    clear() {
        this.unitData.clear();
        debugLogEngine.log('AIManager', '모든 AI 유닛 데이터가 초기화되었습니다.');
    }

    /**
     * 유닛의 MBTI 아키타입이나 클래스에 맞는 행동 트리를 생성합니다.
     * @param {object} unit
     * @returns {BehaviorTree}
     * @private
     */
    _createAIFromArchetype(unit) {
        const mbti = unit.mbti;
        if (mbti) {
            const mbtiString = (mbti.E > mbti.I ? 'E' : 'I') +
                               (mbti.S > mbti.N ? 'S' : 'N') +
                               (mbti.T > mbti.F ? 'T' : 'F') +
                               (mbti.J > mbti.P ? 'J' : 'P');

            switch (mbtiString) {
                case 'INTJ': return createINTJ_AI(this.aiEngines);
                case 'INTP': return createINTP_AI(this.aiEngines);
                case 'ENTJ': return createENTJ_AI(this.aiEngines);
                case 'ENTP': return createENTP_AI(this.aiEngines);
                // ✨ [추가] INFJ 케이스 추가
                case 'INFJ': return createINFJ_AI(this.aiEngines);
                // ✨ [추가] INFP 케이스 추가
                case 'INFP': return createINFP_AI(this.aiEngines);
                // ✨ [신규] ENFP 케이스 추가
                case 'ENFP': return createENFP_AI(this.aiEngines);
                case 'ENFJ': return createENFJ_AI(this.aiEngines);
                // ✨ [신규] ISTJ 케이스 추가
                case 'ISTJ': return createISTJ_AI(this.aiEngines);
                // ✨ [신규] ISFJ 케이스 추가
                case 'ISFJ': return createISFJ_AI(this.aiEngines);
                // ✨ [신규] ESTJ 케이스 추가
                case 'ESTJ': return createESTJ_AI(this.aiEngines);
                // ✨ [신규] ESFJ 케이스 추가
                case 'ESFJ': return createESFJ_AI(this.aiEngines);
                // ✨ [신규] ISTP 케이스 추가
                case 'ISTP': return createISTP_AI(this.aiEngines);
                // ✨ [신규] ISFP 케이스 추가
                case 'ISFP': return createISFP_AI(this.aiEngines);
                // ✨ [신규] ESTP 케이스 추가
                case 'ESTP': return createESTP_AI(this.aiEngines);
                // ✨ [신규] ESFP 케이스 추가
                case 'ESFP': return createESFP_AI(this.aiEngines);
                // 다른 MBTI 유형은 여기서 추가 가능
            }
        }

        const unitBaseData = mercenaryData[unit.id];
        // ✨ [수정] 거너(gunner)가 ai_archetype을 사용하도록 수정
        if (unitBaseData && unitBaseData.ai_archetype) {
            switch (unitBaseData.ai_archetype) {
                case 'ranged':
                    return createRangedAI(this.aiEngines);
                case 'healer':
                    return createHealerAI(this.aiEngines);
                case 'assassin':
                    return createFlyingmanAI(this.aiEngines);
                // ✨ [신규] 거너가 ENFP AI를 사용하도록 연결
                case 'gunner':
                    return createENFP_AI(this.aiEngines);
                case 'enfj':
                    return createENFJ_AI(this.aiEngines);
                case 'melee':
                default:
                    return createMeleeAI(this.aiEngines);
            }
        }

        // 모든 조건에 해당하지 않으면 기본적으로 근접 AI 사용
        return createMeleeAI(this.aiEngines);
    }

    // ✨ [신규] 행동 실패 시 직업에 맞는 기본 AI를 생성하고 실행하는 메서드
    async _executeFallbackAI(unit, allUnits, enemyUnits) {
        let fallbackAI;
        const unitClass = unit.id;

        // 16개 클래스를 3개의 기본 역할군으로 분류합니다.
        switch (unitClass) {
            // --- 원거리 딜러 ---
            case 'gunner':
            case 'nanomancer':
            case 'esper':
                fallbackAI = createRangedAI(this.aiEngines);
                break;

            // --- 힐러 및 지원가 ---
            case 'medic':
            case 'plagueDoctor':
            case 'mechanic': // 소환사는 지원 역할군으로 분류
                fallbackAI = createHealerAI(this.aiEngines);
                break;

            // --- 그 외 모든 근접/돌격 클래스 ---
            case 'warrior':
            case 'commander':
            case 'android':
            case 'sentinel':
            case 'flyingmen':
            case 'ghost':
            case 'darkKnight':
            case 'hacker':
            case 'clown':
            case 'paladin':
            default:
                fallbackAI = createMeleeAI(this.aiEngines);
                break;
        }

        if (fallbackAI) {
            debugLogEngine.log('AIManager', `[${unit.instanceName}]가 기본 [${fallbackAI.root.constructor.name}] AI로 행동합니다.`);
            // 기본 AI를 즉시 실행합니다.
            await fallbackAI.execute(unit, allUnits, enemyUnits);
        }
    }

    /**
     * 새로운 AI 유닛을 등록하고 MBTI 아키타입에 맞는 행동 트리를 생성합니다.
     * @param {object} unitInstance - AI에 의해 제어될 유닛
     */
    registerUnit(unitInstance, behaviorTreeOverride = null) {
        if (!unitInstance || !unitInstance.uniqueId || this.unitData.has(unitInstance.uniqueId)) {
            debugLogEngine.warn('AIManager', '이미 등록되었거나 유효하지 않은 유닛입니다.');
            return;
        }

        const behaviorTree = behaviorTreeOverride || this._createAIFromArchetype(unitInstance);
        this.unitData.set(unitInstance.uniqueId, {
            instance: unitInstance,
            behaviorTree: behaviorTree,
        });
        debugLogEngine.log('AIManager', `유닛 ID ${unitInstance.uniqueId} (${unitInstance.instanceName})에게 [${behaviorTree.root.constructor.name}] AI 등록 완료.`);
    }

    /**
     * 전장의 모든 유닛 정보를 모든 AI의 블랙보드에 갱신합니다.
     * 유닛이 새로 등장하거나 사라질 때 호출하세요.
     * @param {Array<object>} allUnits
     */
    updateBlackboard(allUnits) {
        for (const data of this.unitData.values()) {
            const allies = allUnits.filter(u => u.team === data.instance.team && u.currentHp > 0);
            const enemies = allUnits.filter(u => u.team !== data.instance.team && u.currentHp > 0);

            data.behaviorTree.blackboard.set('allUnits', allUnits);
            data.behaviorTree.blackboard.set('enemyUnits', enemies);
            data.behaviorTree.blackboard.set('allyUnits', allies);
        }
    }

    /**
     * 특정 유닛의 턴을 실행합니다.
     * @param {object} unit - 턴을 실행할 유닛
     * @param {Array<object>} allUnits - 전장의 모든 유닛
     * @param {Array<object>} enemyUnits - 해당 유닛의 적 목록
     */
    async executeTurn(unit, allUnits, enemyUnits) {
        const data = this.unitData.get(unit.uniqueId);
        if (!data) return;

        // --- \u25BC [핵심 추가] 턴 시작 시 피격 기록 초기화 \u25BC ---
        unit.wasAttackedBy = null;
        // \u2728 턴 시작 시 공격 행동 플래그 초기화
        unit.offensiveActionTakenThisTurn = false;

        // ✨ [신규] 턴 시작 시, 전략적 상황을 계산하여 블랙보드에 업데이트
        const blackboard = data.behaviorTree.blackboard;
        const allies = allUnits.filter(u => u.team === unit.team && u.currentHp > 0);

        blackboard.set('healthPercentage', unit.currentHp / unit.finalStats.hp);
        blackboard.set('isLastAllyAlive', allies.length === 1 && allies[0].uniqueId === unit.uniqueId);
        // (allyDeathCountSinceLastTurn는 BattleSimulatorEngine에서 처리하는 것이 더 정확하므로 일단 0으로 둡니다)
        blackboard.set('allyDeathCountSinceLastTurn', 0);

        // 턴 시작 시 블랙보드 플래그 초기화
        blackboard.set('hasMovedThisTurn', false);
        blackboard.set('usedSkillsThisTurn', new Set());

        console.group(`[AIManager] --- ${data.instance.instanceName} (ID: ${unit.uniqueId}) 턴 시작 ---`);

        // ✨ [신규] 턴 동안 어떤 행동이라도 했는지 추적하는 플래그
        let actionTakenInTurn = false;

        // 남은 토큰이 없더라도 0코스트 스킬 사용을 시도할 수 있도록
        // 일정 횟수만큼 행동 트리를 반복 실행합니다.
        const maxActionsPerTurn = 10;
        for (let i = 0; i < maxActionsPerTurn; i++) {
            const blackboard = data.behaviorTree.blackboard;
            const prevTokens = tokenEngine.getTokens(unit.uniqueId);
            // usedSkillsThisTurn이 없을 수도 있으므로 기본값을 사용합니다.
            const prevSkillsUsedSize = (blackboard.get('usedSkillsThisTurn') || new Set()).size;
            const wasMoved = blackboard.get('hasMovedThisTurn');

            // --- ▼ [핵심 수정] 혼란 상태 체크 및 타겟 교체 ▼ ---
            let currentAllies = allUnits.filter(u => u.team === unit.team && u.currentHp > 0);
            let currentEnemies = allUnits.filter(u => u.team !== unit.team && u.currentHp > 0);

            if (unit.isConfused) {
                // 혼란 상태일 경우, 아군을 적으로, 적을 아군으로 인식하게 만듭니다.
                [currentAllies, currentEnemies] = [currentEnemies, currentAllies];
                if (this.aiEngines.vfxManager) {
                    this.aiEngines.vfxManager.showEffectName(unit.sprite, '혼란!', '#f43f5e');
                }
            }
            // --- ▲ [핵심 수정] 혼란 상태 체크 및 타겟 교체 ▲ ---

            const treeResult = await data.behaviorTree.execute(unit, allUnits, currentEnemies);
            if (treeResult === NodeState.FAILURE) {
                debugLogEngine.log('AIManager', `[${unit.instanceName}] 행동 실패 - 루프 종료.`);
                break;
            }

            const currentTokens = tokenEngine.getTokens(unit.uniqueId);
            const currentSkillsUsedSize = (blackboard.get('usedSkillsThisTurn') || new Set()).size;
            const hasMoved = blackboard.get('hasMovedThisTurn');

            const tokenSpent = currentTokens < prevTokens;
            const skillUsed = currentSkillsUsedSize > prevSkillsUsedSize;
            const movedThisLoop = !wasMoved && hasMoved;

            // ✨ [신규] 이번 루프에서 행동했다면 플래그를 true로 설정합니다.
            if (tokenSpent || skillUsed || movedThisLoop) {
                actionTakenInTurn = true;
            }

            // 토큰 소모, 스킬 사용, 이동 중 아무것도 하지 않았다면
            // 더 이상 할 행동이 없는 것으로 간주하고 종료합니다.
            if (!tokenSpent && !skillUsed && !movedThisLoop) {
                debugLogEngine.log('AIManager', `[${unit.instanceName}] 행동 종료: 변화 없음.`);
                break;
            }
        }

        // ✨ [신규] 턴 전체를 통틀어 아무 행동도 하지 않았다면 기본 AI를 실행합니다.
        if (!actionTakenInTurn && unit.currentHp > 0) {
            debugLogEngine.warn('AIManager', `[${unit.instanceName}]가 아키타입 AI로 행동을 결정하지 못했습니다. 기본 AI로 대체합니다.`);
            // 혼란 상태를 반영하여 적/아군 목록을 전달합니다.
            const enemiesForFallback = unit.isConfused
                ? allUnits.filter(u => u.team === unit.team)
                : allUnits.filter(u => u.team !== unit.team);
            await this._executeFallbackAI(unit, allUnits, enemiesForFallback);
        }

        // \u2728 --- [핵심 수정] 턴 종료 후 비행동 여부 확인 --- \u2728
        // 공격/지원 스킬을 사용하지 않았고, 이번 턴에 피격당하지도 않았다면 열망 감소
        if (unit.currentHp > 0 && !unit.offensiveActionTakenThisTurn && !unit.wasAttackedBy) {
            aspirationEngine.addAspiration(unit.uniqueId, -5, '비전투');
        }
        // \u2728 --- 수정 완료 --- \u2728

        console.groupEnd();
    }
}

// 싱글턴으로 관리
export const aiManager = new AIManager();
