import { formationEngine } from './FormationEngine.js';
import { OffscreenTextEngine } from './OffscreenTextEngine.js';
import { BindingManager } from './BindingManager.js';
import { VFXManager } from './VFXManager.js';
import { AnimationEngine } from './AnimationEngine.js';
import { TerminationManager } from './TerminationManager.js';
// ✨ SummoningEngine을 새로 import 합니다.
import { SummoningEngine } from './SummoningEngine.js';
import SkillEffectProcessor from './SkillEffectProcessor.js';
import { trapManager } from './TrapManager.js';
import { debugLogEngine } from './DebugLogEngine.js';

import { aiManager } from '../../ai/AIManager.js';

import { targetManager } from './TargetManager.js';
import { pathfinderEngine } from './PathfinderEngine.js';
import { visionManager } from './VisionManager.js'; // VisionManager를 import합니다.
import { turnOrderManager } from './TurnOrderManager.js';
import { combatCalculationEngine } from './CombatCalculationEngine.js';
import { delayEngine } from './DelayEngine.js';
// --- ✨ TokenEngine을 import 합니다. ---
import { tokenEngine } from './TokenEngine.js';
import { skillEngine } from './SkillEngine.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { cooldownManager } from './CooldownManager.js';
import { SKILL_TAGS } from './SkillTagManager.js';
// 전투 중 하단 UI를 관리하는 매니저
import { CombatUIManager } from '../dom/CombatUIManager.js';
import { TurnOrderUIManager } from '../dom/TurnOrderUIManager.js';
import { sharedResourceEngine } from './SharedResourceEngine.js';
import { SharedResourceUIManager } from '../dom/SharedResourceUIManager.js';
import { comboManager } from './ComboManager.js';
// ✨ YinYangEngine을 import 합니다.
import { yinYangEngine } from './YinYangEngine.js';
import { aspirationEngine } from './AspirationEngine.js'; // ✨ AspirationEngine import
import { statEngine } from './StatEngine.js';
import { createMeleeAI } from '../../ai/behaviors/MeleeAI.js';
import { EFFECT_TYPES } from './EffectTypes.js';
import { BattleSpeedManager } from './BattleSpeedManager.js';
import { NarrationUIManager } from '../dom/NarrationUIManager.js';

// 그림자 생성을 담당하는 매니저
import { ShadowManager } from './ShadowManager.js';


export class BattleSimulatorEngine {
    constructor(scene) {
        this.scene = scene;
        this.isRunning = false;

        // --- 모든 엔진과 매니저 초기화 ---
        this.animationEngine = new AnimationEngine(scene);
        this.textEngine = new OffscreenTextEngine(scene);
        this.bindingManager = new BindingManager(scene);
        // 그림자 생성용 매니저 초기화
        this.shadowManager = new ShadowManager(scene);
        this.vfxManager = new VFXManager(scene, this.textEngine, this.bindingManager);
        this.vfxManager.setBattleSimulator(this);
        // 소환 엔진을 먼저 생성합니다.
        this.summoningEngine = new SummoningEngine(scene, this);
        // 소환 엔진을 참조하는 종료 매니저를 초기화합니다.
        this.terminationManager = new TerminationManager(scene, this.summoningEngine, this);
        this.skillEffectProcessor = new SkillEffectProcessor({
            vfxManager: this.vfxManager,
            animationEngine: this.animationEngine,
            terminationManager: this.terminationManager,
            summoningEngine: this.summoningEngine,
            battleSimulator: this,
            delayEngine
        });
        // 전투 속도 매니저
        this.battleSpeedManager = new BattleSpeedManager();
        // 전투 중 유닛 정보를 표시할 UI 매니저
        this.combatUI = new CombatUIManager(this.battleSpeedManager);
        // 턴 순서 UI 매니저
        this.turnOrderUI = new TurnOrderUIManager();
        this.sharedResourceUI = new SharedResourceUIManager();
        this.narrationUI = new NarrationUIManager();
        
        // AI 노드에 주입할 엔진 패키지
        this.aiEngines = {
            targetManager,
            pathfinderEngine,
            formationEngine,
            combatCalculationEngine,
            delayEngine,
            animationEngine: this.animationEngine,
            vfxManager: this.vfxManager,
            terminationManager: this.terminationManager,
            visionManager, // visionManager를 엔진 패키지에 추가합니다.
            cameraControl: this.scene.cameraControl,
            // ✨ AI가 소환 엔진을 사용할 수 있도록 패키지에 포함합니다.
            summoningEngine: this.summoningEngine,
            battleSimulator: this,
            narrationEngine: this.narrationUI,
            skillEffectProcessor: this.skillEffectProcessor,
        };

        // ✨ AspirationEngine에 battleSimulator 참조 설정
        aspirationEngine.setBattleSimulator(this);
        // ✨ CombatCalculationEngine에 battleSimulator 참조 설정
        combatCalculationEngine.setBattleSimulator(this);

        this.turnQueue = [];
        this.currentTurnIndex = 0;
        // --- ✨ 전체 턴 수를 추적하는 변수 ---
        this.currentTurnNumber = 1;
    }

    /**
     * 안드로이드의 '강화 학습' 패시브를 발동시켜 버프 스택을 쌓습니다.
     * @param {object} unit - 패시브를 발동할 유닛 (안드로이드)
     * @param {string} reason - 발동 사유 (로그용)
     */
    triggerReinforcementLearning(unit, reason) {
        if (!unit || unit.classPassive?.id !== 'reinforcementLearning') return;

        const effects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
        let learningEffect = effects.find(e => e.id === 'reinforcementLearningBuff');

        if (learningEffect) {
            learningEffect.stack = (learningEffect.stack || 0) + 1;
        } else {
            const newEffect = {
                id: 'reinforcementLearningBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 99,
                stack: 1,
                modifiers: {}
            };
            statusEffectManager.addEffect(unit, { name: '강화 학습', effect: newEffect }, unit);
        }

        if (this.vfxManager) {
            this.vfxManager.showEffectName(unit.sprite, '강화 학습', '#f59e0b');
        }
        console.log(`%c[Passive] ${unit.instanceName}의 [${reason}]으로 '강화 학습' 스택이 쌓입니다.`, "color: #f59e0b; font-weight: bold;");
    }

    start(allies, enemies) {
        if (this.isRunning) return;
        this.isRunning = true;

        aiManager.clear();

        this.battleSpeedManager.reset();
        cooldownManager.reset();
        this.summoningEngine.reset();
        trapManager.reset();
        // ✨ [수정] 각 팀의 자원을 개별적으로 초기화
        sharedResourceEngine.initialize('ally');
        sharedResourceEngine.initialize('enemy');
        statusEffectManager.setBattleSimulator(this);
        combatCalculationEngine.setBattleSimulator(this);
        // ✨ 전투 시작 시 음양 엔진을 초기화합니다.
        yinYangEngine.initializeUnits([...allies, ...enemies]);

        const allUnits = [...allies, ...enemies];
        // ✨ 전투 시작 시 열망 엔진 초기화
        aspirationEngine.initializeUnits(allUnits);
        // --- ✨ 전투 시작 시 토큰 엔진 초기화 ---
        tokenEngine.initializeUnits(allUnits);
        allies.forEach(u => u.team = 'ally');
        enemies.forEach(u => u.team = 'enemy');

        formationEngine.applyFormation(this.scene, allies, 0, 7);
        const unplaced = allies.filter(u => !u.sprite);
        if (unplaced.length > 0) {
            formationEngine.placeUnits(this.scene, unplaced, 0, 7);
        }
        formationEngine.placeMonsters(this.scene, enemies, 8);

        this._setupUnits(allUnits);

        // ✨ [신규] 유닛 배치 및 기본 스탯 계산 후, 동적 패시브 적용
        allUnits.forEach(unit => {
            if (unit.team === 'ally') {
                statEngine.applyDynamicPassives(unit, allies);
            } else {
                statEngine.applyDynamicPassives(unit, enemies);
            }
        });

        // AI 엔진 패키지를 AIManager에 전달하고 각 유닛을 등록합니다.
        aiManager.aiEngines = this.aiEngines;
        allUnits.forEach(unit => {
            if (unit.name === '커맨더') {
                aiManager.registerUnit(unit, createMeleeAI(this.aiEngines));
            } else {
                aiManager.registerUnit(unit);
            }
        });

        this.turnQueue = turnOrderManager.createTurnQueue(allUnits);
        this.currentTurnIndex = 0;
        this.currentTurnNumber = 1; // 턴 번호 초기화

        // 턴 순서 UI 초기화
        this.turnOrderUI.show(this.turnQueue);
        this.sharedResourceUI.show();
        this.narrationUI.show('전투 시작!', 1500);

        // --- ✨ 첫 턴 시작 시 토큰 지급 ---
        tokenEngine.addTokensForNewTurn();
        // 스킬 사용 기록 초기화
        skillEngine.resetTurnActions();

        // [✨ 수정] 첫 턴 시작 직후 모든 유닛의 토큰 UI를 업데이트합니다.
        allUnits.forEach(unit => {
            const bound = this.bindingManager.bindings.get(unit.sprite) || [];
            const nameTag = bound.find(el => el.type === 'Text');
            this.vfxManager.updateTokenDisplay(unit, nameTag);
            this.vfxManager.updateHealthBar(unit.uniqueId, unit.currentHp, unit.finalStats.hp);
            this.vfxManager.updateAspirationBar(unit.uniqueId);
            this.vfxManager.iconManager.updateIconsForUnit(unit.uniqueId);
        });

        this.gameLoop(); // 수정된 루프 시작
    }

    _setupUnits(units) {
        units.forEach(unit => {
            if (!unit.sprite) return;

            // --- ✨ unitId를 스프라이트에 먼저 설정 ---
            unit.sprite.setData('unitId', unit.uniqueId);
            unit.sprite.setData('team', unit.team);

            // \u2728 적군 스프라이트는 오른쪽을 향하도록 좌우 반전합니다.
            if (unit.team === 'enemy') {
                unit.sprite.flipX = true;
            }

            unit.currentHp = unit.finalStats.hp;
            // --- ▼ [신규] 고스트 패시브를 위한 누적 데미지 변수 초기화 ▼ ---
            if (unit.classPassive?.id === 'ghosting') {
                unit.cumulativeDamageTaken = 0;
            }
            // --- ▲ [신규] 고스트 패시브를 위한 누적 데미지 변수 초기화 ▲ ---
            // ✨ 배리어 상태 초기화
            unit.maxBarrier = unit.finalStats.maxBarrier;
            unit.currentBarrier = unit.finalStats.currentBarrier;
            const cell = formationEngine.getCellFromSprite(unit.sprite);
            if (cell) {
                unit.gridX = cell.col;
                unit.gridY = cell.row;
            }

            // ✨ 팀에 따라 이름표 색상을 다르게 설정합니다.
            const nameColor = unit.team === 'ally' ? '#60a5fa' : '#f87171';
            const nameTag = this.textEngine.createLabel(unit.sprite, unit.instanceName, nameColor);

            // 그림자 생성
            const shadow = this.shadowManager.createShadow(unit.sprite);

            // ✨ VFXManager가 모든 UI 요소를 생성하고 바인딩하도록 위임합니다.
            this.vfxManager.setupUnitVFX(unit, nameTag);
            // 그림자는 별도로 바인딩합니다.
            this.bindingManager.bind(unit.sprite, [shadow]);
        });
    }

    // gameLoop를 while 루프로 변경
    async gameLoop() {
        while (this.isRunning && !this.isBattleOver()) {
            const currentUnit = this.turnQueue[this.currentTurnIndex];

            // ✨ AI가 현재 턴을 인식할 수 있도록 블랙보드에 기록
            const aiData = aiManager.unitData.get(currentUnit.uniqueId);
            if (aiData) {
                aiData.behaviorTree.blackboard.set('currentTurnNumber', this.currentTurnNumber);
            }

            // 턴 시작 시 콤보 정보를 초기화합니다.
            comboManager.startTurn(currentUnit.uniqueId);
            
            // ✨ [신규] 턴 시작 시 동적 패시브 효과를 적용합니다.
            if (currentUnit && currentUnit.currentHp > 0) {
                statEngine.handleTurnStartPassives(currentUnit, this.turnQueue);
            }

            // 현재 턴 표시를 위해 턴 순서 UI 업데이트
            this.turnQueue.forEach((u, index) => u.isTurnActive = (index === this.currentTurnIndex));
            this.turnOrderUI.update(this.turnQueue);

            // 턴을 처리하기 전에 유닛이 살아있는지 확인하여 죽은 유닛의 턴을 건너뜁니다.
            if (currentUnit && currentUnit.currentHp > 0) {
                // 현재 턴을 진행하는 유닛 정보를 하단 UI에 표시
                this.combatUI.show(currentUnit);

                if (!currentUnit.isStunned) {
                    this.scene.cameraControl.panTo(currentUnit.sprite.x, currentUnit.sprite.y);
                    await delayEngine.hold(500);

                    if (aiManager.unitData.has(currentUnit.uniqueId)) {
                        const allies = this.turnQueue.filter(u => u.team === 'ally' && u.currentHp > 0);
                        const enemies = this.turnQueue.filter(u => u.team === 'enemy' && u.currentHp > 0);

                        await aiManager.executeTurn(currentUnit, [...allies, ...enemies], currentUnit.team === 'ally' ? enemies : allies);
                    }
                } else {
                    console.log(`%c[Battle] ${currentUnit.instanceName}은(는) 기절해서 움직일 수 없습니다!`, "color: yellow;");
                }

                // ✨ Reset stun recovery flag at turn end
                if (currentUnit.justRecoveredFromStun) {
                    currentUnit.justRecoveredFromStun = false;
                }

                // 살아있는 유닛은 기절 여부와 관계없이 쿨다운이 감소해야 합니다.
                cooldownManager.reduceCooldowns(currentUnit.uniqueId);

                // 행동이 끝난 후 UI를 다시 업데이트하여 변경된 체력 등을 즉시 반영합니다.
                this.combatUI.show(currentUnit);
                await delayEngine.hold(500); // 변경된 상태를 잠시 보여줍니다.
            }

            this.currentTurnIndex++;
            if (this.currentTurnIndex >= this.turnQueue.length) {
                this.currentTurnIndex = 0;
                this.currentTurnNumber++; // 모든 유닛의 턴이 끝나면 전체 턴 수 증가

                // ✨ [수정] 턴 종료 시 지속 피해 효과 처리를 statusEffectManager로 위임
                statusEffectManager.onTurnEnd(this.turnQueue);
                // ✨ 턴 종료 시 음양 지수 자연 감소를 적용합니다.
                yinYangEngine.applyTurnDecay();
                tokenEngine.addTokensForNewTurn();
                skillEngine.resetTurnActions();
            }

            // 다음 턴을 위해 턴 순서 UI 갱신
            this.turnQueue.forEach((u, idx) => u.isTurnActive = (idx === this.currentTurnIndex));
            this.turnOrderUI.update(this.turnQueue);

            // --- ✨ 매 행동 후 모든 유닛의 UI를 갱신합니다. ---
            this.turnQueue.forEach(unit => {
                if (unit.sprite && unit.sprite.active) {
                    const bound = this.bindingManager.bindings.get(unit.sprite) || [];
                    const nameTag = bound.find(el => el.type === 'Text');
                    this.vfxManager.updateTokenDisplay(unit, nameTag);
                    this.vfxManager.updateHealthBar(unit.uniqueId, unit.currentHp, unit.finalStats.hp);
                    this.vfxManager.updateAspirationBar(unit.uniqueId);
                    this.vfxManager.iconManager.updateIconsForUnit(unit.uniqueId);
                }
            });
            this.sharedResourceUI.update();

            // 다음 턴의 유닛 정보를 미리 갱신합니다.
            const nextUnit = this.turnQueue[this.currentTurnIndex];
            // 다음 턴의 유닛이 살아있을 때만 UI를 업데이트합니다.
            if (nextUnit && nextUnit.currentHp > 0) {
                this.combatUI.show(nextUnit);
            } else if (!this.isBattleOver()) {
                // 전투가 끝나지 않았는데 다음 유닛이 유효하지 않으면 UI를 숨깁니다.
                this.combatUI.hide();
            }

            await delayEngine.hold(1000);
        }

        if (!this.isRunning) return;

        // 전투 종료 시 UI 숨김 처리
        this.combatUI.hide();
        this.turnOrderUI.hide();
        this.sharedResourceUI.hide();
        console.log('전투 종료!');
    }

    isBattleOver() {
        const aliveAllies = this.turnQueue.filter(u => u.team === 'ally' && u.currentHp > 0).length;
        const aliveEnemies = this.turnQueue.filter(u => u.team === 'enemy' && u.currentHp > 0).length;
        return aliveAllies === 0 || aliveEnemies === 0;
    }

    shutdown() {
        this.isRunning = false;
        if (this.vfxManager) {
            this.vfxManager.shutdown();
        }
        if (this.textEngine) {
            this.textEngine.shutdown();
        }
        if (this.shadowManager) {
            this.shadowManager.shutdown();
        }
        if (this.combatUI) {
            this.combatUI.destroy();
        }
        if (this.turnOrderUI) {
            this.turnOrderUI.destroy();
        }
        if (this.sharedResourceUI) {
            this.sharedResourceUI.destroy();
        }
        if (this.narrationUI) {
            this.narrationUI.destroy();
        }
    }
}

export const battleSimulatorEngine = {
    async runFullSimulation(initialAllies, initialEnemies) {
        debugLogEngine.reset();
        debugLogEngine.startRecording();

        // 깊은 복사로 시뮬레이션용 유닛 생성
        const simAllies = JSON.parse(JSON.stringify(initialAllies));
        const simEnemies = JSON.parse(JSON.stringify(initialEnemies));

        simAllies.forEach(u => (u.team = 'ally'));
        simEnemies.forEach(u => (u.team = 'enemy'));
        const allUnits = [...simAllies, ...simEnemies];

        // 전투 관련 엔진 초기화
        tokenEngine.initializeUnits(allUnits);
        tokenEngine.addTokensForNewTurn();
        cooldownManager.reset();
        skillEngine.resetTurnActions();
        statusEffectManager.activeEffects.clear();

        // 컴뱃 계산 엔진과 상태 효과 매니저가 참조할 전투 컨텍스트
        const battleContext = { turnQueue: allUnits };
        statusEffectManager.setBattleSimulator(battleContext);
        combatCalculationEngine.setBattleSimulator(battleContext);

        const basicAttack = {
            id: 'basicAttack',
            name: '기본 공격',
            type: 'ACTIVE',
            cost: 0,
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL],
            damageMultiplier: { min: 1, max: 1 }
        };

        let turn = 0;
        const MAX_TURNS = 100;

        while (
            turn < MAX_TURNS &&
            simAllies.some(u => u.currentHp > 0) &&
            simEnemies.some(u => u.currentHp > 0)
        ) {
            turn++;
            debugLogEngine.log('System', `======= Turn ${turn} =======`);

            battleContext.turnQueue = [...simAllies, ...simEnemies];
            const turnOrder = turnOrderManager.createTurnQueue(battleContext.turnQueue);

            for (const unit of turnOrder) {
                if (unit.currentHp <= 0) continue;
                const opponents = unit.team === 'ally' ? simEnemies : simAllies;
                const target = opponents.find(t => t.currentHp > 0);
                if (!target) break;

                // 스킬 선택 (현재는 첫 번째 스킬 또는 기본 공격)
                let chosen = unit.skills?.[0];
                chosen = chosen?.NORMAL || chosen; // 등급 구분이 있는 경우 처리
                if (!chosen || !skillEngine.canUseSkill(unit, chosen)) {
                    chosen = basicAttack;
                }

                skillEngine.recordSkillUse(unit, chosen);
                const { damage } = combatCalculationEngine.calculateDamage(unit, target, chosen);
                target.currentHp = Math.max(0, target.currentHp - damage);

                debugLogEngine.log(
                    unit.instanceName,
                    `${chosen.name} 사용 -> ${target.instanceName}에게 ${damage} 피해 (남은 HP: ${target.currentHp})`
                );

                if (chosen.effect && target.currentHp > 0) {
                    statusEffectManager.addEffect(target, chosen, unit);
                    debugLogEngine.log(
                        'StatusEffect',
                        `${target.instanceName}에게 [${chosen.effect.id}] 적용`
                    );
                }

                if (target.currentHp <= 0) {
                    debugLogEngine.log('System', `${target.instanceName} 쓰러짐`);
                }

                if (
                    !simAllies.some(u => u.currentHp > 0) ||
                    !simEnemies.some(u => u.currentHp > 0)
                ) {
                    break;
                }
            }

            statusEffectManager.onTurnEnd(battleContext.turnQueue);
            tokenEngine.addTokensForNewTurn();
            skillEngine.resetTurnActions();
        }

        const winner = simAllies.some(u => u.currentHp > 0) ? 'ally' : 'enemy';
        debugLogEngine.log('System', `전투 종료! 결과: ${winner}`);
        debugLogEngine.saveLog();
        return debugLogEngine.getHistory();
    }
};
